'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wind,
  Heart,
  Droplets,
  Moon,
  Sparkles,
  CheckCircle,
  Play,
  RotateCcw,
  Smile,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { JournalMood, MoodEntryDto, WellnessSessionDto } from '@empathylink/types';

export default function WellnessPage() {
  // Breathing Timer state
  const [breathingPhase, setBreathingPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Mood Check-in state
  const [mood, setMood] = useState<JournalMood>('CALM');
  const [intensity, setIntensity] = useState(3);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntryDto[]>([]);
  const [moodSubmitted, setMoodSubmitted] = useState(false);

  // Hydration state
  const [waterGlasses, setWaterGlasses] = useState(3);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            if (breathingPhase === 'INHALE') {
              setBreathingPhase('HOLD');
              return 7;
            } else if (breathingPhase === 'HOLD') {
              setBreathingPhase('EXHALE');
              return 8;
            } else {
              setBreathingPhase('INHALE');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase]);

  useEffect(() => {
    api
      .request<{ moodHistory: MoodEntryDto[] }>('/wellness')
      .then((res) => {
        if (res.moodHistory) setMoodHistory(res.moodHistory);
      })
      .catch(() => {});
  }, []);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.request<{ moodEntry: MoodEntryDto }>('/wellness/mood', {
        method: 'POST',
        body: JSON.stringify({
          mood,
          intensity,
          note: moodNote,
        }),
      });
      if (res.moodEntry) {
        setMoodHistory([...moodHistory, res.moodEntry]);
        setMoodSubmitted(true);
        setMoodNote('');
        setTimeout(() => setMoodSubmitted(false), 3000);
      }
    } catch (_) {}
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-emerald uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4 text-empathy-emerald" />
          <span>Gentle Grounding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Wellness Sanctuary</h1>
        <p className="text-sm text-slate-400 mt-1">
          Non-clinical rituals to breathe, hydrate, and gently ground your awareness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 4-7-8 Breathing Circle */}
        <div className="lg:col-span-6 p-8 rounded-3xl bg-surface-card border border-surface-border flex flex-col items-center justify-between text-center space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Wind className="w-4 h-4 text-empathy-cyan" />
            <span>4-7-8 Restorative Breathing</span>
          </div>

          {/* Animated Visual Orb */}
          <div className="relative flex items-center justify-center my-6">
            <div
              className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                breathingPhase === 'INHALE'
                  ? 'bg-empathy-cyan/20 border-2 border-empathy-cyan shadow-2xl shadow-empathy-cyan/30 scale-110'
                  : breathingPhase === 'HOLD'
                  ? 'bg-empathy-violet/20 border-2 border-empathy-violet shadow-2xl shadow-empathy-violet/30 scale-100'
                  : 'bg-empathy-emerald/20 border-2 border-empathy-emerald shadow-2xl shadow-empathy-emerald/30 scale-90'
              }`}
            >
              <span className="text-4xl font-extrabold text-white">{breathingTimer}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-slate-300 mt-1">
                {breathingPhase}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-empathy-cyan to-empathy-violet text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-95 transition-opacity"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isBreathingActive ? 'Pause Exercise' : 'Begin Breath'}</span>
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathingPhase('INHALE');
                setBreathingTimer(4);
              }}
              className="p-2.5 rounded-xl bg-surface border border-surface-border text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 max-w-xs">
            Inhale deeply through your nose for 4s, hold gently for 7s, and release slowly through your mouth for 8s.
          </p>
        </div>

        {/* Right: Daily Mood Check-In & Hydration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Mood Check-In */}
          <form onSubmit={handleMoodSubmit} className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-empathy-violet" />
                <span>Daily Mood Check-In</span>
              </h2>
              {moodSubmitted && (
                <span className="text-xs text-empathy-emerald font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Recorded
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['CALM', 'REFLECTIVE', 'ENERGIZED', 'ANXIOUS', 'TIRED', 'GRATEFUL', 'SEEKING'] as JournalMood[]).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-colors ${
                      mood === m
                        ? 'bg-empathy-violet text-white shadow-sm'
                        : 'bg-surface border border-surface-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                )
              )}
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Intensity</span>
                <span className="font-bold text-empathy-violet">{intensity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-empathy-violet"
              />
            </div>

            <div>
              <input
                type="text"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Optional one-line note about how you feel..."
                className="w-full rounded-xl bg-surface border border-surface-border p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-empathy-violet"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-surface hover:bg-slate-700 text-xs font-bold text-slate-200 border border-surface-border transition-colors"
            >
              Record Mood Reflection
            </button>
          </form>

          {/* Hydration Tracker */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-empathy-cyan/15 text-empathy-cyan border border-empathy-cyan/30">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Gentle Hydration</h3>
                <p className="text-xs text-slate-400">Remember to drink clean water today</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                className="w-8 h-8 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white font-bold"
              >
                -
              </button>
              <span className="font-extrabold text-lg text-white">{waterGlasses} / 8</span>
              <button
                onClick={() => setWaterGlasses(waterGlasses + 1)}
                className="w-8 h-8 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
