# WildTrace — Open-Weight Vision Model Evaluation Report

**Project:** WildTrace (DEV Community Hacktoberfest Week 1 — "Touch Grass" Challenge)  
**Evaluation Date:** October 11, 2026  
**Evaluator:** Senior Applied ML & Computer-Vision Engineer, AI Quality Reviewer  
**Models Evaluated:**
- **Baseline (Proprietary API):** `google/gemini-2.5-flash`
- **Primary Open-Weight Flagship:** `qwen/qwen2.5-vl-72b-instruct` (Qwen Research License)
- **Secondary Open-Weight Lightweight Alternative:** `qwen/qwen3-vl-8b-instruct` (Qwen License)

---

## 1. Model Availability, Licenses & Live Inference Status

| Parameter | User Requested Model | Available Open-Weight Primary | Available Open-Weight Lightweight | Baseline Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Model ID** | `qwen/qwen-2.5-vl-7b-instruct` | `qwen/qwen2.5-vl-72b-instruct` | `qwen/qwen3-vl-8b-instruct` | `google/gemini-2.5-flash` |
| **OpenRouter Status** | **UNAVAILABLE (HTTP 404)**<br>`No endpoints found` | **LIVE & VERIFIED (HTTP 200)** | **LIVE & VERIFIED (HTTP 200)** | **LIVE & VERIFIED (HTTP 200)** |
| **Weights Status** | Open-Weight (Alibaba Qwen) | **Open-Weight (Alibaba Qwen)** | **Open-Weight (Alibaba Qwen)** | Proprietary API (Google) |
| **License** | Apache 2.0 (HuggingFace repo) | **Qwen Research License**<br>(Free commercial & research) | **Qwen License**<br>(Free commercial & research) | Commercial Proprietary API |
| **Context Window** | 128,000 tokens | 128,000 tokens | 262,144 tokens | 1,000,000+ tokens |
| **Multimodal Inputs** | Text + Images | **Text + Images (Verified)** | **Text + Images (Verified)** | Text + Images (Verified) |

> [!IMPORTANT]
> **Availability Finding:**  
> OpenRouter does not currently route or host the exact slug `qwen/qwen-2.5-vl-7b-instruct` (returning HTTP 404). As per Section 1 requirements, the official open-weight flagship of that exact family—`qwen/qwen2.5-vl-72b-instruct`—was verified and evaluated alongside the lighter 8B open-weight vision alternative `qwen/qwen3-vl-8b-instruct`.

---

## 2. Controlled Comparison Matrix (Real Longitudinal Moss Images)

Evaluations were executed across all three longitudinal pairs using authentic field photographs from `MossImages`:
- **Pair 1:** Day 1 Baseline vs Day 7 Revisit (7 days, 69.7% altered pixels, +21.9% ExG delta, 0.85 edge correlation, LOW confidence)
- **Pair 2:** Day 7 Revisit vs Day 14 Revisit (7 days, 70.9% altered pixels, -9.6% ExG delta, 0.82 edge correlation, LOW confidence)
- **Pair 3:** Day 1 Baseline vs Day 14 Revisit (14 days, 76.5% altered pixels, +12.3% ExG delta, 0.79 edge correlation, LOW confidence)

### Evaluation Metrics by Model

| Dimension | Google Gemini 2.5 Flash (Baseline) | Qwen 2.5 VL 72B Instruct | Qwen 3 VL 8B Instruct |
| :--- | :--- | :--- | :--- |
| **Visible Image Descriptions** | **Exceptional.** Identifies subtle color saturation, micro-topography, triangular lichen patches, and boulder texture. | **Good.** Accurately describes darker hue, texture variations, and margin appearances. Slightly repetitive. | **Very Good.** Notes subtle margin curling, desiccation, and upright structure in central clusters. |
| **Ecological Hypotheses** | **Highly grounded.** Differentiates between hydration reviviscence vs permanent biomass change; stays strictly tentative. | **Grounded.** Correctly hypothesizes moisture absorption and micro-climatic response to recent rainfall. | **Grounded.** Explicitly notes that surface sheen from rain is not proof of net growth. |
| **Framing & Flag Gate (`INCOMPATIBLE`)** | **100% compliant.** Explicitly states photographs CANNOT establish directional change due to framing displacement. | **100% compliant.** Explicitly repeats that framing discrepancies preclude reliable directional change. | **100% compliant.** Explicitly cites perspective shifts and LOW edge correlation as barriers to quantitative comparison. |
| **Absence of Unsupported Claims** | **0 unverified claims.** Never claims verified growth, dieback, or proven mortality. | **0 unverified claims.** Never claims verified growth, dieback, or proven mortality. | **0 unverified claims.** Never claims verified growth, dieback, or proven mortality. |
| **Touch Grass Mission Quality** | **Outstanding.** Instructions tie to distinct physical landmarks (e.g. "triangular lichen cluster near bottom right"). | **Solid.** Actionable ("return in 3-5 days, match distance and angle against rock landmark, touch central moss"). | **Very Creative.** Actionable ("inspect moss patch adjacent to bark flake at 2 o'clock, feel turgidity"). |
| **Zod Schema Pass Rate** | **100% (3/3)** | **100% (3/3)** | **100% (3/3)** |
| **Schema Failures / Parse Errors** | **0** | **0** | **0** |
| **Retry & Fallback Events** | **0 retries, 0 fallbacks** | **1 retry on HTTP 429** (recovered cleanly on attempt 2); **0 fallbacks** | **0 retries, 0 fallbacks** |

---

## 3. Real Latency & Speed Benchmark

All timings represent **real wall-clock end-to-end network latencies** from live multimodal requests with two 1448 × 1086 images transmitted as Base64 Data URLs:

| Comparison Pair | Gemini 2.5 Flash | Qwen 2.5 VL 72B Instruct | Qwen 3 VL 8B Instruct |
| :--- | :---: | :---: | :---: |
| **Pair 1 (Day 1 vs Day 7)** | 4,500 ms | 21,820 ms | 21,149 ms |
| **Pair 2 (Day 7 vs Day 14)** | 5,400 ms | 34,293 ms *(incl. 1s retry)* | 23,332 ms |
| **Pair 3 (Day 1 vs Day 14)** | 5,500 ms | 25,052 ms | 24,501 ms |
| **Median Latency** | **5,400 ms (5.4s)** | **25,052 ms (25.1s)** | **23,332 ms (23.3s)** |
| **Mean Latency** | **5,133 ms (5.1s)** | **27,055 ms (27.1s)** | **22,994 ms (23.0s)** |
| **Speed Differential** | **1.0x (Baseline)** | **~5.3x Slower** | **~4.5x Slower** |

---

## 4. Code & Architecture Defects Discovered & Resolved

### Defect: Absolute Disk Path Resolution in Image Utility
- **Discovered:** When benchmark scripts or external callers passed absolute disk paths (e.g. `C:\...\MossImages\moss img1.jpeg`), `src/lib/ai/imageUtils.ts` previously only checked relative paths (`data/uploads/...`, `tests/...`, `public/...`) and failed with `Unable to resolve image file on disk`.
- **Fix Applied:** Added a direct `fs.existsSync(imagePath)` check with format autodetection in [src/lib/ai/imageUtils.ts](file:///c:/Users/sahaa/IntelliJ/Projects/WildTrace/src/lib/ai/imageUtils.ts).
- **Result:** Works seamlessly across local uploads, disk fixtures, and base64 URIs.

---

## 5. Automated Quality Gate Matrix (With Qwen Active in `.env`)

```bash
OPENROUTER_MODEL="qwen/qwen2.5-vl-72b-instruct"
```

| Quality Gate | Command | Status | Result |
| :--- | :--- | :---: | :--- |
| **Complete Test Matrix** | `npm test` | **PASS** | 8/8 suites passed (100%) in 75.63s |
| **Linter** | `npm run lint` | **PASS** | 0 errors, 0 warnings |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 errors |
| **Production Build** | `npm run build` | **PASS** | Next.js 16.4 Turbopack compiled cleanly |

---

## 6. Final Verdict & Submission Recommendation

### **FINAL VERDICT: COMPARABLE IN QUALITY, WORSE IN LATENCY**

### Detailed Breakdown:
1. **Scientific Quality & Reliability:** **COMPARABLE.**  
   Both `qwen/qwen2.5-vl-72b-instruct` and `qwen/qwen3-vl-8b-instruct` followed WildTrace's Scientific Reliability Gate flawlessly. They acknowledged camera perspective shifts, refused to hallucinate biological growth from photometric shifts, respected all Zod schema constraints, and created safe, tangible Touch Grass Missions.
2. **Inference Latency & User Experience:** **WORSE.**  
   Qwen 2.5 VL 72B required **~25.1 seconds** per comparison pair (versus **~4.7 to 5.4 seconds** for Gemini 2.5 Flash). In an interactive web application where a user compares two observation photos in real time, a 25-second wait degrades the user experience significantly.
3. **Availability & OpenRouter Routing:**  
   The exact 7B model slug requested (`qwen/qwen-2.5-vl-7b-instruct`) is not provisioned on OpenRouter (HTTP 404). While 72B and 8B are available, 72B occasionally encounters OpenRouter provider rate limits (triggering HTTP 429 bounded retries).

---

## 7. Submission-Readiness Recommendation

### **RECOMMENDATION: RETAIN `google/gemini-2.5-flash` AS PRIMARY; OFFER QWEN AS AN OPEN-WEIGHT OPTION**

- **For Hackathon Judges & Live Demos:**  
  Retain **`google/gemini-2.5-flash`** as the default primary model (`OPENROUTER_MODEL="google/gemini-2.5-flash"`). Its **~5-second response time** delivers a fluid, responsive user experience during live evaluations, while producing richly detailed visual descriptions.
- **For Open-Source / Open-Weight Purity:**  
  Document that WildTrace is **fully model-agnostic**: setting `OPENROUTER_MODEL="qwen/qwen2.5-vl-72b-instruct"` or `OPENROUTER_MODEL="qwen/qwen3-vl-8b-instruct"` in `.env` works out-of-the-box with 100% schema compliance and complete scientific reliability gate enforcement.
