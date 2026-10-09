'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Send,
  Lock,
  ShieldAlert,
  UserX,
  ArrowLeft,
  LifeBuoy,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { MessageDto, ConversationDto } from '@empathylink/types';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.id as string;

  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Load messages
    api
      .request<{ messages: MessageDto[] }>(`/conversations/${conversationId}/messages`)
      .then((res) => {
        if (res.messages) setMessages(res.messages);
      })
      .catch(() => {
        // Fallback demo conversation
        setMessages([
          {
            id: 'msg_init',
            conversationId,
            senderId: 'partner',
            senderPersona: {
              id: 'per_lyra',
              userId: 'usr_lyra',
              displayName: 'Lyra',
              publicCode: 'EL-OC-10492',
              universe: 'DEEP_OCEAN',
              lifestyle: 'Subsea Drifter',
              lifetimePath: 'Bioluminescent Navigator',
              dreamTheme: 'Whale Song Twilight',
              aura: 'Abyssal Cyan',
              title: 'Trench Whisperer',
              symbols: ['abyssal-pearl'],
              motto: 'In the tranquil deep, every ripple is understood.',
              createdAt: new Date().toISOString(),
            },
            content: 'Hello kindred soul! Glad our paths crossed in HeartLink. How is your day treating you?',
            isEncrypted: false,
            reactions: [],
            createdAt: new Date(Date.now() - 60000).toISOString(),
          },
        ]);
      });

    // Socket.IO Room Setup
    const socket = getSocket();
    socket.emit('join:conversation', { conversationId });

    socket.on('message:new', (msg: MessageDto) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('typing:update', (data: any) => {
      if (data.conversationId === conversationId) {
        setPartnerTyping(data.isTyping);
      }
    });

    return () => {
      socket.emit('leave:conversation', { conversationId });
      socket.off('message:new');
      socket.off('typing:update');
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await api.request<{ message: MessageDto }>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: text,
          isEncrypted: false,
        }),
      });

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (_) {
      // Local optimistic append
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          conversationId,
          senderId: 'current',
          senderPersona: {
            id: 'per_curr',
            userId: 'current',
            displayName: 'You',
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
          },
          content: text,
          isEncrypted: false,
          reactions: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleBlockPartner = async () => {
    if (confirm('Block this user? You will not receive any further messages.')) {
      try {
        await api.request(`/conversations/${conversationId}/block`, { method: 'POST' });
        router.push('/');
      } catch (_) {}
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Conversation Header */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Kindred Peer Room</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-empathy-cyan/15 text-empathy-cyan font-bold border border-empathy-cyan/30">
                HEARTLINK DIRECT
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3 h-3 text-empathy-emerald" />
              <span>TLS Protected Transport • Third-party E2EE audit pending</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleBlockPartner}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-slate-700 text-xs text-slate-400 hover:text-empathy-rose border border-surface-border transition-colors"
        >
          <UserX className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Block / End Connection</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border h-[480px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isMe = m.senderPersona.displayName === 'You' || m.senderId === 'current';
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">{m.senderPersona.displayName}</span>
                <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-surface border border-slate-800">
                  {m.senderPersona.publicCode}
                </span>
                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white shadow-md'
                    : 'bg-surface border border-surface-border text-slate-200'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {partnerTyping && (
          <div className="text-xs text-slate-400 italic">Peer is composing a thought...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Share your thought safely..."
          className="flex-1 rounded-2xl bg-surface-card border border-surface-border px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-empathy-cyan transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-empathy-violet/20 hover:opacity-95 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
