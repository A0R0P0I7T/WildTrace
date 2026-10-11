import assert from 'assert';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { NextRequest } from 'next/server';
import { GET as getSites, POST as createSiteRoute } from '../src/app/api/sites/route';
import { GET as getSiteByIdRoute, DELETE as deleteSiteRoute } from '../src/app/api/sites/[id]/route';
import { POST as createObservationRoute } from '../src/app/api/observations/route';
import { POST as compareRoute } from '../src/app/api/compare/route';
import { POST as interpretRoute } from '../src/app/api/interpret/route';
import { GET as getUploadRoute } from '../src/app/api/uploads/[filename]/route';
import { GET as getSeedStatus, POST as seedActionRoute } from '../src/app/api/seed/route';
import { resetToSeedData, getAllSites, getSiteById, UPLOADS_DIR, getDatabase } from '../src/lib/storage/db';
import { AIInterpretationSchema } from '../src/lib/ai/schema';

const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'images');

async function runApiIntegrationTests() {
  console.log('🌐 Starting WildTrace API & Security Integration Automated Tests...\n');

  let passed = 0;
  let failed = 0;

  async function testCase(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // Baseline reset & disable file handle cache on Windows
  sharp.cache(false);
  resetToSeedData();

  // 1. Sites API - GET all sites
  await testCase('GET /api/sites returns initial demonstration sites', async () => {
    const res = await getSites();
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.sites));
    assert.strictEqual(data.sites.length, 2);
  });

  // 2. Sites API - Input Validation Failures
  await testCase('POST /api/sites rejects missing name', async () => {
    const req = new NextRequest('http://localhost:3000/api/sites', {
      method: 'POST',
      body: JSON.stringify({ habitatType: 'moss_rock' }),
    });
    const res = await createSiteRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Site name is required'));
  });

  await testCase('POST /api/sites rejects whitespace-only name', async () => {
    const req = new NextRequest('http://localhost:3000/api/sites', {
      method: 'POST',
      body: JSON.stringify({ name: '    ', habitatType: 'moss_rock' }),
    });
    const res = await createSiteRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await testCase('POST /api/sites rejects invalid habitat type', async () => {
    const req = new NextRequest('http://localhost:3000/api/sites', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alien Bioquadrant', habitatType: 'extraterrestrial_biome' }),
    });
    const res = await createSiteRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Invalid habitat type'));
  });

  await testCase('POST /api/sites rejects out-of-bounds coordinates', async () => {
    const req = new NextRequest('http://localhost:3000/api/sites', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid Coordinates Site',
        habitatType: 'moss_rock',
        latitude: 195.4, // invalid lat > 90
        longitude: 45.2,
      }),
    });
    const res = await createSiteRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Latitude must be a valid number between -90 and 90'));
  });

  // 3. Sites API - Valid Site Creation & Privacy Coordinate Fuzzing
  let testSiteId = '';
  await testCase('POST /api/sites creates valid site with coordinate fuzzing', async () => {
    const req = new NextRequest('http://localhost:3000/api/sites', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Oak Trunk Quadrant Alpha',
        habitatType: 'tree_bark',
        description: 'North-facing mossy crevice on heritage English Oak.',
        latitude: 37.7749295, // High precision
        longitude: -122.4194155, // High precision
        locationLabel: 'Presidio Grove',
      }),
    });
    const res = await createSiteRoute(req);
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.site.id);
    testSiteId = data.site.id;

    // Verify coordinates are fuzzed to 2 decimal places (~1.1 km precision)
    assert.strictEqual(data.site.latitude, 37.77);
    assert.strictEqual(data.site.longitude, -122.42);
  });

  // 4. Sites API - GET /api/sites/[id]
  await testCase('GET /api/sites/[id] returns created site details', async () => {
    const req = new NextRequest(`http://localhost:3000/api/sites/${testSiteId}`);
    const res = await getSiteByIdRoute(req, { params: Promise.resolve({ id: testSiteId }) });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.site.id, testSiteId);
  });

  await testCase('GET /api/sites/[id] returns 404 for nonexistent ID', async () => {
    const req = new NextRequest('http://localhost:3000/api/sites/nonexistent-999');
    const res = await getSiteByIdRoute(req, { params: Promise.resolve({ id: 'nonexistent-999' }) });
    assert.strictEqual(res.status, 404);
  });

  // 5. Observations API - Upload & Validation
  let obs1Id = '';
  let obs2Id = '';

  await testCase('POST /api/observations rejects nonexistent siteId without saving files', async () => {
    const beforeFiles = fs.readdirSync(UPLOADS_DIR).length;
    const formData = new FormData();
    formData.append('siteId', 'nonexistent-site-id');
    const fakeFile = new Blob([fs.readFileSync(path.join(FIXTURES_DIR, '01_baseline.png'))], { type: 'image/png' });
    formData.append('image', fakeFile, 'photo.png');

    const req = new NextRequest('http://localhost:3000/api/observations', {
      method: 'POST',
      body: formData,
    });
    const res = await createObservationRoute(req);
    assert.strictEqual(res.status, 404);

    // Verify no orphan files were left on disk
    const afterFiles = fs.readdirSync(UPLOADS_DIR).length;
    assert.strictEqual(beforeFiles, afterFiles, 'No orphan files should remain on disk when site validation fails');
  });

  await testCase('POST /api/observations rejects corrupted image bytes', async () => {
    const formData = new FormData();
    formData.append('siteId', testSiteId);
    const badFile = new Blob([fs.readFileSync(path.join(FIXTURES_DIR, '14_corrupted_bad_bytes.png'))], { type: 'image/png' });
    formData.append('image', badFile, 'bad.png');

    const req = new NextRequest('http://localhost:3000/api/observations', {
      method: 'POST',
      body: formData,
    });
    const res = await createObservationRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await testCase('POST /api/observations rejects path traversal in JSON imageData', async () => {
    const req = new NextRequest('http://localhost:3000/api/observations', {
      method: 'POST',
      body: JSON.stringify({
        siteId: testSiteId,
        imageData: '../../../../etc/passwd',
      }),
    });
    const res = await createObservationRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Prohibited or unsafe image path'));
  });

  await testCase('POST /api/observations rejects files exceeding 10MB', async () => {
    const formData = new FormData();
    formData.append('siteId', testSiteId);
    // Create oversized mock Blob (> 10MB)
    const bigBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'image/jpeg' });
    formData.append('image', bigBlob, 'giant.jpg');

    const req = new NextRequest('http://localhost:3000/api/observations', {
      method: 'POST',
      body: formData,
    });
    const res = await createObservationRoute(req);
    assert.strictEqual(res.status, 413);
  });

  await testCase('POST /api/observations successfully uploads baseline image and sanitizes EXIF', async () => {
    // Generate a test JPEG with fake EXIF GPS metadata
    const testJpg = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 50, g: 120, b: 50 } },
    })
      .jpeg()
      .toBuffer();

    const formData = new FormData();
    formData.append('siteId', testSiteId);
    formData.append('weatherNotes', 'Dry sunny afternoon, 21°C');
    formData.append('fieldNotes', 'Initial baseline photograph of bark crevice.');
    formData.append('image', new Blob([testJpg], { type: 'image/jpeg' }), 'baseline.jpg');

    const req = new NextRequest('http://localhost:3000/api/observations', {
      method: 'POST',
      body: formData,
    });
    const res = await createObservationRoute(req);
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.observation.id);
    obs1Id = data.observation.id;

    // Verify output file exists on disk and is WebP format without EXIF GPS
    const filename = path.basename(data.observation.imagePath);
    const storedPath = path.join(UPLOADS_DIR, filename);
    assert.ok(fs.existsSync(storedPath), 'Stored WebP image file must exist on disk');

    // Read buffer first to avoid Windows libvips file descriptor lock
    const fileBuf = fs.readFileSync(storedPath);
    const meta = await sharp(fileBuf).metadata();
    assert.strictEqual(meta.format, 'webp', 'Image should be converted to WebP');
    assert.strictEqual(meta.exif, undefined, 'EXIF metadata must be stripped from stored file');
  });

  await testCase('POST /api/observations records second visit observation', async () => {
    const greenerFile = fs.readFileSync(path.join(FIXTURES_DIR, '03_slightly_greener.png'));
    const formData = new FormData();
    formData.append('siteId', testSiteId);
    formData.append('weatherNotes', 'Post-rain drizzle, 14°C');
    formData.append('fieldNotes', 'Moss appears visibly greener and hydrated.');
    formData.append('image', new Blob([greenerFile], { type: 'image/png' }), 'revisit.png');

    const req = new NextRequest('http://localhost:3000/api/observations', {
      method: 'POST',
      body: formData,
    });
    const res = await createObservationRoute(req);
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    obs2Id = data.observation.id;
  });

  // 6. Compare API
  let comparisonPairId = '';
  await testCase('POST /api/compare rejects same observation comparison', async () => {
    const req = new NextRequest('http://localhost:3000/api/compare', {
      method: 'POST',
      body: JSON.stringify({ baselineObservationId: obs1Id, targetObservationId: obs1Id }),
    });
    const res = await compareRoute(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Cannot compare an observation against itself'));
  });

  await testCase('POST /api/compare computes genuine visual comparison and caches result', async () => {
    const req = new NextRequest('http://localhost:3000/api/compare', {
      method: 'POST',
      body: JSON.stringify({ baselineObservationId: obs1Id, targetObservationId: obs2Id }),
    });
    const res = await compareRoute(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.cached, false);
    assert.ok(data.comparison.id);
    comparisonPairId = data.comparison.id;

    // Verify subsequent call hits cache
    const req2 = new NextRequest('http://localhost:3000/api/compare', {
      method: 'POST',
      body: JSON.stringify({ baselineObservationId: obs1Id, targetObservationId: obs2Id }),
    });
    const res2 = await compareRoute(req2);
    const data2 = await res2.json();
    assert.strictEqual(data2.cached, true);
    assert.strictEqual(data2.comparison.id, comparisonPairId);
  });

  // 7. Interpret API & Deterministic Fallback
  await testCase('POST /api/interpret generates grounded AI interpretation with Zod schema validation', async () => {
    const req = new NextRequest('http://localhost:3000/api/interpret', {
      method: 'POST',
      body: JSON.stringify({ comparisonPairId }),
    });
    const res = await interpretRoute(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.interpretation.id);

    // Validate structured fields
    const validated = AIInterpretationSchema.parse({
      observed_changes: data.interpretation.observedChanges,
      ecological_hypotheses: data.interpretation.ecologicalHypotheses,
      uncertainties: data.interpretation.uncertainties,
      next_visit_prompt: data.interpretation.nextVisitPrompt,
    });
    assert.ok(validated.observed_changes.length >= 1);
    assert.ok(validated.ecological_hypotheses.length >= 1);
    assert.ok(validated.uncertainties.length >= 1);
    assert.ok(validated.next_visit_prompt.includes('Touch Grass Mission'));
  });

  // 8. Uploads Serving API & Path Traversal Guards
  await testCase('GET /api/uploads/[filename] serves valid uploaded file', async () => {
    const db = getDatabase();
    const obs = db.observations.find((o) => o.id === obs1Id);
    assert.ok(obs);
    const filename = path.basename(obs.imagePath);

    const req = new NextRequest(`http://localhost:3000/api/uploads/${filename}`);
    const res = await getUploadRoute(req, { params: Promise.resolve({ filename }) });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'image/webp');
    assert.strictEqual(res.headers.get('X-Content-Type-Options'), 'nosniff');
  });

  await testCase('GET /api/uploads/[filename] rejects path traversal and directories', async () => {
    const reqDot = new NextRequest('http://localhost:3000/api/uploads/.');
    const resDot = await getUploadRoute(reqDot, { params: Promise.resolve({ filename: '.' }) });
    assert.strictEqual(resDot.status, 404);

    const reqTraversal = new NextRequest('http://localhost:3000/api/uploads/..%2Fpackage.json');
    const resTraversal = await getUploadRoute(reqTraversal, { params: Promise.resolve({ filename: '../../package.json' }) });
    assert.strictEqual(resTraversal.status, 404);
  });

  // 9. Deleting Site - Cascading Observations & Upload File Cleanup
  await testCase('DELETE /api/sites/[id] protects demonstration sites', async () => {
    const db = getDatabase();
    const demoSite = db.sites.find((s) => s.isDemoSite);
    assert.ok(demoSite);

    const req = new NextRequest(`http://localhost:3000/api/sites/${demoSite.id}`, { method: 'DELETE' });
    const res = await deleteSiteRoute(req, { params: Promise.resolve({ id: demoSite.id }) });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Demonstration sites cannot be deleted'));
  });

  await testCase('DELETE /api/sites/[id] permanently deletes user site, observations, and image files', async () => {
    const dbBefore = getDatabase();
    const obsToDelete = dbBefore.observations.filter((o) => o.siteId === testSiteId);
    assert.ok(obsToDelete.length >= 2, 'Should have recorded observations to delete');

    // Store filenames that should be removed
    const filesToDelete = obsToDelete
      .map((o) => path.join(UPLOADS_DIR, path.basename(o.imagePath)))
      .filter((p) => fs.existsSync(p));

    assert.ok(filesToDelete.length >= 1, 'Should have at least one upload file on disk');

    const req = new NextRequest(`http://localhost:3000/api/sites/${testSiteId}`, { method: 'DELETE' });
    const res = await deleteSiteRoute(req, { params: Promise.resolve({ id: testSiteId }) });
    assert.strictEqual(res.status, 200);

    // Verify site is gone from database
    const dbAfter = getDatabase();
    assert.strictEqual(dbAfter.sites.some((s) => s.id === testSiteId), false, 'Site must be removed from DB');
    assert.strictEqual(dbAfter.observations.some((o) => o.siteId === testSiteId), false, 'Observations must be removed');
    assert.strictEqual(dbAfter.comparisons.some((c) => c.siteId === testSiteId), false, 'Comparisons must be removed');

    // Verify files on disk were cleaned up
    for (const filePath of filesToDelete) {
      assert.strictEqual(fs.existsSync(filePath), false, `Uploaded image file must be deleted from disk: ${filePath}`);
    }
  });

  // 10. Seed Status & Reset
  await testCase('GET /api/seed returns accurate record counts', async () => {
    const res = await getSeedStatus();
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.totalSites, 2);
  });

  await testCase('POST /api/seed resets cleanly to demonstration data', async () => {
    const req = new NextRequest('http://localhost:3000/api/seed', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset' }),
    });
    const res = await seedActionRoute(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  console.log(`\nAPI Integration Test Summary: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runApiIntegrationTests().catch((err) => {
  console.error('Fatal API integration test error:', err);
  process.exit(1);
});
