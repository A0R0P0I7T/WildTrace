'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Layers,
  Calendar,
  Sparkles,
  ShieldCheck,
  Tag,
  Share2,
  Trees,
  Trash2,
} from 'lucide-react';
import { Site, Observation, ComparisonPair, AIInterpretation } from '@/types';
import SiteTimeline from '@/components/site/SiteTimeline';
import ObservationModal from '@/components/site/ObservationModal';
import ComparisonViewer from '@/components/comparison/ComparisonViewer';
import FieldIntelligencePanel from '@/components/ai/FieldIntelligencePanel';

export default function SiteDetailPage() {
  const params = useParams();
  const siteId = params.id as string;
  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);

  // Active comparison state
  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [activeComparison, setActiveComparison] = useState<ComparisonPair | null>(null);
  const [comparingLoading, setComparingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'comparison'>('timeline');

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sites/${siteId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch site');
      }

      setSite(data.site);
      setObservations(data.observations);
      setComparisons(data.comparisons);

      // Auto-select latest pair if at least 2 exist
      if (data.observations.length >= 2) {
        const obsA = data.observations[0];
        const obsB = data.observations[data.observations.length - 1];
        setBaselineId(obsA.id);
        setTargetId(obsB.id);

        const existingComp = data.comparisons.find(
          (c: ComparisonPair) =>
            (c.baselineObservationId === obsA.id && c.targetObservationId === obsB.id) ||
            (c.baselineObservationId === obsB.id && c.targetObservationId === obsA.id)
        );

        if (existingComp) {
          setActiveComparison(existingComp);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading site');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchSiteData();
    }
  }, [siteId]);

  const handleExecuteComparison = async () => {
    if (!baselineId || !targetId || baselineId === targetId) return;

    try {
      setComparingLoading(true);
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baselineObservationId: baselineId,
          targetObservationId: targetId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Comparison calculation failed');
      }

      setActiveComparison(data.comparison);
      setActiveTab('comparison');
    } catch (e: any) {
      alert(e.message || 'Comparison failed');
    } finally {
      setComparingLoading(false);
    }
  };

  const handleDeleteSite = async () => {
    if (!site || site.isDemoSite) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${site.name}" and all its recorded observations?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/sites/${site.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete habitat');
      }
      router.push('/');
    } catch (e: any) {
      alert(e.message || 'Error deleting site');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-lime-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-emerald-300/80">Loading micro-habitat record...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-white">Habitat Not Found</h2>
        <p className="text-xs text-emerald-200/70">{error || 'Unable to find specified habitat.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500 text-black text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const baselineObs = observations.find((o) => o.id === baselineId);
  const targetObs = observations.find((o) => o.id === targetId);

  return (
    <div className="space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-lime-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Micro-Habitats</span>
        </Link>

        {site.isSynthetic ? (
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
            ⚠️ SYNTHETIC DEMO DATA — SIMULATED OBSERVATIONS
          </span>
        ) : site.isDemoSite ? (
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-lime-300 border border-lime-500/40 font-semibold">
            🌿 REAL FIELD DEMO — AUTHENTIC PHOTOMETRIC DATA
          </span>
        ) : null}
      </div>

      {site.isSynthetic && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
          <strong>⚠️ Synthetic Demonstration Dataset:</strong> These observations and images are simulated for feature demonstration purposes. Real field observations should be recorded using your own device camera or file upload.
        </div>
      )}

      {/* Habitat Header Glass Banner */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950 text-lime-400 border border-emerald-800/60">
                {site.habitatType.replace('_', ' ')}
              </span>

              {site.locationLabel && (
                <span className="text-xs text-emerald-300/80">&bull; {site.locationLabel}</span>
              )}

              {site.latitude && site.longitude && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/80 font-mono bg-black/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <ShieldCheck className="w-3 h-3 text-lime-400" />
                  <span>Fuzzed: ~{site.latitude.toFixed(2)}°, {site.longitude.toFixed(2)}°</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {site.name}
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {!site.isDemoSite && (
              <button
                type="button"
                onClick={handleDeleteSite}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
                title="Delete this micro-habitat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Site</span>
              </button>
            )}
            <button
              onClick={() => setIsObsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 shadow-lg shadow-lime-950/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Camera className="w-4 h-4" />
              <span>Record New Observation</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-3xl">
          {site.description || 'No physical landmarks or description logged for this site.'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-emerald-900/40 pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-lime-500 text-black shadow-md shadow-lime-950/40'
              : 'text-emerald-300 hover:text-white bg-emerald-950/30'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timeline ({observations.length} Visits)</span>
        </button>

        <button
          onClick={() => {
            if (!activeComparison && observations.length >= 2) {
              handleExecuteComparison();
            } else {
              setActiveTab('comparison');
            }
          }}
          disabled={observations.length < 2}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'comparison'
              ? 'bg-lime-500 text-black shadow-md shadow-lime-950/40'
              : observations.length < 2
              ? 'text-emerald-700 bg-emerald-950/20 cursor-not-allowed'
              : 'text-emerald-300 hover:text-white bg-emerald-950/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visual Comparison & AI Intelligence</span>
        </button>
      </div>

      {/* Tab 1: Timeline */}
      {activeTab === 'timeline' && (
        <SiteTimeline
          observations={observations}
          selectedBaselineId={baselineId}
          selectedTargetId={targetId}
          onSelectBaseline={(id) => setBaselineId(id)}
          onSelectTarget={(id) => setTargetId(id)}
          onCompare={handleExecuteComparison}
        />
      )}

      {/* Tab 2: Visual Comparison & AI Field Intelligence */}
      {activeTab === 'comparison' && (
        <div className="space-y-10">
          {comparingLoading ? (
            <div className="glass-panel p-12 rounded-2xl text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-lime-400 border-t-transparent animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Calculating Pixel & Spectral Deltas...</h3>
              <p className="text-xs text-emerald-200/60 max-w-sm mx-auto">
                Running Sharp image normalization, Excess Green Index calculations, and alignment suitability checks.
              </p>
            </div>
          ) : activeComparison && baselineObs && targetObs ? (
            <>
              {/* Visual Comparison Viewer */}
              <section className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="border-b border-emerald-900/40 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-lime-400" />
                      <span>Visual Change Detection Engine</span>
                    </h2>
                    <p className="text-xs text-emerald-300/70">
                      Comparing Visit A ({new Date(baselineObs.recordedAt).toLocaleDateString()}) and Visit B ({new Date(targetObs.recordedAt).toLocaleDateString()})
                    </p>
                  </div>
                </div>

                <ComparisonViewer
                  baselineObs={baselineObs}
                  targetObs={targetObs}
                  comparison={activeComparison}
                />
              </section>

              {/* AI Field Intelligence Panel */}
              <section className="space-y-4">
                <FieldIntelligencePanel comparisonPairId={activeComparison.id} />
              </section>
            </>
          ) : (
            <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
              <Layers className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">Select Two Visits to Compare</h3>
              <p className="text-xs text-emerald-200/60 max-w-sm mx-auto">
                Head to the Timeline tab and choose a baseline visit and a revisit to compute visual changes.
              </p>
              <button
                onClick={() => setActiveTab('timeline')}
                className="px-4 py-2 rounded-xl bg-lime-500 text-black text-xs font-semibold"
              >
                Go to Timeline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Observation Capture Modal */}
      <ObservationModal
        siteId={site.id}
        baselinePhotoUrl={observations[0]?.imagePath}
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        onSuccess={() => fetchSiteData()}
      />
    </div>
  );
}
