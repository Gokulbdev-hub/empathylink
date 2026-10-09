'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Globe2,
  BookOpen,
  Bot,
  ShieldCheck,
  Compass,
  Sparkles,
  ArrowRight,
  Lock,
  Users,
  Feather,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PersonaSummary } from '@empathylink/types';

export default function HomePage() {
  const [persona, setPersona] = useState<PersonaSummary>({
    id: 'per_demo_nova',
    userId: 'usr_demo_nova',
    displayName: 'Nova',
    publicCode: 'EL-CY-58291',
    universe: 'CYBERPUNK',
    lifestyle: 'Deckrunner',
    lifetimePath: 'Augmented Lifespan',
    dreamTheme: 'System Disconnect',
    aura: 'Neon Violet Glitch',
    title: 'Neon Wanderer',
    symbols: ['neural-jack'],
    motto: 'Your code writes tomorrow.',
    createdAt: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt fetching live profile if logged in
    api
      .request<{ persona: PersonaSummary }>('/persona')
      .then((data) => {
        if (data.persona) setPersona(data.persona);
      })
      .catch(() => {
        // Safe fallback to demo persona
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-card via-surface to-[#0B0F19] border border-surface-border p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-empathy-violet/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-empathy-violet/15 border border-empathy-violet/30 text-empathy-cyan text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Privacy-First Emotional Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            We are there for you. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-empathy-violet via-empathy-cyan to-empathy-emerald">
              Always for you.
            </span>
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Connect anonymously through your DreamVerse persona, discover kindred peers in HeartLink, join quiet Echo Rooms, and safely process your thoughts with private journaling and Sol.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/heartlink"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-sm font-bold shadow-lg shadow-empathy-violet/25 hover:opacity-95 transition-opacity"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Find Kindred Peer</span>
            </Link>
            <Link
              href="/sol"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-card hover:bg-slate-700/60 border border-surface-border text-slate-200 text-sm font-semibold transition-colors"
            >
              <Bot className="w-4 h-4 text-empathy-cyan" />
              <span>Reflect with Sol</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid: DreamVerse Identity & Privacy Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current DreamVerse Identity */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-empathy-cyan" />
                Your Active DreamVerse Identity
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-empathy-cyan/15 text-empathy-cyan border border-empathy-cyan/30">
                {persona.universe}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{persona.displayName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400">
                    {persona.publicCode}
                  </span>
                </h2>
                <p className="text-xs text-empathy-violet font-medium mt-1">
                  {persona.title} • {persona.lifestyle}
                </p>
                <p className="text-xs text-slate-400 mt-2 italic">“{persona.motto}”</p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-slate-700/60 text-xs space-y-1 sm:text-right">
                <div className="text-slate-400">Lifetime Path: <span className="text-white font-medium">{persona.lifetimePath}</span></div>
                <div className="text-slate-400">Dream Theme: <span className="text-white font-medium">{persona.dreamTheme}</span></div>
                <div className="text-slate-400">Aura: <span className="text-empathy-cyan font-medium">{persona.aura}</span></div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
            <span className="text-xs text-slate-400">Gamified symbolic identity only • No psychiatric diagnosis</span>
            <Link
              href="/dreamverse"
              className="inline-flex items-center gap-1 text-xs text-empathy-cyan hover:underline font-semibold"
            >
              <span>Customize Persona</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Privacy & Safety Status */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-empathy-emerald" />
              Privacy & Trust Health
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Tracking Architecture</h3>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-empathy-emerald flex-shrink-0" />
                <span>Encrypted transport & zero follower counts</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-empathy-emerald flex-shrink-0" />
                <span>Dream Journal private & local by default</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-empathy-emerald flex-shrink-0" />
                <span>AI reflection only on user request</span>
              </li>
            </ul>
          </div>

          <Link
            href="/privacy"
            className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-surface hover:bg-slate-700/70 border border-surface-border text-xs text-slate-200 font-semibold transition-colors"
          >
            <span>Review Privacy Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Shortcuts Grid: HeartLink, Explore Circles, Dream Journal, Wellness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* HeartLink Matching */}
        <Link
          href="/heartlink"
          className="group p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-empathy-violet/50 transition-all hover:shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-empathy-violet/10 text-empathy-violet flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-empathy-violet/20" />
          </div>
          <h4 className="font-bold text-white text-base group-hover:text-empathy-violet transition-colors">HeartLink</h4>
          <p className="text-xs text-slate-400 mt-1">
            Intent-driven peer matching without algorithms ranking popularity.
          </p>
        </Link>

        {/* Explore Circles & Echo Rooms */}
        <Link
          href="/explore"
          className="group p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-empathy-cyan/50 transition-all hover:shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-empathy-cyan/10 text-empathy-cyan flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base group-hover:text-empathy-cyan transition-colors">Explore</h4>
          <p className="text-xs text-slate-400 mt-1">
            Universe circles, temporary Echo Rooms, and Silent Presence rooms.
          </p>
        </Link>

        {/* Dream Journal */}
        <Link
          href="/journal"
          className="group p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-empathy-rose/50 transition-all hover:shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-empathy-rose/10 text-empathy-rose flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base group-hover:text-empathy-rose transition-colors">Dream Journal</h4>
          <p className="text-xs text-slate-400 mt-1">
            Private encrypted thought sanctuary with optional on-demand Sol reflection.
          </p>
        </Link>

        {/* Sol Reflection */}
        <Link
          href="/sol"
          className="group p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-empathy-emerald/50 transition-all hover:shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-empathy-emerald/10 text-empathy-emerald flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base group-hover:text-empathy-emerald transition-colors">Sol Assistant</h4>
          <p className="text-xs text-slate-400 mt-1">
            Non-clinical, non-dependent empathetic AI reflection & active listener.
          </p>
        </Link>
      </div>
    </div>
  );
}
