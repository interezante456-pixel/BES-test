import { Injectable, Logger } from '@nestjs/common';
import { Page, CDPSession } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { BaseSunafilRecord } from './interfaces/sunafil-notificacion.interface';

@Injectable()
export class SunafilDownloaderService {
  private readonly logger = new Logger(SunafilDownloaderService.name);

  /**
   * Prepara la carpeta de descargas de SUNAFIL para una empresa
   */
  prepareDownloadDirectory(ruc: string, modulo: string): string {
    const anio = new Date().getFullYear().toString();
    const downloadDir = path.join(process.cwd(), 'uploads', 'sunafil', ruc, anio, modulo.toLowerCase());
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    return downloadDir;
  }

  /**
   * Configura Puppeteer para descargar archivos automáticamente en la carpeta destino sin diálogo de guardar
   */
  async configureDownloadBehavior(page: Page, targetDir: string): Promise<void> {
    try {
      const client = await page.createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: targetDir,
      });
      this.logger.debug(`Comportamiento de descarga configurado hacia: ${targetDir}`);
    } catch (error) {
      this.logger.warn(`No se pudo configurar CDP download behavior: ${error.message}`);
    }
  }

  /**
   * [Fase 2] Descarga el documento asociado a una notificación
   */
  async downloadNotificationDocument(
    page: Page,
    record: BaseSunafilRecord,
    ruc: string,
  ): Promise<string | null> {
    if (!record.tienePdf || !record.docActionSelector) {
      return null;
    }

    try {
      const targetDir = this.prepareDownloadDirectory(ruc, record.modulo);
      await this.configureDownloadBehavior(page, targetDir);

      this.logger.log(`[Fase 2 - PDF] Disparando descarga para: ${record.codigoReferencia}`);
      
      // Localizar y hacer clic en el botón de acción
      const button = await page.$(record.docActionSelector);
      if (button) {
        await button.click();
        await new Promise((r) => setTimeout(r, 2000));
        return targetDir;
      }
      
      return null;
    } catch (e) {
      this.logger.warn(`Error al intentar descargar documento para ${record.codigoReferencia}: ${e.message}`);
      return null;
    }
  }
}
