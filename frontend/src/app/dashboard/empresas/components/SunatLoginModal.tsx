"use client";

import React, { useState } from 'react';
import { X, Copy, Check, Eye, EyeOff, ExternalLink, Building2, KeyRound, ShieldAlert, Sparkles } from 'lucide-react';

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

  if (!isOpen || !empresa) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openSunatTab = (mode: 'normal' | 'incognito' = 'normal') => {
    // 1. Notificar a la extensión de Chrome BES Auto-Fill
    window.postMessage({
      type: 'BES_FILL_SUNAT',
      data: {
        ruc: empresa.ruc,
        usuarioSol: empresa.usuarioSol,
        claveSol: empresa.claveSol
      }
    }, '*');

    // 2. Abrir la página de SUNAT
    const sunatUrl = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';
    if (mode === 'incognito') {
      // Para incógnito, abrir en ventana popup limpia independiente
      window.open(sunatUrl, `sunat_${empresa.ruc}_${Date.now()}`, 'width=1200,height=800,menubar=no,status=no,toolbar=no');
    } else {
      window.open(sunatUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative bg-gradient-to-b from-blue-500/10 to-transparent">
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
              <h3 className="text-lg font-bold text-white leading-tight">Acceso Rápido a SUNAT (Clave SOL)</h3>
              <p className="text-xs text-gray-400">Autocompletado automático y gestión multi-cuenta</p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{empresa.razonSocial}</div>
              <div className="text-[11px] font-mono text-gray-400">RUC: {empresa.ruc}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3.5">
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
              <div className="text-sm font-mono font-semibold text-white">{empresa.usuarioSol || '—'}</div>
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

          {/* Field: Clave SOL */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="overflow-hidden">
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Clave SOL</div>
              <div className="text-sm font-mono font-semibold text-white flex items-center gap-2">
                <span>{showPassword ? (empresa.claveSol || '—') : '••••••••'}</span>
                {empresa.claveSol && (
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => handleCopy(empresa.claveSol, 'clave')}
              disabled={!empresa.claveSol}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                copiedField === 'clave'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {copiedField === 'clave' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'clave' ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Tip Multi-Cuenta */}
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-200/90 leading-relaxed">
              <strong>Tip Multi-cuenta:</strong> Si vas a revisar varias empresas simultáneamente sin que se cierre la sesión de la anterior, usa <strong>Ventana Independiente</strong> o abre una ventana de Incógnito (Ctrl+Shift+N).
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => openSunatTab('normal')}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 px-4 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20"
          >
            <ExternalLink className="w-4 h-4" /> Abrir en Pestaña
          </button>
          <button
            onClick={() => openSunatTab('incognito')}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-2.5 px-4 rounded-2xl font-bold text-xs transition-all border border-white/10"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Ventana Independiente
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl font-semibold text-xs transition-all border border-white/5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
