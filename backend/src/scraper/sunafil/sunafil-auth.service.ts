import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';

@Injectable()
export class SunafilAuthService {
  private readonly logger = new Logger(SunafilAuthService.name);

  private readonly sunafilLoginUrl =
    'https://api-seguridad.sunat.gob.pe/v1/clientessol/b6474e23-8a3b-4153-b301-dafcc9646250/oauth2/login?originalUrl=https://casillaelectronica.sunafil.gob.pe/si.inbox/Login/Empresa&state=s';

  /**
   * Realiza el login Clave SOL para acceder a la Casilla Electrónica de SUNAFIL
   */
  async login(page: Page, ruc: string, usuarioSol: string, claveSol: string): Promise<boolean> {
    this.logger.log(`[SUNAFIL Auth] Iniciando sesión para RUC ${ruc}...`);

    // 1. Navegación con reintentos
    let loaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(this.sunafilLoginUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        loaded = true;
        break;
      } catch (err) {
        this.logger.warn(`[SUNAFIL Auth] Intento ${attempt} de carga fallido, reintentando en 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    if (!loaded) {
      throw new Error('No se pudo conectar con el portal de autenticación Clave SOL de SUNAT/SUNAFIL.');
    }

    // 2. Esperar campos de login
    await page.waitForSelector('input[name="numruc"], #txtRuc, input[placeholder*="RUC" i]', { timeout: 25000 });

    // Asegurar selección de pestaña RUC si existiese
    try {
      await page.evaluate(() => {
        const rucTab = Array.from(document.querySelectorAll('button, a, div')).find((el) =>
          el.textContent?.trim().toUpperCase() === 'RUC'
        );
        if (rucTab) (rucTab as HTMLElement).click();
      });
    } catch {
      // Si no es necesario cambiar de tab, continuar
    }

    // 3. Escribir credenciales
    const rucInput = await page.$('input[name="numruc"], #txtRuc, input[placeholder*="RUC" i]');
    const userInput = await page.$('input[name="txtUsuario"], #txtUsuario, input[placeholder*="Usuario" i]');
    const passInput = await page.$('input[name="txtContrasena"], #txtContrasena, input[type="password"]');

    if (!rucInput || !userInput || !passInput) {
      throw new Error('No se encontraron los campos del formulario de Clave SOL en la página.');
    }

    await rucInput.click({ clickCount: 3 });
    await rucInput.type(ruc, { delay: 40 });

    await userInput.click({ clickCount: 3 });
    await userInput.type(usuarioSol, { delay: 40 });

    await passInput.click({ clickCount: 3 });
    await passInput.type(claveSol, { delay: 40 });

    // 4. Click en el botón Entrar
    this.logger.log('[SUNAFIL Auth] Enviando credenciales...');
    const clicked = await page.evaluate(() => {
      const btn =
        document.querySelector('button#btnAceptar, #btnAceptar, button[type="submit"], input[type="submit"]') ||
        Array.from(document.querySelectorAll('button')).find((b) =>
          b.textContent?.trim().toLowerCase().includes('entrar')
        );
      if (btn) {
        (btn as HTMLElement).click();
        return true;
      }
      return false;
    });

    if (clicked) {
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    } else {
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    }

    // 5. Verificar si hubo error de credenciales
    const errorText = await page.evaluate(() => {
      const alert = document.querySelector('.alert-danger, .error, #divError, .text-danger');
      return alert ? (alert as HTMLElement).innerText.trim() : null;
    });

    if (errorText && (errorText.toLowerCase().includes('inválid') || errorText.toLowerCase().includes('incorrect'))) {
      throw new Error(`Credenciales Clave SOL rechazadas por SUNAT: ${errorText}`);
    }

    // 6. Esperar a que la URL sea de casillaelectronica.sunafil.gob.pe
    const currentUrl = page.url();
    this.logger.log(`[SUNAFIL Auth] URL tras login: ${currentUrl}`);

    // 7. Cerrar modal de bienvenida si aparece
    await this.closeWelcomeModal(page);

    return true;
  }

  /**
   * Cierra el modal de bienvenida que lista el conteo de notificaciones sin revisar
   */
  async closeWelcomeModal(page: Page): Promise<void> {
    try {
      await page.waitForSelector('.modal.show, .modal-dialog, #modalNotificaciones, .modal-content, div[role="dialog"]', {
        timeout: 6000,
      });

      this.logger.log('[SUNAFIL Auth] Modal de bienvenida detectado. Procediendo a cerrarlo...');

      await page.evaluate(() => {
        const closeBtn =
          document.querySelector('.modal-header .close, button.close, [data-dismiss="modal"]') ||
          Array.from(document.querySelectorAll('button, span, a')).find((el) => {
            const txt = el.textContent?.trim().toLowerCase() || '';
            return txt === '×' || txt === 'x' || txt === 'cerrar';
          });
        if (closeBtn) {
          (closeBtn as HTMLElement).click();
        }
      });
      await new Promise((r) => setTimeout(r, 1200));
    } catch {
      // Si no aparece modal dentro de 6s, continuar normalmente
    }
  }
}
