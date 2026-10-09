import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const THEME_COLORS = {
  background: '#0B0F19',
  surface: '#111827',
  surfaceCard: '#1E293B',
  surfaceBorder: '#334155',
  textPrimary: '#F8FAFC',
  textMuted: '#94A3B8',
  accentViolet: '#8B5CF6',
  accentCyan: '#06B6D4',
  accentRose: '#F43F5E',
  accentAmber: '#F59E0B',
  accentEmerald: '#10B981',
};
