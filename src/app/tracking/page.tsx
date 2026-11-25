import React from 'react';
import { prisma } from '@/lib/prisma';
import TrackingViewer from '@/components/TrackingViewer';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ nomor?: string; pin?: string }>;
}

export default async function TrackingPage({ searchParams }: PageProps) {
  const { nomor = '', pin = '' } = await searchParams;

  let application = null;
  let errorMessage: string | null = null;

  if (nomor.trim()) {
    const cleanNomor = nomor.trim().toUpperCase();
    const cleanPin = pin.trim();

    const found = await prisma.application.findUnique({
      where: { nomorRegistrasi: cleanNomor },
      include: {
        service: true,
        dokumen: {
          include: { requirement: true },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!found) {
      errorMessage = 'Nomor registrasi tidak ditemukan dalam sistem.';
    } else if (cleanPin) {
      const isPinValid =
        found.accessPin === cleanPin ||
        (cleanPin.length === 4 && found.nikPemohon.endsWith(cleanPin));

      if (isPinValid) {
        application = {
          ...found,
          tanggalPengajuan: found.tanggalPengajuan.toISOString(),
          tanggalSelesai: found.tanggalSelesai ? found.tanggalSelesai.toISOString() : null,
          dokumen: found.dokumen.map((d) => ({
            ...d,
            createdAt: d.createdAt.toISOString(),
            updatedAt: d.updatedAt.toISOString(),
          })),
          logs: found.logs.map((l) => ({
            ...l,
            createdAt: l.createdAt.toISOString(),
          })),
        };
      } else {
        errorMessage = 'PIN Keamanan tidak sesuai. Masukkan 6 digit PIN atau 4 digit terakhir NIK.';
      }
    } else {
      errorMessage = 'PIN Keamanan wajib diisi untuk membuka berkas.';
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-6 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Header */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-1">
          <h1 className="text-lg font-bold text-slate-900">
            Lacak Status Permohonan Berkas
          </h1>
          <p className="text-xs text-slate-600">
            Pantau status verifikasi berkas warkah pertanahan secara mandiri.
          </p>
        </div>

        {/* Tracking Viewer & Form */}
        <TrackingViewer
          initialApplication={application}
          searchedNomor={nomor}
          searchedPin={pin}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
