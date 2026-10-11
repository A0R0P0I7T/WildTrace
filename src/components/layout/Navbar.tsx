'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, PlusCircle, Sparkles, RotateCcw, Trees, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (!confirm('Reset local database back to pre-seeded demonstration data?')) return;
    try {
      setResetting(true);
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07110a]/75 border-b border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-600 flex items-center justify-center shadow-lg shadow-lime-950/40 border border-lime-400/30 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 text-lime-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-lime-300 transition-colors">
                  WildTrace
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300 font-mono border border-lime-500/30">
                  DEV 2026
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/70 -mt-0.5 hidden sm:block">
                Longitudinal Micro-Habitat Observation
              </p>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/sites/demo-site-oak-hollow"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 transition-all"
            >
              <Trees className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden md:inline">Inspect</span> Demo Site
            </Link>

            <Link
              href="/sites/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 shadow-md shadow-lime-900/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Track New Site</span>
            </Link>

            <button
              onClick={handleResetData}
              disabled={resetting}
              title="Reset to initial demonstration dataset"
              className="p-2 rounded-lg text-emerald-400 hover:text-lime-300 hover:bg-emerald-950/50 border border-emerald-800/30 transition-all text-xs flex items-center gap-1"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
