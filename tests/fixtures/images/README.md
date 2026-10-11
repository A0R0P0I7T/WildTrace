# WildTrace Synthetic Image Test Fixtures Manifest

This directory contains deterministic, locally generated synthetic image fixtures for testing WildTrace's computer-vision comparison engine (`diffEngine.ts`), image upload validation, EXIF stripping, and framing suitability checks.

> **Scientific Notice:** All fixtures in this directory are synthetic artifacts generated locally with Sharp for automated software testing. They represent controlled numerical and geometric stress tests, **not** biological or ecological field evidence.

---

## Fixture Inventory & Provenance Matrix

| Filename | Generation Method | Test Purpose & Confound Scenario | Expected Result / Engine Behavior | Synthetic? |
| :--- | :--- | :--- | :--- | :--- |
| `01_baseline.png` | Sharp procedural RGB synthesis (256x256): brown bark background with circular green lichen/moss patch. | Primary reference baseline image for pairwise comparison tests. | Baseline reference for all subsequent tests. | **Yes** (Synthetic) |
| `02_identical.png` | Bitwise copy of `01_baseline.png`. | Identity test: zero change detection. | Visual diff = 0.0%, ExG delta = 0.0, Structural correlation = 1.0, Alignment = HIGH. | **Yes** (Synthetic) |
| `03_slightly_greener.png` | Controlled green channel boost (+35 G) applied to central moss quadrant. | Biological greening simulation (chlorophyll reviviscence / vegetative spread). | ExG delta > 0 (+3.0 to +8.0), moderate visual diff (~5-15%), Correlation > 0.85, Alignment = HIGH. | **Yes** (Synthetic) |
| `04_large_color_change.png` | Red channel boost (+70 R), Green channel attenuation (-40 G). | Extreme color shift (senescence, autumn leaf fall, desiccation). | ExG delta < 0 (negative shift), Visual diff > 40%, Correlation remains moderate/high. | **Yes** (Synthetic) |
| `05_brightness_increase.png` | Uniform scalar brightness shift (+45 R, +45 G, +45 B) across all pixels. | Ambient sunlight / overexposure confound test without underlying scene change. | ExG delta stays ~0.0 (`2*(G+c) - (R+c) - (B+c) = 2G - R - B`), flags `HIGH_ILLUMINATION_DISPARITY` if luminance shift > 28%. | **Yes** (Synthetic) |
| `06_darkened_moisture.png` | Uniform scalar darkening (-35 R, -35 G, -35 B) across all pixels. | Post-precipitation rain saturation / deep shadow confound test. | ExG delta remains ~0.0, detects illumination variance, warns against false-positive growth claims. | **Yes** (Synthetic) |
| `07_translated_shift.png` | Spatial translation shift (16px X, 16px Y). | Handheld framing drift / camera position misalignment. | Edge correlation drops (~0.60-0.75), flags `MODERATE_FRAMING_VARIANCE`, recommends manual alignment review. | **Yes** (Synthetic) |
| `08_rotated.png` | 15° geometric rotation with edge filling. | Significant camera tilt or perspective change between visits. | Structural similarity < 0.45, flags `INCOMPATIBLE_FOR_PIXEL_DIFF` and `PERSPECTIVE_SHIFT_DETECTED`, Alignment = LOW. | **Yes** (Synthetic) |
| `09_scaled_distance.png` | 1.4x digital crop and bicubic upscale. | Different camera distance or field-of-view scale between visits. | Edge correlation drops, flags framing mismatch or perspective shift. | **Yes** (Synthetic) |
| `10_partial_occlusion.png` | Solid gray rectangular obstruction (100x100px) in top-left quadrant. | Foreign object, fallen leaf, insect, or lens obstruction. | Localized hotspot cluster in SVG difference heatmap, ExG drop in occluded area. | **Yes** (Synthetic) |
| `11_blurred_lowres.png` | Gaussian blur (sigma = 6) applied to baseline image. | Camera defocus, dirty lens, or low-resolution sensor capture. | Structural edges softened, edge magnitude reduced, ExG remains approximately invariant. | **Yes** (Synthetic) |
| `12_unrelated_scene.png` | High-blue, low-red synthetic scene (water/sky/granite). | Completely unrelated micro-habitat or swapped quadrant test. | Visual diff > 80%, Structural similarity < 0.30, flags `INCOMPATIBLE_FOR_PIXEL_DIFF`, Alignment = LOW. Forces side-by-side mode. | **Yes** (Synthetic) |
| `13_aspect_ratio_16_9.png` | 455x256 widescreen format (16:9 aspect ratio). | Different sensor aspect ratios (e.g., 4:3 vs 16:9 mobile modes). | Sharp standardizes to 256x256 square grid with `fit: cover` without crashing. | **Yes** (Synthetic) |
| `14_corrupted_bad_bytes.png` | Non-image raw ASCII/binary payload (49 bytes). | Upload validation and corrupted byte rejection test. | Sharp and upload API immediately reject with 400 Bad Request error. | **Yes** (Synthetic) |

---

## Regeneration Command

To deterministically regenerate all fixtures at any time:

```bash
npx tsx tests/fixtures/generate-fixtures.ts
```
