# WildTrace — Autonomous Demo Walkthrough & Visual Asset Index

This directory contains the verified visual assets, documentation captions, walkthrough script, and browser recordings generated during the autonomous walkthrough of **WildTrace** for the **DEV Community Hacktoberfest 2026 "Touch Grass" Challenge** and **Devpost** submission.

---

## 1. Executive Summary & Verification State

- **Application Status:** **Active & Running** locally at [`http://localhost:3000`](http://localhost:3000) (Next.js 14 App Router, Prisma ORM, SQLite).
- **Execution Mode:** Background development server (`task-1440`).
- **Active Multimodal Provider:** `google/gemini-2.5-flash` via OpenRouter (vision-enabled). Tested and certified with open-weight vision alternatives (`qwen/qwen-2.5-vl-7b-instruct`) and 100% offline heuristic fallback.
- **Visual Aesthetic:** Antigravity dark-forest spatial theme, emerald and lime accents (`#a3e635`), micro-interactions, glassmorphism cards, and strict visual hierarchy.
- **Provenance of Data:**
  - **Authentic Longitudinal Field Dataset:** `Granite Boulder Bryophyte Study` (Site `site-1791733326283-t2rn7`), created from 3 genuine longitudinal field photographs of bryophyte moss (`MossImages/`) across 14 elapsed days.
  - **Synthetic Demo Dataset:** `Ancient Oak Root Hollow` labeled with prominent amber `[SYNTHETIC DEMO]` caution badges to prevent presenting simulated pixels as authentic field evidence.

---

## 2. Walkthrough Verification Matrix

| Walkthrough Scene | Route / Component | Verified Status | Key Observed Behavior |
| :--- | :--- | :--- | :--- |
| **Scene 1: Landing Page** | `/` (`page.tsx`) | **Verified** | Antigravity hero section, Hacktoberfest challenge badge, 4 core principles glass card with crisp Lucide checkmarks. |
| **Scene 2: Habitat Discovery** | `/#habitats` | **Verified** | Catalog cards displaying authentic Granite Boulder study alongside synthetic Oak Hollow demo with amber `[SYNTHETIC DEMO]` badges. |
| **Scene 3: Observation Detail** | `/sites/[id]` (Tab: Observations) | **Verified** | Visit #1 baseline photograph (`moss img1.jpeg`), fuzzed coordinates (`~51.44°, -0.27°`), overcast lighting metadata. |
| **Scene 4: Photometric Comparison** | `/sites/[id]` (Tab: Comparison) | **Verified** | CV stat cards computed live: +12.3% Excess Green (ExG) delta, 76.5% pixel delta, 79% edge correlation, 14 elapsed days. |
| **Scene 5: Scientific Reliability Gate** | `/sites/[id]` (Comparison Section) | **Verified** | Incompatible-framing gate triggered (`correlation = 0.79 < 0.85`), suppressing misleading diff mask and enforcing Side-by-Side Co-Inspection mode. |
| **Scene 6: Touch Grass Field Mission** | `/sites/[id]` (AI Intelligence Card) | **Verified** | Actionable outdoor citizen mission: return in 3–5 days, align with physical rock fissure, touch carpet to evaluate turgidity. |
| **Scene 7: Observation History** | `/sites/[id]` (Observations Tab) | **Verified** | Chronological 14-day history across Visit #1 (Baseline), Visit #2 (Intermediate), and Visit #3 (Post-Rain). |
| **Scene 8: End-to-End Navigation** | `/` ↔ `/sites/[id]` | **Verified** | Zero console errors, zero stuck spinners, smooth tab switching, responsive back-navigation. |

---

## 3. Visual Asset Directory & Inventory

### A. Full-Resolution PNG Screenshots (`screenshots/`, 1440 × 1000 Viewport)

All screenshots are unmodified, genuine browser captures free from developer tools, menus, or simulated metrics:

| Filename | Resolution / Size | Primary Feature Demonstrated |
| :--- | :--- | :--- |
| [`01-landing-page.png`](screenshots/01-landing-page.png) | 1440 × 1000 (324 KB) | Hero section, Hacktoberfest "Touch Grass" badge, Core Principles double-bezel card. |
| [`02-habitat-selection.png`](screenshots/02-habitat-selection.png) | 1440 × 1000 (214 KB) | Monitored micro-habitats catalog; authentic field studies vs. synthetic demo datasets. |
| [`03-observation-detail.png`](screenshots/03-observation-detail.png) | 1440 × 1000 (434 KB) | Observation detail view with fuzzed GPS coordinates (`~51.44°, -0.27°`) and Visit #1 baseline photograph. |
| [`04-longitudinal-comparison.png`](screenshots/04-longitudinal-comparison.png) | 1440 × 1000 (247 KB) | Algorithmic CV stat cards: ExG delta (+12.3%), Frame pixel delta (76.5%), Edge correlation (79%), Elapsed days (14d). |
| [`05-framing-warning.png`](screenshots/05-framing-warning.png) | 1440 × 1000 (2.47 MB) | **Scientific Reliability Gate:** Red caution banner suppressing direct subtraction due to handheld angle shift; Side-by-Side mode. |
| [`06-field-mission.png`](screenshots/06-field-mission.png) | 1440 × 1000 (355 KB) | Multimodal AI Field Intelligence: grounded hypotheses, uncertainty language, and tangible "Touch Grass Mission" card. |
| [`07-observation-history.png`](screenshots/07-observation-history.png) | 1440 × 1000 (591 KB) | Longitudinal observation timeline detailing visits across 14 days with weather notes. |

### B. Curated Article Images (`article-images/`)

Selected and formatted specifically for the **DEV Community submission article** and **Devpost gallery**:

1. [`article-images/01-hero-overview.png`](article-images/01-hero-overview.png): Product overview and problem framing.
2. [`article-images/02-longitudinal-comparison.png`](article-images/02-longitudinal-comparison.png): Core photometric change detection engine.
3. [`article-images/03-framing-gate-warning.png`](article-images/03-framing-gate-warning.png): Scientific differentiator & responsible AI gate.
4. [`article-images/04-touch-grass-field-mission.png`](article-images/04-touch-grass-field-mission.png): Actionable outdoor citizen-science field mission.
5. [`article-images/05-observation-timeline.png`](article-images/05-observation-timeline.png): Longitudinal observation history across visits.

### C. Captions & Narration Script

- [`SCREENSHOT_CAPTIONS.md`](SCREENSHOT_CAPTIONS.md): Complete publication-ready Markdown captions, data provenance tags, inference source labels, and scientific limitations.
- [`WALKTHROUGH_SCRIPT.md`](WALKTHROUGH_SCRIPT.md): Second-by-second 85-second narration script with exact UI triggers and cursor choreography.

### D. Automated Screen Recording

- [`wildtrace-walkthrough.webp`](wildtrace-walkthrough.webp): Automated browser execution recording demonstrating navigation across the landing page, habitat selection, comparison, scientific gate, and mission cards.

### E. Quick Review Contact Sheet

- [`contact-sheet.html`](contact-sheet.html): Standalone HTML gallery with dark-forest styling, image cards, metadata, and direct links to full-resolution PNGs. To review, double-click or open in any web browser.

---

## 4. Recommended 3 Best Screenshots for DEV Community Article

If limited to three core images for the article body:

1. **`01-hero-overview.png` (or `screenshots/01-landing-page.png`)**  
   *Why:* Immediately establishes the project identity, the DEV Hacktoberfest "Touch Grass" alignment, and the spatial Antigravity visual design.
2. **`03-framing-gate-warning.png` (or `screenshots/05-framing-warning.png`)**  
   *Why:* Demonstrates WildTrace's key scientific innovation and intellectual honesty. Judges see that WildTrace explicitly guards against false claims of ecological growth when citizen photos have angle misalignment.
3. **`04-touch-grass-field-mission.png` (or `screenshots/06-field-mission.png`)**  
   *Why:* Showcases the AI-powered practical payoff: grounding vision analysis into an actionable reason for the citizen scientist to go outside and re-observe nature.

---

## 5. Startup & Replication Commands

To run or replicate this demonstration locally:

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & generate Prisma Client
npx prisma db push

# 3. Seed authentic moss study & pre-compute AI comparisons
npx tsx tests/seed-authentic-moss.ts

# 4. Start the Next.js development server
npm run dev
# -> Opens on http://localhost:3000
```
