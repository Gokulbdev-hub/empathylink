import React from 'react';

interface EmpathyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function EmpathyLogo({ size = 'md', showText = true, className = '' }: EmpathyLogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 72, text: 'text-3xl', sub: 'text-sm' },
  };

  const { icon, text, sub } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Dynamic Emblem */}
      <div
        className="relative flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105"
        style={{ width: icon, height: icon }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-empathy-violet via-empathy-cyan to-empathy-emerald opacity-50 blur-md group-hover:opacity-80 transition-opacity" />

        {/* SVG Infinite Heart & Starlight Orbit */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="empathyHeartGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="0.5" stopColor="#06B6D4" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="starlightRing" x1="0" y1="24" x2="48" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="1" stopColor="#EC4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Frosted rounded backing */}
          <rect width="48" height="48" rx="14" fill="#0F172A" fillOpacity="0.85" />
          <rect width="48" height="48" rx="14" stroke="url(#empathyHeartGrad)" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Interlocking Infinite Heart Path */}
          <path
            d="M24 37C24 37 11 28.5 11 19.5C11 14.5 15 11 19.5 11C22 11 23.5 12.2 24 13.5C24.5 12.2 26 11 28.5 11C33 11 37 14.5 37 19.5C37 28.5 24 37 24 37Z"
            fill="url(#empathyHeartGrad)"
            fillOpacity="0.25"
            stroke="url(#empathyHeartGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Celestial Orbit Ring */}
          <ellipse
            cx="24"
            cy="24"
            rx="16"
            ry="6"
            transform="rotate(-25 24 24)"
            stroke="url(#starlightRing)"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />

          {/* Core Starlight Spark */}
          <circle cx="24" cy="22" r="2.5" fill="#FFFFFF" />
          <circle cx="24" cy="22" r="5" fill="#FFFFFF" fillOpacity="0.25" />
          
          {/* Subtle orbiting starlight gem */}
          <circle cx="36" cy="18" r="1.5" fill="#F59E0B" />
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-white block ${text} leading-tight`}>
              Empathy<span className="text-transparent bg-clip-text bg-gradient-to-r from-empathy-cyan to-empathy-emerald">Link</span>
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-empathy-emerald animate-pulse" />
          </div>
          <span className={`text-slate-400 font-semibold tracking-widest uppercase block ${sub}`}>
            Always for you
          </span>
        </div>
      )}
    </div>
  );
}
