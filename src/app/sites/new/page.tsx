'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, ShieldCheck, MapPin, ArrowLeft, PlusCircle, Trees, Info } from 'lucide-react';
import { HabitatType } from '@/types';

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [habitatType, setHabitatType] = useState<HabitatType>('tree_bark');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Fuzz on client to 2 decimal places immediately for transparency
        const fuzzedLat = Math.round(pos.coords.latitude * 100) / 100;
        const fuzzedLng = Math.round(pos.coords.longitude * 100) / 100;
        setLatitude(fuzzedLat);
        setLongitude(fuzzedLng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        alert('Could not acquire location. You can enter an area label manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this micro-habitat.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          habitatType,
          description: description.trim(),
          locationLabel: locationLabel.trim() || 'Outdoor Field Site',
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create site');
      }

      router.push(`/sites/${data.site.id}`);
    } catch (err: any) {
      setError(err.message || 'Error creating site');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-lime-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Micro-Habitats</span>
      </Link>

      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trees className="w-6 h-6 text-lime-400" />
            <span>Establish New Micro-Habitat</span>
          </h1>
          <p className="text-xs text-emerald-300/70 mt-1">
            Designate a specific outdoor quadrant (30-60cm) that you plan to observe repeatedly over time.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Habitat Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Habitat Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ancient Birch Base, Garden Bed Quadrant 3"
              required
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Habitat Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Habitat Substrate / Type *
            </label>
            <select
              value={habitatType}
              onChange={(e) => setHabitatType(e.target.value as HabitatType)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-[#0a160f]"
            >
              <option value="tree_bark">Tree Bark / Root Base</option>
              <option value="moss_rock">Moss on Rock / Stone</option>
              <option value="soil_bed">Soil Bed / Leaf Litter</option>
              <option value="grass_patch">Grass / Turf Patch</option>
              <option value="garden_quadrant">Garden Plant Quadrant</option>
              <option value="water_edge">Water Edge / Riparian Margin</option>
            </select>
          </div>

          {/* Habitat Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Physical Description & Framing Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical landmarks (e.g. 'North-facing root pocket with deep moss, shaded by canopy') to help you frame future photos from the same position."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* General Location Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Location Name / Park / Yard
            </label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g. City Botanical Garden, Backyard North Corner"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Privacy-Preserving Geolocation */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span className="text-xs font-semibold text-white">Privacy-Preserving Coordinates</span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="px-3 py-1 rounded-lg text-xs font-medium text-lime-300 bg-emerald-900/50 hover:bg-emerald-800/50 border border-emerald-600/40 transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3 h-3" />
                <span>{locating ? 'Acquiring...' : 'Use My GPS'}</span>
              </button>
            </div>

            <p className="text-[11px] text-emerald-300/60 leading-normal">
              Coordinates are automatically <strong>fuzzed to ~1.1km resolution</strong> (2 decimal places) to protect personal residential privacy while retaining rough climate/regional context.
            </p>

            {latitude !== undefined && longitude !== undefined && (
              <div className="text-xs font-mono text-lime-300 bg-black/40 px-3 py-1.5 rounded-lg border border-lime-500/20">
                Fuzzed Coordinates: {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 shadow-xl shadow-lime-950/50 hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'Creating Micro-Habitat...' : 'Create Micro-Habitat'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
