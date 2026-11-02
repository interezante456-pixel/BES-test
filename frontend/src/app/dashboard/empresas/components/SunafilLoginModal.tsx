"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Building2,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';

interface SunafilLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: any | null;
  onSync?: (id: string) => void;
  isSyncing?: boolean;
}

export const SunafilLoginModal: React.FC<SunafilLoginModalProps> = ({
  isOpen,
  onClose,
  empresa,
  onSync,
  isSyncing = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const sunafilOAuthUrl =
    'https://api-seguridad.sunat.gob.pe/v1/clientessol/b6474e23-8a3b-4153-b301-dafcc9646250/oauth2/login?originalUrl=https://casillaelectronica.sunafil.gob.pe/si.inbox/Login/Empresa&state=s';

  // Detectar la extensión BES
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'BES_EXTENSION_INSTALLED') {
        setExtensionInstalled(true);
      }
      if (event.data && event.data.type === 'BES_SUNAT_OPENED') {
        if (event.data.incognito) {
          setActionStatus({
            type: 'success',
            message: '✓ Ventana de Incógnito abierta y credenciales autocompletadas en SUNAFIL.',
          });
        } else {
          setActionStatus({
            type: 'success',
            message: '✓ Pestaña abierta y credenciales autocompletadas en SUNAFIL.',
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Consultar presencia de la extensión hacia el origen local
    window.postMessage({ type: 'BES_CHECK_EXTENSION' }, window.location.origin);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen]);

  if (!isOpen || !empresa) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openSunafilTab = async (mode: 'normal' | 'incognito' = 'normal') => {
    const isIncognito = mode === 'incognito';
    setActionStatus(null);
    setLoadingCredentials(true);

    let clave = empresa.claveSol;
    let targetUrl = sunafilOAuthUrl;

    // Obtener credenciales frescas y desencriptadas on-demand de forma segura
    try {
      const res = await api.post(`/scraper/open-portal/${empresa.id}`, { portal: 'SUNAFIL' });
      if (res.data?.claveSol) {
        clave = res.data.claveSol;
      }
      if (res.data?.url) {
        targetUrl = res.data.url;
      }
    } catch (err) {
      console.warn('[SunafilLoginModal] No se pudieron obtener credenciales on-demand:', err);
    } finally {
      setLoadingCredentials(false);
    }

    // 1. Notificar a la extensión BES Auto-Fill asegurando el targetOrigin
    window.postMessage(
      {
        type: 'BES_FILL_SUNAT',
        incognito: isIncognito,
        data: {
          ruc: empresa.ruc,
          usuarioSol: empresa.usuarioSol,
          claveSol: clave,
          url: targetUrl,
        },
      },
      window.location.origin,
    );

    // 2. Si la extensión no está instalada, hacer fallback
    if (!extensionInstalled) {
      if (isIncognito) {
        setActionStatus({
          type: 'warning',
          message:
            '⚠️ Para autocompletar automáticamente instala la extensión BES desde chrome://extensions o copia las credenciales con los botones de abajo.',
        });
        window.open(
          targetUrl,
          `sunafil_incognito_${empresa.ruc}`,
          'width=1280,height=850,menubar=no,status=no,toolbar=no',
        );
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 relative bg-gradient-to-b from-indigo-500/10 to-transparent shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Detalles y Acceso SUNAFIL
                </h3>
                {extensionInstalled ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Extensión lista
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Extensión pendiente
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Credenciales Clave SOL y autocompletado en Casilla SUNAFIL
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {empresa.razonSocial}
                </div>
                <div className="text-[11px] font-mono text-gray-400">
                  RUC: {empresa.ruc}
                </div>
              </div>
            </div>
            {empresa.ultimaSincronizacion && (
              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-500 block">Última sincro:</span>
                <span className="text-[11px] font-medium text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  {new Date(empresa.ultimaSincronizacion).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          {/* Field: RUC */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">RUC</div>
              <div className="text-sm font-mono font-semibold text-white">{empresa.ruc}</div>
            </div>
            <button
              onClick={() => handleCopy(empresa.ruc, 'ruc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                copiedField === 'ruc'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {copiedField === 'ruc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'ruc' ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Field: Usuario SOL */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Usuario SOL</div>
              <div className="text-sm font-mono font-semibold text-white">{empresa.usuarioSol || 'No configurado'}</div>
            </div>
            <button
              onClick={() => handleCopy(empresa.usuarioSol, 'usuario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                copiedField === 'usuario'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {copiedField === 'usuario' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'usuario' ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Field: Clave SOL Protegida */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Clave SOL</div>
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <span>••••••••••••</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  PROTEGIDA
                </span>
              </div>
            </div>
            <span className="text-[11px] text-gray-500 italic">
              Autocompletado seguro
            </span>
          </div>

          {/* Alerta de Términos y Condiciones Pendientes */}
          {empresa.terminosSunafil === 'PENDIENTE_ACEPTACION' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed">
                <strong className="text-amber-300 font-bold block mb-0.5">⚠️ Términos y Condiciones Pendientes</strong>
                Esta empresa aún no ha aceptado los Términos y Condiciones de la Casilla SUNAFIL. Haz clic en <strong>&quot;Abrir y Autocompletar&quot;</strong> para ingresar con la Clave SOL y aceptarlos manualmente antes de sincronizar.
              </div>
            </div>
          )}

          {/* Alerta de Contacto Pendiente */}
          {empresa.terminosSunafil === 'PENDIENTE_CONTACTO' && (
            <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-2.5 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
              <UserPlus className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-xs text-orange-200 leading-relaxed">
                <strong className="text-orange-300 font-bold block mb-0.5">⚠️ Falta Registrar Contacto en SUNAFIL</strong>
                Esta empresa no cuenta con contactos registrados en la Casilla SUNAFIL. Haz clic en <strong>&quot;Abrir y Autocompletar&quot;</strong> para ingresar con la Clave SOL y registrar por lo menos los datos de un contacto.
              </div>
            </div>
          )}

          {/* Status Feedback */}
          {actionStatus && (
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                actionStatus.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              }`}
            >
              {actionStatus.message}
            </div>
          )}

          {/* Tip Extensión / Multi-Cuenta */}
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-200/90 leading-relaxed space-y-1">
              <p>
                <strong>Autocompletado instantáneo:</strong> Con la extensión cargada en{' '}
                <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">
                  chrome://extensions
                </code>{' '}
                o{' '}
                <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">
                  brave://extensions
                </code>
                , los datos se rellenarán automáticamente en el formulario oficial.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openSunafilTab('normal')}
                className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <ExternalLink className="w-4 h-4" /> Abrir y Autocompletar
              </button>
              <button
                onClick={() => openSunafilTab('incognito')}
                className="py-3 px-4 rounded-xl text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Ventana Incógnito
              </button>
            </div>

            {onSync && (
              <button
                onClick={() => onSync(empresa.id)}
                disabled={isSyncing || empresa.activo === false}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando SUNAFIL...' : 'Sincronizar Notificaciones SUNAFIL'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
