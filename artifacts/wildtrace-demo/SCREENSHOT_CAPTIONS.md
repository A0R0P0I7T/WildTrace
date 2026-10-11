# WildTrace — Screenshot Captions & Visual Asset Guide

This directory contains verified, unedited screenshots of the live **WildTrace** application running on `http://localhost:3000` (1440 × 1000 desktop viewport).

---

## 1. Complete Screenshot Inventory (`screenshots/`)

### `01-landing-page.png`
- **Feature Demonstrated:** Antigravity spatial landing page, value proposition, core principles card, and DEV Community Hacktoberfest theme badge.
- **Data Authenticity:** UI overview & navigation shell.
- **Inference Mode:** N/A (client navigation).
- **Caption for Article:**
  > *Figure 1: WildTrace landing page featuring an Antigravity spatial aesthetic, highlighting core principles—longitudinal micro-habitat tracking, Excess Green computer vision, open-weight VLM intelligence, and privacy-first location fuzzing.*
- **Important Limitation:** Illustrates application navigation; does not depict raw field measurements.

---

### `02-habitat-selection.png`
- **Feature Demonstrated:** Monitored micro-habitats catalog displaying both authentic field study sites and synthetic demo datasets.
- **Data Authenticity:**
  - `Granite Boulder Bryophyte Study`: **Authentic longitudinal field dataset** (3 visits across 14 days).
  - `Richmond Park Beech Bark Fissure`: Real field demonstration study (2 visits logged).
  - `Ancient Oak Root Hollow`: **Synthetic demonstration dataset** with explicit `[SYNTHETIC DEMO]` badge.
- **Inference Mode:** N/A (database query).
- **Caption for Article:**
  > *Figure 2: The habitat selector displaying authentic field datasets alongside synthetic demonstration datasets, clearly distinguishing simulated imagery with amber `[SYNTHETIC DEMO]` tags.*
- **Important Limitation:** Demonstrates multi-site management; users select a specific micro-quadrant to inspect longitudinal progressions.

---

### `03-observation-detail.png`
- **Feature Demonstrated:** Micro-habitat detail header with fuzzed location coordinates (~1.1km grid privacy), action buttons, and Visit #1 baseline photograph.
- **Data Authenticity:** **Authentic field photography** (`moss img1.jpeg`, Day 1 baseline, damp granite boulder face).
- **Inference Mode:** N/A (observation intake).
- **Caption for Article:**
  > *Figure 3: Micro-habitat study detail view showing privacy-fuzzed coordinates (`~51.44°, -0.27°`), environmental metadata (morning overcast, 82% RH, damp moisture), and the baseline observation photograph.*
- **Important Limitation:** Photographs are taken with handheld citizen cameras; natural lighting shifts occur across visits.

---

### `04-longitudinal-comparison.png`
- **Feature Demonstrated:** Photometric Change Detection Engine stat cards (Frame Pixel Delta, Excess Green Index Delta, Edge Overlap Correlation, Elapsed Days) and mandatory scientific limitation disclosures.
- **Data Authenticity:** **Authentic 14-day field comparison** (Day 1 Baseline vs. Day 14 Revisit).
- **Inference Mode:** Algorithmic computer vision engine (Sharp, pixel difference, Excess Green $2G - R - B$, Sobel gradient dot-product).
- **Caption for Article:**
  > *Figure 4: Algorithmic computer vision analysis computing a +12.3% Excess Green (ExG) delta and 79% framing correlation over 14 days, with prominent disclosures explaining that photometric shifts do not prove biological biomass growth.*
- **Important Limitation:** Explicitly warns that color shifts can stem from moisture gloss and cloud cover rather than true biomass increase.

---

### `05-framing-warning.png`
- **Feature Demonstrated:** **The Scientific Reliability Gate:** Automated incompatible-framing detection, suppression of misleading pixel-diff masks, and enforcement of Side-by-Side Co-Inspection mode.
- **Data Authenticity:** **Authentic field photography** (Day 1 vs. Day 14 comparison of bryophyte carpet on rock substrate).
- **Inference Mode:** Deterministic computer vision thresholding (`structuralSimilarityScore = 0.79`, `LOW` confidence).
- **Caption for Article:**
  > *Figure 5: The Scientific Reliability Gate in action. Because handheld camera angles differed between visits, WildTrace suppresses ghosting pixel-subtraction masks and enforces Side-by-Side Co-Inspection mode to prevent misleading claims of ecological growth.*
- **Important Limitation:** Handheld citizen-science photos rarely achieve pixel-perfect alignment; this gate protects users from treating photographic misalignment as biological change.

---

### `06-field-mission.png`
- **Feature Demonstrated:** Field Intelligence panel with directly observed visual evidence, non-definitive ecological hypotheses, field uncertainties, and the highlighted **"Touch Grass" Next Visit Mission**.
- **Data Authenticity:** Generated from authentic 14-day longitudinal moss photographs and environmental notes.
- **Inference Mode:** **Live multimodal inference** via `google/gemini-2.5-flash` through OpenRouter (Zod schema validated).
- **Caption for Article:**
  > *Figure 6: Grounded AI field intelligence synthesizes tentative ecological hypotheses (hydration reviviscence) while generating an actionable "Touch Grass Mission" instructing the observer to physically inspect and touch the moss turgidity on their next visit.*
- **Important Limitation:** All hypotheses remain explicitly tentative; the model acknowledges camera displacement and refuses to claim permanent vegetative growth.

---

### `07-observation-history.png`
- **Feature Demonstrated:** Chronological observation timeline showing Visit #2 (Day 7 revisit under partial sun and dry conditions) and Visit #3 (Day 14 revisit post-rain under saturated conditions).
- **Data Authenticity:** **Authentic longitudinal field series** (`moss img2.jpeg` and `moss img3.jpeg`).
- **Inference Mode:** N/A (chronological timeline renderer).
- **Caption for Article:**
  > *Figure 7: Chronological timeline tracking environmental transitions from dry partial-sun desiccation on Day 7 to post-rain chlorophyll saturation on Day 14.*
- **Important Limitation:** Micro-climate conditions vary naturally across observation visits.

---

## 2. Recommended Article Selection (`article-images/`)

For the DEV Community submission article and Devpost submission, use the curated images in `article-images/`:

| Priority | Filename | Recommended Article Placement | Story Role |
| :---: | :--- | :--- | :--- |
| **1** | `01-hero-overview.png` | Introduction / Cover image | Sets the product vision, theme, and Antigravity design. |
| **2** | `02-longitudinal-comparison.png` | Computer Vision section | Shows algorithmic ExG calculation and photometric indicators. |
| **3** | `03-framing-gate-warning.png` | Scientific Integrity section | **Core differentiator:** Demonstrates why WildTrace refuses to hallucinate growth on misaligned photos. |
| **4** | `04-touch-grass-field-mission.png` | "Touch Grass" Theme & AI section | Highlights actionable outdoor missions and grounded ecological reasoning. |
| **5** | `05-observation-timeline.png` | Architecture / UX section | Shows longitudinal multi-visit tracking and environmental context. |
