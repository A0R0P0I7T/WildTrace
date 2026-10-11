# WildTrace — 90-Second Demo Video Narration & Screen-Recording Script

This script provides an exact, second-by-second choreography for recording a 60–90 second video walkthrough of WildTrace for the **DEV Community Hacktoberfest "Touch Grass"** submission and Devpost.

---

## 🎬 Video Recording Settings

- **Recommended Resolution:** 1920 × 1080 (1080p) or 1440 × 1000 desktop window.
- **Frame Rate:** 30 or 60 FPS.
- **Audio:** Clear voiceover with soft, optional natural ambient background sound.
- **Recording Asset Already Captured:** `artifacts/wildtrace-demo/wildtrace-walkthrough.webp` (automated browser execution recording).

---

## ⏱️ Timeline & Action Script (Total Duration: 85 Seconds)

### [00:00 – 00:12] Act 1: The Problem & Product Vision
- **Screen:** Landing page (`http://localhost:3000`).
- **UI Action:** Start on the landing hero section. Gently hover over the *"DEV Community Hacktoberfest 2026 • Touch Grass Challenge"* badge and the *"Core Principles"* glass card.
- **Narration:**
  > *"Most nature apps are one-off plant identifiers or chat bots. But real ecosystems change slowly over time. Welcome to WildTrace—a longitudinal micro-habitat observation system built for the DEV Community Hacktoberfest 'Touch Grass' challenge."*

---

### [00:12 – 00:26] Act 2: Habitat Discovery & Observation Timeline
- **Screen:** Scrolled to *Monitored Micro-Habitats* grid.
- **UI Action:** Scroll smoothly down to reveal the habitat cards. Hover over the amber `[SYNTHETIC DEMO]` badge on Oak Hollow, then click *"Inspect Timeline & Compare"* on the **"Granite Boulder Bryophyte Study"** card.
- **Narration:**
  > *"WildTrace tracks small, persistent 50cm patches over weeks. Here we have a 14-day study of a bryophyte moss carpet on a granite rock face. Coordinates are automatically fuzzed to protect local flora. As we open the timeline, we can see three authentic visits logged under changing weather—from dry morning overcast to post-rain saturation."*

---

### [00:26 – 00:46] Act 3: Longitudinal Computer Vision & Photometric Shift
- **Screen:** Habitat detail view (`/sites/site-...`).
- **UI Action:** Switch to the *"Visual Comparison & AI Intelligence"* tab (or click comparison selector). Observe the four stat cards.
- **Narration:**
  > *"When we compare Day 1 against Day 14, WildTrace's algorithmic computer vision engine kicks in. It calculates an Excess Green Index delta of +12.3%, measuring spectral chlorophyll shifts, alongside a 76.5% photometric frame pixel delta."*

---

### [00:46 – 01:03] Act 4: The Scientific Reliability Gate (The Core Differentiator)
- **Screen:** Scrolling to the prominent red Incompatible Framing warning banner and side-by-side viewer.
- **UI Action:** Hover over the warning banner: *"Incompatible Framing for Direct Pixel Subtraction"*. Point out the `79% (LOW)` edge correlation score. Scroll down slightly to showcase the Side-by-Side Co-Inspection viewer.
- **Narration:**
  > *"Here is WildTrace's key scientific differentiator: camera angles between handheld citizen visits are rarely identical. Rather than generating misleading visual ghosts or hallucinating verified moss growth, our Sobel edge gradient gate halts direct subtraction and engages Side-by-Side Co-Inspection mode. Photometric shifts do NOT prove biological growth—they reflect moisture gloss and angle shifts."*

---

### [01:03 – 01:17] Act 5: Grounded Field Intelligence & The "Touch Grass" Mission
- **Screen:** Field Intelligence & Hypotheses panel.
- **UI Action:** Scroll down to the green-bordered *"Next Field Visit Mission"* card. Highlight the prompt text.
- **Narration:**
  > *"Our multimodal AI gateway evaluates the evidence with strict scientific uncertainty. It hypothesizes hydration reviviscence rather than net biomass expansion, and gives the observer exactly one tangible 'Touch Grass Mission' for Visit #3: return in 3 to 5 days, align against a physical rock fissure, and physically touch the moss carpet to test its turgidity."*

---

### [01:17 – 01:25] Act 6: Model Flexibility & 100% Offline Resilience
- **Screen:** Glancing back up at the model badge (`google/gemini-2.5-flash (via OpenRouter)`).
- **UI Action:** Smoothly scroll to the top of the page.
- **Narration:**
  > *"WildTrace is model-agnostic—supporting Google Gemini 2.5 Flash, open-weight Qwen 2.5 VL, and a 100% offline deterministic heuristic fallback that requires zero API keys. Go outside, pick a patch of nature, and Touch Grass with WildTrace."*

---

## 💡 Practical Recording Tips for the Presenter

1. **Keep movements deliberate:** Avoid rapid or erratic mouse cursor circles. Hover deliberately over badges and buttons before clicking.
2. **Tab switching:** When clicking *"Visual Comparison & AI Intelligence"*, pause for 1 second so the audience can absorb the stat cards before you scroll down.
3. **Highlight the warning banner:** Spend an extra 3 seconds on the red incompatible framing box—judges frequently single out scientific integrity and responsible AI safeguards.
4. **Offline fallback demo (optional):** If showcasing offline capabilities, unset `OPENROUTER_API_KEY` in `.env` and demonstrate that the entire pipeline continues running locally without an internet connection.
