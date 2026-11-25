import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findStoredFile } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ fileId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { fileId } = await params;

    const doc = await prisma.applicationDocument.findUnique({
      where: { id: fileId },
    });

    if (!doc) {
      return new NextResponse('Dokumen tidak ditemukan', { status: 404 });
    }

    const safeStoredFilename = path.basename(doc.storedFilename || doc.filePath);
    const resolvedPath = findStoredFile(doc.applicationId, safeStoredFilename);

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return new NextResponse('File fisik dokumen tidak ditemukan di server storage', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.originalFilename)}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Terjadi kesalahan saat memuat berkas', { status: 500 });
  }
}
