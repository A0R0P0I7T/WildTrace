import { NextRequest, NextResponse } from 'next/server';
import { resetToSeedData, purgeAllData, getDatabase } from '@/lib/storage/db';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    success: true,
    totalSites: db.sites.length,
    totalObservations: db.observations.length,
    totalComparisons: db.comparisons.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Protect destructive administrative operations in production environments
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED_RESET !== 'true') {
      const authHeader = req.headers.get('authorization');
      const adminSecret = process.env.ADMIN_SECRET;
      if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Administrative operations are restricted in production. Provide a valid Authorization Bearer token or set ALLOW_SEED_RESET=true.',
          },
          { status: 403 }
        );
      }
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Malformed JSON payload.' }, { status: 400 });
    }

    const { action } = body;

    if (action === 'reset') {
      const data = resetToSeedData();
      return NextResponse.json({ success: true, message: 'Database reset to demonstration dataset', data });
    }

    if (action === 'purge') {
      const data = purgeAllData();
      return NextResponse.json({ success: true, message: 'All sites and observations purged', data });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Use reset or purge.' }, { status: 400 });
  } catch (error) {
    console.error('Error handling seed action:', error);
    return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
  }
}
