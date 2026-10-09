'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cake, Heart, Bot, Wind, Sparkles, X, ChevronUp } from 'lucide-react';

export function FloatingQuickDock() {
  const pathname = usePathname();
  const [minimized, setMinimized] = useState(false);

  // Don't show dock on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <aside
      aria-label="Quick Actions Dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2rem)] sm:w-auto transition-all duration-300"
    >
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card/90 border border-surface-border backdrop-blur-xl text-xs font-bold text-slate-200 shadow-2xl hover:border-empathy-cyan transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-empathy-cyan animate-pulse" />
          <span>Quick Actions</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        <div className="relative flex items-center justify-between sm:justify-start gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-surface-card/90 border border-surface-border/80 backdrop-blur-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
          {/* Birthday Sanctuary Quick Pill */}
          <Link
            href="/birthday"
            className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/birthday'
                ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="relative">
              <Cake className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            </div>
            <span className="hidden xs:inline">Birthday</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Live
            </span>
          </Link>

          {/* HeartLink Peer Match */}
          <Link
            href="/heartlink"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/heartlink'
                ? 'bg-empathy-violet/20 text-empathy-violet border border-empathy-violet/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4 text-empathy-violet hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Kindred</span>
          </Link>

          {/* Sol AI Companion */}
          <Link
            href="/sol"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/sol'
                ? 'bg-empathy-cyan/20 text-empathy-cyan border border-empathy-cyan/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-4 h-4 text-empathy-cyan hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Sol AI</span>
          </Link>

          {/* Calm 4-7-8 Breathing */}
          <Link
            href="/wellness"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/wellness'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="w-4 h-4 text-emerald-400 hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Breathe</span>
          </Link>

          {/* Close / Minimize button */}
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors ml-1"
            title="Minimize Quick Dock"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
