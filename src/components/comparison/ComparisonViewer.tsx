'use client';

import React, { useState } from 'react';
import { Observation, ComparisonPair } from '@/types';
import { Layers, Sliders, ShieldAlert, Sparkles, TrendingUp, AlertTriangle, Eye, Info } from 'lucide-react';

interface ComparisonViewerProps {
  baselineObs: Observation;
  targetObs: Observation;
  comparison: ComparisonPair;
}

export default function ComparisonViewer({
  baselineObs,
  targetObs,
  comparison,
}: ComparisonViewerProps) {
  const {
    visualDifferencePercentage,
    excessGreenDelta,
    alignmentConfidence,
    structuralSimilarityScore,
    limitationFlags,
    diffMaskPath,
  } = comparison;

  const isLowConfidence = alignmentConfidence === 'LOW';

  // Default to side-by-side if low confidence (incompatible framing)
  const [sliderPos, setSliderPos] = useState(50);
  const [showDiffMask, setShowDiffMask] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>(
    isLowConfidence ? 'side-by-side' : 'slider'
  );

  return (
    <div className="space-y-6">
      {/* Photometric Indicator Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-emerald-400 block">Photometric Shift</span>
          <span className="text-xl font-bold text-white tracking-tight">
            {visualDifferencePercentage}%
          </span>
          <span className="text-[10px] text-emerald-300/60 block">Frame Pixel Delta</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-lime-400 block">Excess Green (ExG) Δ</span>
          <span className={`text-xl font-bold tracking-tight ${excessGreenDelta >= 0 ? 'text-lime-400' : 'text-amber-400'}`}>
            {excessGreenDelta > 0 ? `+${excessGreenDelta}%` : `${excessGreenDelta}%`}
          </span>
          <span className="text-[10px] text-emerald-300/60 block">
            Image-Derived Indicator
          </span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-cyan-400 block">Framing Correlation</span>
          <span className={`text-xl font-bold tracking-tight ${
            alignmentConfidence === 'HIGH' ? 'text-cyan-300' : alignmentConfidence === 'MEDIUM' ? 'text-amber-300' : 'text-rose-400'
          }`}>
            {Math.round(structuralSimilarityScore * 100)}% ({alignmentConfidence})
          </span>
          <span className="text-[10px] text-emerald-300/60 block">Edge Overlap Score</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-emerald-400 block">Elapsed Interval</span>
          <span className="text-xl font-bold text-white tracking-tight">
            {(() => {
              const diffMs = Math.abs(new Date(targetObs.recordedAt).getTime() - new Date(baselineObs.recordedAt).getTime());
              const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
              if (diffDays === 0) return '< 1 day';
              return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
            })()}
          </span>
          <span className="text-[10px] text-emerald-300/60 block">Between Observations</span>
        </div>
      </div>

      {/* Mandatory Suitability & Limitations Disclosure */}
      <div className="glass-panel p-4 rounded-xl border-emerald-800/50 space-y-2 bg-[#0c1a12]/80">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <Info className="w-4 h-4 text-lime-400" />
          <span>Scientific Grounding: Photometric Disclosures & Suitability Notes</span>
        </div>
        <p className="text-[11px] text-emerald-200/80 leading-relaxed">
          Pixel differentials and Excess Green Index (ExG = 2G - R - B) are <strong>purely image-derived photometric indicators</strong>. They are confounded by ambient illumination, cloud cover, sensor exposure, and moisture gloss. They do <strong>not</strong> represent verified biological biomass growth.
        </p>

        {limitationFlags.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {limitationFlags.map((flag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-600/40"
              >
                ⚠️ {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Incompatible Framing Warning if LOW confidence */}
      {isLowConfidence && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-300 block">Incompatible Framing for Direct Pixel Subtraction</span>
            <p className="text-[11px] text-rose-200/80 leading-relaxed">
              The photographs show differences in visible texture and green coverage, but their framing and perspective are not sufficiently comparable to establish how this habitat changed over time. Retake the photograph from the same distance and angle before drawing conclusions. Direct pixel subtraction masks are disabled to prevent misleading visual ghosting. Please use the <strong>Side-by-Side Co-Inspection Mode</strong> below to visually cross-reference landmarks.
            </p>
          </div>
        </div>
      )}

      {/* Comparison View Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-emerald-900/40 pb-3">
        <div className="flex items-center gap-2">
          {!isLowConfidence && (
            <button
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'slider'
                  ? 'bg-lime-500 text-black shadow-md shadow-lime-950/40'
                  : 'bg-emerald-950/40 text-emerald-400 hover:text-white border border-emerald-800/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Curtain Slider</span>
            </button>
          )}

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-lime-500 text-black shadow-md shadow-lime-950/40'
                : 'bg-emerald-950/40 text-emerald-400 hover:text-white border border-emerald-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Co-Inspection</span>
          </button>
        </div>

        {/* Toggle Difference Mask Heatmap (Only if compatible) */}
        {!isLowConfidence ? (
          <button
            onClick={() => setShowDiffMask(!showDiffMask)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              showDiffMask
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950/40'
                : 'bg-emerald-950/40 text-emerald-300 hover:text-white border-emerald-800/40'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showDiffMask ? 'Hide Photometric Delta Mask' : 'Show Photometric Delta Mask'}</span>
          </button>
        ) : (
          <span className="text-[11px] text-stone-400 font-mono italic">
            [Delta mask disabled for low framing correlation]
          </span>
        )}
      </div>

      {/* Surface Display */}
      {viewMode === 'slider' && !isLowConfidence ? (
        <div className="relative w-full aspect-square max-h-[550px] rounded-2xl overflow-hidden border border-emerald-800/50 select-none bg-black/60 shadow-2xl">
          <img
            src={targetObs.imagePath}
            alt="Target observation"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={baselineObs.imagePath}
              alt="Baseline observation"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {showDiffMask && (
            <img
              src={diffMaskPath}
              alt="Difference mask"
              className="absolute inset-0 w-full h-full object-cover object-center mix-blend-screen opacity-75 pointer-events-none"
            />
          )}

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-lime-400 pointer-events-none shadow-[0_0_12px_#a3e635]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-lime-400 text-black border-2 border-[#07110a] flex items-center justify-center shadow-lg font-bold text-xs">
              ↔
            </div>
          </div>

          <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
            Visit A: Baseline
          </div>
          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-lime-300 border border-lime-500/30">
            Visit B: Revisit
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />
        </div>
      ) : (
        /* Side by Side Co-Inspection Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-mono font-semibold">
              <span>VISIT A (BASELINE)</span>
              <span>{new Date(baselineObs.recordedAt).toLocaleDateString()}</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-cyan-500/30 aspect-square relative bg-black/40">
              <img
                src={baselineObs.imagePath}
                alt="Baseline"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-[11px] text-cyan-200/80">
              {baselineObs.weatherNotes} &bull; {baselineObs.fieldNotes || 'No notes logged.'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-lime-300 font-mono font-semibold">
              <span>VISIT B (REVISIT)</span>
              <span>{new Date(targetObs.recordedAt).toLocaleDateString()}</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-lime-500/30 aspect-square relative bg-black/40">
              <img
                src={targetObs.imagePath}
                alt="Target"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2.5 rounded-lg bg-black/30 border border-lime-500/20 text-[11px] text-lime-200/80">
              {targetObs.weatherNotes} &bull; {targetObs.fieldNotes || 'No notes logged.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
