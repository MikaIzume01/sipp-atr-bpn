import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OfficerVerificationWorkspace from '@/components/OfficerVerificationWorkspace';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PermohonanDetailPage({ params }: PageProps) {
  const { id } = await params;

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      service: true,
      dokumen: {
        include: { requirement: true },
        orderBy: { requirement: { urutan: 'asc' } },
      },
      logs: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!app) {
    notFound();
  }

  const serializedApp = {
    ...app,
    tanggalPengajuan: app.tanggalPengajuan.toISOString(),
    tanggalSelesai: app.tanggalSelesai ? app.tanggalSelesai.toISOString() : null,
    dokumen: app.dokumen.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
    logs: app.logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return <OfficerVerificationWorkspace app={serializedApp} />;
}
