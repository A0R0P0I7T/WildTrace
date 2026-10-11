import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createObservation, getSiteById, UPLOADS_DIR } from '@/lib/storage/db';
import { EnvironmentalMetadata } from '@/types';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  let createdFilePath: string | null = null;
  try {
    const contentType = req.headers.get('content-type') || '';
    let siteId = '';
    let weatherNotes = '';
    let fieldNotes = '';
    let recordedAt = new Date().toISOString();
    let environmentalMetadata: EnvironmentalMetadata = {};
    let imagePath = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      siteId = ((formData.get('siteId') as string) || '').trim();
      weatherNotes = (formData.get('weatherNotes') as string) || 'Standard field conditions';
      fieldNotes = (formData.get('fieldNotes') as string) || '';
      const recordedAtRaw = formData.get('recordedAt') as string;
      if (recordedAtRaw) recordedAt = recordedAtRaw;

      const metaRaw = formData.get('environmentalMetadata') as string;
      if (metaRaw) {
        try {
          environmentalMetadata = JSON.parse(metaRaw);
        } catch {
          // ignore malformed metadata
        }
      }

      // 1. Verify Site ID before writing any files
      if (!siteId) {
        return NextResponse.json({ success: false, error: 'Site ID is required.' }, { status: 400 });
      }
      const site = getSiteById(siteId);
      if (!site) {
        return NextResponse.json({ success: false, error: 'Associated micro-habitat site not found.' }, { status: 404 });
      }

      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'Observation photo is required.' }, { status: 400 });
      }

      // 2. Validate file size
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Image file size exceeds maximum limit of 10MB.' },
          { status: 413 }
        );
      }

      // 3. Validate MIME type if present
      if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, error: `Unsupported image format (${file.type}). Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (buffer.length === 0) {
        return NextResponse.json({ success: false, error: 'Image file is empty.' }, { status: 400 });
      }

      // 4. Process, optimize, and strip EXIF metadata using Sharp
      const filename = `obs-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
      const outputPath = path.join(UPLOADS_DIR, filename);

      try {
        await sharp(buffer)
          .rotate() // auto-orient based on EXIF before stripping
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);
      } catch (sharpErr: any) {
        return NextResponse.json(
          { success: false, error: `Invalid or corrupted image format. Please upload valid JPEG, PNG, or WebP: ${sharpErr.message}` },
          { status: 400 }
        );
      }

      createdFilePath = outputPath;
      imagePath = `/api/uploads/${filename}`;
    } else {
      // JSON payload
      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ success: false, error: 'Malformed JSON payload.' }, { status: 400 });
      }

      siteId = (body.siteId || '').toString().trim();
      weatherNotes = body.weatherNotes || 'Standard field conditions';
      fieldNotes = body.fieldNotes || '';
      if (body.recordedAt) recordedAt = body.recordedAt;
      if (body.environmentalMetadata) environmentalMetadata = body.environmentalMetadata;

      // 1. Verify Site ID before processing
      if (!siteId) {
        return NextResponse.json({ success: false, error: 'Site ID is required.' }, { status: 400 });
      }
      const site = getSiteById(siteId);
      if (!site) {
        return NextResponse.json({ success: false, error: 'Associated micro-habitat site not found.' }, { status: 404 });
      }

      if (!body.imageData) {
        return NextResponse.json({ success: false, error: 'Observation photo is required.' }, { status: 400 });
      }

      // If base64 data URI
      if (body.imageData.startsWith('data:image')) {
        const matches = body.imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const imageBuffer = Buffer.from(matches[2], 'base64');
          if (imageBuffer.length > MAX_IMAGE_SIZE_BYTES) {
            return NextResponse.json(
              { success: false, error: 'Image data exceeds maximum limit of 10MB.' },
              { status: 413 }
            );
          }

          const filename = `obs-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
          const outputPath = path.join(UPLOADS_DIR, filename);

          try {
            await sharp(imageBuffer)
              .rotate()
              .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 85 })
              .toFile(outputPath);
          } catch (sharpErr: any) {
            return NextResponse.json(
              { success: false, error: `Invalid or corrupted base64 image data: ${sharpErr.message}` },
              { status: 400 }
            );
          }

          createdFilePath = outputPath;
          imagePath = `/api/uploads/${filename}`;
        } else {
          // If SVG or plain data URI
          imagePath = body.imageData;
        }
      } else {
        const rawPath = String(body.imageData).trim();
        // Prevent path traversal and arbitrary system file access
        if (rawPath.includes('..') || (rawPath.startsWith('/') && !rawPath.startsWith('/api/uploads/'))) {
          return NextResponse.json(
            { success: false, error: 'Prohibited or unsafe image path.' },
            { status: 400 }
          );
        }
        imagePath = rawPath;
      }
    }

    // Validate date format
    if (isNaN(new Date(recordedAt).getTime())) {
      if (createdFilePath && fs.existsSync(createdFilePath)) {
        fs.unlinkSync(createdFilePath);
      }
      return NextResponse.json({ success: false, error: 'Invalid recordedAt timestamp.' }, { status: 400 });
    }

    // Validate notes lengths
    if (weatherNotes.length > 1000) {
      if (createdFilePath && fs.existsSync(createdFilePath)) fs.unlinkSync(createdFilePath);
      return NextResponse.json({ success: false, error: 'Weather notes must not exceed 1000 characters.' }, { status: 400 });
    }
    if (fieldNotes.length > 4000) {
      if (createdFilePath && fs.existsSync(createdFilePath)) fs.unlinkSync(createdFilePath);
      return NextResponse.json({ success: false, error: 'Field notes must not exceed 4000 characters.' }, { status: 400 });
    }

    const newObs = createObservation({
      siteId,
      recordedAt,
      imagePath,
      thumbnailPath: imagePath,
      weatherNotes: weatherNotes.trim(),
      fieldNotes: fieldNotes.trim(),
      environmentalMetadata,
    });

    return NextResponse.json({ success: true, observation: newObs }, { status: 201 });
  } catch (error: any) {
    // Clean up created file if anything failed
    if (createdFilePath && fs.existsSync(createdFilePath)) {
      try {
        fs.unlinkSync(createdFilePath);
      } catch (cleanupErr) {
        console.warn('Failed to clean up upload after error:', cleanupErr);
      }
    }
    console.error('Error creating observation:', error);
    return NextResponse.json({ success: false, error: 'Failed to record observation.' }, { status: 500 });
  }
}
