// Content script inyectado en la SUNAT (*.sunat.gob.pe)

function setInputValue(input, value) {
  if (!input || value === undefined || value === null) return;
  try {
    input.focus();
    // Usar el setter nativo de HTMLInputElement para que Angular / React / Vue sincronicen su estado interno
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }
  } catch (e) {
    input.value = value;
  }

  // Disparar eventos nativos seguros sin 'blur' prematuro que limpie el campo
  try {
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  } catch (e) {
    // Fallback
  }
}

function findInputs() {
  const inputs = Array.from(document.querySelectorAll('input'));
  let rucInput = null;
  let userInput = null;
  let passInput = null;

  for (const input of inputs) {
    const type = (input.type || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();

    // 1. Password input
    if (
      type === 'password' ||
      id.includes('clave') ||
      id.includes('contras') ||
      name.includes('clave') ||
      name.includes('contras') ||
      placeholder.includes('contra') ||
      placeholder.includes('clave')
    ) {
      if (!passInput) passInput = input;
      continue;
    }

    // 2. RUC input
    if (
      id.includes('ruc') ||
      name.includes('ruc') ||
      placeholder.includes('ruc') ||
      ariaLabel.includes('ruc')
    ) {
      if (!rucInput) rucInput = input;
      continue;
    }

    // 3. Usuario input
    if (
      id.includes('usuario') ||
      name.includes('usuario') ||
      id.includes('user') ||
      name.includes('user') ||
      placeholder.includes('usuario') ||
      placeholder.includes('user') ||
      ariaLabel.includes('usuario')
    ) {
      if (!userInput) userInput = input;
      continue;
    }
  }

  // Fallback por orden visual en formularios estándar
  if (!rucInput || !userInput || !passInput) {
    const textInputs = inputs.filter(i => {
      const t = (i.type || 'text').toLowerCase();
      return (t === 'text' || t === 'tel' || t === 'number' || t === '') && i.style.display !== 'none';
    });

    if (!rucInput && textInputs[0]) rucInput = textInputs[0];
    if (!userInput && textInputs[1]) userInput = textInputs[1];
    if (!passInput) {
      const pass = inputs.find(i => (i.type || '').toLowerCase() === 'password');
      if (pass) passInput = pass;
    }
  }

  return { rucInput, userInput, passInput };
}

function fillSunatForm(credentials) {
  if (!credentials || !credentials.ruc) return false;

  // Si las credenciales tienen más de 5 minutos, ignorar
  if (Date.now() - credentials.timestamp > 5 * 60 * 1000) {
    return false;
  }

  const { rucInput, userInput, passInput } = findInputs();

  if (rucInput && userInput && passInput) {
    let filledAny = false;

    if (rucInput.value !== credentials.ruc) {
      setInputValue(rucInput, credentials.ruc);
      filledAny = true;
    }

    if (userInput.value !== credentials.usuarioSol) {
      setInputValue(userInput, credentials.usuarioSol);
      filledAny = true;
    }

    if (credentials.claveSol && passInput.value !== credentials.claveSol) {
      setInputValue(passInput, credentials.claveSol);
      filledAny = true;
    }

    if (filledAny) {
      console.log('[BES Extension] Formulario autocompletado y sincronizado con éxito.');
      showSunatBanner(credentials.ruc);
    }
    return true;
  }

  return false;
}

function showSunatBanner(ruc) {
  if (document.getElementById('bes-sunat-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'bes-sunat-banner';
  banner.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 99999999;
    background: #0f172a;
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
    padding: 12px 18px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: opacity 0.4s ease;
  `;
  banner.innerHTML = `
    <span>✅ BES autocompletó las credenciales del RUC <strong>${ruc}</strong>.</span>
  `;
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 400);
  }, 6000);
}

function init() {
  chrome.storage.local.get('bes_pending_login', (result) => {
    const credentials = result.bes_pending_login;
    if (!credentials || !credentials.ruc) return;

    let attempts = 0;
    // Intentos frecuentes al inicio y luego vigilancia continua para evitar que SUNAT borre la contraseña
    const interval = setInterval(() => {
      attempts++;
      fillSunatForm(credentials);

      // Mantener vigilancia durante 15 intentos (~6 segundos) para neutralizar scripts tardíos de SUNAT
      if (attempts >= 15) {
        clearInterval(interval);
        // Limpiar de storage después de haberse completado con éxito la sesión
        setTimeout(() => {
          chrome.storage.local.remove('bes_pending_login');
        }, 10000);
      }
    }, 400);

    // Observador de mutaciones por si SUNAT re-renderiza el formulario con React/Angular
    const observer = new MutationObserver(() => {
      const { passInput } = findInputs();
      if (passInput && credentials.claveSol && passInput.value !== credentials.claveSol) {
        fillSunatForm(credentials);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
