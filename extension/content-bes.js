// Content script inyectado en la aplicación web BES

// 1. Notificar a la web que la extensión está instalada
function notifyExtensionReady() {
  window.postMessage({ type: 'BES_EXTENSION_INSTALLED', version: '1.1.0' }, window.location.origin);
}

notifyExtensionReady();

// 2. Escuchar mensajes provenientes de la web BES
window.addEventListener('message', (event) => {
  // Validar origen: rechazar mensajes provenientes de frames u orígenes externos
  if (event.origin !== window.location.origin) return;

  if (event.data && event.data.type === 'BES_CHECK_EXTENSION') {
    notifyExtensionReady();
  }

  // Escuchar cuando el usuario hace clic en "Abrir en Pestaña" o "Abrir en Incógnito"
  if (event.data && event.data.type === 'BES_FILL_SUNAT') {
    const { ruc, usuarioSol, claveSol, url } = event.data.data || event.data.credentials || {};
    const incognito = Boolean(event.data.incognito);

    if (ruc) {
      // Intentar enviar al Service Worker de Background
      chrome.runtime.sendMessage({
        type: 'BES_OPEN_SUNAT_WINDOW',
        incognito: incognito,
        data: {
          ruc: ruc || '',
          usuarioSol: usuarioSol || '',
          claveSol: claveSol || '',
          url: url || '',
        }
      }, (response) => {
        window.postMessage({
          type: 'BES_SUNAT_OPENED',
          incognito: incognito,
          success: !chrome.runtime.lastError,
        }, window.location.origin);

        if (chrome.runtime.lastError) {
          console.warn('[BES Extension] Guardando localmente en storage como fallback:', chrome.runtime.lastError);
          // Fallback clásico con storage local si el worker no responde
          chrome.storage.local.set({
            bes_pending_login: {
              ruc: ruc || '',
              usuarioSol: usuarioSol || '',
              claveSol: claveSol || '',
              timestamp: Date.now()
            }
          });
        }
      });
    }
  }
});
