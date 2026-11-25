import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import OfficerQueueTable from '@/components/OfficerQueueTable';
import { 
  Inbox, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [applications, baruComplaintCount] = await Promise.all([
    prisma.application.findMany({
      include: {
        service: true,
        dokumen: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.complaint.count({ where: { status: 'BARU' } }),
  ]);

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'DIAJUKAN').length;
  const revisionCount = applications.filter((a) => a.status === 'PERLU_REVISI').length;
  const processingCount = applications.filter((a) => a.status === 'DIVERIFIKASI' || a.status === 'DIPROSES').length;
  const completedCount = applications.filter((a) => a.status === 'SELESAI').length;

  const serializedApps = applications.map((app) => ({
    ...app,
    tanggalPengajuan: app.tanggalPengajuan.toISOString(),
    dokumen: app.dokumen.map((d) => ({
      id: d.id,
      statusVerifikasi: d.statusVerifikasi,
    })),
  }));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Dashboard Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Portal Administrasi Petugas Loket
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Antrean Verifikasi Berkas
          </h1>
          <p className="text-xs text-slate-500">
            Kantor Pertanahan Kota Administrasi Jakarta Pusat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/pengaduan"
            className="flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-medium shadow-2xs transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Pengaduan Dumas</span>
            {baruComplaintCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {baruComplaintCount} Baru
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 5 Statistics Metric Cards (Unified, Non-Rainbow Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Total Berkas</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</div>
          <span className="text-[10px] text-slate-500 block">Permohonan terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{pendingCount}</div>
          <span className="text-[10px] text-slate-500 block">Belum diperiksa</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Perlu Revisi</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{revisionCount}</div>
          <span className="text-[10px] text-slate-500 block">Menunggu pemohon</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Proses Teknis</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{processingCount}</div>
          <span className="text-[10px] text-slate-500 block">Penelitian buku tanah</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{completedCount}</div>
          <span className="text-[10px] text-slate-500 block">Siap diambil</span>
        </div>
      </div>

      {/* Main Queue Table */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Daftar Antrean Permohonan Warkah</h2>
        <OfficerQueueTable applications={serializedApps} />
      </section>
    </div>
  );
}
