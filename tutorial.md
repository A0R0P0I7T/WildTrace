# WildTrace — User Guide, Architecture & Developer Tutorial

Welcome to **WildTrace**, an offline-first micro-habitat ecological observation platform built for the **DEV Community Hacktoberfest "Touch Grass"** challenge.

WildTrace empowers individuals, naturalists, and students to track subtle longitudinal changes across a dedicated physical patch of nature—such as an oak tree bark crevice, moss-covered granite boulder, garden soil bed, or grass quadrant—over days, weeks, and seasons.

---

## Table of Contents

1. [What WildTrace Does](#1-what-wildtrace-does)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Running Locally](#4-running-locally)
5. [First-Use Walkthrough](#5-first-use-walkthrough)
6. [Test Images & Repeat Photograph Methodology](#6-test-images--repeat-photograph-methodology)
7. [AI Inference Gateway & Offline Mode](#7-ai-inference-gateway--offline-mode)
8. [Persistence, Storage & Privacy Architecture](#8-persistence-storage--privacy-architecture)
9. [Docker & Containerized Deployment](#9-docker--containerized-deployment)
10. [Automated Testing & Troubleshooting](#10-automated-testing--troubleshooting)
11. [Known Limitations & Scientific Integrity](#11-known-limitations--scientific-integrity)
12. [Repository Architecture Map](#12-repository-architecture-map)
13. [Reproducing the Demonstration](#13-reproducing-the-demonstration)

---

## 1. What WildTrace Does

Nature does not change in dramatic jumps; it unfolds through quiet, micro-scale shifts:
- A patch of lichen swells and intensifies in greenness within hours of morning rain.
- Seedling cotyledons pierce leaf litter after three warm afternoons.
- Desiccated moss withdraws into dormant brown protection during dry spells.

### Core Capabilities

1. **Micro-Habitat Tracking:** Users define small, specific outdoor quadrants (10cm–1m²), recording qualitative environmental context (weather, soil dampness, temperature, canopy cover).
2. **Camera-Alignment Aid (Ghost View):** When recording a repeat observation, WildTrace renders a translucent, adjustable overlay of your baseline photograph to assist manual camera positioning in the field.
3. **Computer-Vision Comparison Engine:** Computes image-derived photometric indicators using [Sharp](https://sharp.pixelplumbing.com):
   - **Excess Green Index ($\text{ExG} = 2G - R - B$):** A quantitative spectral greenness shift indicator that tracks color dynamics without assuming biological growth.
   - **Photometric Alteration Mask:** Identifies color-shifted pixel clusters and generates an SVG heatmap overlay.
   - **Sobel Edge Correlation:** A 3×3 spatial gradient dot-product correlation ($0.0$ to $1.0$) that checks framing consistency and flags perspective misalignment.
4. **Framing Suitability & Uncertainty Disclosures:** The engine explicitly refuses to treat photometric shifts as biological proof, flagging confounds such as `HIGH_ILLUMINATION_DISPARITY`, `PERSPECTIVE_SHIFT_DETECTED`, or `MODERATE_FRAMING_VARIANCE`.
5. **Grounded AI Field Intelligence:** An inference gateway (supporting open-weight vision-language models or a 100% offline deterministic heuristic engine) evaluates observations and synthesizes:
   - Observed physical changes.
   - Non-definitive ecological hypotheses.
   - Confound disclosures and uncertainties.
   - Exactly **one actionable "Touch Grass" field mission** directing your next physical visit.

---

## 2. Prerequisites

### Mandatory
- **Node.js:** `v20.x` or higher (verified on Node `v24.13.1`).
- **npm:** `v10.x` or higher (bundled with Node.js).
- **Operating System:** Windows 10/11 (PowerShell), macOS, or Linux.

### Optional
- **Docker & Docker Compose:** Optional for containerized deployment.
- **OpenRouter API Key:** Optional. WildTrace connects to vision-capable multimodal models (e.g. `google/gemini-2.5-flash`, `qwen/qwen-2.5-vl-72b-instruct`) via OpenRouter. Defaults seamlessly to the built-in offline heuristic engine when no key is present.

---

## 3. Installation

### Step 1: Clone the Repository
Open your terminal and navigate to the project directory:

```bash
git clone https://github.com/your-username/wildtrace.git
cd wildtrace
```

### Step 2: Install Dependencies
Install all production and development dependencies:

```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment configuration:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Inside `.env`, verify or configure the following settings:
```ini
# Local SQLite Database URL
DATABASE_URL="file:../data/wildtrace.db"

# Primary External Multimodal AI Provider (OpenRouter)
# Obtain an API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=""

# Configurable OpenRouter Vision Model (must support multimodal image inputs)
# Recommended: "google/gemini-2.5-flash" (Default: ~5s), "qwen/qwen2.5-vl-72b-instruct" (Open-Weight Flagship), "qwen/qwen3-vl-8b-instruct" (Open-Weight Lightweight)
OPENROUTER_MODEL="google/gemini-2.5-flash"
OPENROUTER_TIMEOUT_MS=35000

# Optional Secondary Hugging Face Token (backward-compatible fallback)
HUGGINGFACE_API_KEY=""

# Port Configuration
PORT=3000
```

### Step 4: Initialize the Database
Generate the Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma db push
```

---

## 4. Running Locally

### Development Mode
Start the Next.js development server:

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).

- **Stop the server:** Press `Ctrl + C` in your terminal.
- **View logs:** Server-side API logs, Sharp processing notifications, and Prisma database sync notes print directly to the terminal output.

### Production Mode
To build and run the optimized production bundle locally:

```bash
npm run build
npm start
```

---

## 5. First-Use Walkthrough

Follow this step-by-step path to explore all features:

### Step 5.1: Explore Demonstration Habitats
Upon opening [http://localhost:3000](http://localhost:3000), the dashboard presents two pre-seeded habitats:
1. **[Synthetic Demo] Beech Bark Fissure #04:** A simulated micro-habitat illustrating dry vs. post-rain moss expansion and fungal emergence.
2. **[Real Field Demo] Forest Lichen Patch Alpha:** Authentic longitudinal macro imagery of *Physcia adscendens* lichen on beech bark under overcast vs. hydrated post-drizzle field conditions.

Click **"Inspect Timeline & Compare"** on either card to view its timeline, photographs, and comparison metrics.

### Step 5.2: Create a New Micro-Habitat
1. From the top navigation bar or dashboard hero, click **"New Micro-Habitat"**.
2. Fill in the habitat registration form:
   - **Habitat Name:** e.g., `Backyard Mossy Boulder #1`.
   - **Micro-Habitat Type:** Select one of `Tree Bark / Root`, `Soil Bed`, `Grass Patch`, `Moss on Rock`, `Water Edge`, or `Garden Quadrant`.
   - **Physical Landmarks & Description:** e.g., `West-facing granite surface shaded by maple canopy.`
   - **Coordinates (Optional):** Enter latitude and longitude if desired.
3. Click **"Register Micro-Habitat"**.
   > **Privacy Guarantee:** If coordinates are provided, WildTrace automatically fuzzes them to two decimal places (~1.1 km precision) before saving to disk. Exact GPS coordinates are never stored.

### Step 5.3: Record Your Baseline Observation (Visit #1)
1. On your newly created habitat's detail page, click the **"Record New Observation"** button.
2. Under **Habitat Photograph**, tap the upload zone to select a photo from your device or capture one using your mobile camera.
3. Enter your field observations:
   - **Field Notes:** What do you see? (e.g., `Thin, dry, brownish moss film in central indentation.`)
   - **Weather Conditions:** (e.g., `Dry, sunny, 22°C.`)
   - **Estimated Surface Moisture:** Select `Dry`, `Damp`, or `Saturated`.
4. Click **"Save Field Observation"**.

### Step 5.4: Use Ghost View on Revisit (Visit #2)
1. Return to the habitat a few days later (or after a rain event).
2. Click **"Record New Observation"**.
3. Upload or capture your second observation photo.
4. With a photo loaded, notice the **"Toggle Ghost View"** control:
   - Click **"Toggle Ghost View"** to overlay a translucent projection of your baseline photograph over the new photo.
   - Adjust the **Opacity Slider** (10% to 90%) to align prominent physical landmarks (cracks, knots, pebbles).
   - *Scientific Note:* Ghost View aids manual alignment in the field; it does not perform automated geometric warping.
5. Log field notes (e.g., `Heavy rainfall yesterday; moss has swollen into bright green cushions.`) and click **"Save Field Observation"**.

### Step 5.5: Run Visual Change Detection & AI Field Mission
1. On the habitat page, select the **"Visual Comparison & AI Intelligence"** tab (or click **"Compare Selected Visits"** from the Timeline tab).
2. Inspect the **Visual Change Detection Engine**:
   - **Photometric Alteration Mask:** Toggles between baseline, revisit, and the color-shift SVG heatmap.
   - **Excess Green Index ($\text{ExG}$):** Displays the numerical greenness delta (e.g., `+12.3%`).
   - **Framing & Alignment Confidence:** Indicates whether camera angles match (`HIGH`, `MEDIUM`, or `LOW`).
   - **Suitability Disclosures:** Displays warnings such as illumination disparities or perspective shifts.
3. Inspect the **AI Field Intelligence Panel**:
   - Reviews observed physical changes.
   - Reads non-definitive ecological hypotheses.
   - Discloses known confounds.
   - Reads your **Touch Grass Mission** (e.g., a specific physical task to perform on your next visit).

### Step 5.6: Delete User-Created Habitats
If you create a temporary test habitat, navigate to its detail page and click the red **"Delete Site"** button in the header.
- Confirm the dialog prompt.
- The habitat, its recorded observations, and all associated image files on disk are permanently removed.
- Demonstration habitats are protected against accidental deletion.

---

## 6. Test Images & Repeat Photograph Methodology

### Synthetic Test Fixtures
WildTrace includes a reproducible synthetic image test dataset located in:

```
tests/fixtures/images/
```

To regenerate the fixtures deterministically at any time:

```bash
npx tsx tests/fixtures/generate-fixtures.ts
```

| Fixture | Scenario | Purpose |
| :--- | :--- | :--- |
| `01_baseline.png` | Reference baseline | 256×256 synthetic bark with moss patch |
| `02_identical.png` | Zero delta | Verifies 0.0% diff, 1.0 correlation, zero ExG shift |
| `03_slightly_greener.png` | Vegetative greening | Controlled +45 G channel boost; tests positive ExG |
| `04_large_color_change.png` | Senescence / autumn | Red boost (+70 R, -40 G); tests negative ExG |
| `05_brightness_increase.png` | Sunlight confound | Uniform +45 shift across all channels; ExG invariant |
| `06_darkened_moisture.png` | Rain saturation confound | Uniform -35 darkening; tests illumination disparity |
| `07_translated_shift.png` | 16px spatial drift | Tests edge correlation drop and framing warnings |
| `08_rotated.png` | 15° camera tilt | Verifies LOW confidence, perspective shift flag |
| `09_scaled_distance.png` | 1.4x zoom/distance | Tests scale variance and framing suitability |
| `10_partial_occlusion.png` | 100×100px obstruction | Tests localized heatmap hotspot clustering |
| `11_blurred_lowres.png` | Gaussian blur ($\sigma=6$) | Tests sensor defocus and edge softness |
| `12_unrelated_scene.png` | Water/sky scene | Tests rejection (<0.45 correlation, side-by-side mode) |
| `13_aspect_ratio_16_9.png` | 455×256 wide aspect | Verifies resizing without distortion or crash |
| `14_corrupted_bad_bytes.png` | Corrupt non-image bytes | Verifies upload rejection (HTTP 400) |

### Repeat Photography Field Best Practices
To obtain high-quality longitudinal comparisons in the field:
1. **Consistent Distance & Angle:** Maintain approximately the same distance (e.g., 20–30 cm) and perpendicular camera angle.
2. **Use Natural Landmarks:** Align unique bark grooves, rock fissures, or fixed roots using Ghost View.
3. **Control Illumination:** Capture repeat visits under similar lighting (e.g., diffuse overcast sky) whenever possible to minimize harsh shadows.
4. **Log Weather Context:** Always log recent precipitation, temperature, and surface dampness in observation notes.
5. **Never Assume Growth from Color Alone:** Treat color shifts as photometric signals confounded by moisture, lighting, and sensor white balance.

---

## 7. AI Inference Gateway & Offline Mode

WildTrace employs a **provider-independent AI Gateway** (`src/lib/ai/gateway.ts`):

```
+-------------------------------------------------------------+
|                      WildTrace AI Gateway                   |
+-------------------------------------------------------------+
                              |
       +----------------------+----------------------+
       |                                             |
       v                                             v
[OpenRouter Provider] (Primary)          [Deterministic Heuristic]
Model: Configurable Vision VLM           Offline Zero-Credential Mode
(e.g., google/gemini-2.5-flash)          • Always available (100% offline)
• Requires OPENROUTER_API_KEY            • Grounded in photometric metrics
• Multimodal base64 image inputs         • Zero hallucinations
• 15s timeout with bounded retry         • Instant local generation
• Strict Zod schema enforcement          • Touch Grass physical missions
       |                                             |
       +----------------------+----------------------+
                              |
                              v
                [Validated Structured Output]
                • observed_changes (string[])
                • ecological_hypotheses (string[])
                • uncertainties (string[])
                • next_visit_prompt (Touch Grass Mission)
```

### Offline / Heuristic Mode (Default)
When no `OPENROUTER_API_KEY` is provided, WildTrace operates entirely offline with zero network latency. The deterministic engine generates structured outputs derived directly from:
- Calculated $\text{ExG}$ shift and visual difference percentage.
- Framing edge correlation score and detected confounds.
- User-supplied weather notes and moisture estimates.
- The specific habitat type classification.

### Multimodal Vision AI Mode (OpenRouter)
To enable external multimodal vision-language model inference:
1. Obtain an API key from [openrouter.ai/keys](https://openrouter.ai/keys).
2. Set `OPENROUTER_API_KEY="sk-or-v1-..."` in `.env`.
3. Optionally configure `OPENROUTER_MODEL="google/gemini-2.5-flash"` (or any vision-capable model such as `meta-llama/llama-3.2-11b-vision-instruct:free` or `qwen/qwen-2.5-vl-72b-instruct`).
4. **Multimodal Image Analysis:** WildTrace automatically converts observation photographs into optimized base64 Data URLs and transmits them directly within OpenAI-compatible multimodal content arrays (`type: "image_url"`).
5. **Resilience & Rate-Limiting:** The provider enforces a 15-second timeout and a single bounded backoff retry for HTTP 429/503 rate limits. If the provider is unavailable or returns invalid formatting, the gateway seamlessly engages the deterministic heuristic engine without breaking the user experience.

---

## 8. Persistence, Storage & Privacy Architecture

### Data Storage Locations
- **Database:** SQLite database located at `data/wildtrace.db` (managed via Prisma 6).
- **JSON Dual-Store:** Fast document store at `data/wildtrace_db.json`.
- **Uploaded Images:** Sanitized images stored in `data/uploads/`.

### Privacy Protections
1. **Metadata Stripping:** All uploaded JPEG, PNG, and WebP images are auto-oriented and converted to optimized WebP format with all EXIF metadata (GPS coordinates, camera serial numbers, device model) stripped.
2. **Coordinate Fuzzing:** Micro-habitat latitude and longitude are fuzzed to two decimal places ($\approx 1.1\text{ km}$ precision) before storage. Exact coordinates are never written to disk or sent to client bundles.
3. **Local-Only Inference:** In offline heuristic mode, no data, images, or telemetry leave your local machine.

---

## 9. Docker & Containerized Deployment

### Build the Docker Image
```bash
docker build -t wildtrace:latest .
```

### Run with Persistent Volume
```bash
docker run -d \
  -p 3000:3000 \
  -v wildtrace_data:/app/data \
  --name wildtrace-app \
  wildtrace:latest
```

All micro-habitat records, observations, and uploaded photographs persist inside the `wildtrace_data` volume.

### Run with Docker Compose
```bash
docker compose up -d
```

To stop:
```bash
docker compose down
```

> **Single-Node Architecture Note:** WildTrace uses SQLite and a local uploads directory. It is designed for single-node deployment (personal workstation, local server, or single-instance container). Running multiple instances against a shared file share without distributed locking is not supported.

---

## 10. Automated Testing & Troubleshooting

### Verified Test Commands

Run all checks using the project scripts:

| Command | Description | Verified Execution Time |
| :--- | :--- | :--- |
| `npm run lint` | ESLint 9 code quality and TypeScript check | ~1.5s |
| `npx tsc --noEmit` | Strict TypeScript compilation check | ~3.8s |
| `npm run test:unit` | Photometric & computer-vision engine tests (12 cases) | ~2.4s |
| `npm run test:api` | API routes, security, and lifecycle integration tests (22 cases) | ~2.8s |
| `npm run test:journey` | End-to-end user verification journey | ~2.8s |
| `npm test` | Master automated test suite (runs all suites sequentially) | ~10.2s |
| `npm run build` | Next.js production build and static page generation | ~4.5s |

### Common Issues & Solutions

1. **Port 3000 Already in Use:**
   - Run on an alternate port: `PORT=3005 npm run dev`
2. **Uploads Directory Permissions:**
   - If uploads fail, verify that the `data/` directory exists and is writable.
3. **Database Reset:**
   - To restore the demonstration dataset: make a `POST` request to `/api/seed` with body `{"action": "reset"}` or run `npm run test:journey`.

---

## 11. Known Limitations & Scientific Integrity

WildTrace is designed with strict adherence to scientific integrity:

1. **Pixel Deltas $\neq$ Growth:** A visual difference percentage indicates changed pixels in the image frame. It does not measure biomass, cellular growth, or ecosystem vitality.
2. **Moisture & Darkness Confounds:** Wet bark, saturated soil, and shadows darken surfaces, artificially shifting RGB values. WildTrace detects illumination changes and warns against false claims.
3. **Geometric Warping Limitation:** Ghost View aids manual alignment in the field. WildTrace does not perform perspective distortion warping, as artificial warping can invent non-existent biological changes.
4. **AI Uncertainty:** AI hypotheses are exploratory suggestions, not biological diagnoses.

---

## 12. Repository Architecture Map

```
WildTrace/
├── prisma/
│   └── schema.prisma            # Prisma schema (Site, Observation, Comparison, AIInterpretation)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compare/route.ts         # Pairwise image comparison API
│   │   │   ├── interpret/route.ts       # AI field intelligence interpretation API
│   │   │   ├── observations/route.ts    # Secure multipart upload & EXIF stripping API
│   │   │   ├── seed/route.ts            # Demonstration reset & status API
│   │   │   ├── sites/route.ts           # Site creation & listing API
│   │   │   ├── sites/[id]/route.ts      # Site retrieval & cascading deletion API
│   │   │   └── uploads/[filename]/route.ts # Hardened static image serving API
│   │   ├── sites/[id]/page.tsx  # Micro-habitat timeline, comparison & delete UI
│   │   ├── sites/new/page.tsx   # Micro-habitat registration form
│   │   ├── layout.tsx           # Global root layout & styling
│   │   └── page.tsx             # Main dashboard & demonstration cards
│   ├── components/
│   │   ├── ai/FieldIntelligencePanel.tsx # AI interpretations & Touch Grass missions
│   │   ├── comparison/ComparisonViewer.tsx # Interactive visual delta viewer & heatmap
│   │   ├── layout/Navbar.tsx    # Header navigation
│   │   └── site/
│   │       ├── ObservationModal.tsx     # Image upload & Ghost View camera aid
│   │       ├── SiteCard.tsx             # Habitat preview card
│   │       └── SiteTimeline.tsx         # Chronological visit timeline
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gateway.ts               # Provider-independent AI gateway
│   │   │   ├── heuristicFallback.ts     # Offline deterministic intelligence engine
│   │   │   ├── providers/               # Hugging Face & Heuristic providers
│   │   │   └── schema.ts                # Strict Zod interpretation schema
│   │   ├── storage/
│   │   │   ├── db.ts                    # Storage manager, CRUD & cascading delete
│   │   │   ├── prisma.ts                # Prisma client singleton
│   │   │   └── seedData.ts              # Synthetic and real-field demo datasets
│   │   └── vision/
│   │       └── diffEngine.ts            # ExG, Sobel correlation & photometric masks
│   └── types/index.ts           # Core TypeScript domain types
├── tests/
│   ├── fixtures/
│   │   ├── generate-fixtures.ts # Synthetic image generator script
│   │   └── images/              # 14 deterministic synthetic test fixtures
│   ├── api-integration.test.ts  # API routes & security integration test suite
│   ├── run-all-tests.ts         # Master automated test suite runner
│   ├── verify-journey.ts        # End-to-end user verification journey
│   └── vision-engine.test.ts    # Photometric & Sobel correlation unit test suite
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Persistent volume container orchestration
├── eslint.config.mjs            # ESLint 9 flat configuration
├── package.json                 # Project dependencies & scripts
└── tutorial.md                  # Comprehensive user & developer manual
```

---

## 13. Reproducing the Demonstration

To reproduce the demonstration state without altering or losing personal data:

1. Start WildTrace: `npm run dev`
2. In a separate terminal, trigger a seed refresh:
   ```bash
   curl -X POST http://localhost:3000/api/seed -H "Content-Type: application/json" -d '{"action": "reset"}'
   ```
3. Open [http://localhost:3000](http://localhost:3000) and explore the seeded demonstration habitats.
