'use client';

import React from 'react';
import { CRISIS_RESOURCES, SOL_SAFETY_NOTICE } from '@empathylink/config';
import { Phone, HeartHandshake, X, ExternalLink, ShieldAlert } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface-card border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-surface transition-colors"
          aria-label="Close crisis support modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-empathy-rose/10 border border-empathy-rose/30 text-empathy-rose">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">We are there for you. Always for you.</h2>
            <p className="text-sm text-slate-400">Immediate, confidential, and compassionate emergency resources.</p>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-xl bg-surface border border-slate-700/60 mb-6 text-sm text-slate-300 leading-relaxed">
          <p className="font-medium text-white mb-1">Important Safety Boundary:</p>
          <p>{SOL_SAFETY_NOTICE}</p>
        </div>

        {/* Hotline Directory */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Verified 24/7 Free Support Lines
          </h3>
          {CRISIS_RESOURCES.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-empathy-rose/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-white text-base">{item.name}</h4>
                  <p className="text-xs text-empathy-rose font-medium">{item.country}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-slate-700 text-xs font-medium text-slate-200 border border-surface-border transition-colors"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-empathy-rose/20 text-empathy-rose border border-empathy-rose/40 text-xs font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    {item.contact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Guidance */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
          <p className="text-xs text-slate-400">If you are in immediate physical danger, please call your local emergency service (911 / 999 / 112).</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface text-slate-200 hover:text-white text-sm font-medium border border-surface-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
