import Link from 'next/link';
import { getAllSites } from '@/lib/storage/db';
import SiteCard from '@/components/site/SiteCard';
import { PlusCircle, Sparkles, Eye, Compass, Shield, ArrowRight, Trees, Leaf, Check } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  const sites = getAllSites();

  return (
    <div className="space-y-12">
      {/* Antigravity Spatial Hero Section */}
      <section className="relative pt-6 pb-10 text-center sm:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-5">
            {/* Theme Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-950/70 text-lime-300 border border-lime-500/30 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
              <span>DEV Community Hacktoberfest 2026 &bull; Touch Grass Challenge</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Track a micro-habitat <br />
              <span className="bg-gradient-to-r from-lime-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                across real-world time.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/70 leading-relaxed">
              WildTrace is not a plant identifier or nature chatbot. It is a longitudinal observation system that connects repeated visits to the same outdoor quadrant, detects genuine visual changes, and generates evidence-grounded field missions.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              <Link
                href="/sites/new"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 shadow-xl shadow-lime-950/50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Micro-Habitat Site</span>
              </Link>

              <Link
                href="/sites/demo-site-oak-hollow"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-emerald-200 bg-emerald-950/50 hover:bg-emerald-900/40 border border-emerald-700/40 hover:border-emerald-500/50 hover:scale-105 transition-all duration-300"
              >
                <Eye className="w-5 h-5 text-lime-400" />
                <span>Explore Oak Hollow Demo</span>
              </Link>
            </div>
          </div>

          {/* Antigravity Floating Feature Card */}
          <div className="w-full lg:w-96 glass-panel-elevated p-6 rounded-2xl float-card space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Core Principles
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                Scientific Grounding
              </span>
            </div>

            <ul className="space-y-3 text-xs text-emerald-100/80">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Longitudinal tracking:</strong> Observes the same physical 50cm patch over days, weeks, and seasons.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Grounded Computer Vision:</strong> Measures Excess Green Index (ExG) and generates delta masks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Open-Weight VLM:</strong> Hypotheses with uncertainty disclosure & zero paid API locks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Privacy First:</strong> Geolocation coordinates fuzzed to ~1.1km; no commercial tracking.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sites Listing Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Trees className="w-6 h-6 text-lime-400" />
              <span>Monitored Micro-Habitats</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300/70">
              Select a location to record observations, inspect timelines, or compute visual comparisons.
            </p>
          </div>

          <Link
            href="/sites/new"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-lime-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-lime-500/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Site</span>
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-4">
            <Compass className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-lg font-semibold text-white">No Micro-Habitats Found</h3>
            <p className="text-sm text-emerald-200/60 max-w-md mx-auto">
              Get started by creating your first observation quadrant or load the pre-configured demonstration habitat.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/sites/new"
                className="px-4 py-2 rounded-lg bg-lime-500 text-black font-semibold text-xs hover:bg-lime-400"
              >
                Create First Site
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}

            {/* Quick Create Card */}
            <Link
              href="/sites/new"
              className="glass-panel p-6 rounded-2xl border-dashed border-emerald-700/50 hover:border-lime-400/60 flex flex-col items-center justify-center text-center group float-card min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-900/40 text-emerald-400 group-hover:text-lime-300 group-hover:bg-lime-500/20 flex items-center justify-center mb-3 transition-colors">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-lime-300 transition-colors">
                Establish New Habitat
              </h3>
              <p className="text-xs text-emerald-300/60 mt-1 max-w-[200px]">
                Mark a tree, soil quadrant, or rock patch in your local area.
              </p>
            </Link>
          </div>
        )}
      </section>

      {/* Touch Grass Field Methodology */}
      <section className="glass-panel p-8 rounded-2xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-lime-400" />
          <span>The Four-Step Field Workflow</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-400">01 &bull; GROUND SELECTION</span>
            <h4 className="text-sm font-semibold text-white">Find a Micro-Habitat</h4>
            <p className="text-xs text-emerald-200/70">
              Pick a small 30-50cm area outdoors that you can conveniently return to every week.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-400">02 &bull; BASELINE RECORD</span>
            <h4 className="text-sm font-semibold text-white">Capture Observation</h4>
            <p className="text-xs text-emerald-200/70">
              Photograph the quadrant and log environmental conditions like ground moisture and weather.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-400">03 &bull; REVISIT & COMPARE</span>
            <h4 className="text-sm font-semibold text-white">Detect Visual Shifts</h4>
            <p className="text-xs text-emerald-200/70">
              Return post-rain or seasonal shift. Algorithmic diffing isolates foliage growth and soil darkening.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-400">04 &bull; FIELD INTELLIGENCE</span>
            <h4 className="text-sm font-semibold text-white">Next Visit Mission</h4>
            <p className="text-xs text-emerald-200/70">
              Receive open-weight AI hypotheses and a specific physical prompt for your subsequent visit.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
