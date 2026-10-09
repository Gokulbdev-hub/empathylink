'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cake,
  Sparkles,
  Heart,
  Globe,
  Flame,
  Send,
  Gift,
  Smile,
  Bot,
  RefreshCw,
  X,
  Compass,
  MessageCircle,
  Wind,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  BirthdayCelebrant,
  BirthdayWish,
  BirthdayStats,
  BirthdayGiftType,
  BirthdayWishVibe,
} from '@empathylink/types';
import { ActionButton } from '@/components/ui/ActionButton';

export default function BirthdaySanctuaryPage() {
  const { isAuthenticated, user } = useAuth();

  // State
  const [celebrants, setCelebrants] = useState<BirthdayCelebrant[]>([]);
  const [stats, setStats] = useState<BirthdayStats>({
    todayCelebrantsCount: 3,
    totalWishesSentToday: 350,
    participatingCountries: 48,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCelebrant, setSelectedCelebrant] = useState<BirthdayCelebrant | null>(null);
  const [wishesForSelected, setWishesForSelected] = useState<BirthdayWish[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);

  // Send Wish Modal State
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [targetCelebrant, setTargetCelebrant] = useState<BirthdayCelebrant | null>(null);
  const [selectedGift, setSelectedGift] = useState<BirthdayGiftType>('STARLIGHT_CANDLE');
  const [selectedVibe, setSelectedVibe] = useState<BirthdayWishVibe>('WARM_HUG');
  const [wishMessage, setWishMessage] = useState('');
  const [sendingWish, setSendingWish] = useState(false);
  const [wishSuccessMessage, setWishSuccessMessage] = useState<string | null>(null);

  // Celebrate Today Form Modal State
  const [celebrateModalOpen, setCelebrateModalOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Somewhere on Earth');
  const [birthdayMood, setBirthdayMood] = useState('Reflective and hoping for warmth 🕯️');
  const [birthdayWishNote, setBirthdayWishNote] = useState('');
  const [submittingCelebration, setSubmittingCelebration] = useState(false);

  // Sol Blessing State
  const [solBlessing, setSolBlessing] = useState<string | null>(null);
  const [generatingBlessing, setGeneratingBlessing] = useState(false);

  // Interactive Candle Blow
  const [blowingCandleId, setBlowingCandleId] = useState<string | null>(null);

  const giftOptions: { type: BirthdayGiftType; label: string; icon: string; desc: string }[] = [
    { type: 'STARLIGHT_CANDLE', label: 'Starlight Candle', icon: '🕯️', desc: 'A gentle beacon of hope' },
    { type: 'COSMIC_CAKE', label: 'Cosmic Cake', icon: '🎂', desc: 'Baked with interstellar sweetness' },
    { type: 'AURORA_LANTERN', label: 'Aurora Lantern', icon: '🏮', desc: 'Guiding through dark skies' },
    { type: 'GOLDEN_LOTUS', label: 'Golden Lotus', icon: '🪷', desc: 'Serenity and blossoming growth' },
    { type: 'WARM_COCOA', label: 'Warm Cocoa', icon: '☕', desc: 'A comforting cup of care' },
    { type: 'DREAM_BALLOON', label: 'Dream Balloon', icon: '🎈', desc: 'Lifting heavy thoughts away' },
    { type: 'CONSTELLATION_STAR', label: 'Wishing Star', icon: '🌟', desc: 'A personal starlight blessing' },
  ];

  const vibeOptions: { vibe: BirthdayWishVibe; label: string; bg: string }[] = [
    { vibe: 'WARM_HUG', label: 'Warm Hug & Embrace', bg: 'bg-rose-500/20 text-rose-300' },
    { vibe: 'PEACEFUL', label: 'Peaceful & Gentle', bg: 'bg-teal-500/20 text-teal-300' },
    { vibe: 'COSMIC_COURAGE', label: 'Cosmic Courage', bg: 'bg-indigo-500/20 text-indigo-300' },
    { vibe: 'JOYFUL', label: 'Joyful & Bright', bg: 'bg-amber-500/20 text-amber-300' },
    { vibe: 'GENTLE_SOLACE', label: 'Gentle Solace', bg: 'bg-purple-500/20 text-purple-300' },
  ];

  const fetchSanctuaryData = async () => {
    try {
      setLoading(true);
      const res = await api.request<{ celebrants: BirthdayCelebrant[]; stats: BirthdayStats }>('/birthday');
      if (res.celebrants) setCelebrants(res.celebrants);
      if (res.stats) setStats(res.stats);
    } catch (_) {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanctuaryData();
  }, []);

  const openWishesView = async (celebrant: BirthdayCelebrant) => {
    setSelectedCelebrant(celebrant);
    setLoadingWishes(true);
    try {
      const res = await api.request<{ celebrant: BirthdayCelebrant; wishes: BirthdayWish[] }>(
        `/birthday/celebrants/${celebrant.id}`
      );
      if (res.wishes) setWishesForSelected(res.wishes);
    } catch (_) {
      setWishesForSelected([]);
    } finally {
      setLoadingWishes(false);
    }
  };

  const handleSendWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCelebrant || !wishMessage.trim()) return;

    try {
      setSendingWish(true);
      await api.request('/birthday/wish', {
        method: 'POST',
        body: JSON.stringify({
          celebrantId: targetCelebrant.id,
          gift: selectedGift,
          vibe: selectedVibe,
          message: wishMessage.trim(),
        }),
      });

      setWishSuccessMessage(`Your warm wish has been delivered to ${targetCelebrant.persona.displayName}! 🌟`);
      setWishMessage('');
      fetchSanctuaryData();
      if (selectedCelebrant?.id === targetCelebrant.id) {
        openWishesView(targetCelebrant);
      }
      setTimeout(() => {
        setWishModalOpen(false);
        setWishSuccessMessage(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to send wish. Please try again.');
    } finally {
      setSendingWish(false);
    }
  };

  const handleCelebrateTodaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingCelebration(true);
      await api.request('/birthday/celebrate', {
        method: 'POST',
        body: JSON.stringify({
          locationLabel,
          mood: birthdayMood,
          wishNote: birthdayWishNote.trim() || undefined,
        }),
      });
      setCelebrateModalOpen(false);
      fetchSanctuaryData();
    } catch (err: any) {
      alert(err.message || 'Error joining sanctuary. Please try again.');
    } finally {
      setSubmittingCelebration(false);
    }
  };

  const handleBlowCandle = async (celebrantId: string) => {
    setBlowingCandleId(celebrantId);
    try {
      await api.request(`/birthday/blow-candle/${celebrantId}`, { method: 'POST' });
      // Optimistic update
      setCelebrants((prev) =>
        prev.map((c) => (c.id === celebrantId ? { ...c, candlesBlown: c.candlesBlown + 1 } : c))
      );
    } catch (_) {
      // Ignored
    } finally {
      setTimeout(() => setBlowingCandleId(null), 1200);
    }
  };

  const handleGetSolBlessing = async () => {
    try {
      setGeneratingBlessing(true);
      const res = await api.request<{ blessing: string }>('/birthday/sol-blessing', {
        method: 'POST',
        body: JSON.stringify({
          celebrantName: user?.persona?.displayName || 'Traveler',
          universe: user?.persona?.universe || 'Cosmic',
          mood: birthdayMood,
        }),
      });
      if (res.blessing) setSolBlessing(res.blessing);
    } catch (err: any) {
      alert(err.message || 'Sol could not generate a reflection right now.');
    } finally {
      setGeneratingBlessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Banner with Celestial Glow */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-card via-slate-900 to-[#120D24] border border-amber-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-empathy-violet/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-pink-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold shadow-sm">
            <Cake className="w-4 h-4 text-amber-400" />
            <span>Worldwide Birthday Sanctuary</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping ml-1" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Nobody spends their birthday{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-empathy-cyan">
              in the dark.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Whether your birthday is quiet, reflective, or lonely, you are held by kindred souls.
            Send warm, anonymous starlight wishes to strangers celebrating their birthday today,
            or light your own birthday candle to receive warmth from across the planet.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <ActionButton
                variant="starlight"
                size="md"
                icon={<Flame className="w-4 h-4 text-slate-950 fill-current" />}
                onClick={() => setCelebrateModalOpen(true)}
              >
                It&apos;s My Birthday Today!
              </ActionButton>
            ) : (
              <Link href="/login">
                <ActionButton variant="starlight" size="md" icon={<Cake className="w-4 h-4 text-slate-950" />}>
                  Sign in to Celebrate
                </ActionButton>
              </Link>
            )}

            <button
              onClick={fetchSanctuaryData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-card hover:bg-slate-800 border border-surface-border text-slate-300 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Sanctuary</span>
            </button>
          </div>
        </div>

        {/* Global Live Stat Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface/50 border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              🎂
            </div>
            <div>
              <div className="text-xl font-black text-white">{stats.todayCelebrantsCount} Celebrants</div>
              <div className="text-[11px] text-slate-400">Marking their solar orbit today</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface/50 border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center font-bold">
              🕯️
            </div>
            <div>
              <div className="text-xl font-black text-white">{stats.totalWishesSentToday} Wishes</div>
              <div className="text-[11px] text-slate-400">Warm messages & gifts sent</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface/50 border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
              🌐
            </div>
            <div>
              <div className="text-xl font-black text-white">{stats.participatingCountries} Countries</div>
              <div className="text-[11px] text-slate-400">Connected in global empathy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Celebrants Grid & Interactive Starlight Candles */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Kindred Spirits Celebrating Today</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose someone to wish a happy birthday and illuminate their day with a symbolic blessing.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center bg-surface-card rounded-3xl border border-surface-border">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
            <p className="text-sm text-slate-300 font-medium">Gathering starlight from around the globe...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {celebrants.map((cel) => {
              const isBlowing = blowingCandleId === cel.id;

              return (
                <div
                  key={cel.id}
                  className="group relative flex flex-col justify-between p-6 rounded-3xl bg-surface-card border border-surface-border hover:border-amber-400/50 transition-all duration-300 shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
                >
                  {/* Card Header: Persona, Universe, Location */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-lg">
                            {cel.persona.displayName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400">
                            {cel.persona.publicCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <Globe className="w-3.5 h-3.5 text-empathy-cyan" />
                          <span>{cel.locationLabel}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-400/30">
                        {cel.persona.universe}
                      </span>
                    </div>

                    {/* Celebration Mood Banner */}
                    <div className="p-3 rounded-2xl bg-surface border border-slate-800 text-xs text-slate-200 mb-4">
                      <div className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider mb-1">
                        Birthday Mood
                      </div>
                      <p className="italic leading-relaxed">{cel.mood}</p>
                      {cel.wishNote && (
                        <p className="text-slate-400 text-[11px] mt-2 pt-2 border-t border-slate-800">
                          &ldquo;{cel.wishNote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Candle & Wishes Counter + Actions */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                        <span>{cel.candlesBlown} Gentle Breaths</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Gift className="w-4 h-4 text-pink-400" />
                        <span>{cel.wishesCount} Wishes Sent</span>
                      </div>
                    </div>

                    {/* Button Group */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Mindful Candle Blow Button */}
                      <button
                        onClick={() => handleBlowCandle(cel.id)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isBlowing
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-95'
                            : 'bg-surface hover:bg-slate-800 text-amber-300 border-amber-400/30 hover:border-amber-400/60'
                        }`}
                        title="Take a mindful breath and blow the candle for them"
                      >
                        <Wind className={`w-3.5 h-3.5 ${isBlowing ? 'animate-spin' : ''}`} />
                        <span>{isBlowing ? 'Blowing... ✨' : 'Blow Candle'}</span>
                      </button>

                      {/* Send Wish Button */}
                      <button
                        onClick={() => {
                          setTargetCelebrant(cel);
                          setWishModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02]"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Send Wish</span>
                      </button>
                    </div>

                    {/* View Wishes Accordion trigger */}
                    <button
                      onClick={() => openWishesView(cel)}
                      className="w-full text-center text-[11px] text-slate-400 hover:text-white font-medium hover:underline pt-1 transition-colors"
                    >
                      Read {cel.wishesCount} global blessings &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sol AI Birthday Reflection Studio */}
      <section className="rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-empathy-cyan/15 text-empathy-cyan flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Sol AI Birthday Reflection Sanctuary</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-empathy-cyan/20 text-empathy-cyan font-mono">
                  SOL COMPANION
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Receive an empathetic, warm, non-clinical reflection crafted by Sol to celebrate another year of existence.
              </p>
            </div>
          </div>

          <ActionButton
            variant="aurora"
            size="sm"
            isLoading={generatingBlessing}
            onClick={handleGetSolBlessing}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Reflect on My Orbit
          </ActionButton>
        </div>

        {solBlessing && (
          <div className="p-5 rounded-2xl bg-surface border border-empathy-cyan/30 text-sm text-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-empathy-cyan uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sol&apos;s Letter to You</span>
            </div>
            <p className="italic leading-relaxed whitespace-pre-wrap">{solBlessing}</p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Sol is an AI reflection assistant, NOT a medical provider. May your day be gentle.
            </div>
          </div>
        )}
      </section>

      {/* MODAL 1: Send Birthday Wish & Gift */}
      {wishModalOpen && targetCelebrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-6">
            <button
              onClick={() => setWishModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">
                <Gift className="w-4 h-4" />
                <span>Send Cosmic Birthday Blessing</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Wishing {targetCelebrant.persona.displayName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                From {targetCelebrant.locationLabel} • {targetCelebrant.persona.universe} Universe
              </p>
            </div>

            {wishSuccessMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">{wishSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSendWishSubmit} className="space-y-5">
                {/* Gift Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Pick a Symbolic Gift
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {giftOptions.map((g) => (
                      <button
                        key={g.type}
                        type="button"
                        onClick={() => setSelectedGift(g.type)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          selectedGift === g.type
                            ? 'bg-pink-500/20 border-pink-500/60 text-white shadow-sm'
                            : 'bg-surface border-surface-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-xl mb-1">{g.icon}</div>
                        <div className="text-xs font-bold text-slate-200">{g.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibe Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Choose Blessing Vibe
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {vibeOptions.map((v) => (
                      <button
                        key={v.vibe}
                        type="button"
                        onClick={() => setSelectedVibe(v.vibe)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedVibe === v.vibe
                            ? `${v.bg} ring-1 ring-white/20`
                            : 'bg-surface text-slate-400 hover:text-white'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Your Warm Message
                  </label>
                  <textarea
                    rows={3}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    required
                    maxLength={500}
                    placeholder="Write something kind and uplifting from your heart..."
                    className="w-full rounded-2xl bg-surface border border-surface-border p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  />
                </div>

                <ActionButton
                  type="submit"
                  variant="sunset"
                  size="md"
                  isLoading={sendingWish}
                  className="w-full"
                  icon={<Send className="w-4 h-4" />}
                >
                  Deliver Blessing Across the World
                </ActionButton>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Register Celebration (Celebrate Today) */}
      {celebrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-6">
            <button
              onClick={() => setCelebrateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Cake className="w-4 h-4" />
                <span>Light Your Birthday Candle</span>
              </div>
              <h3 className="text-xl font-bold text-white">Join Today&apos;s Sanctuary</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your DreamVerse persona will appear in the global constellation so kindred souls can wish you well.
              </p>
            </div>

            <form onSubmit={handleCelebrateTodaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  General Location / Region (e.g. Kyoto, Japan or Just &ldquo;Earth&rdquo;)
                </label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full rounded-xl bg-surface border border-surface-border px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  How are you feeling about your birthday today?
                </label>
                <input
                  type="text"
                  value={birthdayMood}
                  onChange={(e) => setBirthdayMood(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="e.g. A bit quiet, reflective, looking forward to peaceful thoughts"
                  className="w-full rounded-xl bg-surface border border-surface-border px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  A Thought or Wish for the Year Ahead (Optional)
                </label>
                <textarea
                  rows={2}
                  value={birthdayWishNote}
                  onChange={(e) => setBirthdayWishNote(e.target.value)}
                  maxLength={300}
                  placeholder="Share a wish or message for anyone reading..."
                  className="w-full rounded-xl bg-surface border border-surface-border p-3 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <ActionButton
                type="submit"
                variant="starlight"
                size="md"
                isLoading={submittingCelebration}
                className="w-full"
                icon={<Flame className="w-4 h-4 text-slate-950 fill-current" />}
              >
                Place Candle in Global Sanctuary
              </ActionButton>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Read Celebrant's Global Wishes */}
      {selectedCelebrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedCelebrant(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Gift className="w-4 h-4" />
                <span>Global Wishes Archive</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Blessings for {selectedCelebrant.persona.displayName}
              </h3>
              <p className="text-xs text-slate-400">
                Messages from kindred spirits around the world
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingWishes ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>Loading blessings...</span>
                </div>
              ) : wishesForSelected.length === 0 ? (
                <div className="p-8 text-center bg-surface rounded-2xl text-slate-400 text-xs">
                  No wishes sent yet. Be the first to bring a smile to their face!
                </div>
              ) : (
                wishesForSelected.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl bg-surface border border-surface-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{w.senderPersona.displayName}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({w.senderPersona.universe})
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-300">
                        {w.vibe.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{w.message}</p>
                    <div className="text-[10px] text-slate-500">
                      Gift: {w.gift.replace('_', ' ')}
                    </div>
                  </div>
                ))
              )}
            </div>

            <ActionButton
              variant="sunset"
              size="sm"
              onClick={() => {
                setTargetCelebrant(selectedCelebrant);
                setSelectedCelebrant(null);
                setWishModalOpen(true);
              }}
              icon={<Heart className="w-4 h-4 fill-current" />}
            >
              Add Your Own Wish
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
