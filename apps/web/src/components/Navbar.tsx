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
} from 'lucide-react';
import { CrisisModal } from './CrisisModal';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'HOME', href: '/', icon: Sparkles },
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
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-empathy-violet to-empathy-cyan flex items-center justify-center shadow-lg shadow-empathy-violet/20 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 text-white fill-white/20" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">EmpathyLink</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 tracking-wider hidden sm:block">
                  ALWAYS FOR YOU
                </span>
              </div>
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-empathy-violet/15 text-empathy-cyan border border-empathy-cyan/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-surface-card'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
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
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-empathy-violet to-empathy-cyan hover:from-empathy-violet/90 hover:to-empathy-cyan/90 text-white text-xs font-bold transition-all shadow-sm"
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
