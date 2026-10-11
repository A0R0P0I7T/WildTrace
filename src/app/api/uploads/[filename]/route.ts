import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename || filename === '.' || filename === '..') {
      return new NextResponse('File not found', { status: 404 });
    }

    // Prevent path traversal and confine strictly to UPLOADS_DIR
    const safeFilename = path.basename(filename);
    const resolvedPath = path.resolve(UPLOADS_DIR, safeFilename);
    const resolvedUploadsDir = path.resolve(UPLOADS_DIR);

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return new NextResponse('Access denied', { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const ext = path.extname(safeFilename).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('Error serving upload:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
