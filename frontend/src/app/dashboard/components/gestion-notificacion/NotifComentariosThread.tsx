"use client";

import React from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface NotifComentariosThreadProps {
  comentarios: any[];
  nuevoComentario: string;
  setNuevoComentario: (v: string) => void;
  loadingComentarios: boolean;
  sendingComentario: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const NotifComentariosThread: React.FC<NotifComentariosThreadProps> = ({
  comentarios, nuevoComentario, setNuevoComentario,
  loadingComentarios, sendingComentario, onSubmit,
}) => (
  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
      <MessageSquare className="w-4 h-4" /> Bitácora de Seguimiento ({comentarios.length})
    </h4>

    <form onSubmit={onSubmit} className="flex gap-2">
      <input type="text" value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)}
        placeholder="Escribe una actualización o nota rápida..."
        className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      <button type="submit" disabled={sendingComentario || !nuevoComentario.trim()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer">
        {sendingComentario ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </button>
    </form>

    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 divide-y divide-white/5">
      {loadingComentarios ? (
        <div className="text-center text-xs text-gray-500 py-3">Cargando historial...</div>
      ) : comentarios.length === 0 ? (
        <div className="text-center text-xs text-gray-500 py-3">No hay notas ni comentarios registrados aún.</div>
      ) : (
        comentarios.map((c) => (
          <div key={c.id} className="pt-2.5 first:pt-0">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-gray-300">{c.usuarioNombre || 'Usuario'}</span>
              <span className="text-gray-500 text-[10px]">
                {new Date(c.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-gray-300 bg-white/[0.02] p-2 rounded-lg border border-white/5">{c.texto}</p>
          </div>
        ))
      )}
    </div>
  </div>
);
