export type HabitatType = 
  | 'tree_bark'
  | 'soil_bed'
  | 'grass_patch'
  | 'moss_rock'
  | 'water_edge'
  | 'garden_quadrant';

export interface EnvironmentalMetadata {
  temperatureC?: number;
  moistureEstimate?: 'dry' | 'damp' | 'saturated';
  lightingCondition?: 'direct_sun' | 'diffuse_overcast' | 'deep_shade';
  canopyCoverPercent?: number;
}

export interface Site {
  id: string;
  name: string;
  habitatType: HabitatType;
  description: string;
  latitude?: number;  // Fuzzed to ~2 decimal places for privacy
  longitude?: number; // Fuzzed to ~2 decimal places for privacy
  locationLabel?: string;
  isDemoSite: boolean;
  isSynthetic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  id: string;
  siteId: string;
  recordedAt: string; // ISO 8601 string
  imagePath: string;  // Local path or URL
  thumbnailPath?: string;
  weatherNotes: string; // e.g. "Sunny", "Overcast", "Post-rain drizzle"
  fieldNotes: string;   // Qualitative user observation
  environmentalMetadata: EnvironmentalMetadata;
  createdAt: string;
}

export interface ComparisonPair {
  id: string;
  siteId: string;
  baselineObservationId: string;
  targetObservationId: string;
  visualDifferencePercentage: number;
  excessGreenDelta: number; // Positive = greener, Negative = browning/drying
  structuralSimilarityScore: number;
  diffMaskPath: string;
  alignmentConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  limitationFlags: string[];
  createdAt: string;
}

export interface AIInterpretation {
  id: string;
  comparisonPairId: string;
  modelIdentifier: string;
  observedChanges: string[];
  ecologicalHypotheses: string[];
  uncertainties: string[];
  nextVisitPrompt: string;
  isFallback: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  sites: Site[];
  observations: Observation[];
  comparisons: ComparisonPair[];
  interpretations: AIInterpretation[];
}
