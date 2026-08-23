import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function runLiveTest() {
  console.log('🚀 Iniciando prueba interactiva de SUNAFIL en vivo (Navegador visible)...');

  // Credenciales de prueba
  const ruc = '20551902910';
  const usuario = 'ADMIN'; // Reemplazar con el usuario real de la empresa si difiere
  const clave = 'CLAVE';   // Reemplazar con la clave real si difiere

  const browser = await puppeteer.launch({
    headless: false, // ¡Abre la ventana visible de Chrome!
    slowMo: 60,      // Ralentiza las acciones para poder ver cada clic y tipeo
    defaultViewport: { width: 1366, height: 768 },
    args: ['--start-maximized', '--no-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  const loginUrl =
    'https://api-seguridad.sunat.gob.pe/v1/clientessol/b6474e23-8a3b-4153-b301-dafcc9646250/oauth2/login?originalUrl=https://casillaelectronica.sunafil.gob.pe/si.inbox/Login/Empresa&state=s';

  console.log(`1. Navegando a ${loginUrl}...`);
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

  console.log('2. Esperando formulario Clave SOL...');
  await page.waitForSelector('input[name="numruc"], #txtRuc, input[placeholder*="RUC" i]', { timeout: 30000 });

  console.log('3. Ingresando credenciales...');
  const rucInput = await page.$('input[name="numruc"], #txtRuc, input[placeholder*="RUC" i]');
  const userInput = await page.$('input[name="txtUsuario"], #txtUsuario, input[placeholder*="Usuario" i]');
  const passInput = await page.$('input[name="txtContrasena"], #txtContrasena, input[type="password"]');

  if (rucInput && userInput && passInput) {
    await rucInput.type(ruc, { delay: 50 });
    await userInput.type(usuario, { delay: 50 });
    await passInput.type(clave, { delay: 50 });
    console.log('Credenciales ingresadas.');
  }

  console.log('4. Clic en Entrar...');
  await page.evaluate(() => {
    const btn =
      document.querySelector('button#btnAceptar, #btnAceptar, button[type="submit"], input[type="submit"]') ||
      Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.trim().toLowerCase().includes('entrar')
      );
    if (btn) (btn as HTMLElement).click();
  });

  console.log('5. Esperando ingreso a la Casilla Electrónica...');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

  await new Promise((r) => setTimeout(r, 3000));
  console.log(`URL actual: ${page.url()}`);

  console.log('6. Cerrando modal de bienvenida...');
  await page.evaluate(() => {
    const closeBtn =
      document.querySelector('.modal-header .close, button.close, [data-dismiss="modal"]') ||
      Array.from(document.querySelectorAll('button, span, a')).find((el) => {
        const txt = el.textContent?.trim().toLowerCase() || '';
        return txt === '×' || txt === 'x' || txt === 'cerrar';
      });
    if (closeBtn) (closeBtn as HTMLElement).click();

    // Eliminar backdrop
    document.querySelectorAll('.modal, .modal-backdrop').forEach((m) => m.remove());
    document.body.classList.remove('modal-open');
  });

  console.log('7. Prueba completada. El navegador permanecerá abierto 15 segundos para inspección.');
  await new Promise((r) => setTimeout(r, 15000));
  await browser.close();
}

runLiveTest().catch((e) => console.error('Error en prueba:', e));
