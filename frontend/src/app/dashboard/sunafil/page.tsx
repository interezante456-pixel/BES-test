"use client";

import React from 'react';
import { Mail, ShieldCheck, Sparkles, Building2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SunafilPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-[#111827] to-purple-950/30 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">SUNAFIL — Casilla Electrónica</h1>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  MÓDULO BETA PRIVADO
                </span>
              </div>
              <p className="text-xs text-gray-400">Monitoreo automatizado de requerimientos y notificaciones laborales</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Robot Scraper en Desarrollo
          </span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-[#111827]/80 border border-white/5 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Casilla Electrónica SUNAFIL</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Este módulo permitirá extraer de forma automática todas las notificaciones, cartas inductivas, resoluciones y requerimientos de inspección de la <strong>Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
              <Clock className="w-4 h-4" />
              Sincronización
            </div>
            <p className="text-[11px] text-gray-400">Extracción periódica nocturna y manual por demanda.</p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              Bandeja Unificada
            </div>
            <p className="text-[11px] text-gray-400">Consolidación con alertas críticas de plazos de respuesta.</p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <AlertTriangle className="w-4 h-4" />
              Alertas Telegram
            </div>
            <p className="text-[11px] text-gray-400">Notificación al instante ante cualquier actuación inspectiva.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          <span>Solo visible para el Super Administrador y usuarios con permiso asignado.</span>
          <Link
            href="/dashboard"
            className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
          >
            Volver al Panel General <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
