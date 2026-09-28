import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
  asAdmin?: boolean;
}

export function Logo({
  size = 28,
  showText = true,
  className = '',
  variant = 'dark',
  asAdmin = false,
}: LogoProps) {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-105"
        style={{
          width: size,
          height: size,
          background: isLight
            ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
        }}
      >
        <span
          className="font-serif font-bold italic tracking-tight"
          style={{
            fontSize: size * 0.58,
            color: isLight ? '#0f172a' : '#ffffff',
            lineHeight: 1,
            transform: 'translateY(-1px)',
          }}
        >
          C
        </span>
        <div
          className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: asAdmin ? '#f59e0b' : '#38bdf8',
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-serif text-lg sm:text-xl font-bold tracking-tight ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
          >
            Chronicle
          </span>
          <span
            className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {asAdmin ? 'Editorial CMS' : 'Journal & Review'}
          </span>
        </div>
      )}
    </div>
  );
}
