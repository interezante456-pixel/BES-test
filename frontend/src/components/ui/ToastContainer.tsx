'use client';

import React, { useEffect } from 'react';
import { useToastStore, ToastItem, ToastType } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    borderColor: string;
    bgColor: string;
    iconColor: string;
    progressBarColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    bgColor: 'bg-slate-900/90 shadow-emerald-500/10',
    iconColor: 'text-emerald-400',
    progressBarColor: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    borderColor: 'border-rose-500/30 hover:border-rose-500/50',
    bgColor: 'bg-slate-900/90 shadow-rose-500/10',
    iconColor: 'text-rose-400',
    progressBarColor: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500/30 hover:border-amber-500/50',
    bgColor: 'bg-slate-900/90 shadow-amber-500/10',
    iconColor: 'text-amber-400',
    progressBarColor: 'bg-amber-500',
  },
  info: {
    icon: Info,
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/50',
    bgColor: 'bg-slate-900/90 shadow-cyan-500/10',
    iconColor: 'text-cyan-400',
    progressBarColor: 'bg-cyan-500',
  },
};

function ToastMessage({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      role="alert"
      className={`group relative flex items-start gap-3 w-80 sm:w-96 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 overflow-hidden ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        {toast.title && (
          <h4 className="text-sm font-semibold text-white tracking-tight mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-gray-300 leading-relaxed break-words whitespace-pre-line">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        title="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barra de progreso de auto-cierre */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
          <div
            className={`h-full ${config.progressBarColor} transition-all duration-linear`}
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-auto"
    >
      {toasts.map((item) => (
        <ToastMessage key={item.id} toast={item} />
      ))}
    </div>
  );
}
