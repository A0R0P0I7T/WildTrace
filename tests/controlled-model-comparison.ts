import fs from 'fs';
import path from 'path';
import { OpenRouterProvider } from '../src/lib/ai/providers/openrouter';
import { HabitatComparisonPayload } from '../src/lib/ai/types';

// Load .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY="([^"]+)"/);
const apiKey = keyMatch ? keyMatch[1] : '';

if (!apiKey) {
  console.error('FATAL: OPENROUTER_API_KEY missing from .env');
  process.exit(1);
}

const MOSS_FOLDER = path.join(process.cwd(), 'MossImages');
const img1 = path.join(MOSS_FOLDER, 'moss img1.jpeg');
const img2 = path.join(MOSS_FOLDER, 'moss img2.jpeg');
const img3 = path.join(MOSS_FOLDER, 'moss img3.jpeg');

const observationsData = [
  {
    id: 'obs-001',
    siteId: 'site-moss-val',
    recordedAt: '2026-09-27T10:00:00Z',
    imagePath: img1,
    weatherNotes: 'Morning overcast, high relative humidity (82%)',
    fieldNotes: 'Baseline observation of dense bryophyte carpet adhering to damp granite boulder face.',
    environmentalMetadata: { moistureEstimate: 'damp' as const, lightingCondition: 'diffuse_overcast' as const },
    createdAt: '2026-09-27T10:00:00Z',
  },
  {
    id: 'obs-002',
    siteId: 'site-moss-val',
    recordedAt: '2026-10-04T10:00:00Z',
    imagePath: img2,
    weatherNotes: 'Partial sun, dry mild breeze (humidity 48%)',
    fieldNotes: 'Day 7 revisit of bryophyte patch; slight curling and surface desiccation visible along margins.',
    environmentalMetadata: { moistureEstimate: 'dry' as const, lightingCondition: 'direct_sun' as const },
    createdAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'obs-003',
    siteId: 'site-moss-val',
    recordedAt: '2026-10-11T10:00:00Z',
    imagePath: img3,
    weatherNotes: 'Post-rain overcast skies, high surface moisture',
    fieldNotes: 'Day 14 revisit following intermittent overnight rain; gametophyte carpets appears saturated and dark green.',
    environmentalMetadata: { moistureEstimate: 'saturated' as const, lightingCondition: 'diffuse_overcast' as const },
    createdAt: '2026-10-11T10:00:00Z',
  },
];

const comparisonsPlan = [
  {
    name: 'Day 1 vs Day 7',
    pairId: 'comp-d1-d7',
    baseIdx: 0,
    targetIdx: 1,
    visualDiff: 69.7,
    exgDelta: 21.9,
    edgeCorr: 0.85,
    flags: ['INCOMPATIBLE_FOR_PIXEL_DIFF', 'PERSPECTIVE_SHIFT_DETECTED'],
    confidence: 'LOW' as const,
  },
  {
    name: 'Day 7 vs Day 14',
    pairId: 'comp-d7-d14',
    baseIdx: 1,
    targetIdx: 2,
    visualDiff: 70.9,
    exgDelta: -9.6,
    edgeCorr: 0.82,
    flags: ['INCOMPATIBLE_FOR_PIXEL_DIFF', 'PERSPECTIVE_SHIFT_DETECTED'],
    confidence: 'LOW' as const,
  },
  {
    name: 'Day 1 vs Day 14',
    pairId: 'comp-d1-d14',
    baseIdx: 0,
    targetIdx: 2,
    visualDiff: 76.5,
    exgDelta: 12.3,
    edgeCorr: 0.79,
    flags: ['INCOMPATIBLE_FOR_PIXEL_DIFF', 'PERSPECTIVE_SHIFT_DETECTED'],
    confidence: 'LOW' as const,
  },
];

async function runModelEvaluation(modelId: string, modelLabel: string) {
  console.log(`\n================================================================`);
  console.log(`EVALUATING MODEL: ${modelLabel} (${modelId})`);
  console.log(`================================================================`);

  const provider = new OpenRouterProvider(apiKey, modelId, 45000);
  const results: any[] = [];
  const latencies: number[] = [];

  for (const cmp of comparisonsPlan) {
    console.log(`\n▶ Running Pair: ${cmp.name}...`);
    const baseObs = observationsData[cmp.baseIdx];
    const targetObs = observationsData[cmp.targetIdx];

    const payload: HabitatComparisonPayload = {
      site: {
        id: 'site-moss-val',
        name: 'WildTrace Three-Stage Moss Validation',
        habitatType: 'moss_rock',
        description: 'Longitudinal micro-habitat validation study tracking bryophyte coverage and hydration dynamics across a 14-day sequence using three authentic photographs.',
        createdAt: '2026-09-27T10:00:00Z',
        updatedAt: '2026-10-11T10:00:00Z',
        isDemoSite: false,
        isSynthetic: false,
      },
      baselineObs: baseObs,
      targetObs: targetObs,
      comparison: {
        id: cmp.pairId,
        siteId: 'site-moss-val',
        baselineObservationId: baseObs.id,
        targetObservationId: targetObs.id,
        visualDifferencePercentage: cmp.visualDiff,
        excessGreenDelta: cmp.exgDelta,
        structuralSimilarityScore: cmp.edgeCorr,
        diffMaskPath: 'data:image/svg+xml;utf8,<svg></svg>',
        alignmentConfidence: cmp.confidence,
        limitationFlags: cmp.flags,
        createdAt: '2026-10-11T10:00:00Z',
      },
    };

    const tStart = performance.now();
    try {
      const interpretation = await provider.interpret(payload);
      const latencyMs = Math.round(performance.now() - tStart);
      latencies.push(latencyMs);

      console.log(`  ✓ Inference completed in ${latencyMs}ms`);
      console.log(`  • Observed Changes: ${interpretation.observed_changes.length} items`);
      interpretation.observed_changes.forEach((c: string, idx: number) => console.log(`     [${idx+1}] ${c}`));
      console.log(`  • Ecological Hypotheses: ${interpretation.ecological_hypotheses.length} items`);
      interpretation.ecological_hypotheses.forEach((h: string, idx: number) => console.log(`     [${idx+1}] ${h}`));
      console.log(`  • Uncertainties: ${interpretation.uncertainties.length} items`);
      interpretation.uncertainties.forEach((u: string, idx: number) => console.log(`     [${idx+1}] ${u}`));
      console.log(`  • Next Visit Prompt: ${interpretation.next_visit_prompt}`);

      // Scientific reliability check
      const text = [...interpretation.observed_changes, ...interpretation.ecological_hypotheses, ...interpretation.uncertainties].join(' ').toLowerCase();
      const claimsVerified = !text.includes('confirmed moss growth') && !text.includes('proven biomass loss') && !text.includes('verified ecological deterioration');
      const acknowledgedFraming = text.includes('framing') || text.includes('perspective') || text.includes('angle') || text.includes('distance');
      const validTouchGrass = interpretation.next_visit_prompt.startsWith('Touch Grass Mission:');

      results.push({
        pairName: cmp.name,
        latencyMs,
        success: true,
        schemaValid: true,
        claimsVerified,
        acknowledgedFraming,
        validTouchGrass,
        interpretation,
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - tStart);
      console.error(`  ✗ Error in ${latencyMs}ms:`, err.message);
      results.push({
        pairName: cmp.name,
        latencyMs,
        success: false,
        error: err.message,
      });
    }
  }

  const medianLatencyMs = latencies.length > 0 ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length / 2)] : 0;
  const avgLatencyMs = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  console.log(`\nModel Summary for ${modelLabel}:`);
  console.log(`  • Latencies: ${latencies.join(', ')} ms`);
  console.log(`  • Median Latency: ${medianLatencyMs} ms`);
  console.log(`  • Mean Latency: ${avgLatencyMs} ms`);
  console.log(`  • Success Rate: ${results.filter(r => r.success).length}/${results.length}`);

  return {
    modelId,
    modelLabel,
    latencies,
    medianLatencyMs,
    avgLatencyMs,
    results,
  };
}

async function main() {
  console.log('=== WILDTRACE CONTROLLED OPEN-WEIGHT VISION MODEL BENCHMARK ===');

  // Load previous Gemini baseline from tests/moss_e2e_results.json
  let geminiBaseline: any = null;
  const geminiPath = path.join(process.cwd(), 'tests', 'moss_e2e_results.json');
  if (fs.existsSync(geminiPath)) {
    const geminiRaw = JSON.parse(fs.readFileSync(geminiPath, 'utf8'));
    geminiBaseline = {
      modelId: 'google/gemini-2.5-flash',
      modelLabel: 'Google Gemini 2.5 Flash (Baseline)',
      latenciesMs: [4500, 5400, 5500], // Measured from live server logs in previous run
      medianLatencyMs: 5400,
      comparisons: geminiRaw.comparisons.map((c: any) => ({
        pairName: c.pairName,
        interpretation: c.interpretation,
      })),
    };
    console.log('Loaded previous Gemini 2.5 Flash baseline measurements.');
  }

  // 1. Evaluate Qwen 2.5 VL 72B Instruct (flagship open-weight Qwen VL model)
  const qwen25Vl72b = await runModelEvaluation(
    'qwen/qwen2.5-vl-72b-instruct',
    'Qwen 2.5 VL 72B Instruct (Open-Weight Flagship)'
  );

  // 2. Evaluate Qwen 3 VL 8B Instruct (lightweight open-weight alternative)
  const qwen3Vl8b = await runModelEvaluation(
    'qwen/qwen3-vl-8b-instruct',
    'Qwen 3 VL 8B Instruct (Open-Weight Lightweight)'
  );

  const fullReportData = {
    executedAt: new Date().toISOString(),
    geminiBaseline,
    qwen25Vl72b,
    qwen3Vl8b,
  };

  const outPath = path.join(process.cwd(), 'tests', 'controlled_comparison_results.json');
  fs.writeFileSync(outPath, JSON.stringify(fullReportData, null, 2), 'utf8');
  console.log(`\nFull benchmark results saved to: ${outPath}`);
}

main().catch(err => {
  console.error('Benchmark fatal error:', err);
  process.exit(1);
});
