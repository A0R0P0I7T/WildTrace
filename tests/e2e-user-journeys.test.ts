import fs from 'fs';
import path from 'path';
import assert from 'assert';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:3000';
const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'images');
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

async function runE2EUserJourneys() {
  console.log('================================================================');
  console.log('     WILDTRACE LIVE RUNTIME END-TO-END USER JOURNEYS (A-E)      ');
  console.log('================================================================\n');

  // Disable Sharp file handle cache
  sharp.cache(false);

  // Helper for fetch with JSON response
  async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    }
    return { status: res.status, headers: res.headers, data, rawRes: res };
  }

  // -------------------------------------------------------------------------
  // JOURNEY A: FIRST OBSERVATION
  // -------------------------------------------------------------------------
  console.log('▶ [Journey A] Testing First Observation Creation & Serving...');

  // 1. Create a habitat/site
  const sitePayload = {
    name: 'Live Audit Micro-Quadrant Alpha',
    habitatType: 'moss_rock',
    description: 'Granite boulder surface with pleurocarpous moss mat.',
    latitude: 45.421532,
    longitude: -75.697193,
    locationLabel: 'Gatineau Park Trailhead',
  };

  const createSiteRes = await apiFetch('/api/sites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sitePayload),
  });

  assert.strictEqual(createSiteRes.status, 201, 'Site creation must return 201');
  assert.strictEqual(createSiteRes.data.success, true);
  const siteId = createSiteRes.data.site.id;
  assert.ok(siteId, 'Site ID must be present');
  assert.strictEqual(createSiteRes.data.site.latitude, 45.42, 'Latitude must be fuzzed to 2 decimal places');
  assert.strictEqual(createSiteRes.data.site.longitude, -75.7, 'Longitude must be fuzzed to 2 decimal places');
  console.log(`  ✓ Site created successfully: ${sitePayload.name} (ID: ${siteId})`);

  // 2. Upload baseline photograph
  const baselineBuf = fs.readFileSync(path.join(FIXTURES_DIR, '01_baseline.png'));
  const formA = new FormData();
  formA.append('siteId', siteId);
  formA.append('weatherNotes', 'Clear skies, dry rock face, 20°C');
  formA.append('fieldNotes', 'Baseline observation. Thin moss carpet adhering to stone.');
  formA.append('environmentalMetadata', JSON.stringify({ moistureEstimate: 'dry', temperatureC: 20 }));
  formA.append('image', new Blob([baselineBuf], { type: 'image/png' }), '01_baseline.png');

  const uploadARes = await apiFetch('/api/observations', {
    method: 'POST',
    body: formA,
  });

  assert.strictEqual(uploadARes.status, 201, 'Baseline upload must return 201');
  assert.strictEqual(uploadARes.data.success, true);
  const obsA = uploadARes.data.observation;
  assert.ok(obsA.id, 'Observation A ID must be present');
  console.log(`  ✓ Baseline observation recorded: ID ${obsA.id}`);

  // 3. Reload site and verify observation is visible
  const reloadSiteRes = await apiFetch(`/api/sites/${siteId}`);
  assert.strictEqual(reloadSiteRes.status, 200);
  assert.strictEqual(reloadSiteRes.data.observations.length, 1);
  assert.strictEqual(reloadSiteRes.data.observations[0].id, obsA.id);
  console.log(`  ✓ Reload verified: Observation ${obsA.id} persists in site record`);

  // 4. Verify stored image is accessible through the serving route
  const serveImgRes = await fetch(`${BASE_URL}${obsA.imagePath}`);
  assert.strictEqual(serveImgRes.status, 200, 'Serving route must return 200');
  assert.strictEqual(serveImgRes.headers.get('Content-Type'), 'image/webp');
  assert.strictEqual(serveImgRes.headers.get('X-Content-Type-Options'), 'nosniff');
  const imgBytes = await serveImgRes.arrayBuffer();
  assert.ok(imgBytes.byteLength > 1000, 'Served image must have valid non-zero bytes');
  console.log(`  ✓ Stored image accessible at ${obsA.imagePath} (${imgBytes.byteLength} bytes)\n`);

  // -------------------------------------------------------------------------
  // JOURNEY B: REVISIT AND COMPARISON
  // -------------------------------------------------------------------------
  console.log('▶ [Journey B] Testing Revisit Observation, Comparison & Suitability...');

  // 1. Upload second photograph representing revisit
  const revisitBuf = fs.readFileSync(path.join(FIXTURES_DIR, '03_slightly_greener.png'));
  const formB = new FormData();
  formB.append('siteId', siteId);
  formB.append('weatherNotes', 'Post-rain drizzle 2 hours ago, saturated rock surface, 15°C');
  formB.append('fieldNotes', 'Moss cushions are hydrated, visibly greener, and swollen.');
  formB.append('environmentalMetadata', JSON.stringify({ moistureEstimate: 'saturated', temperatureC: 15 }));
  formB.append('image', new Blob([revisitBuf], { type: 'image/png' }), '03_slightly_greener.png');

  const uploadBRes = await apiFetch('/api/observations', {
    method: 'POST',
    body: formB,
  });

  assert.strictEqual(uploadBRes.status, 201);
  const obsB = uploadBRes.data.observation;
  assert.ok(obsB.id);
  console.log(`  ✓ Revisit observation recorded: ID ${obsB.id}`);

  // 2. Confirm both observations are associated with the habitat
  const siteAfterB = await apiFetch(`/api/sites/${siteId}`);
  assert.strictEqual(siteAfterB.data.observations.length, 2);
  console.log('  ✓ Both observations correctly linked to the habitat');

  // 3. Run real visual comparison pipeline
  const compareRes = await apiFetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baselineObservationId: obsA.id,
      targetObservationId: obsB.id,
    }),
  });

  assert.strictEqual(compareRes.status, 200);
  assert.strictEqual(compareRes.data.success, true);
  const comparison = compareRes.data.comparison;
  assert.ok(comparison.id);
  console.log(`  ✓ Comparison computed: ${comparison.visualDifferencePercentage}% visual shift, ExG delta: ${comparison.excessGreenDelta}%`);
  assert.ok(comparison.diffMaskPath.startsWith('data:image/svg+xml'), 'Comparison must include SVG diff mask');

  // 4. Test Incompatible Comparison (Unrelated Scene)
  const unrelatedBuf = fs.readFileSync(path.join(FIXTURES_DIR, '12_unrelated_scene.png'));
  const formUnrelated = new FormData();
  formUnrelated.append('siteId', siteId);
  formUnrelated.append('weatherNotes', 'Test unrelated scene');
  formUnrelated.append('fieldNotes', 'Unrelated photograph test');
  formUnrelated.append('image', new Blob([unrelatedBuf], { type: 'image/png' }), '12_unrelated.png');

  const uploadUnrelatedRes = await apiFetch('/api/observations', {
    method: 'POST',
    body: formUnrelated,
  });
  const obsUnrelated = uploadUnrelatedRes.data.observation;

  const compareUnrelatedRes = await apiFetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baselineObservationId: obsA.id,
      targetObservationId: obsUnrelated.id,
    }),
  });

  assert.strictEqual(compareUnrelatedRes.status, 200);
  const unrelatedComp = compareUnrelatedRes.data.comparison;
  assert.strictEqual(unrelatedComp.alignmentConfidence, 'LOW', 'Unrelated image comparison must flag LOW confidence');
  assert.ok(
    unrelatedComp.limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF'),
    'Must flag INCOMPATIBLE_FOR_PIXEL_DIFF for unrelated scenes'
  );
  console.log('  ✓ Incompatible scene detected: flagged INCOMPATIBLE_FOR_PIXEL_DIFF and forced side-by-side mode\n');

  // -------------------------------------------------------------------------
  // JOURNEY C: AI INTERPRETATION
  // -------------------------------------------------------------------------
  console.log('▶ [Journey C] Testing Grounded AI Field Intelligence & Fallback...');

  const interpretRes = await apiFetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comparisonPairId: comparison.id }),
  });

  assert.strictEqual(interpretRes.status, 200);
  assert.strictEqual(interpretRes.data.success, true);
  const interp = interpretRes.data.interpretation;
  assert.ok(interp.id);
  assert.ok(Array.isArray(interp.observedChanges) && interp.observedChanges.length >= 1);
  assert.ok(Array.isArray(interp.ecologicalHypotheses) && interp.ecologicalHypotheses.length >= 1);
  assert.ok(Array.isArray(interp.uncertainties) && interp.uncertainties.length >= 1);
  assert.ok(interp.nextVisitPrompt.includes('Touch Grass Mission'), 'Prompt must contain Touch Grass Mission');

  console.log(`  ✓ Interpretation returned via: ${interp.modelIdentifier}`);
  console.log(`  ✓ Touch Grass Mission: "${interp.nextVisitPrompt.slice(0, 80)}..."`);

  // Test invalid comparison ID error handling
  const badInterpRes = await apiFetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comparisonPairId: 'nonexistent-comp-999' }),
  });
  assert.strictEqual(badInterpRes.status, 404);
  console.log('  ✓ Nonexistent comparison ID rejected with HTTP 404\n');

  // -------------------------------------------------------------------------
  // JOURNEY D: DELETION AND CLEANUP
  // -------------------------------------------------------------------------
  console.log('▶ [Journey D] Testing Cascading Deletion & Protected Demo Data...');

  // 1. Create disposable habitat with an observation
  const dispSiteRes = await apiFetch('/api/sites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Disposable Habitat for Deletion Test',
      habitatType: 'soil_bed',
      description: 'Temporary site to verify cascading disk unlinks.',
    }),
  });
  const dispSiteId = dispSiteRes.data.site.id;

  const formDisp = new FormData();
  formDisp.append('siteId', dispSiteId);
  formDisp.append('weatherNotes', 'Sunny');
  formDisp.append('fieldNotes', 'Disposable observation');
  formDisp.append('image', new Blob([baselineBuf], { type: 'image/png' }), 'disp.png');

  const uploadDispRes = await apiFetch('/api/observations', {
    method: 'POST',
    body: formDisp,
  });
  const dispObs = uploadDispRes.data.observation;
  const dispDiskFile = path.join(UPLOADS_DIR, path.basename(dispObs.imagePath));
  assert.ok(fs.existsSync(dispDiskFile), 'Disposable upload file must exist on disk before deletion');

  // 2. Delete the disposable habitat
  const deleteRes = await apiFetch(`/api/sites/${dispSiteId}`, { method: 'DELETE' });
  assert.strictEqual(deleteRes.status, 200);

  // 3. Verify DB record is deleted
  const checkDispSite = await apiFetch(`/api/sites/${dispSiteId}`);
  assert.strictEqual(checkDispSite.status, 404, 'Deleted site must return 404');

  // 4. Verify physical file is deleted from disk
  assert.strictEqual(fs.existsSync(dispDiskFile), false, 'Uploaded image must be deleted from disk on site deletion');
  console.log('  ✓ Cascading deletion verified: Site record, observation, and disk file deleted cleanly');

  // 5. Verify Journey A site remains completely unaffected
  const checkSiteA = await apiFetch(`/api/sites/${siteId}`);
  assert.strictEqual(checkSiteA.status, 200, 'Original test site must remain intact');
  assert.strictEqual(checkSiteA.data.observations.length, 3, 'Observations on other sites must remain intact');
  console.log('  ✓ Cross-site isolation confirmed: Deletion did not affect other habitats');

  // 6. Verify demonstration site deletion is blocked
  const allSitesRes = await apiFetch('/api/sites');
  const demoSite = allSitesRes.data.sites.find((s: any) => s.isDemoSite);
  assert.ok(demoSite, 'Demonstration site must exist');
  const demoSiteCheck = await apiFetch(`/api/sites/${demoSite.id}`, { method: 'DELETE' });
  assert.strictEqual(demoSiteCheck.status, 403, 'Demonstration sites must be protected from deletion (HTTP 403)');
  console.log(`  ✓ Protected demonstration data confirmed: Deletion of ${demoSite.name} blocked with HTTP 403\n`);

  // Clean up Journey A site
  await apiFetch(`/api/sites/${siteId}`, { method: 'DELETE' });

  // -------------------------------------------------------------------------
  // JOURNEY E: PERSISTENCE & SYSTEM HEALTH
  // -------------------------------------------------------------------------
  console.log('▶ [Journey E] Testing Persistence & Database Integrity...');

  // Verify database files exist and are populated
  const dbJsonPath = path.join(process.cwd(), 'data', 'wildtrace_db.json');
  const sqliteDbPath = path.join(process.cwd(), 'data', 'wildtrace.db');

  assert.ok(fs.existsSync(dbJsonPath), 'wildtrace_db.json must exist');
  assert.ok(fs.existsSync(sqliteDbPath), 'wildtrace.db SQLite file must exist');

  const dbContent = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
  assert.ok(dbContent.sites.length >= 2, 'Demonstration sites must persist');
  console.log(`  ✓ Persistent database files intact (SQLite & JSON document store: ${dbContent.sites.length} sites)`);

  console.log('\n================================================================');
  console.log('  ALL LIVE END-TO-END USER JOURNEYS (A through E) PASSED (100%) ');
  console.log('================================================================\n');
}

runE2EUserJourneys().catch((err) => {
  console.error('Fatal user journey test failure:', err);
  process.exit(1);
});
