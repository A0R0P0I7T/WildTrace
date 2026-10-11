'use client';

import React, { useState } from 'react';
import { AIInterpretation } from '@/types';
import { Sparkles, Compass, HelpCircle, ShieldAlert, CheckCircle, RotateCw, Footprints, Trees } from 'lucide-react';

interface FieldIntelligencePanelProps {
  comparisonPairId: string;
  initialInterpretation?: AIInterpretation;
}

export default function FieldIntelligencePanel({
  comparisonPairId,
  initialInterpretation,
}: FieldIntelligencePanelProps) {
  const [interpretation, setInterpretation] = useState<AIInterpretation | undefined>(initialInterpretation);
  const [loading, setLoading] = useState(!initialInterpretation);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch if not already present
  React.useEffect(() => {
    if (!interpretation) {
      handleFetchInterpretation(false);
    }
  }, [comparisonPairId]);

  const handleFetchInterpretation = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparisonPairId, forceRefresh }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate interpretation');
      }

      setInterpretation(data.interpretation);
    } catch (err: any) {
      setError(err.message || 'Error communicating with interpretation engine');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-lime-400 border-t-transparent animate-spin mx-auto" />
        <h4 className="text-sm font-semibold text-white">Synthesizing Field Intelligence...</h4>
        <p className="text-xs text-emerald-300/70 max-w-sm mx-auto">
          Grounding algorithmic visual shifts and environmental context into ecological hypotheses and next-visit missions.
        </p>
      </div>
    );
  }

  if (error || !interpretation) {
    return (
      <div className="glass-panel p-6 rounded-2xl space-y-3 border-amber-800/40">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Interpretation Error</span>
        </div>
        <p className="text-xs text-emerald-200/70">{error || 'Unable to display interpretation.'}</p>
        <button
          onClick={() => handleFetchInterpretation(true)}
          className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-xs font-medium text-lime-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engine Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/40 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-lime-400" />
          <h3 className="text-base font-bold text-white">Field Intelligence & Hypotheses</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
            {interpretation.modelIdentifier}
          </span>
          <button
            onClick={() => handleFetchInterpretation(true)}
            title="Re-run interpretation"
            className="p-1.5 rounded-lg text-emerald-400 hover:text-lime-300 hover:bg-emerald-900/40 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Direct Observations & Hypotheses */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Grounded Observations */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Directly Observed Visual Evidence
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/90">
              {interpretation.observedChanges.map((change, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lime-400 font-bold">&bull;</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Ecological Hypotheses */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Ecological Hypotheses
              </h4>
              <span className="text-[10px] text-emerald-400/60 font-mono">Non-Definitive</span>
            </div>

            <ul className="space-y-2.5 text-xs text-emerald-100/85">
              {interpretation.ecologicalHypotheses.map((hyp, idx) => (
                <li key={idx} className="p-2.5 rounded-xl bg-black/25 border border-emerald-900/30">
                  {hyp}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Uncertainties & Confounds */}
          <div className="glass-panel p-4 rounded-xl space-y-2 border-emerald-900/30">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="w-3 h-3" /> Field Uncertainties & Limitations
            </h4>
            <ul className="space-y-1.5 text-[11px] text-emerald-200/70">
              {interpretation.uncertainties.map((unc, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400/70">&bull;</span>
                  <span>{unc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: "Touch Grass" Next Visit Mission Card */}
        <div className="lg:col-span-1">
          <div className="glass-panel-elevated p-6 rounded-2xl border-lime-400/30 space-y-4 glow-pulse h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30 text-[11px] font-bold">
                <Footprints className="w-3.5 h-3.5" />
                <span>Next Field Visit Mission</span>
              </div>

              <h4 className="text-base font-extrabold text-white leading-snug">
                Your Tangible Action for Visit #{3}
              </h4>

              <div className="p-4 rounded-xl bg-emerald-950/60 border border-lime-500/30 text-xs text-lime-100 leading-relaxed font-medium">
                {interpretation.nextVisitPrompt}
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-800/40 text-[11px] text-emerald-300/70 space-y-1">
              <span className="font-semibold text-white block">Why this matters:</span>
              <p>
                Natural systems reveal themselves through recurring physical inspection, not one-off photos. Return outdoors to verify this hypothesis!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
