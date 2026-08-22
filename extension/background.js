// Service Worker de Fondo (Background) para ORACON Auto-Fill SUNAT (Manifest V3)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'BES_OPEN_SUNAT_WINDOW') {
    const { ruc, usuarioSol, claveSol } = request.data || {};
    const incognito = Boolean(request.incognito);

    // 1. Guardar credenciales en el storage local para que content-sunat.js las lea
    chrome.storage.local.set({
      bes_pending_login: {
        ruc: ruc || '',
        usuarioSol: usuarioSol || '',
        claveSol: claveSol || '',
        timestamp: Date.now()
      }
    }, () => {
      const sunatUrl = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';

      if (incognito) {
        // 2a. Abrir en Ventana de Incógnito / Privada dedicada (Brave / Chrome / Edge)
        chrome.windows.create({
          url: sunatUrl,
          incognito: true,
          focused: true,
          state: 'maximized'
        }, (createdWindow) => {
          if (chrome.runtime.lastError || !createdWindow) {
            console.warn(
              '[BES Extension] No se pudo abrir en incógnito (posiblemente falta activar el permiso en la extensión). Abriendo en ventana independiente normal...',
              chrome.runtime.lastError
            );
            // Fallback si no tiene habilitado el permiso de incógnito
            chrome.windows.create({ url: sunatUrl, focused: true, state: 'maximized' });
          }
        });
      } else {
        // 2b. Abrir en nueva pestaña normal
        chrome.tabs.create({ url: sunatUrl, active: true });
      }

      sendResponse({ success: true, mode: incognito ? 'incognito' : 'normal' });
    });

    return true; // Respuesta asíncrona
  }
});
