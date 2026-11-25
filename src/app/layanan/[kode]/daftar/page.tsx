import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ApplicationFormWizard from '@/components/ApplicationFormWizard';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ kode: string }>;
}

export default async function DaftarPermohonanPage({ params }: PageProps) {
  const { kode } = await params;

  const service = await prisma.service.findUnique({
    where: { kode },
    include: {
      persyaratan: {
        orderBy: { urutan: 'asc' },
      },
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-6 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href={`/layanan/${service.kode}`} className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Detail Layanan</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">{service.nama}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800">Formulir Pendaftaran</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono">
            {service.kategori}
          </span>
          <h1 className="text-lg font-bold text-slate-900">
            Formulir Permohonan: {service.nama}
          </h1>
          <p className="text-xs text-slate-600">
            Lengkapi data identitas pemohon, letak objek tanah, dan unggah pindaian warkah persyaratan.
          </p>
        </div>

        {/* Wizard */}
        <ApplicationFormWizard service={service} />
      </div>
    </div>
  );
}
