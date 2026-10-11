import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const MOSS_FOLDER = path.join(process.cwd(), 'MossImages');

async function seedAuthenticHabitat() {
  console.log('Seeding authentic moss demonstration habitat...');

  // Check if it already exists
  const sitesRes = await fetch(`${BASE_URL}/api/sites`);
  const sitesData = await sitesRes.json();
  const existing = sitesData.sites?.find((s: any) => s.name === 'Granite Boulder Bryophyte Study');
  if (existing) {
    console.log(`Authentic moss habitat already exists (ID: ${existing.id}).`);
    return existing.id;
  }

  // 1. Create habitat site
  const createSiteRes = await fetch(`${BASE_URL}/api/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Granite Boulder Bryophyte Study',
      habitatType: 'moss_rock',
      description: 'Longitudinal micro-habitat study tracking natural bryophyte coverage and hydration dynamics across a 14-day sequence on a north-facing granite rock face using authentic handheld photography.',
      latitude: 51.44,
      longitude: -0.27,
      locationLabel: 'Richmond Park Woodland Outcrop',
    }),
  });

  const siteData = await createSiteRes.json();
  if (!siteData.success) throw new Error(`Failed to create site: ${JSON.stringify(siteData)}`);
  const siteId = siteData.site.id;
  console.log(`Created site: ${siteId}`);

  // 2. Upload observations
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

  const observationIds: string[] = [];

  for (const item of imageMap) {
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

    const obsRes = await fetch(`${BASE_URL}/api/observations`, {
      method: 'POST',
      body: formData,
    });
    const obsData = await obsRes.json();
    if (!obsData.success) throw new Error(`Failed to upload ${item.file}: ${JSON.stringify(obsData)}`);
    observationIds.push(obsData.observation.id);
    console.log(`Uploaded observation ${item.stage} -> ID: ${obsData.observation.id}`);
  }

  // 3. Pre-compute comparisons
  const pairs = [
    { name: 'Day 1 vs Day 7', a: observationIds[0], b: observationIds[1] },
    { name: 'Day 7 vs Day 14', a: observationIds[1], b: observationIds[2] },
    { name: 'Day 1 vs Day 14', a: observationIds[0], b: observationIds[2] },
  ];

  for (const p of pairs) {
    const cmpRes = await fetch(`${BASE_URL}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baselineObservationId: p.a,
        targetObservationId: p.b,
      }),
    });
    const cmpData = await cmpRes.json();
    console.log(`Computed comparison ${p.name} -> ID: ${cmpData.comparison?.id}`);

    if (cmpData.comparison?.id) {
      // Trigger interpretation
      const interpRes = await fetch(`${BASE_URL}/api/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comparisonPairId: cmpData.comparison.id,
        }),
      });
      const interpData = await interpRes.json();
      console.log(`Generated interpretation for ${p.name} -> Model: ${interpData.interpretation?.modelIdentifier}`);
    }
  }

  console.log(`Authentic moss habitat seeded successfully! Site ID: ${siteId}`);
  return siteId;
}

seedAuthenticHabitat().catch((err) => {
  console.error('Error seeding habitat:', err);
  process.exit(1);
});
