import React from 'react';

interface OraconLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export function OraconLogo({ size = 'md', showSubtitle = true, className = '' }: OraconLogoProps) {
  const sizeClasses = {
    sm: {
      text: 'text-xl tracking-wider',
      bracket: 'w-3 h-3 border-[2px]',
      subtitle: 'text-[9px] tracking-[0.2em]',
      gap: 'p-1.5',
    },
    md: {
      text: 'text-2xl font-black tracking-widest',
      bracket: 'w-4 h-4 border-[2.5px]',
      subtitle: 'text-[10px] tracking-[0.25em]',
      gap: 'p-2',
    },
    lg: {
      text: 'text-4xl font-black tracking-widest',
      bracket: 'w-6 h-6 border-[3px]',
      subtitle: 'text-xs tracking-[0.3em]',
      gap: 'p-3',
    },
    xl: {
      text: 'text-5xl font-black tracking-widest',
      bracket: 'w-8 h-8 border-[4px]',
      subtitle: 'text-sm tracking-[0.35em]',
      gap: 'p-4',
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Container with L-Brackets */}
      <div className={`relative flex items-center justify-center ${current.gap}`}>
        {/* Top-Right L-Bracket (┌ ... ┐) */}
        <div className={`absolute top-0 right-0 ${current.bracket} border-t-white border-r-white border-b-transparent border-l-transparent`} />
        
        {/* Bottom-Left L-Bracket (└ ... ┘) */}
        <div className={`absolute bottom-0 left-0 ${current.bracket} border-b-white border-l-white border-t-transparent border-r-transparent`} />

        {/* ORACON Main Text */}
        <span className={`font-black text-[#FF5500] uppercase font-sans ${current.text} drop-shadow-[0_2px_10px_rgba(255,85,0,0.3)]`}>
          ORACON
        </span>
      </div>

      {/* Subtitle */}
      {showSubtitle && (
        <span className={`text-gray-300 font-bold uppercase ${current.subtitle} mt-1 text-center opacity-90`}>
          Estudio Contable
        </span>
      )}
    </div>
  );
}
