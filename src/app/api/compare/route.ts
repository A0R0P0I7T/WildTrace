import { NextRequest, NextResponse } from 'next/server';
import { getObservationById, getSiteById, saveComparison, getComparisonByPair } from '@/lib/storage/db';
import { computeImageComparison } from '@/lib/vision/diffEngine';

export async function POST(req: NextRequest) {
  try {
    const { baselineObservationId, targetObservationId } = await req.json();

    if (!baselineObservationId || !targetObservationId) {
      return NextResponse.json(
        { success: false, error: 'Both baseline and target observation IDs are required.' },
        { status: 400 }
      );
    }

    if (baselineObservationId === targetObservationId) {
      return NextResponse.json(
        { success: false, error: 'Cannot compare an observation against itself.' },
        { status: 400 }
      );
    }

    const obs1 = getObservationById(baselineObservationId);
    const obs2 = getObservationById(targetObservationId);

    if (!obs1 || !obs2) {
      return NextResponse.json(
        { success: false, error: 'One or both observations could not be found.' },
        { status: 404 }
      );
    }

    if (obs1.siteId !== obs2.siteId) {
      return NextResponse.json(
        { success: false, error: 'Observations must belong to the same micro-habitat site.' },
        { status: 400 }
      );
    }

    // Check if we already have a cached comparison
    const existing = getComparisonByPair(baselineObservationId, targetObservationId);
    if (existing) {
      return NextResponse.json({ success: true, comparison: existing, cached: true });
    }

    // Compute genuine visual comparison
    const diffMetrics = await computeImageComparison(obs1.imagePath, obs2.imagePath);

    const saved = saveComparison({
      siteId: obs1.siteId,
      baselineObservationId,
      targetObservationId,
      ...diffMetrics,
    });

    return NextResponse.json({ success: true, comparison: saved, cached: false });
  } catch (error: any) {
    console.error('Error running image comparison:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Comparison calculation failed' },
      { status: 500 }
    );
  }
}
