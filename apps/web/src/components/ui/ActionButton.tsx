import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cosmic' | 'sunset' | 'aurora' | 'emerald' | 'starlight' | 'glass' | 'ghost' | 'radiant' | 'sky' | 'blush';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  pulse?: boolean;
}

export function ActionButton({
  children,
  variant = 'cosmic',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  pulse = false,
  className = '',
  disabled,
  ...props
}: ActionButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-wide select-none transition-all duration-200 active:scale-[0.97] rounded-xl overflow-hidden disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 group';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[11px] gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs gap-2',
    md: 'px-5 py-2.5 text-xs sm:text-sm gap-2.5',
    lg: 'px-7 py-3.5 text-sm sm:text-base gap-3 rounded-2xl',
  }[size];

  const variantStyles = {
    radiant:
      'bg-gradient-to-r from-pink-500 via-amber-400 to-sky-400 text-slate-950 font-black shadow-lg shadow-pink-500/25 hover:shadow-amber-400/40 hover:brightness-105 border border-amber-200/40',
    blush:
      'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:brightness-110 border border-white/10',
    sky:
      'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:brightness-110 border border-white/10',
    cosmic:
      'bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-sky-500/40 hover:brightness-110 border border-white/10',
    sunset:
      'bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:brightness-110 border border-white/10',
    aurora:
      'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 border border-white/10',
    emerald:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 border border-white/10',
    starlight:
      'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-105 border border-amber-200/50',
    glass:
      'bg-surface-card/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-surface-border hover:border-slate-600 backdrop-blur-md shadow-sm',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${pulse ? 'animate-pulse' : ''} ${className}`}
      {...props}
    >
      {/* Dynamic light reflection effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
        </>
      )}
    </button>
  );
}
