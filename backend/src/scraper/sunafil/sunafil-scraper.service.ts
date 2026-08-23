import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Page, Browser } from 'puppeteer';
import { PrismaService } from '../../prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { SunafilAuthService } from './sunafil-auth.service';
import { SunafilDownloaderService } from './sunafil-downloader.service';
import { FiscalizacionExtractor } from './extractors/fiscalizacion.extractor';
import { CobranzaExtractor } from './extractors/cobranza.extractor';
import { AccionesPreviasExtractor } from './extractors/acciones-previas.extractor';
import { FormalizacionExtractor } from './extractors/formalizacion.extractor';
import { SstExtractor } from './extractors/sst.extractor';
import {
  BaseSunafilRecord,
  SyncSunafilOptions,
  SyncSunafilResult,
  ModuloSunafil,
} from './interfaces/sunafil-notificacion.interface';

@Injectable()
export class SunafilScraperService {
  private readonly logger = new Logger(SunafilScraperService.name);

  private readonly fiscalizacionExtractor = new FiscalizacionExtractor();
  private readonly cobranzaExtractor = new CobranzaExtractor();
  private readonly accionesPreviasExtractor = new AccionesPreviasExtractor();
  private readonly formalizacionExtractor = new FormalizacionExtractor();
  private readonly sstExtractor = new SstExtractor();

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly authService: SunafilAuthService,
    private readonly downloaderService: SunafilDownloaderService,
  ) {}

  /**
   * Inicializa el navegador Puppeteer con configuración óptima
   */
  private async launchBrowser(): Promise<{ browser: Browser; page: Page }> {
    const isHeadless =
      process.env.PUPPETEER_HEADLESS?.replace(/['\"]/g, '').trim() === 'true';
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

    const browser = await puppeteer.launch({
      executablePath,
      headless: isHeadless,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--incognito',
      ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    );

    return { browser, page };
  }

  /**
   * Sincroniza las notificaciones de SUNAFIL para una empresa
   */
  async sincronizarEmpresa(
    empresaId: string,
    options: SyncSunafilOptions = { descargarPdfs: false },
  ): Promise<SyncSunafilResult> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new Error(`Empresa con ID ${empresaId} no encontrada.`);
    }

    const claveSol = this.encryptionService.decrypt(empresa.claveSol);
    let browser: Browser | null = null;
    const allRecords: BaseSunafilRecord[] = [];

    const result: SyncSunafilResult = {
      empresaRuc: empresa.ruc,
      totalExtraidas: 0,
      nuevasGuardadas: 0,
      porModulo: {
        fiscalizacion: 0,
        cobranza: 0,
        accionesPrevias: 0,
        formalizacion: 0,
        sst: 0,
      },
      notificaciones: [],
    };

    try {
      this.logger.log(`Iniciando extracción SUNAFIL para RUC ${empresa.ruc}...`);
      const { browser: b, page } = await this.launchBrowser();
      browser = b;

      // 1. Autenticación Clave SOL
      await this.authService.login(page, empresa.ruc, empresa.usuarioSol, claveSol);
      await this.takeDebugScreenshot(page, '01-tras-login');

      // 2. Módulo 1: Notificaciones de Fiscalización
      try {
        await this.navigateToMenu(page, 'Fiscalización', 'Notificaciones de Fiscalización');
        const notifsFiscalizacion = await this.fiscalizacionExtractor.extract(page);
        result.porModulo.fiscalizacion = notifsFiscalizacion.length;
        allRecords.push(...notifsFiscalizacion);
      } catch (err) {
        this.logger.error(`Error al extraer Fiscalización: ${err.message}`);
      }

      // 3. Módulo 2: Notificaciones de Cobranza
      try {
        await this.navigateToMenu(page, 'Cobranza', 'Notificaciones de Cobranza');
        const notifsCobranza = await this.cobranzaExtractor.extract(page);
        result.porModulo.cobranza = notifsCobranza.length;
        allRecords.push(...notifsCobranza);
      } catch (err) {
        this.logger.error(`Error al extraer Cobranza: ${err.message}`);
      }

      // 4. Módulo 3: Acciones Previas
      try {
        await this.navigateToMenu(page, 'Acciones Previas', 'Acciones Previas');
        const notifsAccionesPrevias = await this.accionesPreviasExtractor.extract(page);
        result.porModulo.accionesPrevias = notifsAccionesPrevias.length;
        allRecords.push(...notifsAccionesPrevias);
      } catch (err) {
        this.logger.error(`Error al extraer Acciones Previas: ${err.message}`);
      }

      // 5. Módulo 4: Alertas -> Formalización
      try {
        await this.navigateToMenu(page, 'Alertas', 'Formalización');
        const notifsFormalizacion = await this.formalizacionExtractor.extract(page);
        result.porModulo.formalizacion = notifsFormalizacion.length;
        allRecords.push(...notifsFormalizacion);
      } catch (err) {
        this.logger.error(`Error al extraer Formalización: ${err.message}`);
      }

      // 6. Módulo 5: Alertas -> Seguridad y Salud en el Trabajo
      try {
        await this.navigateToMenu(page, 'Alertas', 'Seguridad y Salud en el Trabajo');
        const notifsSst = await this.sstExtractor.extract(page);
        result.porModulo.sst = notifsSst.length;
        allRecords.push(...notifsSst);
      } catch (err) {
        this.logger.error(`Error al extraer SST: ${err.message}`);
      }

      // 7. Persistir notificaciones en BD
      result.totalExtraidas = allRecords.length;
      result.notificaciones = allRecords;
      result.nuevasGuardadas = await this.guardarNotificaciones(empresa.id, allRecords);

      // Actualizar timestamp de última sincronización
      await this.prisma.empresa.update({
        where: { id: empresa.id },
        data: {
          ultimaSincronizacion: new Date(),
          estadoSincro: 'SUCCESS',
        },
      });

      this.logger.log(
        `[SUNAFIL] Sincronización completada para ${empresa.ruc}. Extraídas: ${result.totalExtraidas}, Nuevas: ${result.nuevasGuardadas}`,
      );

      return result;
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  /**
   * Toma una captura de pantalla y la guarda en uploads/sunafil-debug/
   */
  private async takeDebugScreenshot(page: Page, name: string): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.join(process.cwd(), 'uploads', 'sunafil-debug');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, `${name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      this.logger.log(`📸 Captura de depuración guardada: uploads/sunafil-debug/${name}.png (URL: ${page.url()})`);
    } catch (e) {
      this.logger.debug(`No se pudo tomar captura: ${e.message}`);
    }
  }

  /**
   * Navega a un menú específico haciendo clic en los enlaces o submenús del sidebar
   */
  private async navigateToMenu(page: Page, parentText: string, subText: string): Promise<void> {
    this.logger.log(`Navegando a menú: ${parentText} > ${subText}...`);

    // 1. Eliminar cualquier modal o backdrop residual
    await page.evaluate(() => {
      document.querySelectorAll('.modal, .modal-backdrop').forEach((m) => {
        (m as HTMLElement).style.display = 'none';
        m.remove();
      });
      document.body.classList.remove('modal-open');
    });

    // 2. Extraer el href del submenú
    const linkInfo = await page.evaluate((parent, sub) => {
      const clean = (t: string) =>
        t
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const pClean = clean(parent);
      const sClean = clean(sub);

      const allElements = Array.from(document.querySelectorAll('aside a, nav a, .sidebar a, ul a, a'));
      let subLink = allElements.find((el) => clean(el.textContent || '').includes(sClean));

      // Si no se encuentra o no está visible, abrir acordeón padre
      if (!subLink) {
        const parentLink = allElements.find((el) => clean(el.textContent || '').includes(pClean));
        if (parentLink) {
          (parentLink as HTMLElement).click();
        }
      }

      // Reintentar encontrar sublink
      subLink = allElements.find((el) => clean(el.textContent || '').includes(sClean));
      if (subLink) {
        const href = (subLink as HTMLAnchorElement).getAttribute('href');
        return {
          found: true,
          href: href && href !== '#' && !href.startsWith('javascript:') ? href : null,
        };
      }

      return { found: false, href: null };
    }, parentText, subText);

    // 3. Navegar por URL directa si existe o por clic
    if (linkInfo.href) {
      const currentOrigin = new URL(page.url()).origin;
      const targetUrl = linkInfo.href.startsWith('http')
        ? linkInfo.href
        : `${currentOrigin}${linkInfo.href.startsWith('/') ? '' : '/'}${linkInfo.href}`;
      this.logger.log(`Navegando a URL directa: ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => {});
    } else {
      await page.evaluate((sub) => {
        const clean = (t: string) =>
          t.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const sClean = clean(sub);
        const allElements = Array.from(document.querySelectorAll('aside a, nav a, .sidebar a, ul a, a'));
        const subLink = allElements.find((el) => clean(el.textContent || '').includes(sClean));
        if (subLink) (subLink as HTMLElement).click();
      }, subText);
    }

    // 4. Esperar a que la tabla o datos carguen
    await new Promise((r) => setTimeout(r, 2000));
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => {});

    // 5. Capturar pantalla de depuración
    const cleanName = subText.replace(/[\s\/]/g, '_').toLowerCase();
    await this.takeDebugScreenshot(page, `modulo-${cleanName}`);
  }

  /**
   * Guarda o actualiza los registros extraídos en la base de datos
   */
  private async guardarNotificaciones(empresaId: string, records: BaseSunafilRecord[]): Promise<number> {
    let nuevas = 0;

    for (const rec of records) {
      const fileId = `SUNAFIL-${rec.modulo}-${rec.codigoReferencia}`;
      
      const existente = await this.prisma.notificacion.findFirst({
        where: {
          empresaId,
          fileId,
        },
      });

      if (!existente) {
        await this.prisma.notificacion.create({
          data: {
            empresaId,
            fileId,
            asunto: rec.asunto,
            tipo: rec.modulo,
            estado: rec.estado || 'NO_LEIDO',
            fechaMensaje: rec.fechaNotificacion || rec.fechaDeposito || new Date(),
            origen: 'SUNAFIL',
            moduloSunafil: rec.modulo,
            codigoReferencia: rec.codigoReferencia,
            intendencia: rec.intendencia || null,
            fechaDeposito: rec.fechaDeposito || null,
            fechaNotificacion: rec.fechaNotificacion || null,
            fechaLimite: rec.fechaLimite || null,
            plazoDias: rec.plazoDias || null,
            trabajadoresIncorporados: rec.trabajadoresIncorporados || null,
            pdfDescargado: false,
            metadataExtra: (rec.metadataExtra || {}) as any,
          } as any,
        });
        nuevas++;
      } else {
        // Actualizar estado o fechas si cambiaron
        const prevData = existente as any;
        await this.prisma.notificacion.update({
          where: { id: existente.id },
          data: {
            estado: rec.estado || existente.estado,
            fechaLimite: rec.fechaLimite || prevData.fechaLimite || null,
            metadataExtra: (rec.metadataExtra || prevData.metadataExtra || {}) as any,
          } as any,
        });
      }
    }

    return nuevas;
  }
}
