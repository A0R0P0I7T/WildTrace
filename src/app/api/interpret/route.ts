import { NextRequest, NextResponse } from 'next/server';
import {
  getComparisonById,
  getObservationById,
  getSiteById,
  saveInterpretation,
  getInterpretationByComparisonId,
} from '@/lib/storage/db';
import { aiGateway } from '@/lib/ai/gateway';

export async function POST(req: NextRequest) {
  try {
    const { comparisonPairId, forceRefresh } = await req.json();

    if (!comparisonPairId) {
      return NextResponse.json(
        { success: false, error: 'Comparison pair ID is required.' },
        { status: 400 }
      );
    }

    const comparison = getComparisonById(comparisonPairId);
    if (!comparison) {
      return NextResponse.json(
        { success: false, error: 'Comparison record not found.' },
        { status: 404 }
      );
    }

    // Check cached interpretation
    if (!forceRefresh) {
      const existing = getInterpretationByComparisonId(comparisonPairId);
      if (existing) {
        return NextResponse.json({ success: true, interpretation: existing, cached: true });
      }
    }

    const site = getSiteById(comparison.siteId);
    const obs1 = getObservationById(comparison.baselineObservationId);
    const obs2 = getObservationById(comparison.targetObservationId);

    if (!site || !obs1 || !obs2) {
      return NextResponse.json(
        { success: false, error: 'Underlying site or observations not found.' },
        { status: 404 }
      );
    }

    // Call unified gateway
    const result = await aiGateway.generateInterpretation({
      site,
      baselineObs: obs1,
      targetObs: obs2,
      comparison,
    });

    const saved = saveInterpretation({
      comparisonPairId,
      modelIdentifier: result.modelIdentifier,
      observedChanges: result.data.observed_changes,
      ecologicalHypotheses: result.data.ecological_hypotheses,
      uncertainties: result.data.uncertainties,
      nextVisitPrompt: result.data.next_visit_prompt,
      isFallback: result.isFallback,
    });

    return NextResponse.json({ success: true, interpretation: saved, cached: false });
  } catch (error: any) {
    console.error('Error in interpretation route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Interpretation failed' },
      { status: 500 }
    );
  }
}
