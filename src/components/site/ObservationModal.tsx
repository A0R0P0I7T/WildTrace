'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, CloudSun, Droplets, Sun, Sparkles } from 'lucide-react';

interface ObservationModalProps {
  siteId: string;
  isOpen: boolean;
  baselinePhotoUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ObservationModal({
  siteId,
  isOpen,
  baselinePhotoUrl,
  onClose,
  onSuccess,
}: ObservationModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showGhostOverlay, setShowGhostOverlay] = useState(false);
  const [ghostOpacity, setGhostOpacity] = useState(40);
  const [weatherNotes, setWeatherNotes] = useState('Overcast, mild breeze');
  const [fieldNotes, setFieldNotes] = useState('');
  const [moisture, setMoisture] = useState<'dry' | 'damp' | 'saturated'>('damp');
  const [lighting, setLighting] = useState<'direct_sun' | 'diffuse_overcast' | 'deep_shade'>('diffuse_overcast');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !imagePreview) {
      setError('Please capture or select an observation photograph.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('siteId', siteId);
      formData.append('weatherNotes', weatherNotes);
      formData.append('fieldNotes', fieldNotes);
      formData.append('recordedAt', new Date().toISOString());
      formData.append(
        'environmentalMetadata',
        JSON.stringify({
          moistureEstimate: moisture,
          lightingCondition: lighting,
        })
      );

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/observations', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record observation');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording observation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-elevated w-full max-w-xl rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-lime-400" />
            <h2 className="text-lg font-bold text-white">Record Field Observation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-700/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photograph Capture / Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Habitat Photograph *
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-emerald-600/40 group max-h-64 flex items-center justify-center bg-black/40">
                  <img
                    src={imagePreview}
                    alt="Current Observation Preview"
                    className="w-full h-auto max-h-64 object-contain"
                  />

                  {/* Translucent Baseline Ghost Overlay */}
                  {showGhostOverlay && baselinePhotoUrl && (
                    <img
                      src={baselinePhotoUrl}
                      alt="Baseline Ghost Overlay"
                      style={{ opacity: ghostOpacity / 100 }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-rose-300 hover:text-white text-xs border border-rose-500/30 flex items-center gap-1 backdrop-blur-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>

                {/* Ghost View Controls if baseline exists */}
                {baselinePhotoUrl && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between gap-3 text-xs flex-wrap">
                      <button
                        type="button"
                        aria-label="Toggle Ghost View camera alignment overlay"
                        onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                        className={`px-2.5 py-1 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                          showGhostOverlay
                            ? 'bg-lime-500/20 text-lime-300 border-lime-400/50 font-bold'
                            : 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                        <span>{showGhostOverlay ? 'Ghost View ON' : 'Toggle Ghost View'}</span>
                      </button>

                      {showGhostOverlay && (
                        <div className="flex items-center gap-2">
                          <label htmlFor="ghost-opacity-input" className="text-[11px] text-emerald-300/70">Opacity:</label>
                          <input
                            id="ghost-opacity-input"
                            aria-label="Ghost View overlay opacity percentage"
                            type="range"
                            min="10"
                            max="90"
                            value={ghostOpacity}
                            onChange={(e) => setGhostOpacity(Number(e.target.value))}
                            className="w-24 accent-lime-400"
                          />
                          <span className="font-mono text-[11px] text-lime-300">{ghostOpacity}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-300/60 italic px-1">
                      ℹ️ <strong>Field Alignment Aid:</strong> Ghost View displays a translucent overlay of the baseline observation to assist manual framing and camera orientation in the field. It does not perform automated geometric or perspective warping.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-700/50 hover:border-lime-400/70 rounded-xl p-8 text-center cursor-pointer bg-emerald-950/20 hover:bg-emerald-950/40 transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-lime-500/20 text-lime-300 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Tap to use Camera or Upload Photo
                </p>
                <p className="text-[11px] text-emerald-300/60">
                  Aim for the same framing and height as previous visits for optimal change detection.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Qualitative Field Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Field Notes & What You Notice
            </label>
            <textarea
              rows={3}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="e.g. Soil is notably damp; small yellowish specks on lowest bark groove; lichen looks brighter green than last week."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Weather & Environmental State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-lime-400" />
                <span>Weather Conditions</span>
              </label>
              <input
                type="text"
                value={weatherNotes}
                onChange={(e) => setWeatherNotes(e.target.value)}
                placeholder="e.g. Sunny, 19°C, rain yesterday"
                className="w-full px-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-lime-400" />
                <span>Ground Moisture</span>
              </label>
              <select
                value={moisture}
                onChange={(e) => setMoisture(e.target.value as any)}
                className="w-full px-4 py-2 rounded-xl glass-input text-xs bg-[#0a160f]"
              >
                <option value="dry">Dry / Desiccated</option>
                <option value="damp">Damp / Moist</option>
                <option value="saturated">Saturated / Puddled</option>
              </select>
            </div>
          </div>

          {/* Lighting */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wide flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-lime-400" />
              <span>Ambient Lighting</span>
            </label>
            <select
              value={lighting}
              onChange={(e) => setLighting(e.target.value as any)}
              className="w-full px-4 py-2 rounded-xl glass-input text-xs bg-[#0a160f]"
            >
              <option value="diffuse_overcast">Diffuse / Overcast (Recommended for comparison)</option>
              <option value="direct_sun">Direct Sunlight (High contrast shadows)</option>
              <option value="deep_shade">Deep Canopy Shade (Low light)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 shadow-md shadow-lime-950/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Processing & Saving...' : 'Save Observation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
