'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ShieldCheck, X, Mail, Key, User } from 'lucide-react';

interface UserCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    password?: string;
    rol?: string;
  } | null;
}

export default function UserCreatedModal({
  isOpen,
  onClose,
  userData,
}: UserCreatedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !userData) return null;

  const handleCopy = async () => {
    const textToCopy = `CREDENCIALES DE ACCESO - BES ORACON\nUsuario: ${userData.nombres} ${userData.apellidos}\nDNI: ${userData.dni}\nCorreo: ${userData.email}\nContraseña: ${userData.password || '(la contraseña ingresada)'}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-md shadow-2xl shadow-emerald-500/10 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="relative p-6 text-center">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícono de éxito animado */}
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border border-emerald-500/30 bg-emerald-500/10 mb-4 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-9 h-9 text-emerald-400" />
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">
            ¡Usuario Creado con Éxito!
          </h3>
          <p className="text-gray-400 text-xs mb-6">
            La cuenta ha sido dada de alta correctamente en el sistema.
          </p>

          {/* Tarjeta de Credenciales */}
          <div className="text-left bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-3 mb-6">
            <div className="flex items-center gap-3 text-xs">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  Nombre Completo
                </span>
                <span className="text-white font-semibold truncate block">
                  {userData.nombres} {userData.apellidos}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs border-t border-white/5 pt-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  Correo Electrónico Asignado
                </span>
                <span className="text-emerald-300 font-mono font-medium truncate block select-all">
                  {userData.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs border-t border-white/5 pt-2.5">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  Contraseña de Ingreso
                </span>
                <span className="text-white font-mono font-medium truncate block">
                  {userData.password || '(La ingresada en el formulario)'}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCopy}
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all border ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-300" />
                  <span>Copiar Credenciales</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
