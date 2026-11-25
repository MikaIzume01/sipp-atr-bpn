import React from 'react';
import { prisma } from '@/lib/prisma';
import ComplaintAdminTable, { ComplaintItem } from '@/components/ComplaintAdminTable';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Inbox,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPengaduanPage() {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalCount = complaints.length;
  const baruCount = complaints.filter((c) => c.status === 'BARU').length;
  const diprosesCount = complaints.filter((c) => c.status === 'DIPERIKSA' || c.status === 'DITINDAKLANJUTI').length;
  const selesaiCount = complaints.filter((c) => c.status === 'SELESAI').length;

  const serializedComplaints: ComplaintItem[] = complaints.map((c) => ({
    id: c.id,
    nomorTiket: c.nomorTiket,
    namaPelapor: c.namaPelapor,
    nikPelapor: c.nikPelapor,
    noWhatsapp: c.noWhatsapp,
    email: c.email,
    kategori: c.kategori,
    nomorBerkas: c.nomorBerkas,
    uraian: c.uraian,
    status: c.status,
    tanggapanPetugas: c.tanggapanPetugas,
    namaPetugas: c.namaPetugas,
    tanggalSelesai: c.tanggalSelesai ? c.tanggalSelesai.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Kanal Pengaduan &amp; Aspirasi Masyarakat (DUMAS)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Daftar Pengaduan Masuk
          </h1>
          <p className="text-xs text-slate-500">
            Penanganan laporan kendala pelayanan, keterlambatan warkah, dan aspirasi masyarakat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Antrean Berkas</span>
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Total Pengaduan</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</div>
          <span className="text-[10px] text-slate-500 block">Laporan masuk</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Laporan Baru</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono text-amber-600">{baruCount}</div>
          <span className="text-[10px] text-slate-500 block">Perlu tindak lanjut</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Dalam Proses</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono text-blue-600">{diprosesCount}</div>
          <span className="text-[10px] text-slate-500 block">Klarifikasi &amp; investigasi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Selesai Ditangani</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono text-emerald-600">{selesaiCount}</div>
          <span className="text-[10px] text-slate-500 block">Solusi tersampaikan</span>
        </div>
      </div>

      {/* Interactive Complaint Table */}
      <ComplaintAdminTable initialComplaints={serializedComplaints} />
    </div>
  );
}
