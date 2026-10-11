import fs from 'fs';
import path from 'path';
import { OpenRouterProvider } from '../src/lib/ai/providers/openrouter';
import { prepareImageAsDataUrl } from '../src/lib/ai/imageUtils';
import { HabitatComparisonPayload } from '../src/lib/ai/types';

// Load .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY="([^"]+)"/);
const apiKey = keyMatch ? keyMatch[1] : '';

async function testModel(modelId: string) {
  console.log(`\n======================================================`);
  console.log(`Testing Multimodal Inference with: ${modelId}`);
  console.log(`======================================================`);

  const MOSS_FOLDER = path.join(process.cwd(), 'MossImages');
  const img1Path = path.join(MOSS_FOLDER, 'moss img1.jpeg');
  const img2Path = path.join(MOSS_FOLDER, 'moss img2.jpeg');

  const payload: HabitatComparisonPayload = {
    site: {
      id: 'site-moss-val',
      name: 'WildTrace Three-Stage Moss Validation',
      habitatType: 'moss_rock',
      description: 'Longitudinal micro-habitat validation study tracking bryophyte coverage.',
      createdAt: '2026-09-27T10:00:00Z',
      updatedAt: '2026-10-04T10:00:00Z',
      isDemoSite: false,
      isSynthetic: false,
    },
    baselineObs: {
      id: 'obs-001',
      siteId: 'site-moss-val',
      recordedAt: '2026-09-27T10:00:00Z',
      imagePath: img1Path,
      weatherNotes: 'Morning overcast, high relative humidity (82%)',
      fieldNotes: 'Baseline observation of dense bryophyte carpet adhering to damp granite boulder face.',
      environmentalMetadata: { moistureEstimate: 'damp', lightingCondition: 'diffuse_overcast' },
      createdAt: '2026-09-27T10:00:00Z',
    },
    targetObs: {
      id: 'obs-002',
      siteId: 'site-moss-val',
      recordedAt: '2026-10-04T10:00:00Z',
      imagePath: img2Path,
      weatherNotes: 'Partial sun, dry mild breeze (humidity 48%)',
      fieldNotes: 'Day 7 revisit of bryophyte patch; slight curling and surface desiccation visible along margins.',
      environmentalMetadata: { moistureEstimate: 'dry', lightingCondition: 'direct_sun' },
      createdAt: '2026-10-04T10:00:00Z',
    },
    comparison: {
      id: 'comp-001',
      siteId: 'site-moss-val',
      baselineObservationId: 'obs-001',
      targetObservationId: 'obs-002',
      visualDifferencePercentage: 69.7,
      excessGreenDelta: 21.9,
      structuralSimilarityScore: 0.85,
      diffMaskPath: 'data:image/svg+xml;utf8,<svg></svg>',
      alignmentConfidence: 'LOW',
      limitationFlags: ['INCOMPATIBLE_FOR_PIXEL_DIFF', 'PERSPECTIVE_SHIFT_DETECTED'],
      createdAt: '2026-10-04T10:00:00Z',
    },
  };

  const provider = new OpenRouterProvider(apiKey, modelId, 30000);

  const t0 = performance.now();
  try {
    const interpretation = await provider.interpret(payload);
    const latencyMs = Math.round(performance.now() - t0);
    console.log(`✓ SUCCESS in ${latencyMs}ms!`);
    console.log('Model Identifier:', provider.name);
    console.log('Observed Changes:', interpretation.observed_changes);
    console.log('Ecological Hypotheses:', interpretation.ecological_hypotheses);
    console.log('Uncertainties:', interpretation.uncertainties);
    console.log('Next Visit Prompt:', interpretation.next_visit_prompt);
    return { success: true, latencyMs, interpretation };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - t0);
    console.error(`✗ FAILED after ${latencyMs}ms:`, err.message);
    return { success: false, latencyMs, error: err.message };
  }
}

async function run() {
  // Test qwen/qwen2.5-vl-72b-instruct and qwen/qwen3-vl-8b-instruct
  await testModel('qwen/qwen2.5-vl-72b-instruct');
  await testModel('qwen/qwen3-vl-8b-instruct');
}

run();
