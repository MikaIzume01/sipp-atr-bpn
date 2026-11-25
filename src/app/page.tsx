import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ServiceCatalog from '@/components/ServiceCatalog';
import { 
  Search, 
  FileText,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  PenLine,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { GOOGLE_DRIVE_MAIN_FOLDER_URL } from '@/lib/driveForms';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
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
    <div className="flex flex-col gap-8 pb-16">
      {/* Hero Header */}
      <section className="bg-[#0b2f57] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Badan Pertanahan Nasional
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] font-semibold text-emerald-400 tracking-wide uppercase">
                  Portal Resmi
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                KILAT BPN
              </h1>
              <p className="text-base sm:text-lg text-emerald-300 font-semibold -mt-1">
                Kanal Informasi &amp; Layanan Administrasi Tanah
              </p>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl">
                Akses informasi persyaratan dokumen warkah resmi, pengisian E-Formulir permohonan langsung di website, pendaftaran mandiri digital, serta pemantauan status berkas dan pengaduan secara transparan.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/formulir"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Isi Formulir Online Sekarang</span>
                </Link>

                <Link
                  href="/pendaftaran"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg transition-colors border border-white/20"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Pendaftaran Berkas Online</span>
                </Link>
              </div>
            </div>

            {/* Right Card: Lacak Status Berkas */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm text-slate-900 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Lacak Berkas Permohonan
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Masukkan nomor registrasi dan PIN keamanan Anda
                </p>

                <form action="/tracking" method="GET" className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="nomor-hero-f" className="block font-medium text-slate-700 mb-1">
                      Nomor Registrasi
                    </label>
                    <input
                      id="nomor-hero-f"
                      type="text"
                      name="nomor"
                      placeholder="Contoh: REG-202611-0001"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="pin-hero-f" className="block font-medium text-slate-700 mb-1">
                      PIN Keamanan (6 Digit PIN / 4 Digit NIK)
                    </label>
                    <input
                      id="pin-hero-f"
                      type="password"
                      name="pin"
                      maxLength={6}
                      placeholder="Contoh: 829143"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Periksa Status Berkas</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* Pintasan 4 Layanan Cepat (Clean & Modern) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-6 relative z-10">
          <Link
            href="/formulir"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <PenLine className="w-4 h-4 text-emerald-600 mb-2" />
              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                E-Formulir Online
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block font-normal">Isi Langsung di Web</span>
          </Link>

          <Link
            href="/layanan/jualb"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <FileText className="w-4 h-4 text-slate-700 mb-2" />
              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                Peralihan Hak (Jual Beli)
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block font-normal">Layanan Pertanahan</span>
          </Link>

          <Link
            href="/layanan/roya"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <FileCheck className="w-4 h-4 text-slate-700 mb-2" />
              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                Pelayanan Roya
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block font-normal">Hak Tanggungan</span>
          </Link>

          <Link
            href="/layanan/sertifikat-hilang"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <Search className="w-4 h-4 text-slate-700 mb-2" />
              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                Sertifikat Hilang / Rusak
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block font-normal">Layanan Pemeliharaan</span>
          </Link>
        </div>

        {/* Banner Pintasan E-Formulir & Pengaduan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <PenLine className="w-4 h-4" />
                </div>
                <span>E-Formulir Interaktif</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Isi Formulir Permohonan Langsung di Web
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kini pemohon tidak perlu mengunduh blangko kosong secara manual. Anda dapat mengisi data pemohon, data tanah, dan pernyataan langsung di website, lalu mencetak berkas rapi yang siap ditandatangani.
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/formulir"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Mulai Pengisian Formulir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span>Kanal Aspirasi Masyarakat</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Layanan Pengaduan Pertanahan (DUMAS)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengalami kendala pelayanan atau indikasi keluhan lainnya? Laporkan secara online untuk ditindaklanjuti secara transparan dan akuntabel.
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/pengaduan"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Sampaikan Pengaduan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Katalog Informasi Layanan Interaktif */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Katalog Informasi Layanan Pertanahan
              </h2>
              <p className="text-xs text-slate-500">
                Daftar {services.length} layanan resmi pertanahan Kota Administrasi Jakarta Pusat
              </p>
            </div>

            <Link
              href="/layanan"
              className="text-xs font-semibold text-[#0b2f57] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Lihat Detail Semua Layanan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <ServiceCatalog services={services} />
        </div>

        {/* Alur Tahapan Layanan */}
        <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Tahapan Alur Pelayanan Pertanahan
            </h3>
            <p className="text-xs text-slate-500">
              Alur baku pemrosesan berkas warkah dari pengisian formulir sampai penyerahan sertifikat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">1</span>
              <h4 className="font-semibold text-slate-900">Isi Formulir Online</h4>
              <p className="text-[11px] text-slate-500">Isi data permohonan langsung di website atau ajukan lewat pendaftaran online.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">2</span>
              <h4 className="font-semibold text-slate-900">Verifikasi Dokumen</h4>
              <p className="text-[11px] text-slate-500">Petugas memeriksa keabsahan warkah, buku tanah, serta validasi data yuridis objek tanah.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">3</span>
              <h4 className="font-semibold text-slate-900">Pencatatan Buku Tanah</h4>
              <p className="text-[11px] text-slate-500">Pemrosesan yuridis dan spasial pada sistem informasi pertanahan kantor.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">4</span>
              <h4 className="font-semibold text-slate-900">Penyerahan Sertifikat</h4>
              <p className="text-[11px] text-slate-500">Penerbitan dokumen hak dan penyerahan produk resmi di Loket Penyerahan.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
