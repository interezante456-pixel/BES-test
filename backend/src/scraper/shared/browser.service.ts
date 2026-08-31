import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, BrowserContext, Page } from 'puppeteer';

export interface BrowserSession {
  browser: Browser;
  page: Page;
}

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);

  /**
   * Configuración base de argumentos de Chrome compartida por todos los scrapers.
   * Cambiar aquí afecta a SUNAT y SUNAFIL simultáneamente.
   */
  private get chromeArgs(): string[] {
    return [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--start-maximized',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--incognito',
      '--disable-features=PasswordLeakDetection,AutofillServerCommunication',
      '--disable-save-password-bubble',
      '--password-store=basic',
    ];
  }

  private get userAgent(): string {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  }

  private isHeadless(): boolean {
    return process.env.PUPPETEER_HEADLESS?.replace(/['"]/g, '').trim() === 'true';
  }

  private getExecutablePath(): string | undefined {
    return process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  }

  /**
   * Lanza un browser con contexto AISLADO (BrowserContext propio).
   * Uso: SUNAT — garantiza aislamiento total de cookies entre sesiones.
   * Cada llamada devuelve un contexto independiente aunque el proceso sea el mismo.
   */
  async launchIsolated(): Promise<BrowserSession> {
    const headless = this.isHeadless();
    this.logger.log(`[Browser] Iniciando Puppeteer (aislado). Headless: ${headless}`);

    const browser = await puppeteer.launch({
      executablePath: this.getExecutablePath(),
      headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: this.chromeArgs,
    });

    const context: BrowserContext = await browser.createBrowserContext();
    const page = await context.newPage();
    this.configPage(page);
    return { browser, page };
  }

  /**
   * Lanza un browser con página directa sobre el contexto por defecto.
   * Uso: SUNAFIL — más ligero para sesiones donde el aislamiento
   * de cookies es gestionado por la lógica de login.
   */
  async launchSimple(): Promise<BrowserSession> {
    const headless = this.isHeadless();
    this.logger.log(`[Browser] Iniciando Puppeteer (simple). Headless: ${headless}`);

    const browser = await puppeteer.launch({
      executablePath: this.getExecutablePath(),
      headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: this.chromeArgs,
    });

    const page = await browser.newPage();
    this.configPage(page);
    return { browser, page };
  }

  /**
   * Configura una página con los ajustes estándar del sistema:
   * timeout, User-Agent, headers de idioma y handler de diálogos automáticos.
   */
  private configPage(page: Page): void {
    page.setDefaultNavigationTimeout(60000);
    void page.setUserAgent(this.userAgent);
    void page.setExtraHTTPHeaders({ 'Accept-Language': 'es-ES,es;q=0.9' });

    page.on('dialog', async (dialog) => {
      this.logger.log(
        `[Browser] Diálogo detectado [${dialog.type()}]: "${dialog.message()}". Aceptando...`,
      );
      await dialog.accept();
    });
  }
}
