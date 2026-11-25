'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  X, 
  Check, 
  ArrowRight,
  FileText
} from 'lucide-react';

interface ApplicationRow {
  id: string;
  nomorRegistrasi: string;
  accessPin: string;
  namaPemohon: string;
  nikPemohon: string;
  noWhatsapp: string;
  dataObjek: string;
  estimasiBiaya: number;
  status: string;
  tanggalPengajuan: string;
  service: {
    nama: string;
    kategori: string;
  };
  dokumen: Array<{ id: string; statusVerifikasi: string }>;
}

export default function OfficerQueueTable({ applications }: { applications: ApplicationRow[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('SEMUA');

  const statusOptions = [
    { key: 'SEMUA', label: 'Semua Status' },
    { key: 'DIAJUKAN', label: 'Menunggu Verifikasi' },
    { key: 'PERLU_REVISI', label: 'Perlu Revisi' },
    { key: 'DIVERIFIKASI', label: 'Terverifikasi' },
    { key: 'DIPROSES', label: 'Diproses Teknis' },
    { key: 'SELESAI', label: 'Selesai' },
  ];

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchStatus = selectedStatus === 'SEMUA' || app.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        app.nomorRegistrasi.toLowerCase().includes(q) ||
        app.namaPemohon.toLowerCase().includes(q) ||
        app.nikPemohon.includes(q) ||
        app.service.nama.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [applications, selectedStatus, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-4">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Registrasi, Nama Pemohon, NIK, atau Layanan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {statusOptions.map((st) => {
            const isSelected = selectedStatus === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#0b2f57] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <th className="py-3 px-4">No. Registrasi</th>
              <th className="py-3 px-4">Tanggal Masuk</th>
              <th className="py-3 px-4">Nama Pemohon &amp; NIK</th>
              <th className="py-3 px-4">Layanan</th>
              <th className="py-3 px-4">Dokumen</th>
              <th className="py-3 px-4">Status Berkas</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span>Tidak ada permohonan yang sesuai dengan filter pencarian.</span>
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const totalDocs = app.dokumen.length;
                const validDocs = app.dokumen.filter((d) => d.statusVerifikasi === 'VALID').length;

                return (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* No. Registrasi */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{app.nomorRegistrasi}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-normal border border-slate-200">
                          PIN: {app.accessPin}
                        </span>
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(app.tanggalPengajuan).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Pemohon */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.namaPemohon}</div>
                      <div className="font-mono text-[11px] text-slate-400">{app.nikPemohon}</div>
                    </td>

                    {/* Layanan */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{app.service.nama}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">{app.service.kategori}</span>
                    </td>

                    {/* Dokumen Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {validDocs}/{totalDocs} Valid
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {app.status === 'DIAJUKAN' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-medium text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Menunggu Verifikasi
                        </span>
                      )}
                      {app.status === 'DIVERIFIKASI' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-medium text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          Terverifikasi
                        </span>
                      )}
                      {app.status === 'PERLU_REVISI' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[11px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Perlu Revisi
                        </span>
                      )}
                      {app.status === 'DIPROSES' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-medium text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Diproses Teknis
                        </span>
                      )}
                      {app.status === 'SELESAI' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium text-[11px] inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          Selesai
                        </span>
                      )}
                      {app.status === 'DITOLAK' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-200 font-medium text-[11px] inline-flex items-center gap-1">
                          <X className="w-3 h-3 text-rose-600" />
                          Ditolak
                        </span>
                      )}
                    </td>

                    {/* Aksi Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/permohonan/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-300" />
                        <span>Verifikasi</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
