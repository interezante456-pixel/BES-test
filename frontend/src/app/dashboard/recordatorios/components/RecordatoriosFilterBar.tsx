import React from 'react';
import type { RecordatorioFilter } from '../hooks/useRecordatorios';

interface RecordatoriosFilterBarProps {
  filter: RecordatorioFilter;
  setFilter: (f: RecordatorioFilter) => void;
  recordatorios: any[];
}

export const RecordatoriosFilterBar: React.FC<RecordatoriosFilterBarProps> = ({
  filter,
  setFilter,
  recordatorios,
}) => {
  const pendientesCount = recordatorios.filter((r) => !r.completado).length;
  const completadosCount = recordatorios.filter((r) => r.completado).length;
  const todosCount = recordatorios.length;

  const tabs: { key: RecordatorioFilter; label: string; count: number; activeClass: string }[] = [
    {
      key: 'PENDIENTES',
      label: 'Pendientes',
      count: pendientesCount,
      activeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      key: 'COMPLETADOS',
      label: 'Completados',
      count: completadosCount,
      activeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      key: 'TODOS',
      label: 'Todos',
      count: todosCount,
      activeClass: 'bg-white/10 text-white border border-white/20',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setFilter(tab.key)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === tab.key ? tab.activeClass : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
};
