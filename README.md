# 🌿 WildTrace

> **Longitudinal Micro-Habitat Observation System**  
> *Built for DEV Community Hacktoberfest Week 1 (October 2026) &bull; Theme: "Touch Grass"*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter%20%7C%20Gemini%20%26%20Qwen-lime)](https://openrouter.ai/)

---

## 📌 Vision: Why WildTrace?

WildTrace is not a plant identifier or an AI nature chatbot. It is a longitudinal micro-habitat observation system that connects repeated real-world visits, visual change detection, evidence-grounded AI interpretation, and actionable follow-up observations.

The goal is to encourage people to go outside, select a 50cm patch of nature (tree bark, moss rock, garden corner, or soil hollow), record observations across weeks, and understand how ecosystems change over time.

---

## 🚀 Key Features

- **Chronological Habitat Timelines:** Track observations with environmental context (ground moisture, ambient lighting, weather).
- **Algorithmic Computer Vision:**
  - **Excess Green Index (ExG):** Measures vegetative chlorophyll shifts ($2G - R - B$).
  - **Dynamic Difference Masks:** Generates color-coded change heatmaps isolating growth vs. soil moisture.
  - **Sobel Edge Correlation:** A 3×3 spatial gradient dot-product correlation ($0.0$ to $1.0$) that checks framing consistency and flags perspective misalignment.
- **Interactive Before/After Curtain Slider:** Smooth, responsive comparison viewer with zoom and difference mask toggles (automatically disabled when framing is incompatible to prevent visual ghosting).
- **Multimodal AI Field Intelligence:**
  - Pluggable gateway for vision models via **OpenRouter** with multimodal image inputs and secondary Hugging Face support.
  - **100% Offline Deterministic Heuristic Fallback:** Generates grounded hypotheses even without internet or API keys.
  - **"Touch Grass" Next-Visit Mission:** Every comparison yields a concrete physical inspection task for your next visit.
- **Privacy-First Design:** Geolocation automatically fuzzed to ~1.1km resolution; EXIF GPS and device metadata stripped on upload; zero third-party commercial trackers.
- **Antigravity Spatial Design:** Frosted glassmorphism, depth layering, weightless card transitions, and high-contrast outdoor visibility.

---

## 🤖 AI Models & Provider Configuration

WildTrace features a provider-agnostic AI inference gateway supporting hosted multimodal vision models via OpenRouter, as well as an offline heuristic fallback engine.

### Default Interactive Demo Model
- **`google/gemini-2.5-flash`** (Default): Fast (~5.4s median wall-clock latency), highly cost-effective, and provides rich qualitative descriptions. Recommended for live demonstrations.

### Tested Open-Weight Vision Alternatives
WildTrace has been evaluated against verified open-weight vision-language models:
- **`qwen/qwen2.5-vl-72b-instruct`**: Open-weight flagship (Qwen Research License; free commercial & research use). High grounding fidelity, ~25.1s median latency.
- **`qwen/qwen3-vl-8b-instruct`**: Lightweight open-weight model (Qwen License; 262k context). Fast grounding, ~23.3s median latency.

> [!NOTE]
> **Hosted Cloud Inference Disclosure:**  
> When configured via OpenRouter, these open-weight models execute via OpenRouter's hosted cloud inference endpoints, **not** local on-device hardware. For environments without network access or API credentials, WildTrace automatically engages its **100% local, offline deterministic heuristic engine**.

To switch models, update `OPENROUTER_MODEL` in your `.env` file:
```ini
OPENROUTER_MODEL="qwen/qwen2.5-vl-72b-instruct"
OPENROUTER_TIMEOUT_MS=35000
```

---

## 🔬 Scientific Grounding & Photometric Limitations

WildTrace enforces strict scientific guardrails to avoid misleading users:

1. **Photometric Shifts ≠ Biological Growth:**  
   Pixel differences and the Excess Green Index ($\text{ExG} = 2G - R - B$) are **purely image-derived indicators**. They reflect changes in camera exposure, illumination, angle, and surface moisture (hydration reviviscence). They do **not** prove permanent biomass growth, dieback, or species vitality.
2. **Incompatible Framing Gate:**  
   When camera framing or perspective diverges (low edge correlation), the system flags `INCOMPATIBLE_FOR_PIXEL_DIFF` and `PERSPECTIVE_SHIFT_DETECTED`. Direct pixel difference subtraction is suppressed to prevent visual ghosting artifacts, side-by-side inspection is enforced, and the AI prompt prohibits claiming verified directional habitat change.
3. **Uncertainty Disclosures:**  
   All AI interpretations must output explicit photometric and environmental uncertainties and formulate non-definitive hypotheses.

---

## 🛡️ Image Privacy, EXIF Sanitization & Provenance

### Privacy & EXIF Scrubbing
- **Automated EXIF Sanitization:** All user-uploaded images are processed server-side through [Sharp](https://sharp.pixelplumbing.com). EXIF metadata (embedded GPS coordinates, camera serial numbers, device fingerprints) is completely stripped before writing to disk. Images are converted to optimized WebP format.
- **Location Fuzzing:** All habitat coordinates are fuzzed to a ~1.1km grid radius to prevent revealing sensitive micro-locations of wild flora or private residences.

### Demonstration Imagery Provenance
- **Synthetic Demonstration Datasets (`Ancient Oak Root Hollow`):** Pre-seeded demonstration habitats use vector-rendered SVG graphics explicitly labeled with **`[SYNTHETIC DEMO]`** badges and warning banners. They illustrate UI workflows and are never presented as authentic longitudinal evidence.
- **Authentic Longitudinal Moss Photography (`MossImages/`):** Real-world field photographs of a bryophyte patch adhering to a granite boulder captured across 14 days (Day 1 baseline, Day 7 revisit, Day 14 revisit). All photographs have been scrubbed of personal EXIF data and are provided by the author for project validation and automated testing.

---

## ⚡ Quickstart

### Option 1: Run with Node.js

#### Prerequisites
- Node.js `v20.x` or higher (verified on Node `v24.2.0`)
- npm `v10.x` or higher

```bash
# 1. Clone repository
git clone https://github.com/your-username/wildtrace.git
cd wildtrace

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env to add your OPENROUTER_API_KEY (optional; fallback operates without it)

# 4. Generate Prisma client & initialize database
npx prisma generate
npx prisma db push

# 5. Build application
npm run build

# 6. Start production server
npm start
```
Visit `http://localhost:3000` to start observing!

### Option 2: Run with Docker Compose
Docker persistence preserves SQLite database records and uploaded images across container restarts in `./data`:
```bash
docker compose up --build
```

---

## 🧪 Automated Verification & Quality Gates

Run the comprehensive test suite and code quality gates:

```bash
# Run complete 8-suite automated test matrix (unit, API, E2E, vision, provider, moss audit)
npm test

# Run ESLint code quality check
npm run lint

# Run TypeScript strict typecheck
npx tsc --noEmit

# Run Next.js production build check
npm run build

# Run interactive user verification journey
npm run test:journey
```

---

## 📂 Project Structure

```
WildTrace
├── src/
│   ├── app/                    # Next.js App Router (Pages & API endpoints)
│   ├── components/             # Antigravity UI components (Slider, Timeline, Cards)
│   ├── lib/
│   │   ├── ai/                 # OpenRouter multimodal client, schemas & fallback
│   │   ├── storage/            # Dual-store SQLite/JSON persistence & demo seed
│   │   └── vision/             # Computer vision, Sobel edge correlation & ExG engine
│   └── types/                  # Domain TypeScript interfaces & Zod schemas
├── tests/                      # Automated test matrix & E2E verification suites
├── MossImages/                 # Authentic 14-day longitudinal field test photographs
├── data/                       # Local SQLite database & uploaded WebP imagery
└── docs/                       # Architecture specifications & evaluation reports
```

---

## 📝 License

WildTrace is released under the **MIT License**. Open-weight AI models evaluated in this project are governed by their respective official licenses (Qwen Research License and Qwen License).
