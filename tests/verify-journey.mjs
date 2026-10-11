import assert from 'assert';
import { getDatabase, getAllSites, createSite, createObservation, resetToSeedData, purgeAllData } from '../src/lib/storage/db.js';
import { computeImageComparison } from '../src/lib/vision/diffEngine.js';
import { generateDeterministicInterpretation } from '../src/lib/ai/heuristicFallback.js';
import { AIInterpretationSchema } from '../src/lib/ai/schema.js';
import { DEMO_IMG_VISIT_1, DEMO_IMG_VISIT_2 } from '../src/lib/storage/seedData.js';

console.log('🧪 Starting WildTrace End-to-End Verification Journey...\n');

// 1. Reset and verify initial seed demo data
console.log('Step 1: Testing Demo Seed Database Initialization...');
const db = resetToSeedData();
assert.strictEqual(db.sites.length, 1, 'Should have exactly 1 seeded demo site');
assert.strictEqual(db.sites[0].isDemoSite, true, 'Seeded site must be marked as isDemoSite=true');
assert.strictEqual(db.observations.length, 2, 'Should have 2 seeded visits for demo site');
console.log('✓ Seed database initialized with Ancient Oak Root Hollow.\n');

// 2. Create a new personal micro-habitat with privacy fuzzing
console.log('Step 2: Creating a New Micro-Habitat Site with Privacy Fuzzing...');
const newSite = createSite({
  name: 'Backyard Moss Fissure #2',
  habitatType: 'moss_rock',
  description: 'West-facing granite rock face shaded by Japanese Maple.',
  latitude: 37.77, // Fuzzed
  longitude: -122.42, // Fuzzed
  locationLabel: 'Golden Gate Backyard Quadrant',
  isDemoSite: false,
});
assert.ok(newSite.id, 'New site must have a valid ID');
assert.strictEqual(newSite.isDemoSite, false, 'User site must not be marked as demo data');
console.log(`✓ Site created: "${newSite.name}" (${newSite.id})\n`);

// 3. Record Visit #1 (Baseline)
console.log('Step 3: Recording Baseline Visit #1...');
const obs1 = createObservation({
  siteId: newSite.id,
  recordedAt: '2026-10-01T10:00:00.000Z',
  imagePath: DEMO_IMG_VISIT_1,
  weatherNotes: 'Dry, sunny, 18°C',
  fieldNotes: 'Baseline visit. Thin dry moss film on rock surface.',
  environmentalMetadata: {
    moistureEstimate: 'dry',
    lightingCondition: 'direct_sun',
  },
});
assert.ok(obs1.id, 'Observation 1 must have an ID');
console.log(`✓ Visit 1 recorded (${obs1.id})\n`);

// 4. Record Visit #2 (Revisit)
console.log('Step 4: Recording Revisit Visit #2...');
const obs2 = createObservation({
  siteId: newSite.id,
  recordedAt: '2026-10-08T15:30:00.000Z',
  imagePath: DEMO_IMG_VISIT_2,
  weatherNotes: 'Heavy rain 12 hours ago, damp, 12°C',
  fieldNotes: 'Moss cushion has visibly swollen and turned rich lime green.',
  environmentalMetadata: {
    moistureEstimate: 'saturated',
    lightingCondition: 'diffuse_overcast',
  },
});
assert.ok(obs2.id, 'Observation 2 must have an ID');
console.log(`✓ Visit 2 recorded (${obs2.id})\n`);

// 5. Test Visual Change Detection Engine
console.log('Step 5: Running Algorithmic Visual Comparison Engine (Sharp + ExG)...');
const diff = await computeImageComparison(obs1.imagePath, obs2.imagePath);
console.log(`- Visual difference percentage: ${diff.visualDifferencePercentage}%`);
console.log(`- Excess Green Index delta: ${diff.excessGreenDelta}%`);
console.log(`- Framing confidence: ${diff.alignmentConfidence}`);
assert.ok(diff.visualDifferencePercentage > 0, 'Visual difference should be greater than 0%');
assert.ok(diff.diffMaskPath.startsWith('data:image/svg+xml'), 'Should generate valid SVG difference mask');
console.log('✓ Visual comparison metrics and delta mask generated successfully.\n');

// 6. Test Structured AI Interpretation & Grounded Heuristics
console.log('Step 6: Testing Grounded AI Field Intelligence & Next-Visit Mission...');
const fakeCompPair = {
  id: 'test-comp-1',
  siteId: newSite.id,
  baselineObservationId: obs1.id,
  targetObservationId: obs2.id,
  ...diff,
  createdAt: new Date().toISOString(),
};

const interpretation = generateDeterministicInterpretation(newSite, obs1, obs2, fakeCompPair);
const validated = AIInterpretationSchema.parse(interpretation);

assert.ok(validated.observed_changes.length >= 1, 'Must have observed changes');
assert.ok(validated.ecological_hypotheses.length >= 1, 'Must have ecological hypotheses');
assert.ok(validated.uncertainties.length >= 1, 'Must disclose uncertainties');
assert.ok(validated.next_visit_prompt.includes('Touch Grass Mission'), 'Next visit prompt must include mission');

console.log('✓ Grounded AI schema validation passed:');
console.log(`  • Observed Changes: ${validated.observed_changes.length} items`);
console.log(`  • Ecological Hypotheses: ${validated.ecological_hypotheses.length} items`);
console.log(`  • Field Uncertainties: ${validated.uncertainties.length} items`);
console.log(`  • Next Field Mission: "${validated.next_visit_prompt}"\n`);

// 7. Cleanup & reset back to demonstration state
console.log('Step 7: Verifying Database Reset & Demo Isolation...');
resetToSeedData();
const finalSites = getAllSites();
assert.strictEqual(finalSites.length, 1, 'Should reset cleanly back to 1 demo site');
console.log('✓ Reset verified.\n');

console.log('🎉 ALL WILDTRACE VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
