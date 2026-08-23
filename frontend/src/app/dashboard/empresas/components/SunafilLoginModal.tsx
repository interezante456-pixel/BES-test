"use client";

import React, { useState } from 'react';
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
  Clock,
  RefreshCw,
  ShieldCheck,
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

  if (!isOpen || !empresa) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sunafilOAuthUrl =
    'https://api-seguridad.sunat.gob.pe/v1/clientessol/b6474e23-8a3b-4153-b301-dafcc9646250/oauth2/login?originalUrl=https://casillaelectronica.sunafil.gob.pe/si.inbox/Login/Empresa&state=s';

  const openSunafilTab = (mode: 'normal' | 'incognito' = 'normal') => {
    if (mode === 'incognito') {
      window.open(
        sunafilOAuthUrl,
        `sunafil_incognito_${empresa.ruc}`,
        'width=1280,height=850,menubar=no,status=no,toolbar=no',
      );
    } else {
      window.open(sunafilOAuthUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative bg-gradient-to-b from-indigo-500/10 to-transparent">
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
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" /> Casilla Activa
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Credenciales Clave SOL y monitoreo de notificaciones laborales
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

          {/* Field: Clave SOL */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Clave SOL</div>
              <div className="text-sm font-mono font-semibold text-white flex items-center gap-2">
                {empresa.claveSol ? (
                  showPassword ? (
                    empresa.claveSol
                  ) : (
                    '••••••••••••'
                  )
                ) : (
                  <span className="text-gray-500 italic">No disponible</span>
                )}
                {empresa.claveSol && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white p-0.5"
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            {empresa.claveSol && (
              <button
                onClick={() => handleCopy(empresa.claveSol, 'clave')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  copiedField === 'clave'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                {copiedField === 'clave' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'clave' ? '¡Copiado!' : 'Copiar'}
              </button>
            )}
          </div>

          {/* Info Módulos */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Módulos Extraídos en Casilla SUNAFIL:
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400">
              <div>• Fiscalización Laboral</div>
              <div>• Cobranza Ordinaria</div>
              <div>• Acciones Previas (Plazos)</div>
              <div>• Alertas Formalización</div>
              <div className="col-span-2">• Seguridad y Salud en el Trabajo</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openSunafilTab('normal')}
                className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <ExternalLink className="w-4 h-4" /> Abrir Casilla
              </button>
              <button
                onClick={() => openSunafilTab('incognito')}
                className="py-3 px-4 rounded-xl text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-purple-400" /> Modo Incógnito
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
