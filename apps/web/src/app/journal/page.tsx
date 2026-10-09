'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  RefreshCw,
  BookOpen,
  Lock,
  Unlock,
  Trash2,
  Download,
  Bot,
  Sparkles,
  Save,
  Search,
  Check,
  Tag,
  Smile,
  Mic,
  MicOff,
  GitGraph,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  JournalEntryDto,
  JournalMood,
  SolReflectionType,
  JournalAIReflectionDto,
} from '@empathylink/types';

export default function JournalPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntryDto[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryDto | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState<JournalMood>('REFLECTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);
  const [activeReflection, setActiveReflection] = useState<JournalAIReflectionDto | null>(null);
  const [reflectionType, setReflectionType] = useState<SolReflectionType>('GENTLE_REFLECTION');
  const [isListening, setIsListening] = useState(false);

  const moods: JournalMood[] = [
    'CALM',
    'REFLECTIVE',
    'ENERGIZED',
    'ANXIOUS',
    'TIRED',
    'GRATEFUL',
    'SEEKING',
  ];

  // Fetch entries
  const fetchEntries = async () => {
    try {
      const res = await api.request<{ entries: JournalEntryDto[] }>('/journal');
      if (res.entries) {
        setEntries(res.entries);
        if (res.entries.length > 0 && !selectedEntry) {
          selectEntry(res.entries[0]);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const selectEntry = (entry: JournalEntryDto) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMoodTag(entry.moodTag);
    setActiveReflection(entry.reflections?.[0] || null);
  };

  const handleNewEntry = async () => {
    try {
      const res = await api.request<{ entry: JournalEntryDto }>('/journal', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Chapter',
          content: '',
          moodTag: 'REFLECTIVE',
          tags: ['personal'],
        }),
      });
      if (res.entry) {
        setEntries([res.entry, ...entries]);
        selectEntry(res.entry);
      }
    } catch (_) {}
  };

  const handleSave = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    try {
      const res = await api.request<{ entry: JournalEntryDto }>(`/journal/${selectedEntry.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          content,
          moodTag,
        }),
      });
      if (res.entry) {
        setLastSaved(new Date().toLocaleTimeString());
        setEntries(entries.map((e) => (e.id === res.entry.id ? res.entry : e)));
        setSelectedEntry(res.entry);
      }
    } catch (_) {}
    finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry || !confirm('Permanently delete this private journal entry?')) return;
    try {
      await api.request(`/journal/${selectedEntry.id}`, { method: 'DELETE' });
      const remaining = entries.filter((e) => e.id !== selectedEntry.id);
      setEntries(remaining);
      setSelectedEntry(remaining[0] || null);
      if (remaining[0]) selectEntry(remaining[0]);
    } catch (_) {}
  };

  // User-triggered "Reflect with Sol"
  const handleReflectWithSol = async () => {
    if (!selectedEntry || !content.trim()) return;
    setReflecting(true);
    try {
      const res = await api.request<{ reflection: JournalAIReflectionDto }>(
        `/journal/${selectedEntry.id}/reflect`,
        {
          method: 'POST',
          body: JSON.stringify({
            reflectionType,
          }),
        }
      );
      if (res.reflection) {
        setActiveReflection(res.reflection);
      }
    } catch (err: any) {
      alert(err.message || 'Error running Sol reflection.');
    } finally {
      setReflecting(false);
    }
  };

  // Web Speech API Voice-to-Text helper
  const toggleVoiceToText = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => `${prev} ${transcript}`);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Export entry to markdown
  const handleExportMarkdown = () => {
    if (!selectedEntry) return;
    const blob = new Blob(
      [`# ${title}\n*Mood: ${moodTag}* | *Saved: ${selectedEntry.createdAt}*\n\n${content}`],
      { type: 'text/markdown' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign in to access your Dream Journal</h2>
          <p className="text-sm text-slate-400">Private by default. Never sent to AI unless explicitly triggered.</p>
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-rose uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-empathy-rose" />
            <span>Private Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dream Journal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Private by default. Never sent to AI unless explicitly triggered via “Reflect with Sol”.
          </p>
        </div>

        <button
          onClick={handleNewEntry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-rose text-white text-xs font-bold shadow-md shadow-empathy-violet/20 hover:opacity-95 transition-opacity"
        >
          <span>Write New Entry</span>
        </button>
      </div>

      {/* Main Journal Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Entries Sidebar & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-surface-card border border-surface-border pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-empathy-rose"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredEntries.map((e) => {
              const isSelected = selectedEntry?.id === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => selectEntry(e)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-surface-card border-empathy-rose/50 shadow-md'
                      : 'bg-surface border-surface-border hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-empathy-rose">{e.moodTag}</span>
                    <span>{new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{e.title || 'Untitled'}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{e.content || 'Blank entry...'}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Entry Editor & Sol Reflection Panel */}
        <div className="lg:col-span-8 space-y-5">
          {selectedEntry ? (
            <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5">
              {/* Title & Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reflection Title..."
                  className="bg-transparent text-xl font-extrabold text-white focus:outline-none flex-1"
                />

                <div className="flex items-center gap-2">
                  {/* Voice-to-text Button */}
                  <button
                    onClick={toggleVoiceToText}
                    title="Voice-to-Text Transcription"
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      isListening
                        ? 'bg-empathy-rose text-white border-empathy-rose animate-pulse'
                        : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    title="Export as Markdown"
                    className="p-2 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDelete}
                    title="Delete Entry Permanently"
                    className="p-2 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-empathy-rose"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-slate-700 text-xs font-semibold text-white border border-surface-border"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Mood Selector */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-medium">Mood:</span>
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoodTag(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      moodTag === m
                        ? 'bg-empathy-rose text-white shadow-sm'
                        : 'bg-surface border border-surface-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Content Editor */}
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Pour your heart and thoughts here in safety..."
                className="w-full rounded-xl bg-surface border border-surface-border p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-empathy-rose transition-colors leading-relaxed resize-none"
              />

              {/* Sol AI Reflection Trigger */}
              <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={reflectionType}
                    onChange={(e) => setReflectionType(e.target.value as SolReflectionType)}
                    className="rounded-lg bg-surface-card border border-surface-border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-empathy-cyan"
                  >
                    <option value="GENTLE_REFLECTION">Gentle Reflection</option>
                    <option value="SUMMARIZE">Summarize Key Points</option>
                    <option value="ORGANIZE_THOUGHTS">Organize Thoughts</option>
                    <option value="KEY_IDEAS">Extract Key Ideas</option>
                    <option value="ACTION_STEPS">Tiny Action Steps</option>
                    <option value="THOUGHT_MAP">Generate Thought Map</option>
                  </select>
                  <span className="text-[11px] text-slate-400 hidden md:inline">Explicit on-demand trigger</span>
                </div>

                <button
                  onClick={handleReflectWithSol}
                  disabled={reflecting || !content.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-empathy-violet to-empathy-cyan text-white text-xs font-bold shadow-md shadow-empathy-violet/20 hover:opacity-95 transition-opacity disabled:opacity-40"
                >
                  <Bot className="w-4 h-4" />
                  <span>{reflecting ? 'Reflecting with Sol...' : 'Reflect with Sol'}</span>
                </button>
              </div>

              {/* Sol Reflection Display */}
              {activeReflection && (
                <div className="p-5 rounded-2xl bg-empathy-violet/10 border border-empathy-violet/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-empathy-cyan text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sol Reflection • {activeReflection.reflectionType.replace('_', ' ')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">On-demand AI perspective</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activeReflection.output}
                  </div>

                  {/* Thought Map Visual Nodes if generated */}
                  {activeReflection.thoughtMapNodes && (
                    <div className="p-4 rounded-xl bg-surface border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <GitGraph className="w-3.5 h-3.5 text-empathy-cyan" />
                        <span>Interactive Thought Map Nodes</span>
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {activeReflection.thoughtMapNodes.map((n) => (
                          <div
                            key={n.id}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-surface-card border border-empathy-cyan/30 text-empathy-cyan"
                          >
                            {n.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 italic">
                    Explicit notice: Content was processed on-demand for your reflection. Never stored in public model training corpus.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center bg-surface-card rounded-2xl border border-surface-border text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">Select an existing reflection or write a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
