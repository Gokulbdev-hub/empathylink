'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Send,
  ShieldAlert,
  Info,
  RefreshCw,
  Phone,
  LifeBuoy,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SolChatResponse, CrisisResourceInfo } from '@empathylink/types';
import { SOL_SAFETY_NOTICE } from '@empathylink/config';

interface ChatBubble {
  role: 'user' | 'assistant';
  content: string;
  crisisDetected?: boolean;
  crisisResources?: CrisisResourceInfo[];
}

export default function SolPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      role: 'assistant',
      content:
        'Hello traveler. I am Sol, your AI reflection companion. I am here to listen without judgment, help you organize your thoughts, or reflect on your day. Take a breath — what is on your mind today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [tonePreference, setTonePreference] = useState<'WARM' | 'MINIMAL' | 'ANALYTIC' | 'CREATIVE'>('WARM');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const response = await api.request<SolChatResponse>('/sol/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMsg,
          history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          tonePreference,
        }),
      });

      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: response.reply,
          crisisDetected: response.crisisDetected,
          crisisResources: response.crisisResources,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I had trouble connecting for a moment. Please take a gentle breath and try again.',
        },
      ]);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-empathy-violet/15 text-empathy-cyan flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sol Reflection Assistant</span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400 font-mono">
                  AI COMPANION
                </span>
              </h1>
              <p className="text-xs text-slate-400">Non-clinical active listening and perspective partner.</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-surface/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-empathy-cyan flex-shrink-0 mt-0.5" />
          <span>{SOL_SAFETY_NOTICE}</span>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="max-w-md w-full p-8 rounded-2xl bg-surface-card border border-surface-border text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-empathy-violet/15 text-empathy-violet flex items-center justify-center mx-auto">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Sign in to reflect with Sol</h2>
            <p className="text-sm text-slate-400">Connect with your AI companion for non-clinical active listening.</p>
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Safety Notice Header */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-empathy-violet/15 text-empathy-cyan flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Sol Reflection Assistant</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400 font-mono">
                AI COMPANION
              </span>
            </h1>
            <p className="text-xs text-slate-400">Non-clinical active listening and perspective partner.</p>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Tone:</span>
          <select
            value={tonePreference}
            onChange={(e) => setTonePreference(e.target.value as any)}
            className="rounded-lg bg-surface border border-surface-border px-2.5 py-1 text-xs text-white focus:outline-none focus:border-empathy-cyan"
          >
            <option value="WARM">Warm & Grounded</option>
            <option value="MINIMAL">Minimalist & Quiet</option>
            <option value="ANALYTIC">Structured & Clear</option>
            <option value="CREATIVE">Poetic & Metaphoric</option>
          </select>
        </div>
      </div>

      {/* Boundary Disclaimer */}
      <div className="px-4 py-2.5 rounded-xl bg-surface/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-empathy-cyan flex-shrink-0 mt-0.5" />
        <span>{SOL_SAFETY_NOTICE}</span>
      </div>

      {/* Chat Messages Log */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border min-h-[450px] max-h-[600px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white shadow-md'
                    : 'bg-surface border border-surface-border text-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 mb-1">
                  {isUser ? 'You' : 'Sol'}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Crisis Resources Emergency Card if Detected */}
              {msg.crisisDetected && msg.crisisResources && (
                <div className="w-full max-w-lg p-5 rounded-2xl bg-empathy-rose/10 border border-empathy-rose/30 space-y-3">
                  <div className="flex items-center gap-2 text-empathy-rose font-bold text-xs uppercase tracking-wider">
                    <LifeBuoy className="w-4 h-4" />
                    <span>Free, 24/7 Confidential Crisis Support</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    You do not have to carry this alone. Please connect with caring human professionals right now:
                  </p>
                  <div className="space-y-2">
                    {msg.crisisResources.slice(0, 3).map((res, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-surface border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{res.name}</div>
                          <div className="text-[10px] text-slate-400">{res.country}</div>
                        </div>
                        <span className="font-bold text-empathy-rose flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {res.contact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-xl bg-surface w-fit border border-surface-border">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-empathy-cyan" />
            <span>Sol is reflecting...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts with Sol..."
          className="flex-1 rounded-2xl bg-surface-card border border-surface-border px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-empathy-cyan transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-empathy-violet/20 hover:opacity-95 transition-opacity disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
