import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { computeImageComparison } from '../src/lib/vision/diffEngine';

const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'images');

async function runVisionEngineTests() {
  console.log('🔬 Starting WildTrace Photometric & Vision Engine Automated Tests...\n');

  let passed = 0;
  let failed = 0;

  function testCase(name: string, fn: () => void | Promise<void>) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✓ PASS: ${name}`);
        passed++;
      } catch (err: any) {
        console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
        failed++;
      }
    })();
  }

  // 1. Mathematical formula verification: ExG = 2G - R - B
  await testCase('ExG Mathematical Invariance Under Uniform Brightness Shift', async () => {
    // If every pixel shifts by +c (scalar brightness shift):
    // ExG_new = 2*(G+c) - (R+c) - (B+c) = 2G + 2c - R - c - B - c = 2G - R - B = ExG_old
    // Therefore, an ideal scalar brightness shift yields ExG delta of ~0.0
    const baseline = path.join(FIXTURES_DIR, '01_baseline.png');
    const bright = path.join(FIXTURES_DIR, '05_brightness_increase.png');
    const res = await computeImageComparison(baseline, bright);

    // Delta should be close to 0 (within rounding of saturation limits)
    assert.ok(Math.abs(res.excessGreenDelta) < 3.0, `ExG delta should be ~0 under uniform illumination (actual: ${res.excessGreenDelta})`);
    assert.ok(res.limitationFlags.includes('HIGH_ILLUMINATION_DISPARITY'), 'Must flag HIGH_ILLUMINATION_DISPARITY');
  });

  // 2. Identical Images Test
  await testCase('Identical Image Pair (Zero-Delta Baseline)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '02_identical.png');
    const res = await computeImageComparison(img1, img2);

    assert.strictEqual(res.visualDifferencePercentage, 0, 'Visual diff must be 0.0%');
    assert.strictEqual(res.excessGreenDelta, 0, 'Excess green delta must be 0.0');
    assert.strictEqual(res.structuralSimilarityScore, 1, 'Edge correlation score must be 1.0');
    assert.strictEqual(res.alignmentConfidence, 'HIGH', 'Alignment confidence must be HIGH');
    assert.strictEqual(res.limitationFlags.length, 0, 'Should have no limitation flags for identical images');
  });

  // 3. Greener Image Test
  await testCase('Greener Image Pair (Positive ExG Shift)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '03_slightly_greener.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.excessGreenDelta > 0, `ExG delta must be positive (actual: ${res.excessGreenDelta})`);
    assert.ok(res.visualDifferencePercentage > 0, 'Visual difference must be > 0%');
    assert.ok(res.structuralSimilarityScore >= 0.8, 'Structural similarity should remain high for localized greening');
    assert.strictEqual(res.alignmentConfidence, 'HIGH', 'Alignment confidence should remain HIGH');
  });

  // 4. Large Color Change (Autumn Senescence / Red Shift)
  await testCase('Large Color Shift (Negative ExG Delta)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '04_large_color_change.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.excessGreenDelta < 0, `ExG delta must be negative for red shift (actual: ${res.excessGreenDelta})`);
    assert.ok(res.visualDifferencePercentage > 30, 'Visual difference must be significant');
  });

  // 5. Darkened Moisture Simulation
  await testCase('Darkened / Moisture Confound Simulation', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '06_darkened_moisture.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.limitationFlags.includes('HIGH_ILLUMINATION_DISPARITY'), 'Must flag illumination disparity for darkened surface');
    assert.ok(Math.abs(res.excessGreenDelta) < 3.0, `ExG delta should be near 0 for uniform darkening (actual: ${res.excessGreenDelta})`);
  });

  // 6. Translation Shift (Misalignment)
  await testCase('Framing Translation Drift (Edge Correlation Drop)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '07_translated_shift.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.structuralSimilarityScore < 0.95, 'Edge correlation should drop when translated');
    assert.ok(res.limitationFlags.includes('MODERATE_FRAMING_VARIANCE') || res.limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF'), 'Must flag framing variance');
  });

  // 7. Significant Rotation / Perspective Change
  await testCase('Rotated Image (Low Confidence & Perspective Flag)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '08_rotated.png');
    const res = await computeImageComparison(img1, img2);

    assert.strictEqual(res.alignmentConfidence, 'LOW', 'Alignment confidence must be LOW for rotated image');
    assert.ok(res.limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF'), 'Must flag INCOMPATIBLE_FOR_PIXEL_DIFF');
    assert.ok(res.limitationFlags.includes('PERSPECTIVE_SHIFT_DETECTED'), 'Must flag PERSPECTIVE_SHIFT_DETECTED');
  });

  // 8. Scaled / Distance Change
  await testCase('Camera Distance / Scale Variance', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '09_scaled_distance.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.structuralSimilarityScore < 0.70, 'Scale difference must lower edge correlation');
  });

  // 9. Partial Occlusion
  await testCase('Partial Quadrant Occlusion (Localized Heatmap)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '10_partial_occlusion.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.visualDifferencePercentage > 10, 'Occluded quadrant must reflect in altered pixels');
    assert.ok(res.diffMaskPath.includes('<rect'), 'SVG heatmap must contain hotspot rect tags');
  });

  // 10. Blurred Image
  await testCase('Blurred Defocused Observation', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '11_blurred_lowres.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(res.structuralSimilarityScore > 0, 'Blurred image correlation can be computed');
    assert.ok(Math.abs(res.excessGreenDelta) < 3.0, 'ExG should remain stable despite optical blur');
  });

  // 11. Structurally Unrelated Image
  await testCase('Structurally Unrelated Scene (Forced Fallback to Side-by-Side)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '12_unrelated_scene.png');
    const res = await computeImageComparison(img1, img2);

    assert.strictEqual(res.alignmentConfidence, 'LOW', 'Alignment confidence must be LOW');
    assert.ok(res.structuralSimilarityScore < 0.45, `Structural correlation should be < 0.45 (actual: ${res.structuralSimilarityScore})`);
    assert.ok(res.limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF'), 'Must flag INCOMPATIBLE_FOR_PIXEL_DIFF');
  });

  // 12. Non-Square Aspect Ratio
  await testCase('Non-Square Aspect Ratio (16:9)', async () => {
    const img1 = path.join(FIXTURES_DIR, '01_baseline.png');
    const img2 = path.join(FIXTURES_DIR, '13_aspect_ratio_16_9.png');
    const res = await computeImageComparison(img1, img2);

    assert.ok(typeof res.visualDifferencePercentage === 'number', 'Must successfully compute metrics across different aspect ratios');
  });

  console.log(`\nVision Engine Test Summary: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runVisionEngineTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
