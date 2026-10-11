# WildTrace Technical Architecture

## 1. System Overview
WildTrace is an end-to-end longitudinal observation platform designed to track micro-habitats (30-60cm physical quadrants) over time.

## 2. Layers & Modules

```
WildTrace
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/
│   │   │   ├── compare/        # Visual delta computation endpoint
│   │   │   ├── interpret/      # Open-weight AI / Heuristic interpretation endpoint
│   │   │   ├── observations/   # Image upload & metadata intake
│   │   │   ├── seed/           # Demo reset & purge actions
│   │   │   ├── sites/          # Site CRUD & location privacy fuzzer
│   │   │   └── uploads/        # Local file serving with path traversal guard
│   │   ├── sites/              # Dynamic site & capture pages
│   │   ├── globals.css         # Antigravity spatial tokens & glassmorphism
│   │   ├── layout.tsx          # Root layout & ambient depth backgrounds
│   │   └── page.tsx            # Main dashboard & habitat grid
│   ├── components/
│   │   ├── ai/                 # Field intelligence & Next-Visit mission panels
│   │   ├── comparison/         # Curtain slider & difference mask overlays
│   │   ├── layout/             # Responsive Navbar & footer
│   │   └── site/               # SiteCard, SiteTimeline, ObservationModal
│   ├── lib/
│   │   ├── ai/                 # Open-weight VLM client, Zod schemas, heuristic fallback
│   │   ├── storage/            # Atomic file database & demonstration seed data
│   │   └── vision/             # Sharp normalizer & Excess Green Index engine
│   └── types/                  # TypeScript domain models
├── data/                       # Local SQLite / JSON persistence & uploaded imagery
├── docs/                       # Architectural specs & DEV submission article
└── tests/                      # Automated end-to-end verification scripts
```

## 3. Algorithmic Computer Vision Mechanics

### 3.1 Normalization & Registration
Incoming photos from varied camera models and mobile orientations are normalized via `sharp`:
1. EXIF rotation metadata is parsed and baked.
2. Images are transformed to uniform dimensions (`256x256` or `1024x1024`) with edge preservation.
3. Alpha channels are stripped to maintain uniform 3-channel RGB matrix processing.

### 3.2 Spectral Analysis: Excess Green Index (ExG)
To detect real biological activity rather than superficial pixel lighting changes, WildTrace implements the Excess Green Index across grid tiles:
$$\text{ExG} = \frac{2 \cdot G - R - B}{255}$$
- An increase in ExG indicates photosynthetic chlorophyll activation (e.g. hydrated moss cushions or new cotyledon shoots).
- A decrease in ExG highlights drying, desiccation, or autumn leaf litter coverage.

### 3.3 Difference Heatmap Mask Generation
Pixel difference vectors that exceed camera noise thresholds are projected onto a 16x16 spatial grid. An SVG delta mask is dynamically assembled with color-coded luminescence:
- **Lime (#a3e635):** Vegetative and moss expansion hotspots.
- **Magenta (#f43f5e):** Structural substrate displacement.
- **Cyan (#06b6d4):** High-moisture absorption and puddle boundaries.

## 4. Privacy & Ethical Field Protocol
- **Location Precision:** Coordinates obtained via browser GPS are mathematically fuzzed to 2 decimal places before persistence ($\approx 1.1\text{ km}$ precision). Exact backyard coordinates are never stored.
- **Data Sovereignty:** All files reside on local storage. Users can export all observation data or execute a total purge at any time.
- **Scientific Integrity:** The AI engine refuses to state definitive taxonomic identifications or unverified causal claims, and always discloses illumination and perspective confounds.
