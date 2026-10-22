'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Sparkles,
  Heart,
  Compass,
  Globe2,
  Bot,
  BookOpen,
  PlusCircle,
  Activity,
  Shield,
  Settings,
  LifeBuoy,
  Menu,
  X,
  ShieldCheck,
  Cake,
} from 'lucide-react';
import { CrisisModal } from './CrisisModal';
import { EmpathyLogo } from './EmpathyLogo';
import { ThemeSelector } from './ThemeSelector';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'HOME', href: '/', icon: Sparkles },
    { name: 'BIRTHDAY', href: '/birthday', icon: Cake, isSpecial: true },
    { name: 'HEARTLINK', href: '/heartlink', icon: Heart },
    { name: 'EXPLORE', href: '/explore', icon: Compass },
    { name: 'DREAMVERSE', href: '/dreamverse', icon: Globe2 },
    { name: 'SOL', href: '/sol', icon: Bot },
    { name: 'DREAM JOURNAL', href: '/journal', icon: BookOpen },
    { name: 'CREATE', href: '/create', icon: PlusCircle },
    { name: 'WELLNESS', href: '/wellness', icon: Activity },
    { name: 'PRIVACY & SECURITY', href: '/privacy', icon: Shield },
    { name: 'SETTINGS', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Bespoke Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group" aria-label="EmpathyLink Home">
              <EmpathyLogo size="md" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? item.isSpecial
                        ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                        : 'bg-empathy-violet/15 text-empathy-cyan border border-empathy-cyan/30 shadow-sm'
                      : item.isSpecial
                      ? 'text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-surface-card'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.isSpecial ? 'text-amber-400 animate-bounce' : ''}`} />
                  <span>{item.name}</span>
                  {item.isSpecial && (
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 via-amber-400 to-sky-400 hover:brightness-110 text-slate-950 text-xs font-black transition-all shadow-md shadow-rose-500/20 active:scale-95"
                >
                  Join
                </Link>
              </>
            ) : (
              <>
                <span className="hidden sm:inline-flex text-xs font-medium text-slate-300">
                  {user?.persona?.displayName || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface text-slate-400 hover:text-white border border-surface-border text-xs transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
            {/* Theme Atmosphere Selector */}
            <ThemeSelector />

            {/* Quick Crisis Help */}
            <button
              onClick={() => setCrisisModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-empathy-rose/10 hover:bg-empathy-rose/20 text-empathy-rose border border-empathy-rose/30 text-xs font-bold transition-all shadow-sm"
              title="Immediate Crisis Resources"
            >
              <LifeBuoy className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden md:inline">Need Help Now?</span>
            </button>

            {/* Admin shortcut */}
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface text-slate-400 hover:text-white border border-surface-border text-xs transition-colors"
              title="Moderation & Safety Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-empathy-cyan" />
              <span>Admin</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface border border-surface-border transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-surface-border bg-surface-card px-4 pt-3 pb-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-empathy-violet/20 text-empathy-cyan border border-empathy-cyan/30'
                      : 'text-slate-300 hover:text-white hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-surface-border flex gap-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-surface text-slate-300 hover:text-white text-xs border border-surface-border"
              >
                <ShieldCheck className="w-4 h-4 text-empathy-cyan" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Verified Crisis Modal */}
      <CrisisModal isOpen={crisisModalOpen} onClose={() => setCrisisModalOpen(false)} />
    </>
  );
}
