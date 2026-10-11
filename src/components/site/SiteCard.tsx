import React from 'react';
import Link from 'next/link';
import { Site } from '@/types';
import { getObservationsBySiteId } from '@/lib/storage/db';
import { Trees, Compass, Calendar, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface SiteCardProps {
  site: Site;
}

const HABITAT_LABELS: Record<string, { label: string; color: string }> = {
  tree_bark: { label: 'Tree Bark / Root', color: 'bg-amber-950/60 text-amber-300 border-amber-700/40' },
  soil_bed: { label: 'Soil Bed', color: 'bg-stone-900 text-stone-300 border-stone-700/40' },
  grass_patch: { label: 'Grass Patch', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40' },
  moss_rock: { label: 'Moss on Rock', color: 'bg-lime-950/60 text-lime-300 border-lime-700/40' },
  water_edge: { label: 'Water Edge', color: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/40' },
  garden_quadrant: { label: 'Garden Quadrant', color: 'bg-teal-950/60 text-teal-300 border-teal-700/40' },
};

export default function SiteCard({ site }: SiteCardProps) {
  const observations = getObservationsBySiteId(site.id);
  const habitatInfo = HABITAT_LABELS[site.habitatType] || {
    label: site.habitatType,
    color: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40',
  };

  const latestObs = observations[observations.length - 1];

  return (
    <div className="glass-panel rounded-2xl p-6 float-card flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${habitatInfo.color}`}>
            {habitatInfo.label}
          </span>

          {site.isSynthetic ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold tracking-wide">
              SYNTHETIC DEMO
            </span>
          ) : site.isDemoSite ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-lime-300 border border-lime-500/40 font-semibold tracking-wide">
              REAL FIELD DEMO
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-lime-300 transition-colors line-clamp-1">
          {site.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-emerald-200/70 line-clamp-2 leading-relaxed">
          {site.description || 'No habitat description provided.'}
        </p>
      </div>

      {/* Observation Count & Thumbnail Preview */}
      <div className="space-y-3 pt-2 border-t border-emerald-900/40">
        <div className="flex items-center justify-between text-xs text-emerald-300/80">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-lime-400" />
            <span>{observations.length} {observations.length === 1 ? 'visit' : 'visits'} logged</span>
          </span>

          {site.latitude && site.longitude && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400/70 font-mono" title="Location fuzzed for privacy">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>~{site.latitude.toFixed(2)}°, {site.longitude.toFixed(2)}°</span>
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={`/sites/${site.id}`}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 bg-emerald-950/60 hover:bg-lime-500 hover:text-black text-lime-300 border border-emerald-700/50 hover:border-lime-400 transition-all duration-200"
        >
          <span>Inspect Timeline & Compare</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
