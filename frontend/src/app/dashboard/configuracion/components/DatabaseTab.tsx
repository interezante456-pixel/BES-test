import React from 'react';
import { Database, HardDrive } from 'lucide-react';

export const DatabaseTab: React.FC = () => {
  return (
    <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Database className="w-5 h-5 text-emerald-400" />
          Mantenimiento y Respaldo de Base de Datos
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
          Instrucciones y comandos recomendados para exportar y respaldar tu base de datos PostgreSQL local en el servidor Xeon.
        </p>
      </div>

      <div className="p-6 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <HardDrive className="w-4 h-4" />
          Comando de Exportación Rápida
        </div>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Ejecuta el siguiente comando en la terminal de tu servidor Xeon para generar una copia de seguridad íntegra de PostgreSQL:
        </p>
        <div className="bg-black/50 border border-white/10 p-4 rounded-2xl font-mono text-xs text-emerald-300 overflow-x-auto select-all shadow-inner">
          docker exec -t bes_postgres pg_dump -U postgres bes_db &gt; backup_bes.sql
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Este comando creará el archivo{' '}
          <code className="text-gray-300 bg-white/5 px-1.5 py-0.5 rounded">backup_bes.sql</code> conteniendo
          todas las credenciales, empresas, notificaciones y lecturas.
        </p>
      </div>
    </div>
  );
};
