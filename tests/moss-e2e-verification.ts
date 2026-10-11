import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const MOSS_FOLDER = path.join(process.cwd(), 'MossImages');

async function main() {
  console.log('=== WILDTRACE THREE-STAGE MOSS E2E VERIFICATION ===');
  console.log(`Checking test images in: ${MOSS_FOLDER}`);

  const files = fs.readdirSync(MOSS_FOLDER).filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));
  console.log(`Discovered ${files.length} images:`, files);
  if (files.length < 3) {
    throw new Error(`Expected at least 3 test images, found ${files.length}`);
  }

  // Clean up any existing disposable validation sites first
  const existingSitesRes = await fetch(`${BASE_URL}/api/sites`);
  const existingSitesData = await existingSitesRes.json();
  if (existingSitesData.sites) {
    for (const site of existingSitesData.sites) {
      if (site.name === 'WildTrace Three-Stage Moss Validation') {
        console.log(`Cleaning up pre-existing validation site: ${site.id}`);
        await fetch(`${BASE_URL}/api/sites/${site.id}`, { method: 'DELETE' });
      }
    }
  }

  const imageMap = [
    {
      file: 'moss img1.jpeg',
      stage: 'Day 1 Baseline',
      recordedAt: '2026-09-27T10:00:00.000Z',
      weatherNotes: 'Morning overcast, high relative humidity (82%)',
      fieldNotes: 'Baseline observation of dense bryophyte carpet adhering to damp granite boulder face.',
      env: { moistureEstimate: 'damp', lightingCondition: 'diffuse_overcast' }
    },
    {
      file: 'moss img2.jpeg',
      stage: 'Day 7 Revisit',
      recordedAt: '2026-10-04T10:00:00.000Z',
      weatherNotes: 'Partial sun, dry mild breeze (humidity 48%)',
      fieldNotes: 'Day 7 revisit of bryophyte patch; slight curling and surface desiccation visible along margins.',
      env: { moistureEstimate: 'dry', lightingCondition: 'direct_sun' }
    },
    {
      file: 'moss img3.jpeg',
      stage: 'Day 14 Revisit',
      recordedAt: '2026-10-11T10:00:00.000Z',
      weatherNotes: 'Post-rain overcast skies, high surface moisture',
      fieldNotes: 'Day 14 revisit following intermittent overnight rain; gametophyte carpets appears saturated and dark green.',
      env: { moistureEstimate: 'saturated', lightingCondition: 'diffuse_overcast' }
    }
  ];

  // 1. Create Dedicated Test Habitat
  console.log('\n--- Step 1: Creating Dedicated Test Habitat ---');
  const siteRes = await fetch(`${BASE_URL}/api/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'WildTrace Three-Stage Moss Validation',
      habitatType: 'moss_rock',
      description: 'Longitudinal micro-habitat validation study tracking bryophyte coverage and hydration dynamics across a 14-day sequence using three authentic photographs.',
      latitude: 47.61,
      longitude: -122.33,
      locationLabel: 'Granite Outcrop North Face'
    })
  });

  const siteData = await siteRes.json();
  if (!siteRes.ok || !siteData.success) {
    throw new Error(`Failed to create site: ${JSON.stringify(siteData)}`);
  }
  const siteId = siteData.site.id;
  console.log(`Created test site successfully! ID: ${siteId}, Name: "${siteData.site.name}"`);

  // 2. Upload All Three Observations
  console.log('\n--- Step 2: Uploading 3 Observations via API ---');
  const observationIds: string[] = [];
  const observationRecords: any[] = [];

  for (let i = 0; i < imageMap.length; i++) {
    const item = imageMap[i];
    const filePath = path.join(MOSS_FOLDER, item.file);
    const fileBytes = fs.readFileSync(filePath);

    const blob = new Blob([fileBytes], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('siteId', siteId);
    formData.append('image', blob, item.file);
    formData.append('recordedAt', item.recordedAt);
    formData.append('weatherNotes', item.weatherNotes);
    formData.append('fieldNotes', item.fieldNotes);
    formData.append('environmentalMetadata', JSON.stringify(item.env));

    console.log(`Uploading ${item.stage} (${item.file}, ${fileBytes.length} bytes)...`);
    const obsRes = await fetch(`${BASE_URL}/api/observations`, {
      method: 'POST',
      body: formData
    });

    const obsData = await obsRes.json();
    if (!obsRes.ok || !obsData.success) {
      throw new Error(`Upload failed for ${item.file}: ${JSON.stringify(obsData)}`);
    }

    const obs = obsData.observation;
    observationIds.push(obs.id);
    observationRecords.push(obs);
    console.log(`  -> Stored Observation ID: ${obs.id}`);
    console.log(`  -> Image Path: ${obs.imagePath}`);
    console.log(`  -> Recorded At: ${obs.recordedAt}`);
  }

  // 3. Verify Site & Observations Persistence
  console.log('\n--- Step 3: Verifying Site & Timeline Retrieval ---');
  const getSiteRes = await fetch(`${BASE_URL}/api/sites/${siteId}`);
  const siteDetails = await getSiteRes.json();
  if (!getSiteRes.ok || !siteDetails.success) {
    throw new Error(`Failed to retrieve site details: ${JSON.stringify(siteDetails)}`);
  }

  const fetchedObs = siteDetails.observations;
  console.log(`Retrieved site with ${fetchedObs.length} observations:`);
  fetchedObs.forEach((o: any, idx: number) => {
    console.log(`  [${idx + 1}] ID: ${o.id} | Date: ${o.recordedAt} | Path: ${o.imagePath}`);
    if (o.imagePath.includes('C:\\') || o.imagePath.includes('/Users/')) {
      throw new Error(`Sensitive filesystem path leaked in imagePath: ${o.imagePath}`);
    }
  });

  // Verify that the stored webp files exist on disk and can be fetched via HTTP
  for (const obs of fetchedObs) {
    const imgUrl = `${BASE_URL}${obs.imagePath}`;
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to load uploaded image from ${imgUrl}: HTTP ${imgRes.status}`);
    }
    const ct = imgRes.headers.get('content-type');
    console.log(`  -> Verified image HTTP fetch: ${imgUrl} (HTTP ${imgRes.status}, Content-Type: ${ct})`);
  }

  // 4. Test All Three Pairwise Comparisons
  console.log('\n--- Step 4: Testing All Three Pairwise Comparisons ---');
  const comparisonsToRun = [
    {
      name: 'Comparison 1: Day 1 Baseline vs Day 7 Revisit',
      baselineIdx: 0,
      targetIdx: 1,
      expectedDays: 7
    },
    {
      name: 'Comparison 2: Day 7 Revisit vs Day 14 Revisit',
      baselineIdx: 1,
      targetIdx: 2,
      expectedDays: 7
    },
    {
      name: 'Comparison 3: Day 1 Baseline vs Day 14 Revisit',
      baselineIdx: 0,
      targetIdx: 2,
      expectedDays: 14
    }
  ];

  const comparisonResults: any[] = [];

  for (const cmp of comparisonsToRun) {
    console.log(`\nExecuting: ${cmp.name}`);
    const baselineId = observationIds[cmp.baselineIdx];
    const targetId = observationIds[cmp.targetIdx];

    const compRes = await fetch(`${BASE_URL}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baselineObservationId: baselineId,
        targetObservationId: targetId
      })
    });

    const compData = await compRes.json();
    if (!compRes.ok || !compData.success) {
      throw new Error(`Comparison calculation failed: ${JSON.stringify(compData)}`);
    }

    const comparison = compData.comparison;
    console.log(`  -> Visual Difference: ${comparison.visualDifferencePercentage}%`);
    console.log(`  -> Excess Green Delta: ${comparison.excessGreenDelta}%`);
    console.log(`  -> Structural Similarity (Edge Correlation): ${comparison.structuralSimilarityScore}`);
    console.log(`  -> Alignment Confidence: ${comparison.alignmentConfidence}`);
    console.log(`  -> Limitation Flags:`, comparison.limitationFlags);

    // Call AI Interpretation endpoint
    console.log(`  -> Invoking AI Interpretation for comparison pair ${comparison.id}...`);
    const interpretRes = await fetch(`${BASE_URL}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comparisonPairId: comparison.id,
        forceRefresh: true
      })
    });

    const interpretData = await interpretRes.json();
    if (!interpretRes.ok || !interpretData.success) {
      throw new Error(`AI interpretation failed: ${JSON.stringify(interpretData)}`);
    }

    const interpretation = interpretData.interpretation;
    console.log(`  -> Model Identifier: ${interpretation.modelIdentifier}`);
    console.log(`  -> Is Fallback: ${interpretation.isFallback}`);
    console.log(`  -> Observed Changes:`, interpretation.observedChanges);
    console.log(`  -> Ecological Hypotheses:`, interpretation.ecologicalHypotheses);
    console.log(`  -> Uncertainties:`, interpretation.uncertainties);
    console.log(`  -> Next Visit Prompt: ${interpretation.nextVisitPrompt}`);

    comparisonResults.push({
      pairName: cmp.name,
      baselineObservationId: baselineId,
      targetObservationId: targetId,
      comparison,
      interpretation,
    });

    // Validate Scientific Acceptance Criteria
    assertScientificReliability(cmp.name, comparison, interpretation);
  }

  // 5. Output Results Summary
  const outPath = path.join(process.cwd(), 'tests', 'moss_e2e_results.json');
  const fullOutput = {
    executedAt: new Date().toISOString(),
    siteId,
    siteName: 'WildTrace Three-Stage Moss Validation',
    habitatType: 'moss_rock',
    imageInventory: imageMap.map(img => ({
      stage: img.stage,
      file: img.file,
      intendedDate: img.recordedAt,
      weather: img.weatherNotes,
      fieldNotes: img.fieldNotes
    })),
    comparisons: comparisonResults
  };

  fs.writeFileSync(outPath, JSON.stringify(fullOutput, null, 2), 'utf-8');
  console.log(`\nSaved complete E2E results to: ${outPath}`);

  // 6. Clean Up Dedicated Test Habitat
  console.log('\n--- Step 6: Cleaning Up Dedicated Disposable Test Habitat ---');
  const delRes = await fetch(`${BASE_URL}/api/sites/${siteId}`, { method: 'DELETE' });
  const delData = await delRes.json();
  console.log(`  -> Disposable site cleanup result:`, delData.success ? 'Successfully Deleted' : delData.error);

  console.log('=== E2E OBSERVATION & COMPARISON JOURNEY SUCCESSFUL ===\n');
}

function assertScientificReliability(pairName: string, comparison: any, interpretation: any) {
  // Check that confidence gate is respected
  if (comparison.alignmentConfidence === 'LOW') {
    if (!comparison.limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF')) {
      throw new Error(`[${pairName}] Expected INCOMPATIBLE_FOR_PIXEL_DIFF flag for LOW confidence comparison`);
    }

    const allText = [
      ...interpretation.observedChanges,
      ...interpretation.ecologicalHypotheses,
      ...interpretation.uncertainties
    ].join(' ').toLowerCase();

    // Check that model did not claim proven growth or verified dieback
    const forbiddenPhrases = [
      'confirmed moss growth',
      'proven biomass loss',
      'verified ecological deterioration',
      'proven dehydration'
    ];

    for (const phrase of forbiddenPhrases) {
      if (allText.includes(phrase)) {
        throw new Error(`[${pairName}] AI interpretation made forbidden unverified claim: "${phrase}"`);
      }
    }

    // Check Touch Grass Mission
    if (!interpretation.nextVisitPrompt.startsWith('Touch Grass Mission:')) {
      throw new Error(`[${pairName}] Next visit prompt must start with "Touch Grass Mission:"`);
    }

    console.log(`  ✓ Scientific Reliability Gate Passed: Tentative hypotheses, limitations acknowledged, valid Touch Grass Mission.`);
  }
}

main().catch(err => {
  console.error('\nE2E VERIFICATION FAILED:', err);
  process.exit(1);
});
