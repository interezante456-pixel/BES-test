import React from 'react';
import { Building2, Power, ShieldCheck } from 'lucide-react';

interface DirectorioKpiCardsProps {
  totalCount: number;
  sunatCount: number;
  sunafilCount: number;
  inactivasCount: number;
}

export const DirectorioKpiCards: React.FC<DirectorioKpiCardsProps> = ({
  totalCount, sunatCount, sunafilCount, inactivasCount,
}) => {
  const cards = [
    { label: 'Total Empresas', value: totalCount, color: 'text-gray-400', bg: 'bg-gray-800/80 border-white/5', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Monitoreo SUNAT', value: sunatCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <span className="text-xs font-black">SOL</span> },
    { label: 'Monitoreo SUNAFIL', value: sunafilCount, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Pausadas / Inactivas', value: inactivasCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Power className="w-5 h-5" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${card.color}`}>{card.label}</p>
            <p className="text-2xl font-extrabold text-white mt-1">{card.value}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.color} ${card.bg}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
