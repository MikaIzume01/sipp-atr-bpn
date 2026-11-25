import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ChevronRight, ArrowRight, FileText, ShieldCheck, PenLine } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PendaftaranIndexPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      persyaratan: {
        orderBy: { urutan: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="bg-slate-50 min-h-screen py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800">Pendaftaran Online</span>
        </nav>

        {/* Header Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Layanan Permohonan Mandiri Masyarakat
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Formulir Pendaftaran Online Berkas Pertanahan
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Pilih jenis layanan di bawah ini untuk memulai pengisian formulir pendaftaran digital, melengkapi data identitas pemohon, letak objek tanah, dan mengunggah pindaian warkah persyaratan.
          </p>
        </div>

        {/* Grid of Services for Registration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px] uppercase text-slate-500">
                      {service.kategori}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Layanan Resmi ATR/BPN
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {service.nama}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {service.deskripsi}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Metode Pengajuan:</span>
                      <span className="font-medium text-slate-800">Online &amp; Mandiri</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Wilayah:</span>
                      <span className="font-medium text-slate-800">Jakarta Pusat</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/layanan/${service.kode}`}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Syarat</span>
                  </Link>

                  <Link
                    href={`/layanan/${service.kode}/daftar`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Isi Formulir Pendaftaran</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Setelah menyelesaikan pengisian formulir, sistem akan menerbitkan <strong>Surat Tanda Penerimaan Dokumen (STPD)</strong> resmi lengkap dengan Nomor Registrasi, PIN Keamanan, dan kode QR untuk pemantauan berkas.
          </p>
        </div>
      </div>
    </div>
  );
}
