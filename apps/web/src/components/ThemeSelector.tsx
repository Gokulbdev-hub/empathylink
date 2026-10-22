'use client';

import React, { useState } from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { useTheme, ThemeId } from '@/lib/theme-context';

interface ThemeSelectorProps {
  mode?: 'modal' | 'embedded';
}

export function ThemeSelector({ mode = 'modal' }: ThemeSelectorProps) {
  const { theme, setTheme, themes, themeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Embedded view for Settings page
  if (mode === 'embedded') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-empathy-cyan" />
            <h3 className="text-base font-bold text-white">Visual Atmosphere & Themes</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface border border-surface-border text-slate-300">
            Active: <span className="text-white font-bold">{themeMeta.name}</span>
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Personalize EmpathyLink with 9 handcrafted color atmospheres designed for emotional comfort and eye relaxation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {themes.map((t) => {
            const isSelected = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`relative p-4 rounded-2xl border text-left transition-all group overflow-hidden ${
                  isSelected
                    ? 'border-white/80 bg-surface shadow-xl ring-2 ring-white/20 scale-[1.02]'
                    : 'border-surface-border bg-surface-card/60 hover:bg-surface-card hover:border-slate-500'
                }`}
              >
                {/* Visual Swatch Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow-md flex items-center justify-center"
                      style={{ backgroundColor: t.accentColor }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                    </div>
                    <span className="text-xs font-bold text-white">{t.name}</span>
                  </div>
                  {isSelected ? (
                    <span className="p-1 rounded-full bg-white/20 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {t.tagline}
                    </span>
                  )}
                </div>

                {/* Theme Preview Bar */}
                <div
                  className={`h-2.5 rounded-full bg-gradient-to-r ${t.gradient} border border-white/10 mb-2 shadow-inner`}
                />

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Modal / Dropdown Trigger for Navbar
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-slate-800 text-slate-300 hover:text-white border border-surface-border text-xs font-semibold transition-all group"
        title={`Change Theme (Currently: ${themeMeta.name})`}
      >
        <Palette className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline">{themeMeta.name}</span>
        <span
          className="w-2 h-2 rounded-full border border-white/20"
          style={{ backgroundColor: themeMeta.accentColor }}
        />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Atmospheric Visual Customization</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Select Your UI Theme</h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose from 9 bespoke atmospheres created for midnight tranquility and emotional focus.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map((t) => {
                const isSelected = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-white/80 bg-surface ring-2 ring-white/20 scale-[1.02] shadow-xl'
                        : 'border-surface-border bg-surface/50 hover:bg-surface hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        <span className="text-xs font-bold text-white">{t.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>

                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${t.gradient} border border-white/10 mb-2`}
                    />
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {t.tagline}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Theme is saved automatically to your device.
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-amber-400 to-sky-400 text-slate-950 font-bold hover:brightness-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
