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
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface SunatLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: any | null;
}

export const SunatLoginModal: React.FC<SunatLoginModalProps> = ({
  isOpen,
  onClose,
  empresa,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);

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
            message: '✓ Ventana de Incógnito abierta y credenciales autocompletadas.',
          });
        } else {
          setActionStatus({
            type: 'success',
            message: '✓ Pestaña abierta y credenciales autocompletadas.',
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Consultar presencia de la extensión de forma segura hacia el origen local
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

  const openSunatTab = async (mode: 'normal' | 'incognito' = 'normal') => {
    const isIncognito = mode === 'incognito';
    setActionStatus(null);
    setLoadingCredentials(true);

    let clave = empresa.claveSol;
    let targetUrl = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';

    // Obtener credencial fresca y desencriptada de forma segura bajo demanda
    try {
      const res = await api.post(`/scraper/open-portal/${empresa.id}`, { portal: 'SUNAT' });
      if (res.data?.claveSol) {
        clave = res.data.claveSol;
      }
      if (res.data?.url) {
        targetUrl = res.data.url;
      }
    } catch (err) {
      console.warn('[SunatLoginModal] No se pudieron obtener credenciales on-demand:', err);
    } finally {
      setLoadingCredentials(false);
    }

    // 1. Notificar a la extensión BES Auto-Fill asegurando el origin
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

    // 2. Si la extensión no está instalada o no responde, hacer fallback
    if (!extensionInstalled) {
      if (isIncognito) {
        setActionStatus({
          type: 'warning',
          message:
            '⚠️ Para abrir en Incógnito real: En tu navegador ve a extensions (brave://extensions o chrome://extensions), pulsa 🔄 Recargar y activa "Permitir en modo incógnito".',
        });
        window.open(
          targetUrl,
          `sunat_incognito_${empresa.ruc}`,
          'width=1280,height=850,menubar=no,status=no,toolbar=no',
        );
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 relative bg-gradient-to-b from-blue-500/10 to-transparent shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Acceso Rápido a SUNAT (Clave SOL)
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
                Autocompletado automático y gestión multi-cuenta
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {empresa.razonSocial}
              </div>
              <div className="text-[11px] font-mono text-gray-400">
                RUC: {empresa.ruc}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          {/* Field: RUC */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                RUC
              </div>
              <div className="text-sm font-mono font-semibold text-white">
                {empresa.ruc}
              </div>
            </div>
            <button
              onClick={() => handleCopy(empresa.ruc, 'ruc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                copiedField === 'ruc'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {copiedField === 'ruc' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedField === 'ruc' ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Field: Usuario SOL */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                Usuario SOL
              </div>
              <div className="text-sm font-mono font-semibold text-white">
                {empresa.usuarioSol || '—'}
              </div>
            </div>
            <button
              onClick={() => handleCopy(empresa.usuarioSol, 'usuario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                copiedField === 'usuario'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {copiedField === 'usuario' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedField === 'usuario' ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Field: Clave SOL Protegida */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                Clave SOL
              </div>
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

          {/* Status feedback */}
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

          {/* Tip Incógnito / Multi-Cuenta */}
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-200/90 leading-relaxed space-y-1">
              <p>
                <strong>Para Incógnito en Brave o Chrome:</strong> Abre{' '}
                <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">
                  brave://extensions
                </code>{' '}
                o{' '}
                <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">
                  chrome://extensions
                </code>
                , pulsa el botón <strong>🔄 Recargar</strong> en la extensión y
                activa <strong>&quot;Permitir en modo incógnito&quot;</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <button
            onClick={() => openSunatTab('normal')}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20"
          >
            <ExternalLink className="w-4 h-4" /> Pestaña Normal
          </button>
          <button
            onClick={() => openSunatTab('incognito')}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-4 rounded-2xl font-bold text-xs transition-all border border-indigo-500/30 shadow-lg shadow-purple-600/20"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" /> Ventana Incógnito (Privada)
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl font-semibold text-xs transition-all border border-white/5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
