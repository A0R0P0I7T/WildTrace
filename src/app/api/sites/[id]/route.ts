import { NextRequest, NextResponse } from 'next/server';
import { getSiteById, getObservationsBySiteId, getDatabase, deleteSite } from '@/lib/storage/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = getSiteById(id);

    if (!site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }

    const observations = getObservationsBySiteId(id);
    const db = getDatabase();
    const siteComparisons = db.comparisons.filter((c) => c.siteId === id);

    return NextResponse.json({
      success: true,
      site,
      observations,
      comparisons: siteComparisons,
    });
  } catch (error) {
    console.error('Error fetching site details:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch site details' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = getSiteById(id);

    if (!site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }

    if (site.isDemoSite) {
      return NextResponse.json(
        { success: false, error: 'Demonstration sites cannot be deleted. They can be reset using the seed reset function.' },
        { status: 403 }
      );
    }

    const deleted = deleteSite(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete site' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Micro-habitat site and associated observations deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete site' }, { status: 500 });
  }
}
