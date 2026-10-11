import { NextRequest, NextResponse } from 'next/server';
import { getAllSites, createSite } from '@/lib/storage/db';
import { HabitatType } from '@/types';

const VALID_HABITAT_TYPES: HabitatType[] = [
  'tree_bark',
  'soil_bed',
  'grass_patch',
  'moss_rock',
  'water_edge',
  'garden_quadrant',
];

export async function GET() {
  try {
    const sites = getAllSites();
    return NextResponse.json({ success: true, sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON in request body' },
        { status: 400 }
      );
    }

    const { name, habitatType, description, latitude, longitude, locationLabel } = body;

    // Validate Name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Site name is required and cannot be empty or whitespace only.' },
        { status: 400 }
      );
    }
    if (name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Site name must not exceed 100 characters.' },
        { status: 400 }
      );
    }

    // Validate Habitat Type
    if (!habitatType || !VALID_HABITAT_TYPES.includes(habitatType as HabitatType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid habitat type '${habitatType}'. Valid types: ${VALID_HABITAT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate Description
    if (description && (typeof description !== 'string' || description.length > 2000)) {
      return NextResponse.json(
        { success: false, error: 'Description must not exceed 2000 characters.' },
        { status: 400 }
      );
    }

    // Validate and fuzz Latitude / Longitude
    let fuzzedLat: number | undefined = undefined;
    let fuzzedLng: number | undefined = undefined;

    if (latitude !== undefined && latitude !== null) {
      if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
        return NextResponse.json(
          { success: false, error: 'Latitude must be a valid number between -90 and 90.' },
          { status: 400 }
        );
      }
      fuzzedLat = Math.round(latitude * 100) / 100;
    }

    if (longitude !== undefined && longitude !== null) {
      if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { success: false, error: 'Longitude must be a valid number between -180 and 180.' },
          { status: 400 }
        );
      }
      fuzzedLng = Math.round(longitude * 100) / 100;
    }

    const newSite = createSite({
      name: name.trim(),
      habitatType: habitatType as HabitatType,
      description: description && typeof description === 'string' ? description.trim() : '',
      latitude: fuzzedLat,
      longitude: fuzzedLng,
      locationLabel: locationLabel && typeof locationLabel === 'string' ? locationLabel.trim().slice(0, 100) : 'Local Field Site',
      isDemoSite: false,
      isSynthetic: false,
    });

    return NextResponse.json({ success: true, site: newSite }, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ success: false, error: 'Failed to create site' }, { status: 500 });
  }
}
