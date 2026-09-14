"use client";

import React, { useState } from 'react';
import { Flame } from 'lucide-react';

interface HistoricoItem {
  mesKey: string;
  mesNombre: string;
  cantidad: number;
  peligrosas: number;
  normales: number;
}

interface HistoricoMensualSectionProps {
  historicoMensual?: HistoricoItem[];
}

export const HistoricoMensualSection: React.FC<HistoricoMensualSectionProps> = ({ historicoMensual = [] }) => {
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');

  const filteredHistorico = historicoMensual.filter((item) => {
    if (startMonth && item.mesKey < startMonth) return false;
    if (endMonth && item.mesKey > endMonth) return false;
    return true;
  });

  return (
    <div className="bg-[#111827] rounded-3xl border border-white/5 overflow-hidden p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            Histórico General de Alertas (Vista Mensual)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Evolución histórica y volumen de notificaciones acumuladas por mes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 font-semibold">Desde:</span>
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="bg-transparent border-none text-white outline-none text-sm [color-scheme:dark] cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 font-semibold">Hasta:</span>
            <input
              type="month"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="bg-transparent border-none text-white outline-none text-sm [color-scheme:dark] cursor-pointer"
            />
          </div>
          {(startMonth || endMonth) && (
            <button
              onClick={() => {
                setStartMonth('');
                setEndMonth('');
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      <HistoricoLineChart data={filteredHistorico} />
    </div>
  );
};

function HistoricoLineChart({ data }: { data: HistoricoItem[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111827] rounded-xl border border-white/5 p-6 text-center text-gray-500">
        <p className="text-sm">No hay datos suficientes para el histórico acumulado.</p>
      </div>
    );
  }

  const width = 900;
  const height = 240;
  const px = 50;
  const py = 40;

  const maxVal = Math.max(...data.map((d) => Math.max(d.cantidad, d.peligrosas, d.normales, 1)), 1);

  const pointsPeligrosas: { x: number; y: number; val: number }[] = [];
  const pointsNormales: { x: number; y: number; val: number }[] = [];
  const pointsTotal: { x: number; y: number; val: number }[] = [];

  const count = data.length;
  const stepX = count > 1 ? (width - 2 * px) / (count - 1) : 0;

  data.forEach((d, i) => {
    const x = count > 1 ? px + i * stepX : width / 2;
    const yP = height - py - (d.peligrosas / maxVal) * (height - 2 * py);
    const yN = height - py - (d.normales / maxVal) * (height - 2 * py);
    const yT = height - py - (d.cantidad / maxVal) * (height - 2 * py);

    pointsPeligrosas.push({ x, y: yP, val: d.peligrosas });
    pointsNormales.push({ x, y: yN, val: d.normales });
    pointsTotal.push({ x, y: yT, val: d.cantidad });
  });

  const pathPeligrosas = pointsPeligrosas.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const pathNormales = pointsNormales.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const pathTotal = pointsTotal.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  const areaTotal =
    count > 1
      ? `${pathTotal} L ${pointsTotal[count - 1].x} ${height - py} L ${pointsTotal[0].x} ${height - py} Z`
      : '';

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4 text-xs justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-rose-400 font-semibold">Peligrosas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-indigo-400 font-semibold">Normales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 font-semibold">Total Mensual</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px] overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowRose" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.5" />
            </filter>
            <filter id="glowIndigo" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.5" />
            </filter>
          </defs>

          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = height - py - ratio * (height - 2 * py);
            return (
              <g key={idx}>
                <line x1={px} y1={y} x2={width - px} y2={y} stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="4 4" />
                <text x={px - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end" fontFamily="monospace">
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {areaTotal && <path d={areaTotal} fill="url(#areaGradient)" />}
          <path d={pathTotal} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.7" />
          <path d={pathNormales} fill="none" stroke="#6366f1" strokeWidth="3" filter="url(#glowIndigo)" />
          <path d={pathPeligrosas} fill="none" stroke="#f43f5e" strokeWidth="3" filter="url(#glowRose)" />

          {data.map((d, i) => {
            const pP = pointsPeligrosas[i];
            const pN = pointsNormales[i];
            const pT = pointsTotal[i];
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.mesKey}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <text
                  x={pT.x}
                  y={height - 12}
                  fill={isHovered ? '#ffffff' : '#9ca3af'}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {d.mesNombre}
                </text>

                {isHovered && (
                  <line
                    x1={pT.x}
                    y1={py}
                    x2={pT.x}
                    y2={height - py}
                    stroke="#ffffff"
                    strokeOpacity="0.2"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                <circle cx={pN.x} cy={pN.y} r={isHovered ? '6' : '4'} fill="#6366f1" stroke="#111827" strokeWidth="2" />
                <circle cx={pP.x} cy={pP.y} r={isHovered ? '6' : '4'} fill="#f43f5e" stroke="#111827" strokeWidth="2" />
                <circle cx={pT.x} cy={pT.y} r={isHovered ? '5' : '3'} fill="#22d3ee" stroke="#111827" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-2 right-4 bg-black/90 border border-white/10 rounded-2xl p-3.5 text-xs text-white shadow-2xl backdrop-blur-md min-w-[180px] pointer-events-none">
            <p className="font-bold text-white mb-1.5 text-sm border-b border-white/10 pb-1">
              {data[hoveredIdx].mesNombre}
            </p>
            <div className="space-y-1">
              <p className="text-rose-400 font-semibold flex items-center justify-between gap-3">
                <span>⚠️ Peligrosas:</span> <strong>{data[hoveredIdx].peligrosas}</strong>
              </p>
              <p className="text-indigo-400 font-semibold flex items-center justify-between gap-3">
                <span>ℹ️ Normales:</span> <strong>{data[hoveredIdx].normales}</strong>
              </p>
              <p className="text-cyan-300 font-bold flex items-center justify-between gap-3 pt-1 border-t border-white/10">
                <span>📊 Total Mensual:</span> <strong>{data[hoveredIdx].cantidad}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
