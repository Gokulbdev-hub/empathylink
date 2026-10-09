'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Users,
  Moon,
  Sparkles,
  Upload,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { UniverseKey } from '@empathylink/types';

export default function CreatePage() {
  const router = useRouter();
  const [createType, setCreateType] = useState<'CIRCLE' | 'MEME_CARD'>('CIRCLE');

  // Circle state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [universe, setUniverse] = useState<UniverseKey>('CYBERPUNK');
  const [accessMode, setAccessMode] = useState<'OPEN' | 'APPROVAL_REQUIRED' | 'PRIVATE'>('OPEN');
  const [tagsInput, setTagsInput] = useState('mindfulness, calm');

  // Meme / Affirmation studio state
  const [memeText, setMemeText] = useState('You are doing better than you realize.');
  const [memeTheme, setMemeTheme] = useState('MIDNIGHT_NEON');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      await api.request('/circles', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          universe,
          accessMode,
          tags,
        }),
      });
      setSuccessMsg('Community circle created! Redirecting to Explore...');
      setTimeout(() => router.push('/explore'), 1500);
    } catch (err: any) {
      alert(err.message || 'Error creating circle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-cyan uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4 text-empathy-cyan" />
          <span>Sanctuary Creation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create & Contribute</h1>
        <p className="text-sm text-slate-400 mt-1">
          Form an anonymous universe circle or generate an uplifting affirmation card.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-empathy-emerald/15 border border-empathy-emerald/30 text-empathy-emerald text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-border pb-2">
        <button
          onClick={() => setCreateType('CIRCLE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            createType === 'CIRCLE'
              ? 'bg-empathy-cyan/20 text-empathy-cyan border border-empathy-cyan/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Community Circle
        </button>
        <button
          onClick={() => setCreateType('MEME_CARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            createType === 'MEME_CARD'
              ? 'bg-empathy-violet/20 text-empathy-violet border border-empathy-violet/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Affirmation Card Studio
        </button>
      </div>

      {createType === 'CIRCLE' ? (
        <form onSubmit={handleCreateCircle} className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-empathy-cyan" />
            <span>Circle Information</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Circle Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Midnight Ambient Coders"
              className="w-full rounded-xl bg-surface border border-surface-border p-3 text-xs text-white focus:outline-none focus:border-empathy-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Purpose</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the atmosphere, expectations, and topics of this circle..."
              className="w-full rounded-xl bg-surface border border-surface-border p-3 text-xs text-white focus:outline-none focus:border-empathy-cyan resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Universe Affinity</label>
              <select
                value={universe}
                onChange={(e) => setUniverse(e.target.value as UniverseKey)}
                className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
              >
                <option value="CYBERPUNK">Cyberpunk</option>
                <option value="GAMING">Gaming</option>
                <option value="MYTHOLOGY">Mythology</option>
                <option value="FANTASY">Fantasy</option>
                <option value="DEEP_OCEAN">Deep Ocean</option>
                <option value="TIME_TRAVEL">Time Travel</option>
                <option value="NATURE">Nature</option>
                <option value="ANIME">Anime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Access Mode</label>
              <select
                value={accessMode}
                onChange={(e) => setAccessMode(e.target.value as any)}
                className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
              >
                <option value="OPEN">Open (Anyone can join)</option>
                <option value="APPROVAL_REQUIRED">Approval Required</option>
                <option value="PRIVATE">Private (Invite only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags (Comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="calm, coding, ambient"
              className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-empathy-cyan to-empathy-violet text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-empathy-cyan/20 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Creating Circle...' : 'Establish Circle'}
          </button>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-empathy-violet" />
            <span>Wholesome Affirmation Generator</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Affirmation Message</label>
            <input
              type="text"
              value={memeText}
              onChange={(e) => setMemeText(e.target.value)}
              className="w-full rounded-xl bg-surface border border-surface-border p-3 text-xs text-white focus:outline-none focus:border-empathy-violet"
            />
          </div>

          {/* Card Preview */}
          <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#1E293B] via-[#111827] to-[#0B0F19] border border-empathy-violet/40 text-center shadow-xl space-y-4">
            <Sparkles className="w-6 h-6 text-empathy-cyan mx-auto" />
            <p className="text-xl sm:text-2xl font-extrabold text-white leading-relaxed">
              “{memeText}”
            </p>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              EmpathyLink Affirmation • We are there for you
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
