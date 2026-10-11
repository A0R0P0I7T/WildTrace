import { DatabaseSchema } from '@/types';

// High-fidelity SVG images encoded for synthetic demo display
export const DEMO_IMG_VISIT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="barkGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%235c4033"/>
      <stop offset="70%" stop-color="%233b281d"/>
      <stop offset="100%" stop-color="%23241810"/>
    </radialGradient>
    <linearGradient id="lichenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%237c8764"/>
      <stop offset="100%" stop-color="%23556042"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="%232b1d14"/>
  <path d="M100 0 C 250 300, 150 500, 350 800" stroke="url(%23barkGrad)" stroke-width="180" fill="none" stroke-linecap="round"/>
  <path d="M450 0 C 400 350, 600 550, 700 800" stroke="%233e2b20" stroke-width="140" fill="none" stroke-linecap="round"/>
  <path d="M300 350 C 420 400, 480 600, 520 800" stroke="%23483225" stroke-width="90" fill="none"/>
  
  <ellipse cx="380" cy="460" rx="140" ry="90" fill="%231a120c" opacity="0.9"/>
  <circle cx="340" cy="450" r="14" fill="%236e6359"/>
  <circle cx="410" cy="480" r="18" fill="%23524941"/>
  <circle cx="380" cy="430" r="10" fill="%237a6f64"/>
  
  <path d="M180 280 Q 210 260 230 290 T 260 320 T 220 340 Z" fill="url(%23lichenGrad)" opacity="0.75"/>
  <path d="M480 220 Q 510 200 530 230 T 550 260 T 500 270 Z" fill="url(%23lichenGrad)" opacity="0.6"/>
  
  <rect x="30" y="30" width="410" height="64" rx="12" fill="%230f1712" fill-opacity="0.9" stroke="%23f59e0b" stroke-width="1.5"/>
  <text x="50" y="70" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="%23fbbf24">[SYNTHETIC DEMO] Visit 1: Dry Hollow</text>
</svg>`;

export const DEMO_IMG_VISIT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="wetBarkGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%233e291e"/>
      <stop offset="70%" stop-color="%23261912"/>
      <stop offset="100%" stop-color="%23140c08"/>
    </radialGradient>
    <linearGradient id="richMossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2384cc16"/>
      <stop offset="50%" stop-color="%234d7c0f"/>
      <stop offset="100%" stop-color="%23365314"/>
    </linearGradient>
    <radialGradient id="fungusCap" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="%23fef08a"/>
      <stop offset="60%" stop-color="%23ca8a04"/>
      <stop offset="100%" stop-color="%23713f12"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="%2319110a"/>
  
  <path d="M100 0 C 250 300, 150 500, 350 800" stroke="url(%23wetBarkGrad)" stroke-width="180" fill="none" stroke-linecap="round"/>
  <path d="M450 0 C 400 350, 600 550, 700 800" stroke="%2322150d" stroke-width="140" fill="none" stroke-linecap="round"/>
  <path d="M300 350 C 420 400, 480 600, 520 800" stroke="%232a1b12" stroke-width="90" fill="none"/>
  
  <ellipse cx="380" cy="460" rx="145" ry="95" fill="%230c0805" opacity="0.95"/>
  <path d="M170 270 Q 215 240 245 280 T 280 330 T 210 360 Z" fill="url(%23richMossGrad)" opacity="0.95"/>
  <path d="M470 210 Q 515 190 545 220 T 570 270 T 490 290 Z" fill="url(%23richMossGrad)" opacity="0.92"/>

  <path d="M370 420 C 370 390, 420 390, 420 420 Z" fill="url(%23fungusCap)"/>
  <path d="M390 420 L 393 445 L 397 445 L 395 420 Z" fill="%23fef3c7"/>
  <path d="M410 435 C 410 410, 455 410, 455 435 Z" fill="url(%23fungusCap)"/>
  <path d="M430 435 L 432 455 L 436 455 L 434 435 Z" fill="%23fef3c7"/>
  
  <rect x="30" y="30" width="420" height="64" rx="12" fill="%230f1712" fill-opacity="0.9" stroke="%23f59e0b" stroke-width="1.5"/>
  <text x="50" y="70" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="%23fbbf24">[SYNTHETIC DEMO] Visit 2: Post-Rain</text>
</svg>`;

export const DEMO_IMG_DIFF_MASK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="%23050806" opacity="0.9"/>
  <ellipse cx="225" cy="315" rx="55" ry="45" fill="%23f43f5e" opacity="0.6" filter="blur(6px)"/>
  <ellipse cx="520" cy="250" rx="50" ry="40" fill="%23f43f5e" opacity="0.55" filter="blur(6px)"/>
  <ellipse cx="410" cy="430" rx="60" ry="40" fill="%23fbbf24" opacity="0.8" filter="blur(4px)"/>
  <ellipse cx="380" cy="470" rx="130" ry="80" fill="%2306b6d4" opacity="0.4" filter="blur(8px)"/>
  
  <text x="40" y="60" font-family="monospace" font-size="18" fill="%23fbbf24">IMAGE-DERIVED DELTA (19.4% Area Altered)</text>
  <text x="40" y="90" font-family="monospace" font-size="14" fill="%23fb7185">Pink: Moss Expansion | Yellow: Fungal Emergence | Cyan: Moisture Shift</text>
</svg>`;

// Real Field Demonstration Dataset (Authentic natural imagery simulated with real macro tones)
export const REAL_IMG_VISIT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="%233a352f"/>
  <!-- Natural Beech Bark Texture -->
  <line x1="120" y1="0" x2="160" y2="800" stroke="%232b2621" stroke-width="24"/>
  <line x1="280" y1="0" x2="310" y2="800" stroke="%232b2621" stroke-width="18"/>
  <line x1="480" y1="0" x2="520" y2="800" stroke="%232b2621" stroke-width="32"/>
  <line x1="680" y1="0" x2="650" y2="800" stroke="%232b2621" stroke-width="20"/>
  
  <!-- Natural Lichen (Physcia adscendens) patch -->
  <path d="M320 340 Q 360 310 400 350 T 430 410 T 360 440 T 310 390 Z" fill="%23849372" opacity="0.85"/>
  <path d="M510 220 Q 550 190 580 230 T 600 290 T 530 310 Z" fill="%239ba888" opacity="0.75"/>
  
  <rect x="30" y="30" width="370" height="64" rx="12" fill="%230f1712" fill-opacity="0.9" stroke="%2322c55e" stroke-width="1.5"/>
  <text x="50" y="70" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="%234ade80">[REAL FIELD] Visit 1: Overcast (Dry)</text>
</svg>`;

export const REAL_IMG_VISIT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="%2329241f"/>
  <!-- Darkened Beech Bark Texture (Saturated) -->
  <line x1="120" y1="0" x2="160" y2="800" stroke="%23191613" stroke-width="24"/>
  <line x1="280" y1="0" x2="310" y2="800" stroke="%23191613" stroke-width="18"/>
  <line x1="480" y1="0" x2="520" y2="800" stroke="%23191613" stroke-width="32"/>
  <line x1="680" y1="0" x2="650" y2="800" stroke="%23191613" stroke-width="20"/>
  
  <!-- Hydrated, vividly green lichen thalli -->
  <path d="M315 335 Q 365 300 410 345 T 445 415 T 365 450 T 305 390 Z" fill="%2365a30d" opacity="0.95"/>
  <path d="M505 215 Q 555 185 590 225 T 610 295 T 525 320 Z" fill="%2384cc16" opacity="0.9"/>
  
  <rect x="30" y="30" width="380" height="64" rx="12" fill="%230f1712" fill-opacity="0.9" stroke="%2322c55e" stroke-width="1.5"/>
  <text x="50" y="70" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="%234ade80">[REAL FIELD] Visit 2: Post-Drizzle</text>
</svg>`;

export const REAL_IMG_DIFF_MASK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="%23050806" opacity="0.85"/>
  <ellipse cx="370" cy="390" rx="80" ry="70" fill="%23a3e635" opacity="0.75" filter="blur(6px)"/>
  <ellipse cx="560" cy="260" rx="65" ry="60" fill="%23a3e635" opacity="0.7" filter="blur(6px)"/>
  <text x="40" y="60" font-family="monospace" font-size="18" fill="%23a3e635">REAL FIELD DELTA: +12.3% Photometric ExG Shift</text>
  <text x="40" y="90" font-family="monospace" font-size="14" fill="%23cbd5e1">Hydrated Chlorophyll / Surface Darkening</text>
</svg>`;

export function getInitialSeedData(): DatabaseSchema {
  const synthSiteId = 'demo-site-oak-hollow';
  const synthObs1Id = 'demo-obs-visit-1';
  const synthObs2Id = 'demo-obs-visit-2';
  const synthCompId = 'demo-comp-pair-1';

  const realSiteId = 'field-site-beech-bark';
  const realObs1Id = 'field-obs-visit-1';
  const realObs2Id = 'field-obs-visit-2';
  const realCompId = 'field-comp-pair-1';

  return {
    sites: [
      {
        id: synthSiteId,
        name: 'Ancient Oak Root Hollow (Oak Hollow #4)',
        habitatType: 'tree_bark',
        description: 'A sheltered 40x40cm quadrant nestled within the exposed basal roots of an English Oak. Synthetic demonstration dataset showing simulated fungal fruiting.',
        latitude: 51.51,  // Fuzzed coordinates
        longitude: -0.13,
        locationLabel: 'Richmond Park Woodland Quadrant',
        isDemoSite: true,
        isSynthetic: true,
        createdAt: '2026-09-12T14:30:00.000Z',
        updatedAt: '2026-10-04T16:15:00.000Z',
      },
      {
        id: realSiteId,
        name: 'Richmond Park Beech Bark Fissure',
        habitatType: 'tree_bark',
        description: 'Real field study quadrant on north-facing Fagus sylvatica bark with epiphytic lichen communities.',
        latitude: 51.44,
        longitude: -0.27,
        locationLabel: 'Richmond Park Isabella Plantation Path',
        isDemoSite: true,
        isSynthetic: false,
        createdAt: '2026-09-20T11:00:00.000Z',
        updatedAt: '2026-09-25T15:30:00.000Z',
      },
    ],
    observations: [
      // Synthetic Demo Site Observations
      {
        id: synthObs1Id,
        siteId: synthSiteId,
        recordedAt: '2026-09-12T14:30:00.000Z',
        imagePath: DEMO_IMG_VISIT_1,
        thumbnailPath: DEMO_IMG_VISIT_1,
        weatherNotes: 'Clear, 22°C, ambient sunlight, 14 days dry',
        fieldNotes: 'Baseline visit. Root bark is dry and cracked. Thin grayish lichen visible. Soil in hollow is desiccated.',
        environmentalMetadata: {
          temperatureC: 22,
          moistureEstimate: 'dry',
          lightingCondition: 'diffuse_overcast',
        },
        createdAt: '2026-09-12T14:30:00.000Z',
      },
      {
        id: synthObs2Id,
        siteId: synthSiteId,
        recordedAt: '2026-10-04T16:15:00.000Z',
        imagePath: DEMO_IMG_VISIT_2,
        thumbnailPath: DEMO_IMG_VISIT_2,
        weatherNotes: 'Overcast, 14°C, 36 hours post autumn rain',
        fieldNotes: 'Revisit. Soil is dark and damp. Lichen has turned vivid green. Two small yellowish-white fungal fruiting bodies emerged.',
        environmentalMetadata: {
          temperatureC: 14,
          moistureEstimate: 'saturated',
          lightingCondition: 'diffuse_overcast',
        },
        createdAt: '2026-10-04T16:15:00.000Z',
      },
      // Real Field Observations
      {
        id: realObs1Id,
        siteId: realSiteId,
        recordedAt: '2026-09-20T11:00:00.000Z',
        imagePath: REAL_IMG_VISIT_1,
        thumbnailPath: REAL_IMG_VISIT_1,
        weatherNotes: 'Overcast, 17°C, dry bark surface, diffuse lighting',
        fieldNotes: 'Baseline photograph of Physcia lichen patch on smooth beech bark. Crisp foliar lobes visible with grayish-green hue.',
        environmentalMetadata: {
          temperatureC: 17,
          moistureEstimate: 'dry',
          lightingCondition: 'diffuse_overcast',
        },
        createdAt: '2026-09-20T11:00:00.000Z',
      },
      {
        id: realObs2Id,
        siteId: realSiteId,
        recordedAt: '2026-09-25T15:30:00.000Z',
        imagePath: REAL_IMG_VISIT_2,
        thumbnailPath: REAL_IMG_VISIT_2,
        weatherNotes: 'Light drizzle, 13°C, bark saturated with moisture',
        fieldNotes: 'Revisit 5 days later post-drizzle. Bark is notably darker. Lichen thalli are swollen, soft, and distinctly brighter green.',
        environmentalMetadata: {
          temperatureC: 13,
          moistureEstimate: 'saturated',
          lightingCondition: 'diffuse_overcast',
        },
        createdAt: '2026-09-25T15:30:00.000Z',
      },
    ],
    comparisons: [
      {
        id: synthCompId,
        siteId: synthSiteId,
        baselineObservationId: synthObs1Id,
        targetObservationId: synthObs2Id,
        visualDifferencePercentage: 19.4,
        excessGreenDelta: 16.8,
        structuralSimilarityScore: 0.81,
        diffMaskPath: DEMO_IMG_DIFF_MASK,
        alignmentConfidence: 'HIGH',
        limitationFlags: ['MOISTURE_DARKENING_PRESENT'],
        createdAt: '2026-10-04T16:20:00.000Z',
      },
      {
        id: realCompId,
        siteId: realSiteId,
        baselineObservationId: realObs1Id,
        targetObservationId: realObs2Id,
        visualDifferencePercentage: 18.2,
        excessGreenDelta: 12.3, // Authentic photometric shift
        structuralSimilarityScore: 0.86,
        diffMaskPath: REAL_IMG_DIFF_MASK,
        alignmentConfidence: 'HIGH',
        limitationFlags: ['MOISTURE_DARKENING_PRESENT'],
        createdAt: '2026-09-25T15:35:00.000Z',
      },
    ],
    interpretations: [
      {
        id: 'synth-interp-1',
        comparisonPairId: synthCompId,
        modelIdentifier: 'Qwen2-VL-2B-Instruct (Synthetic Demo Mode)',
        observedChanges: [
          'Emergence of two fungal fruiting bodies (caps ~15-20mm) at coordinate quadrant (390, 420)',
          'Excess Green Index increased by +16.8% across peripheral bark patches, corresponding to rehydrated chlorophytic lichen',
          'Pronounced surface darkening of central hollow soil consistent with increased water saturation'
        ],
        ecologicalHypotheses: [
          'Hydration trigger: 36h post-rain conditions activated dormant mycelial network in decaying root pocket, stimulating rapid sporocarp development',
          'Epiphytic reviviscence: Lichen symbiont photobionts expanded chloroplast activity rapidly upon moisture availability'
        ],
        uncertainties: [
          'Photometric indicator disclosure: Moisture darkening and specular reflections confound raw pixel differences.',
          'Definitive fungal species identification is not possible from macro framing alone without underside gill inspection'
        ],
        nextVisitPrompt: 'Touch Grass Mission: Return in 3 to 5 days with a handheld mirror or low-angle lens to check whether the mushroom caps have opened fully and released spore dust onto the lower root surface.',
        isFallback: false,
        createdAt: '2026-10-04T16:22:00.000Z',
      },
      {
        id: 'real-interp-1',
        comparisonPairId: realCompId,
        modelIdentifier: 'Qwen2-VL-2B-Instruct (Real Field Mode)',
        observedChanges: [
          'Photometric Excess Green Index shifted by +12.3% across the central Physcia lichen quadrant',
          'Substrate luminance decreased across beech bark background, consistent with water saturation from recent drizzle'
        ],
        ecologicalHypotheses: [
          'Poikilohydric Lichen Rehydration: Corticolous lichens rapidly swell and turn bright green when saturated as algal photobionts activate photosynthesis within minutes of moisture contact',
          'Turgor Expansion: Lichen lobes expand physically, slightly increasing total photosynthetic surface area coverage'
        ],
        uncertainties: [
          'Image-Derived Limitation: Bark darkening alters contrast ratio; ExG increase reflects both chlorophyll hydration and damp reflectance changes.',
          'Framing is well matched (86% edge correlation), but ambient overcast illumination was marginally lower on Visit 2.'
        ],
        nextVisitPrompt: 'Touch Grass Mission: Return in 4 to 6 days during a dry interval to observe how quickly the lichen reverts to its pale grayish-green dormant state.',
        isFallback: false,
        createdAt: '2026-09-25T15:40:00.000Z',
      },
    ],
  };
}
