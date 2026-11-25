import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUploadDir } from '@/lib/storage';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const applicationId = formData.get('applicationId') as string;
    const accessPin = formData.get('accessPin') as string;
    const documentId = formData.get('documentId') as string;
    const file = formData.get('file') as File | null;

    if (!applicationId || !accessPin || !documentId || !file) {
      return NextResponse.json(
        { success: false, message: 'Data permohonan, PIN, dan file perbaikan wajib disertakan.' },
        { status: 400 }
      );
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { dokumen: true },
    });

    if (!app || app.accessPin !== accessPin) {
      return NextResponse.json(
        { success: false, message: 'Nomor registrasi atau PIN keamanan tidak cocok.' },
        { status: 403 }
      );
    }

    const doc = app.dokumen.find((d) => d.id === documentId);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Dokumen yang akan diperbaiki tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Save replacement file
    const uploadDir = getUploadDir(app.id);

    const fileId = crypto.randomUUID();
    const safeStoredName = `REVISI_${fileId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetFilePath = path.join(uploadDir, safeStoredName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(targetFilePath, buffer);

    const relativePath = path.join('storage', 'uploads', app.id, safeStoredName);

    // Update document & application in transaction
    await prisma.$transaction(async (tx) => {
      await tx.applicationDocument.update({
        where: { id: doc.id },
        data: {
          originalFilename: file.name,
          storedFilename: safeStoredName,
          filePath: relativePath,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          statusVerifikasi: 'PENDING',
          catatanVerifikasi: null,
        },
      });

      await tx.application.update({
        where: { id: app.id },
        data: {
          status: 'DIAJUKAN',
          catatanRevisi: null,
        },
      });

      await tx.applicationLog.create({
        data: {
          applicationId: app.id,
          statusLama: 'PERLU_REVISI',
          statusBaru: 'DIAJUKAN',
          aktor: 'PEMOHON',
          catatan: `Pemohon telah mengunggah berkas perbaikan untuk dokumen: ${doc.originalFilename}. Permohonan dikembalikan ke antrean verifikasi loket.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Berkas perbaikan berhasil diunggah. Status permohonan telah diperbarui.',
    });
  } catch (error) {
    console.error('Error handling revision upload:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengunggah berkas perbaikan.' },
      { status: 500 }
    );
  }
}
