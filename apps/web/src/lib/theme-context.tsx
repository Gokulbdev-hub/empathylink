'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId =
  | 'jet-black'
  | 'cerulean-blue'
  | 'neon-rose'
  | 'ice-silver'
  | 'deep-aubergine'
  | 'marigold'
  | 'mocha-brown'
  | 'platinum-silver'
  | 'pale-lavender';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  gradient: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'jet-black',
    name: 'Jet Black',
    tagline: 'Obsidian Void',
    primaryColor: '#F8FAFC',
    accentColor: '#38BDF8',
    surfaceColor: '#0A0A0C',
    gradient: 'from-[#050507] via-[#0D0D12] to-[#14141B]',
    description: 'Ultra-deep pitch black with crisp monochrome contrast and subtle star-dust highlights.',
  },
  {
    id: 'cerulean-blue',
    name: 'Cerulean Blue',
    tagline: 'Oceanic Depths',
    primaryColor: '#38BDF8',
    accentColor: '#0284C7',
    surfaceColor: '#08172E',
    gradient: 'from-[#051329] via-[#092244] to-[#0A305E]',
    description: 'Luminous oceanic cerulean with deep cobalt abyss and radiant azure wave reflections.',
  },
  {
    id: 'neon-rose',
    name: 'Neon Rose',
    tagline: 'Cyber Glow',
    primaryColor: '#FB7185',
    accentColor: '#F43F5E',
    surfaceColor: '#1A0B16',
    gradient: 'from-[#140612] via-[#2A0E23] to-[#3B1233]',
    description: 'Vibrant cybernetic pink rose with nocturnal magenta aura and electric warmth.',
  },
  {
    id: 'ice-silver',
    name: 'Ice Silver',
    tagline: 'Glacial Crystal',
    primaryColor: '#E2E8F0',
    accentColor: '#38BDF8',
    surfaceColor: '#0F172A',
    gradient: 'from-[#0B1220] via-[#162033] to-[#1E2C44]',
    description: 'Crisp frozen metallic silver with frosted glass elements and diamond reflections.',
  },
  {
    id: 'deep-aubergine',
    name: 'Deep Aubergine',
    tagline: 'Regal Velvet',
    primaryColor: '#C084FC',
    accentColor: '#A855F7',
    surfaceColor: '#1A0A26',
    gradient: 'from-[#12051C] via-[#240A34] to-[#35104B]',
    description: 'Rich royal eggplant and dark velvety plum with nocturnal amethyst luminescence.',
  },
  {
    id: 'marigold',
    name: 'Marigold',
    tagline: 'Golden Hearth',
    primaryColor: '#FBBF24',
    accentColor: '#F59E0B',
    surfaceColor: '#1A1407',
    gradient: 'from-[#140F04] via-[#291F0A] to-[#3D2E0F]',
    description: 'Warm festive amber-orange bloom with comforting fireside glow and solar starlight.',
  },
  {
    id: 'mocha-brown',
    name: 'Mocha Brown',
    tagline: 'Roasted Espresso',
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    surfaceColor: '#17110D',
    gradient: 'from-[#120D0A] via-[#211610] to-[#332219]',
    description: 'Velvety dark chocolate and toasted mocha with cozy caramel and warm earth tones.',
  },
  {
    id: 'platinum-silver',
    name: 'Platinum Silver',
    tagline: 'Lunar Chrome',
    primaryColor: '#F1F5F9',
    accentColor: '#94A3B8',
    surfaceColor: '#111827',
    gradient: 'from-[#0B0F17] via-[#1B2232] to-[#263147]',
    description: 'Futuristic mirror-sheen platinum with polished titanium borders and celestial lunar glow.',
  },
  {
    id: 'pale-lavender',
    name: 'Pale Lavender',
    tagline: 'Twilight Mist',
    primaryColor: '#E9D5FF',
    accentColor: '#C084FC',
    surfaceColor: '#140E24',
    gradient: 'from-[#0F0A1C] via-[#1D1433] to-[#2C1E4A]',
    description: 'Soft ethereal lilac mist and pastel twilight soothing the eyes for peaceful dreaming.',
  },
];

interface ThemeContextType {
  theme: ThemeId;
  themeMeta: ThemeMeta;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeMeta[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('neon-rose');

  useEffect(() => {
    const saved = localStorage.getItem('el_theme') as ThemeId;
    if (saved && THEMES.some((t) => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'neon-rose');
    }
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem('el_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const themeMeta = THEMES.find((t) => t.id === theme) || THEMES[2];

  return (
    <ThemeContext.Provider value={{ theme, themeMeta, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
