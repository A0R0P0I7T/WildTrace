import assert from 'assert';
import { getDatabase, getAllSites, createSite, createObservation, resetToSeedData } from '../src/lib/storage/db';
import { computeImageComparison } from '../src/lib/vision/diffEngine';
import { aiGateway } from '../src/lib/ai/gateway';
import { AIInterpretationSchema } from '../src/lib/ai/schema';
import { DEMO_IMG_VISIT_1, DEMO_IMG_VISIT_2, REAL_IMG_VISIT_1, REAL_IMG_VISIT_2 } from '../src/lib/storage/seedData';
import { prisma } from '../src/lib/storage/prisma';

async function runJourneyTest() {
  console.log('🧪 Starting WildTrace Comprehensive 4-Phase Verification Journey...\n');

  // 1. Reset and verify seed demonstration datasets
  console.log('Step 1: Testing Demo Seed Database & Prisma SQLite Persistence...');
  const db = resetToSeedData();
  assert.strictEqual(db.sites.length, 2, 'Should have 2 demonstration sites (synthetic + real)');
  
  const syntheticSite = db.sites.find((s) => s.isSynthetic);
  const realSite = db.sites.find((s) => !s.isSynthetic && s.isDemoSite);
  
  assert.ok(syntheticSite, 'Must have synthetic demonstration site');
  assert.ok(realSite, 'Must have real field demonstration site');
  assert.strictEqual(syntheticSite.isSynthetic, true, 'Synthetic site must be flagged as isSynthetic=true');
  assert.strictEqual(realSite.isSynthetic, false, 'Real field site must not be flagged as synthetic');
  console.log('✓ Seed database verified with distinct Synthetic and Real field demonstration sites.\n');

  // 2. Create a new personal micro-habitat with privacy fuzzing
  console.log('Step 2: Creating a New Micro-Habitat Site with Privacy Fuzzing (~1.1km)...');
  const newSite = createSite({
    name: 'Backyard Moss Fissure #2',
    habitatType: 'moss_rock',
    description: 'West-facing granite rock face shaded by Japanese Maple.',
    latitude: 37.774929, // Raw input
    longitude: -122.419416, // Raw input
    locationLabel: 'Golden Gate Backyard Quadrant',
    isDemoSite: false,
    isSynthetic: false,
  });
  assert.ok(newSite.id, 'New site must have a valid ID');
  assert.strictEqual(newSite.isDemoSite, false, 'User site must not be marked as demo data');
  console.log(`✓ Site created: "${newSite.name}" (${newSite.id})\n`);

  // 3. Record Visit #1 (Baseline)
  console.log('Step 3: Recording Baseline Visit #1 with Contextual Metadata...');
  const obs1 = createObservation({
    siteId: newSite.id,
    recordedAt: '2026-10-01T10:00:00.000Z',
    imagePath: REAL_IMG_VISIT_1,
    weatherNotes: 'Dry, sunny, 18°C',
    fieldNotes: 'Baseline visit. Thin dry moss film on rock surface.',
    environmentalMetadata: {
      moistureEstimate: 'dry',
      lightingCondition: 'diffuse_overcast',
    },
  });
  assert.ok(obs1.id, 'Observation 1 must have an ID');
  console.log(`✓ Visit 1 recorded (${obs1.id})\n`);

  // 4. Record Visit #2 (Revisit)
  console.log('Step 4: Recording Revisit Visit #2 with Ground Moisture Shift...');
  const obs2 = createObservation({
    siteId: newSite.id,
    recordedAt: '2026-10-08T15:30:00.000Z',
    imagePath: REAL_IMG_VISIT_2,
    weatherNotes: 'Drizzle 3 hours ago, saturated, 13°C',
    fieldNotes: 'Moss cushion has visibly swollen and turned rich lime green.',
    environmentalMetadata: {
      moistureEstimate: 'saturated',
      lightingCondition: 'diffuse_overcast',
    },
  });
  assert.ok(obs2.id, 'Observation 2 must have an ID');
  console.log(`✓ Visit 2 recorded (${obs2.id})\n`);

  // 5. Test Visual Change Detection Engine & Edge Correlation
  console.log('Step 5: Testing Photometric Change Engine (ExG & Edge Gradient Correlation)...');
  const diff = await computeImageComparison(obs1.imagePath, obs2.imagePath);
  console.log(`  • Photometric frame shift: ${diff.visualDifferencePercentage}%`);
  console.log(`  • Excess Green Index (ExG) delta: ${diff.excessGreenDelta}%`);
  console.log(`  • Edge structural correlation: ${diff.structuralSimilarityScore}`);
  console.log(`  • Framing confidence: ${diff.alignmentConfidence}`);
  console.log(`  • Limitation disclosures: ${diff.limitationFlags.join(', ') || 'None'}`);

  assert.ok(diff.visualDifferencePercentage > 0, 'Visual difference should be greater than 0%');
  assert.ok(diff.diffMaskPath.startsWith('data:image/svg+xml'), 'Should generate valid SVG difference mask');
  console.log('✓ Grounded photometric indicators and suitability score calculated.\n');

  // 6. Test Provider-Independent AI Gateway & Deterministic Fallback
  console.log('Step 6: Testing Provider-Independent AI Gateway & Schema Validation...');
  const fakeCompPair = {
    id: 'test-comp-1',
    siteId: newSite.id,
    baselineObservationId: obs1.id,
    targetObservationId: obs2.id,
    ...diff,
    createdAt: new Date().toISOString(),
  };

  const gatewayResult = await aiGateway.generateInterpretation({
    site: newSite,
    baselineObs: obs1,
    targetObs: obs2,
    comparison: fakeCompPair,
  });

  const validated = AIInterpretationSchema.parse(gatewayResult.data);
  assert.ok(validated.observed_changes.length >= 1, 'Must have observed changes');
  assert.ok(validated.ecological_hypotheses.length >= 1, 'Must have non-definitive ecological hypotheses');
  assert.ok(validated.uncertainties.length >= 1, 'Must disclose photometric uncertainties and confounds');
  assert.ok(validated.next_visit_prompt.includes('Touch Grass Mission'), 'Next visit prompt must include mission');

  console.log(`✓ AI Gateway returned response via [${gatewayResult.modelIdentifier}]`);
  console.log(`  • Observed Changes: ${validated.observed_changes.length} items`);
  console.log(`  • Ecological Hypotheses: ${validated.ecological_hypotheses.length} items`);
  console.log(`  • Photometric Uncertainties: ${validated.uncertainties.length} items`);
  console.log(`  • Touch Grass Mission: "${validated.next_visit_prompt}"\n`);

  // 7. Cleanup & reset back to demonstration state
  console.log('Step 7: Verifying Database Reset & Isolation...');
  resetToSeedData();
  const finalSites = getAllSites();
  assert.strictEqual(finalSites.length, 2, 'Should reset cleanly back to the 2 demonstration sites');
  console.log('✓ Reset verified.\n');

  console.log('🎉 ALL REVISED WILDTRACE VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
}

runJourneyTest()
  .catch((err) => {
    console.error('❌ Verification test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
