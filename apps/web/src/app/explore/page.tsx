'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Users,
  Moon,
  Radio,
  VolumeX,
  Volume2,
  Sparkles,
  ArrowRight,
  Plus,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CircleDto, EchoRoomDto, UniverseKey } from '@empathylink/types';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'CIRCLES' | 'ECHO_ROOMS' | 'GLOBAL_CHAT'>('CIRCLES');
  const [circles, setCircles] = useState<CircleDto[]>([]);
  const [echoRooms, setEchoRooms] = useState<EchoRoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [silentPresenceActive, setSilentPresenceActive] = useState<string | null>(null);

  // Global Chat demo state
  const [globalMessages, setGlobalMessages] = useState<Array<{ sender: string; universe: string; text: string; time: string }>>([
    { sender: 'Nova', universe: 'CYBERPUNK', text: 'Late night syntax and neon rain.', time: '2 mins ago' },
    { sender: 'Lyra', universe: 'DEEP_OCEAN', text: 'Listening to the ocean swell. Peaceful breathing to all.', time: '5 mins ago' },
    { sender: 'Kaito', universe: 'GAMING', text: 'Passed the hard checkpoint! Remember to take water breaks.', time: '10 mins ago' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.request<{ circles: CircleDto[] }>('/circles'),
      api.request<{ echoRooms: EchoRoomDto[] }>('/circles/explore/echorooms'),
    ])
      .then(([circRes, echoRes]) => {
        if (circRes.circles) setCircles(circRes.circles);
        if (echoRes.echoRooms) setEchoRooms(echoRes.echoRooms);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSendGlobalMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setGlobalMessages([
      ...globalMessages,
      {
        sender: 'You',
        universe: 'CYBERPUNK',
        text: inputMsg,
        time: 'Just now',
      },
    ]);
    setInputMsg('');
  };

  const toggleSilentPresence = (roomId: string) => {
    if (silentPresenceActive === roomId) {
      setSilentPresenceActive(null);
    } else {
      setSilentPresenceActive(roomId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-cyan uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-empathy-cyan" />
            <span>Community Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Explore</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gather in universe circles, temporary echo sanctuaries, or silent presence.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-card hover:bg-slate-700/60 border border-surface-border text-xs font-semibold text-white transition-colors"
        >
          <Plus className="w-4 h-4 text-empathy-cyan" />
          <span>Create Circle</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-2">
        <button
          onClick={() => setActiveTab('CIRCLES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'CIRCLES'
              ? 'bg-empathy-cyan/20 text-empathy-cyan border border-empathy-cyan/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Circles ({circles.length})
        </button>
        <button
          onClick={() => setActiveTab('ECHO_ROOMS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ECHO_ROOMS'
              ? 'bg-empathy-violet/20 text-empathy-violet border border-empathy-violet/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Echo Rooms ({echoRooms.length})
        </button>
        <button
          onClick={() => setActiveTab('GLOBAL_CHAT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'GLOBAL_CHAT'
              ? 'bg-empathy-rose/20 text-empathy-rose border border-empathy-rose/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Global Chat
        </button>
      </div>

      {/* Tab Content: Circles */}
      {activeTab === 'CIRCLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between hover:border-slate-600 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-empathy-cyan/15 text-empathy-cyan border border-empathy-cyan/30">
                    {circle.universe}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{circle.memberCount} travelers</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{circle.name}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{circle.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {circle.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Access: {circle.accessMode}</span>
                <button
                  onClick={() => alert(`Joined ${circle.name}`)}
                  className="px-4 py-1.5 rounded-lg bg-surface hover:bg-slate-700 text-xs font-semibold text-white border border-surface-border transition-colors"
                >
                  Join Circle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Echo Rooms & Silent Presence */}
      {activeTab === 'ECHO_ROOMS' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 flex items-center justify-between">
            <span>
              <strong>Echo Rooms</strong> are temporary spaces for focused shared energy. Turn on <strong>Silent Presence</strong> to share calm solidarity without speaking or typing.
            </span>
            <Radio className="w-4 h-4 text-empathy-violet animate-pulse flex-shrink-0 ml-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {echoRooms.map((room) => {
              const isSilentInRoom = silentPresenceActive === room.id;
              return (
                <div
                  key={room.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${
                    isSilentInRoom
                      ? 'bg-empathy-violet/10 border-empathy-violet/40 shadow-lg shadow-empathy-violet/15'
                      : 'bg-surface-card border-surface-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-slate-700 text-slate-400">
                      TEMPORARY ECHO
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-empathy-emerald animate-ping" />
                      <span>{room.activePresenceCount + (isSilentInRoom ? 1 : 0)} here</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{room.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Category: {room.category.replace('_', ' ')}</p>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleSilentPresence(room.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isSilentInRoom
                          ? 'bg-empathy-violet text-white'
                          : 'bg-surface hover:bg-slate-700 text-slate-300 border border-surface-border'
                      }`}
                    >
                      {isSilentInRoom ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSilentInRoom ? 'Silent (Active)' : 'Silent Presence'}</span>
                    </button>

                    <Link
                      href={`/chat/${room.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-slate-700 text-xs font-semibold text-white border border-surface-border"
                    >
                      Enter Room
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Global Chat */}
      {activeTab === 'GLOBAL_CHAT' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-empathy-rose" />
              <span>Real-Time Global Commons</span>
            </h3>
            <span className="text-xs text-slate-400">Ephemeral public stream</span>
          </div>

          <div className="space-y-3 h-80 overflow-y-auto pr-2">
            {globalMessages.map((msg, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {msg.sender}
                    <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-surface-card text-empathy-cyan">
                      {msg.universe}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-200">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendGlobalMessage} className="flex gap-2 pt-2 border-t border-surface-border">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Send a kind thought to the global room..."
              className="flex-1 rounded-xl bg-surface border border-surface-border px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-empathy-rose"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-empathy-rose hover:bg-rose-600 text-white text-xs font-bold transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
