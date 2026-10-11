'use client';

import React from 'react';
import { Observation } from '@/types';
import { Calendar, CloudSun, Droplets, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface SiteTimelineProps {
  observations: Observation[];
  selectedBaselineId: string | null;
  selectedTargetId: string | null;
  onSelectBaseline: (id: string) => void;
  onSelectTarget: (id: string) => void;
  onCompare: () => void;
}

export default function SiteTimeline({
  observations,
  selectedBaselineId,
  selectedTargetId,
  onSelectBaseline,
  onSelectTarget,
  onCompare,
}: SiteTimelineProps) {
  if (observations.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
        <Calendar className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
        <h4 className="text-base font-bold text-white">No Observations Recorded Yet</h4>
        <p className="text-xs text-emerald-200/60 max-w-sm mx-auto">
          Start your micro-habitat record by taking an initial baseline photograph and logging current conditions.
        </p>
      </div>
    );
  }

  const canCompare = selectedBaselineId && selectedTargetId && selectedBaselineId !== selectedTargetId;

  return (
    <div className="space-y-6">
      {/* Comparison Selection Indicator / Floating Bar */}
      {observations.length >= 2 && (
        <div className="glass-panel-elevated p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-lime-500/30">
          <div className="text-xs space-y-0.5 text-center sm:text-left">
            <span className="font-semibold text-lime-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Eye className="w-4 h-4 text-lime-400" />
              <span>Visual Comparison Selector</span>
            </span>
            <p className="text-emerald-200/70 text-[11px]">
              Select two visits below to compute pixel difference masks, Excess Green index, and AI interpretation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCompare}
              disabled={!canCompare}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 ${
                canCompare
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-400 text-black shadow-lg shadow-lime-950/40 hover:scale-105 active:scale-95'
                  : 'bg-emerald-950/40 text-emerald-600 border border-emerald-900/40 cursor-not-allowed'
              }`}
            >
              <span>Compare Selected Visits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Chronological Observation List */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-800/40">
        {observations.map((obs, idx) => {
          const isBaseline = selectedBaselineId === obs.id;
          const isTarget = selectedTargetId === obs.id;
          const visitDate = new Date(obs.recordedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={obs.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isBaseline || isTarget
                    ? 'bg-lime-400 border-lime-300 shadow-md shadow-lime-400/50 scale-110'
                    : 'bg-[#0a160f] border-emerald-600/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black/70" />
              </div>

              {/* Card */}
              <div
                className={`glass-panel p-5 sm:p-6 rounded-2xl transition-all float-card space-y-4 ${
                  isBaseline
                    ? 'border-cyan-500/50 ring-1 ring-cyan-500/40'
                    : isTarget
                    ? 'border-lime-500/50 ring-1 ring-lime-500/40'
                    : 'hover:border-emerald-600/40'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/40 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-lime-400 uppercase tracking-wider">
                      Visit #{idx + 1}
                    </span>
                    <span className="text-xs text-emerald-300/80">{visitDate}</span>
                  </div>

                  {/* Comparison Selection Radios / Badges */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectBaseline(obs.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                        isBaseline
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                          : 'bg-emerald-950/40 text-emerald-400/70 border-emerald-800/40 hover:text-white'
                      }`}
                    >
                      {isBaseline ? '✓ Baseline (Visit A)' : 'Set Baseline A'}
                    </button>

                    <button
                      onClick={() => onSelectTarget(obs.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                        isTarget
                          ? 'bg-lime-500/20 text-lime-300 border-lime-400/50 font-bold'
                          : 'bg-emerald-950/40 text-emerald-400/70 border-emerald-800/40 hover:text-white'
                      }`}
                    >
                      {isTarget ? '✓ Target (Visit B)' : 'Set Target B'}
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Image Thumbnail */}
                  <div className="md:col-span-1 rounded-xl overflow-hidden border border-emerald-800/40 bg-black/40 aspect-square max-h-56 relative group/img">
                    <img
                      src={obs.imagePath}
                      alt={`Observation Visit ${idx + 1}`}
                      className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Metadata and Notes */}
                  <div className="md:col-span-2 space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {obs.weatherNotes && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-950/60 text-emerald-200 border border-emerald-800/40">
                            <CloudSun className="w-3.5 h-3.5 text-lime-400" />
                            <span>{obs.weatherNotes}</span>
                          </span>
                        )}

                        {obs.environmentalMetadata?.moistureEstimate && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-950/60 text-emerald-200 border border-emerald-800/40 capitalize">
                            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Moisture: {obs.environmentalMetadata.moistureEstimate}</span>
                          </span>
                        )}
                      </div>

                      {/* Field Qualitative Observations */}
                      <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-900/30 text-xs text-emerald-100/90 leading-relaxed">
                        <span className="font-semibold text-lime-400 block mb-1">Field Notes:</span>
                        {obs.fieldNotes || 'No qualitative notes recorded for this visit.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
