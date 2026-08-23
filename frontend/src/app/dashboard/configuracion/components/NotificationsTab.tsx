import React from 'react';
import { Bell, Volume2, VolumeX, Mail } from 'lucide-react';

interface NotificationsTabProps {
  soundEnabled: boolean;
  emailAlerts: boolean;
  onToggleSound: () => void;
  onToggleEmail: () => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  soundEnabled,
  emailAlerts,
  onToggleSound,
  onToggleEmail,
}) => {
  return (
    <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-blue-400" />
          Preferencias de Alertas y Sonido
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
          Personaliza cómo recibes las alertas de nuevas resoluciones y notificaciones urgentes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Opción 1: Sonido en tiempo real */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl gap-4">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Sonido de Alerta en Tiempo Real
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Reproduce un timbre de advertencia cuando el robot detecta resoluciones o documentos urgentes de SUNAT.
            </p>
          </div>
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border self-start sm:self-auto ${
              soundEnabled
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-gray-500/10 text-gray-400 border-white/5'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" /> Sonido Activo
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" /> Silenciado
              </>
            )}
          </button>
        </div>

        {/* Opción 2: Alertas por Correo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl gap-4">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Alertas por Correo Electrónico (SMTP)
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Envía correos inmediatos al administrador cuando se detectan órdenes de pago o resoluciones coactivas.
            </p>
          </div>
          <button
            onClick={onToggleEmail}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border self-start sm:self-auto ${
              emailAlerts
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-gray-500/10 text-gray-400 border-white/5'
            }`}
          >
            {emailAlerts ? 'Habilitado' : 'Deshabilitado'}
          </button>
        </div>
      </div>
    </div>
  );
};
