'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  Key,
  LogOut,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sessions, setSessions] = useState<Array<{ id: string; deviceName: string; ipAddress: string; createdAt: string }>>([
    { id: 'ses_current', deviceName: 'Current Web Browser (Chrome on Windows)', ipAddress: '127.0.0.1', createdAt: 'Active Now' },
  ]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);

  useEffect(() => {
    api
      .request<{ sessions: any[] }>('/auth/sessions')
      .then((res) => {
        if (res.sessions && res.sessions.length > 0) setSessions(res.sessions);
      })
      .catch(() => {});
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.request(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (_) {}
  };

  const handleEnable2FA = async () => {
    try {
      const res = await api.request<{ secret: string }>('/auth/2fa/enable', { method: 'POST' });
      setTwoFactorSecret(res.secret);
    } catch (_) {}
  };

  const handleConfirm2FA = async () => {
    try {
      await api.request('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: '123456' }),
      });
      setTwoFactorEnabled(true);
      setTwoFactorSecret(null);
    } catch (_) {}
  };

  const handleLogout = async () => {
    try {
      await api.request('/auth/logout', { method: 'POST' });
    } catch (_) {}
    api.clearTokens();
    window.location.href = '/';
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
            <Settings className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign in to access Settings</h2>
          <p className="text-sm text-slate-400">Manage your account security, two-factor authentication, and sessions.</p>
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
      <div className="flex items-center justify-between border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Account Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Security & Devices</h1>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-slate-700 text-xs font-semibold text-empathy-rose border border-surface-border transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-empathy-violet/15 text-empathy-violet">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Two-Factor Authentication (TOTP)</h2>
              <p className="text-xs text-slate-400">Add an extra layer of protection using Google Authenticator or 1Password.</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              twoFactorEnabled ? 'bg-empathy-emerald/15 text-empathy-emerald' : 'bg-surface text-slate-400 border border-slate-700'
            }`}
          >
            {twoFactorEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        {!twoFactorEnabled && !twoFactorSecret && (
          <button
            onClick={handleEnable2FA}
            className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-700 text-xs font-semibold text-white border border-surface-border transition-colors"
          >
            Enable 2FA Protection
          </button>
        )}

        {twoFactorSecret && (
          <div className="p-4 rounded-xl bg-surface border border-slate-700 space-y-3 text-xs">
            <p className="text-slate-300">
              Secret Key: <span className="font-mono text-empathy-cyan font-bold">{twoFactorSecret}</span>
            </p>
            <button
              onClick={handleConfirm2FA}
              className="px-4 py-2 rounded-xl bg-empathy-emerald text-white font-bold"
            >
              Confirm 2FA Activation
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-empathy-cyan" />
          <span>Active Device Sessions</span>
        </h2>

        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white">{s.deviceName}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">IP: {s.ipAddress} • {s.createdAt}</div>
              </div>

              {s.id !== 'ses_current' && (
                <button
                  onClick={() => handleRevokeSession(s.id)}
                  className="px-3 py-1 rounded-lg bg-surface-card hover:bg-slate-700 text-slate-400 hover:text-empathy-rose border border-slate-700 font-semibold"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
