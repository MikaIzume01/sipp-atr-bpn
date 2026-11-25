import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sipp_officer_session');

    let officerName = 'Petugas Loket Verifikasi';
    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        if (parsed.nama) officerName = parsed.nama;
      } catch {
        // Fallback
      }
    }

    const {
      applicationId,
      actionType, // 'UPDATE_DOC' | 'CHANGE_STATUS'
      documentId,
      docStatus,
      docCatatan,
      newStatus,
      catatan,
      nomorSK,
    } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'ID Permohonan wajib disertakan.' },
        { status: 400 }
      );
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      return NextResponse.json(
        { success: false, message: 'Permohonan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Action 1: Update per-document verification
    if (actionType === 'UPDATE_DOC' && documentId) {
      const updatedDoc = await prisma.applicationDocument.update({
        where: { id: documentId },
        data: {
          statusVerifikasi: docStatus, // "VALID" | "TIDAK_VALID"
          catatanVerifikasi: docCatatan || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Status dokumen berhasil diperbarui.',
        document: updatedDoc,
      });
    }

    // Action 2: Change application milestone status
    if (actionType === 'CHANGE_STATUS' && newStatus) {
      const statusLama = app.status;

      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: {
            status: newStatus,
            catatanRevisi: newStatus === 'PERLU_REVISI' ? catatan : app.catatanRevisi,
            nomorSK: nomorSK || app.nomorSK,
            tanggalSelesai: newStatus === 'SELESAI' ? new Date() : app.tanggalSelesai,
          },
        });

        await tx.applicationLog.create({
          data: {
            applicationId: app.id,
            statusLama,
            statusBaru: newStatus,
            aktor: 'PETUGAS',
            namaPetugas: officerName,
            catatan: catatan || `Status permohonan diubah menjadi ${newStatus}.`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Status permohonan berhasil diperbarui menjadi ${newStatus}.`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Aksi verifikasi tidak valid.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in verifikasi API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses verifikasi.' },
      { status: 500 }
    );
  }
}
