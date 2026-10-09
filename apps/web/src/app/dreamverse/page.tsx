'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Sparkles,
  Compass,
  Check,
  Palette,
  Shield,
  Save,
  Feather,
  Flame,
} from 'lucide-react';
import { DREAMVERSE_UNIVERSES } from '@empathylink/config';
import { UniverseKey, PersonaSummary, UniverseDefinition } from '@empathylink/types';
import { api } from '@/lib/api';

export default function DreamVersePage() {
  const universes = Object.values(DREAMVERSE_UNIVERSES);

  const [selectedUniverse, setSelectedUniverse] = useState<UniverseKey>('CYBERPUNK');
  const [displayName, setDisplayName] = useState('Nova');
  const [lifestyle, setLifestyle] = useState('Deckrunner');
  const [lifetimePath, setLifetimePath] = useState('Augmented Lifespan');
  const [dreamTheme, setDreamTheme] = useState('System Disconnect');
  const [motto, setMotto] = useState('Your code writes tomorrow.');
  const [publicCode, setPublicCode] = useState('EL-CY-58291');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentUniverseConfig: UniverseDefinition = DREAMVERSE_UNIVERSES[selectedUniverse];

  // Load existing persona
  useEffect(() => {
    api
      .request<{ persona: PersonaSummary }>('/persona')
      .then((res) => {
        if (res.persona) {
          setSelectedUniverse(res.persona.universe);
          setDisplayName(res.persona.displayName);
          setLifestyle(res.persona.lifestyle);
          setLifetimePath(res.persona.lifetimePath);
          setDreamTheme(res.persona.dreamTheme);
          setMotto(res.persona.motto);
          setPublicCode(res.persona.publicCode);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectUniverse = (univKey: UniverseKey) => {
    setSelectedUniverse(univKey);
    const u = DREAMVERSE_UNIVERSES[univKey];
    setLifestyle(u.defaultLifestyles[0] || 'Wanderer');
    setLifetimePath(u.defaultLifetimePaths[0] || 'Pathfinder');
    setDreamTheme(u.defaultDreamThemes[0] || 'First Light');
    setMotto(u.motto);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.request<{ persona: PersonaSummary }>('/persona/dreamverse', {
        method: 'PUT',
        body: JSON.stringify({
          universe: selectedUniverse,
          lifestyle,
          lifetimePath,
          dreamTheme,
          motto,
          title: 'Neon Wanderer',
        }),
      });

      if (res.persona) {
        setPublicCode(res.persona.publicCode);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert('Error updating DreamVerse identity.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-violet uppercase tracking-wider mb-1">
          <Globe2 className="w-4 h-4 text-empathy-violet" />
          <span>The Eight Universes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">DreamVerse Sanctuary</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select your universe affinity and craft your symbolic anonymous identity. No psychiatric diagnosis or personal data required.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-empathy-emerald/15 border border-empathy-emerald/30 text-empathy-emerald text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>DreamVerse persona updated successfully across all circles and HeartLink.</span>
        </div>
      )}

      {/* 8 Universe Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {universes.map((u) => {
          const isSelected = selectedUniverse === u.id;
          return (
            <button
              key={u.id}
              onClick={() => handleSelectUniverse(u.id)}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-surface-card border-empathy-cyan ring-1 ring-empathy-cyan shadow-lg shadow-empathy-cyan/15 scale-[1.02]'
                  : 'bg-surface border-surface-border hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${u.primaryColor}25`, color: u.primaryColor }}
              >
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-white text-xs truncate">{u.name}</h3>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{u.aura}</p>
            </button>
          );
        })}
      </div>

      {/* Editor & Real-Time Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-empathy-cyan" />
              <span>Persona Customization</span>
            </h2>
            <span className="text-xs text-empathy-cyan font-semibold">{currentUniverseConfig.name} Universe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Anonymous Public Code</label>
              <input
                type="text"
                disabled
                value={publicCode}
                className="w-full rounded-xl bg-surface/50 border border-slate-700/60 p-2.5 text-xs font-mono text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lifestyle Archetype</label>
            <select
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
            >
              {currentUniverseConfig.defaultLifestyles.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lifetime Path</label>
              <select
                value={lifetimePath}
                onChange={(e) => setLifetimePath(e.target.value)}
                className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
              >
                {currentUniverseConfig.defaultLifetimePaths.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dream Theme</label>
              <select
                value={dreamTheme}
                onChange={(e) => setDreamTheme(e.target.value)}
                className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
              >
                {currentUniverseConfig.defaultDreamThemes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Motto / Guiding Mantra</label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-xs font-bold shadow-lg shadow-empathy-violet/20 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Preserving Identity...' : 'Save DreamVerse Persona'}</span>
          </button>
        </form>

        {/* Live Identity Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Public Card Preview
          </span>
          <div className="p-7 rounded-3xl bg-gradient-to-br from-surface-card via-surface to-[#0B0F19] border border-surface-border shadow-2xl relative overflow-hidden space-y-6">
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: currentUniverseConfig.primaryColor }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-surface border border-slate-700 text-slate-300">
                {publicCode}
              </span>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${currentUniverseConfig.primaryColor}20`,
                  color: currentUniverseConfig.primaryColor,
                  borderColor: `${currentUniverseConfig.primaryColor}40`,
                }}
              >
                {currentUniverseConfig.name}
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-white">{displayName || 'Traveler'}</h3>
              <p className="text-xs font-semibold mt-1" style={{ color: currentUniverseConfig.primaryColor }}>
                {lifestyle}
              </p>
              <p className="text-xs text-slate-400 mt-3 italic">“{motto}”</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Lifetime Path</span>
                <span className="text-slate-200 font-medium">{lifetimePath}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Dream Theme</span>
                <span className="text-slate-200 font-medium">{dreamTheme}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 text-center">
              Symbolic Identity • EmpathyLink Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
