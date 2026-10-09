'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Shield,
  MessageCircle,
  Clock,
  Globe,
  Sliders,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  HeartLinkMatchCandidate,
  ConversationStyle,
  UniverseKey,
} from '@empathylink/types';

export default function HeartLinkPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Form State
  const [intentDescription, setIntentDescription] = useState(
    'Looking for a calm, late-night conversation about creative coding, synth music, and philosophy.'
  );
  const [desiredUniverse, setDesiredUniverse] = useState<UniverseKey | 'ANY'>('ANY');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'coding',
    'philosophy',
    'music',
  ]);
  const [conversationStyle, setConversationStyle] = useState<ConversationStyle>('REFLECTIVE');
  const [availabilityWindow, setAvailabilityWindow] = useState('Evening');

  // Request & Match State
  const [submitting, setSubmitting] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<HeartLinkMatchCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [acceptedMatchId, setAcceptedMatchId] = useState<string | null>(null);

  const availableTopics = [
    'coding',
    'philosophy',
    'music',
    'ambient sound',
    'gaming',
    'mindfulness',
    'book club',
    'creative writing',
    'astronomy',
    'deep thoughts',
  ];

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      if (selectedTopics.length < 5) {
        setSelectedTopics([...selectedTopics, topic]);
      }
    }
  };

  const fetchMatches = async () => {
    setLoadingMatches(true);
    setError(null);
    try {
      const res = await api.request<{ matches: HeartLinkMatchCandidate[] }>('/heartlink/matches');
      if (res.matches) {
        setMatches(res.matches);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load matches.');
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.request<{ matches: HeartLinkMatchCandidate[] }>('/heartlink/requests', {
        method: 'POST',
        body: JSON.stringify({
          intentDescription,
          desiredUniverse: desiredUniverse === 'ANY' ? undefined : desiredUniverse,
          topics: selectedTopics,
          languages: ['en'],
          conversationStyle,
          availabilityWindow,
          timeZone: 'UTC',
        }),
      });

      if (res.matches) {
        setMatches(res.matches);
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting HeartLink request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const res = await api.request<{ conversation: { id: string } }>(
        `/heartlink/requests/${matchId}/accept`,
        { method: 'POST' }
      );
      setAcceptedMatchId(matchId);
      if (res.conversation?.id) {
        router.push(`/chat/${res.conversation.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting match.');
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    try {
      await api.request(`/heartlink/requests/${matchId}/decline`, { method: 'POST' });
      setMatches(matches.filter((m) => m.candidatePersona.id !== matchId));
    } catch (err: any) {
      setError(err.message || 'Error declining match.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-empathy-violet" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-surface-card border border-surface-border text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-empathy-violet/15 text-empathy-violet flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign in to find your Kindred Peer</h2>
          <p className="text-sm text-slate-400">Mutual explicit consent peer matching. No follower algorithms, no psychiatric diagnoses.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-sm font-bold shadow-lg">
              Sign In
            </Link>
            <Link href="/register" className="px-6 py-2.5 rounded-xl bg-surface border border-surface-border text-slate-300 text-sm font-semibold hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-violet uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-empathy-violet" />
            <span>HeartLink Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Find Kindred Peer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Mutual explicit consent peer matching. No follower algorithms, no psychiatric diagnoses.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          disabled={loadingMatches}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-surface-border hover:bg-surface-card text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingMatches ? 'animate-spin' : ''}`} />
          <span>Refresh Matches</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-empathy-rose/10 border border-empathy-rose/30 text-empathy-rose text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold underline ml-3">Dismiss</button>
        </div>
      )}

      {/* Two Column Layout: Request Form & Discovered Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Intent Request Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-card border border-surface-border space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-empathy-violet" />
            <span>Your Connection Request</span>
          </h2>

          <form onSubmit={handleSubmitRequest} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                What kind of person or conversation are you looking for?
              </label>
              <textarea
                rows={4}
                value={intentDescription}
                onChange={(e) => setIntentDescription(e.target.value)}
                required
                className="w-full rounded-xl bg-surface border border-surface-border p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-empathy-violet transition-colors resize-none"
                placeholder="Share your thoughts, interests, or the vibe of conversation you need right now..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Up to 5 Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-empathy-violet text-white shadow-sm'
                          : 'bg-surface border border-surface-border text-slate-400 hover:text-white'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Conversation Style
                </label>
                <select
                  value={conversationStyle}
                  onChange={(e) => setConversationStyle(e.target.value as ConversationStyle)}
                  className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-violet"
                >
                  <option value="REFLECTIVE">Reflective & Mindful</option>
                  <option value="CASUAL">Casual & Lighthearted</option>
                  <option value="DEEP_DIVE">Deep Philosophical Dive</option>
                  <option value="SILENT_LISTENER">Silent Listener</option>
                  <option value="STORYTELLER">Storyteller</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Availability Window
                </label>
                <select
                  value={availabilityWindow}
                  onChange={(e) => setAvailabilityWindow(e.target.value)}
                  className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white focus:outline-none focus:border-empathy-violet"
                >
                  <option value="Evening">Evening (Relaxed)</option>
                  <option value="Midnight">Midnight (Late Night)</option>
                  <option value="Morning">Morning (Fresh Start)</option>
                  <option value="Flexible">Flexible (Anytime)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-empathy-violet/25 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Matching Kindred Spirits...' : 'Find Compatible Peers'}
            </button>
          </form>
        </div>

        {/* Right: Compatible Candidates */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-empathy-cyan" />
              <span>Compatible Candidates ({matches.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Explainable deterministic match</span>
          </div>

          {loadingMatches ? (
            <div className="p-12 text-center text-slate-400 bg-surface-card rounded-2xl border border-surface-border">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-empathy-violet" />
              <p className="text-sm">Calculating compatibility across DreamVerse...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center bg-surface-card rounded-2xl border border-surface-border space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface mx-auto flex items-center justify-center text-slate-500">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">No active matches found yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Submit your connection request above or expand your selected topics to discover compatible travelers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((cand, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-600 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">
                          {cand.candidatePersona.displayName}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400">
                          {cand.candidatePersona.publicCode}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-empathy-cyan/15 text-empathy-cyan font-bold border border-empathy-cyan/30">
                          {cand.candidatePersona.universe}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {cand.candidatePersona.title} • {cand.candidatePersona.lifestyle}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-empathy-violet to-empathy-cyan">
                        {Math.round(cand.compatibilityScore * 100)}%
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">COMPATIBILITY</span>
                    </div>
                  </div>

                  {/* Explainability Breakdown */}
                  <div className="p-3 rounded-xl bg-surface border border-slate-700/60 text-xs space-y-1.5">
                    <span className="font-semibold text-slate-300 block">Why you matched:</span>
                    <ul className="space-y-1">
                      {cand.reasons.map((r, i) => (
                        <li key={i} className="text-slate-400 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-empathy-emerald flex-shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleDeclineMatch(cand.candidatePersona.id)}
                      className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptMatch(cand.candidatePersona.id)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-xs font-bold shadow-md shadow-empathy-violet/20 hover:opacity-95 transition-opacity"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Accept & Connect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
