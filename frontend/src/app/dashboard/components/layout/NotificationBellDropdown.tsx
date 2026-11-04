"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import api from '@/lib/api';
import { useNotificationStore } from '@/store/useNotificationStore';

export const NotificationBellDropdown: React.FC = () => {
  const router = useRouter();
  const { sinLeer } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const toggleNotifications = async () => {
    if (!showNotifications) {
      setNotifLoading(true);
      try {
        const res = await api.get('/notificaciones');
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setRecentNotifications(list.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent notifications", error);
      } finally {
        setNotifLoading(false);
      }
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative p-2 md:p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6" />
        {sinLeer > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 border-2 border-[#111827] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-0.5">
            {sinLeer > 99 ? '99+' : sinLeer}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <h4 className="font-bold text-white text-sm">Notificaciones Recientes</h4>
            {sinLeer > 0 && (
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                {sinLeer} nuevas
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {notifLoading ? (
              <p className="text-xs text-gray-500 text-center py-4">Cargando...</p>
            ) : recentNotifications.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No hay notificaciones sin leer.</p>
            ) : (
              recentNotifications.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => {
                    setShowNotifications(false);
                    router.push(`/dashboard/bandeja?empresa=${n.empresa.id}`);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-[11px] font-bold text-gray-300 truncate max-w-[150px]">
                      {n.empresa.razonSocial}
                    </span>
                    <span className="text-[9px] text-gray-500 flex-shrink-0">
                      {new Date(n.fechaMensaje).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{n.asunto}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-white/5 mt-3 flex justify-between">
            <Link
              href="/dashboard/bandeja"
              onClick={() => setShowNotifications(false)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              Ver bandeja completa
            </Link>
            <Link
              href="/dashboard/archivo"
              onClick={() => setShowNotifications(false)}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors font-medium"
            >
              Ver archivo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
