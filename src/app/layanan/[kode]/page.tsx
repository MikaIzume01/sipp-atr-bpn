import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { 
  ChevronRight, 
  ArrowRight, 
  PenLine,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { ALL_DRIVE_FILES } from '@/lib/driveForms';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ kode: string }>;
}

export default async function DetailLayananPage({ params }: PageProps) {
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

  let alurArray: Array<{ tahap: number; nama: string; hari: string; keterangan: string }> = [];
  try {
    alurArray = JSON.parse(service.alurProses);
  } catch {
    alurArray = [];
  }

  // Find related forms in Google Drive repository
  const relatedDriveForms = ALL_DRIVE_FILES.filter((f) => f.terkaitLayanan === service.kode);

  return (
    <div className="bg-slate-50 min-h-screen py-6 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/layanan" className="hover:text-slate-900 transition-colors">
            Katalog Layanan
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">{service.kategori}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800 truncate">{service.nama}</span>
        </nav>

        {/* Header Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-[11px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {service.kategori}
                </span>
                <span>•</span>
                <span className="text-[11px] text-slate-500">
                  Kantor Pertanahan Kota Administrasi Jakarta Pusat
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {service.nama}
              </h1>

              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {service.deskripsi}
              </p>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
              <Link
                href={`/formulir?terkait=${service.kode}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Isi Formulir Online</span>
              </Link>

              <Link
                href={`/layanan/${service.kode}/daftar`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-[11px] font-medium rounded-lg transition-colors"
              >
                <span>Pendaftaran Mandiri</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Grid Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Persyaratan & SOP (7 Kolom) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Persyaratan Dokumen */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Persyaratan Dokumen ({service.persyaratan.length})
                </h2>
                <span className="text-[11px] text-slate-500">Format digital / berkas fisik</span>
              </div>

              <div className="space-y-2.5">
                {service.persyaratan.map((syarat, idx) => (
                  <div
                    key={syarat.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{syarat.namaDokumen}</h4>
                          {syarat.isWajib ? (
                            <span className="text-[9px] font-semibold text-rose-700 uppercase">
                              Wajib
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 uppercase">
                              Opsional
                            </span>
                          )}
                        </div>
                        {syarat.deskripsi && (
                          <p className="text-[11px] text-slate-500 leading-relaxed">{syarat.deskripsi}</p>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          Format: {syarat.allowedTypes.toUpperCase()} • Maks: {syarat.maxSizeMB} MB
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pl-7 sm:pl-0">
                      <Link
                        href={`/formulir?terkait=${service.kode}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 hover:border-emerald-400 text-emerald-800 text-[11px] font-semibold transition-colors"
                      >
                        <PenLine className="w-3 h-3 text-emerald-600" />
                        <span>Isi di Web</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Ketentuan Khusus */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs pb-1.5 border-b border-slate-100">
                Ketentuan &amp; Catatan Khusus
              </h3>
              <div className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                {service.keterangan}
              </div>
            </div>

            {/* 3. Alur Proses */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs pb-1.5 border-b border-slate-100">
                Tahapan Alur Pemrosesan Berkas
              </h3>

              <div className="space-y-2">
                {alurArray.map((alur, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">
                        {alur.tahap}. {alur.nama}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{alur.keterangan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Formulir Digital & Dasar Hukum (5 Kolom) */}
          <div className="lg:col-span-5 space-y-5">
            {/* E-Formulir Langsung Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-xs">
                <PenLine className="w-4 h-4 text-[#0b2f57]" />
                <span>Pengisian E-Formulir Langsung di Web</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Anda tidak perlu repot mengunduh formulir kosong secara manual. Lengkapi data permohonan Anda secara interaktif langsung pada website ini, lalu pratinjau dan cetak formulir resmi siap pakai.
              </p>

              <div className="space-y-2 pt-1">
                {relatedDriveForms.length > 0 ? (
                  relatedDriveForms.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50/70 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-900 text-xs leading-snug">
                          {item.name.replace(/\.pdf$/i, '')}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {item.deskripsi}
                      </p>
                      <Link
                        href={`/formulir?form=${encodeURIComponent(item.name)}`}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Isi Formulir Ini Sekarang</span>
                      </Link>
                    </div>
                  ))
                ) : (
                  <Link
                    href={`/formulir?terkait=${service.kode}`}
                    className="w-full py-2 px-3 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Buka Pengisian E-Formulir</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Action Pendaftaran */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-100">
                Pendaftaran Berkas Online
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sudah memiliki berkas lengkap dan ingin langsung mengajukan permohonan ke petugas loket secara online?
              </p>
              <Link
                href={`/layanan/${service.kode}/daftar`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b2f57] hover:underline"
              >
                <span>Lanjut ke Formulir Pendaftaran Mandiri</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Dasar Hukum */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-100">
                Dasar Hukum Pelayanan
              </h4>
              <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                {service.dasarHukum}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
