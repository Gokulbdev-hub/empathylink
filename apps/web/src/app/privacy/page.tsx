'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  RefreshCw,
  Shield,
  Lock,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  FileText,
  Key,
  Eye,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PrivacySettingsDto } from '@empathylink/types';

export default function PrivacyPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [settings, setSettings] = useState<PrivacySettingsDto>({
    allowSolJournalReflection: true,
    allowHeartLinkMatching: true,
    profileVisibility: 'UNIVERSE_ONLY',
    showOnlineStatus: true,
    allowDirectMessagesFrom: 'MATCHES_ONLY',
    ephemeralMessagesDefaultTtlSecs: 0,
    requirePasscodeForJournal: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    api
      .request<{ privacySettings: PrivacySettingsDto }>('/privacy')
      .then((res) => {
        if (res.privacySettings) setSettings(res.privacySettings);
      })
      .catch(() => {});
  }, []);

  const handleToggle = (key: keyof PrivacySettingsDto, val: any) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    api.request('/privacy', {
      method: 'PUT',
      body: JSON.stringify(updated),
    }).then(() => {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }).catch(() => {});
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await api.request<{ exportBundle: any }>('/privacy/export', { method: 'POST' });
      const blob = new Blob([JSON.stringify(res.exportBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `empathylink_data_export_${Date.now()}.json`;
      a.click();
    } catch (err) {
      alert('Error exporting personal data.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.request('/privacy/delete-account', { method: 'POST' });
      api.clearTokens();
      alert('Your account and private persona have been deleted.');
      window.location.href = '/';
    } catch (err) {
      alert('Error processing account deletion.');
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
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign in to manage Privacy & Security</h2>
          <p className="text-sm text-slate-400">Full control over your visibility, cryptographic boundaries, and account data lifecycle.</p>
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-empathy-emerald uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4 text-empathy-emerald" />
          <span>Privacy & Security</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Trust & Data Autonomy</h1>
        <p className="text-sm text-slate-400 mt-1">
          Full control over your visibility, cryptographic boundaries, and account data lifecycle.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-empathy-emerald/15 border border-empathy-emerald/30 text-empathy-emerald text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Privacy settings saved successfully.</span>
        </div>
      )}

      {/* Cryptographic Boundary Disclaimer */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Lock className="w-4 h-4 text-empathy-cyan" />
          <span>Cryptographic Boundaries & Transport Notice</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Standard TLS encrypted transport and short-lived rotated JWT sessions are active.
          Third-party independent audit for full end-to-end client-side encryption is pending.
          We never sell telemetry, inject third-party ad pixels, or feed your private Dream Journal to external public AI trainers.
        </p>
      </div>

      {/* Privacy Controls List */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-6">
        <h2 className="text-base font-bold text-white">Visibility & AI Preferences</h2>

        <div className="space-y-4 divide-y divide-surface-border">
          {/* Allow Sol Journal Reflection */}
          <div className="flex items-center justify-between pt-4 first:pt-0">
            <div>
              <div className="text-sm font-semibold text-white">Sol AI Journal Reflection</div>
              <p className="text-xs text-slate-400">Allow on-demand reflection when you click “Reflect with Sol”.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowSolJournalReflection}
              onChange={(e) => handleToggle('allowSolJournalReflection', e.target.checked)}
              className="w-5 h-5 accent-empathy-violet rounded cursor-pointer"
            />
          </div>

          {/* Allow HeartLink Matching */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-sm font-semibold text-white">HeartLink Peer Matching</div>
              <p className="text-xs text-slate-400">Appear as a candidate for compatible peer connection requests.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowHeartLinkMatching}
              onChange={(e) => handleToggle('allowHeartLinkMatching', e.target.checked)}
              className="w-5 h-5 accent-empathy-violet rounded cursor-pointer"
            />
          </div>

          {/* Show Online Status */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-sm font-semibold text-white">Broadcast Online Status</div>
              <p className="text-xs text-slate-400">Display presence in circles and temporary echo rooms.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showOnlineStatus}
              onChange={(e) => handleToggle('showOnlineStatus', e.target.checked)}
              className="w-5 h-5 accent-empathy-violet rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Data */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-empathy-cyan" />
              <span>Export Personal Archive</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Download a machine-readable JSON copy of your journals, mood history, and DreamVerse configuration.
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-surface hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-surface-border transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting Archive...' : 'Download JSON Export'}</span>
          </button>
        </div>

        {/* Delete Account */}
        <div className="p-6 rounded-2xl bg-surface-card border border-empathy-rose/30 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-empathy-rose" />
              <span>Permanent Deletion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Permanently erase your identity, revoke all sessions, and remove private journals.
            </p>
          </div>

          {showDeleteConfirm ? (
            <div className="space-y-2">
              <p className="text-xs text-empathy-rose font-bold">This action cannot be undone. Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2 rounded-xl bg-empathy-rose hover:bg-rose-600 text-white text-xs font-bold transition-colors"
                >
                  Yes, Delete Forever
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-slate-300 text-xs font-semibold border border-surface-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-empathy-rose/10 hover:bg-empathy-rose/20 text-empathy-rose border border-empathy-rose/30 text-xs font-bold transition-colors"
            >
              Request Account Deletion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
