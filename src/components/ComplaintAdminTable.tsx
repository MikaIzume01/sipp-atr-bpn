'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  MessageSquare, 
  Phone, 
  Mail, 
  User, 
  FileText,
  ShieldAlert,
  Send,
  X,
  ChevronDown
} from 'lucide-react';

export interface ComplaintItem {
  id: string;
  nomorTiket: string;
  namaPelapor: string;
  nikPelapor: string;
  noWhatsapp: string;
  email: string | null;
  kategori: string;
  nomorBerkas: string | null;
  uraian: string;
  status: string;
  tanggapanPetugas: string | null;
  namaPetugas: string | null;
  tanggalSelesai: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintAdminTable({
  initialComplaints,
}: {
  initialComplaints: ComplaintItem[];
}) {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(initialComplaints);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('SEMUA');
  const [kategoriFilter, setKategoriFilter] = useState('SEMUA');

  // Selected complaint for modal
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [editStatus, setEditStatus] = useState('BARU');
  const [editTanggapan, setEditTanggapan] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Status filter
      if (statusFilter !== 'SEMUA' && c.status !== statusFilter) {
        return false;
      }
      // Kategori filter
      if (kategoriFilter !== 'SEMUA' && c.kategori !== kategoriFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTiket = c.nomorTiket.toLowerCase().includes(q);
        const matchNama = c.namaPelapor.toLowerCase().includes(q);
        const matchNik = c.nikPelapor.toLowerCase().includes(q);
        const matchUraian = c.uraian.toLowerCase().includes(q);
        const matchBerkas = c.nomorBerkas ? c.nomorBerkas.toLowerCase().includes(q) : false;
        return matchTiket || matchNama || matchNik || matchUraian || matchBerkas;
      }
      return true;
    });
  }, [complaints, statusFilter, kategoriFilter, searchQuery]);

  const handleOpenModal = (c: ComplaintItem) => {
    setSelectedComplaint(c);
    setEditStatus(c.status);
    setEditTanggapan(c.tanggapanPetugas || '');
    setUpdateSuccess(false);
    setErrorMessage(null);
  };

  const handleSaveUpdate = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    setErrorMessage(null);
    setUpdateSuccess(false);

    try {
      const res = await fetch('/api/pengaduan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedComplaint.id,
          status: editStatus,
          tanggapanPetugas: editTanggapan,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui status pengaduan.');
      }

      // Update state local
      setComplaints((prev) =>
        prev.map((item) =>
          item.id === selectedComplaint.id
            ? {
                ...item,
                status: editStatus,
                tanggapanPetugas: editTanggapan,
                namaPetugas: data.complaint?.namaPetugas || item.namaPetugas,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setSelectedComplaint((prev) =>
        prev
          ? {
              ...prev,
              status: editStatus,
              tanggapanPetugas: editTanggapan,
            }
          : null
      );

      setUpdateSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatKategoriLabel = (kategori: string) => {
    switch (kategori) {
      case 'PELAYANAN_LOKET':
        return 'Pelayanan Petugas Loket';
      case 'KETERLAMBATAN_SOP':
        return 'Keterlambatan Layanan';
      case 'DUGAAN_PUNGLI':
        return 'Dugaan Pungutan Liar';
      case 'SENGKETA_BATAS':
        return 'Sengketa Batas / Ukur';
      case 'INFORMASI_TIDAK_JELAS':
        return 'Informasi Syarat';
      default:
        return 'Lain-lain / Saran';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BARU':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Laporan Baru
          </span>
        );
      case 'DIPERIKSA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Sedang Diperiksa
          </span>
        );
      case 'DITINDAKLANJUTI':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Ditindaklanjuti
          </span>
        );
      case 'SELESAI':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Selesai
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengaduan berdasarkan No. Tiket, Nama, NIK, No. Berkas..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="BARU">Laporan Baru</option>
            <option value="DIPERIKSA">Sedang Diperiksa</option>
            <option value="DITINDAKLANJUTI">Ditindaklanjuti</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITOLAK">Ditolak</option>
          </select>

          {/* Kategori Select */}
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="SEMUA">Semua Kategori</option>
            <option value="PELAYANAN_LOKET">Pelayanan Loket</option>
            <option value="KETERLAMBATAN_SOP">Keterlambatan Layanan</option>
            <option value="DUGAAN_PUNGLI">Dugaan Pungli</option>
            <option value="SENGKETA_BATAS">Sengketa Batas</option>
            <option value="INFORMASI_TIDAK_JELAS">Informasi Syarat</option>
            <option value="LAINNYA">Lain-lain</option>
          </select>

          <span className="text-slate-400 font-mono text-[11px] px-1">
            {filteredComplaints.length} Data
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredComplaints.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-sm">Tidak Ada Laporan Pengaduan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'SEMUA' || kategoriFilter !== 'SEMUA'
                ? 'Tidak ada pengaduan yang cocok dengan filter pencarian Anda.'
                : 'Belum ada pengaduan masyarakat yang masuk.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">No. Tiket &amp; Tanggal</th>
                  <th className="py-3 px-4">Pelapor &amp; Kontak</th>
                  <th className="py-3 px-4">Klasifikasi &amp; Berkas</th>
                  <th className="py-3 px-4">Uraian Pengaduan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const cleanPhone = item.noWhatsapp.replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nomor Tiket & Waktu */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono font-bold text-slate-900 block">
                          {item.nomorTiket}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {dateStr}
                        </span>
                      </td>

                      {/* Pelapor */}
                      <td className="py-3 px-4 align-top space-y-0.5">
                        <div className="font-semibold text-slate-900">
                          {item.namaPelapor}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          NIK: {item.nikPelapor}
                        </div>
                        <div className="flex items-center gap-2 pt-1 text-[11px]">
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{item.noWhatsapp}</span>
                          </a>
                        </div>
                      </td>

                      {/* Kategori & Berkas */}
                      <td className="py-3 px-4 align-top space-y-1">
                        <span className="font-medium text-slate-800 block">
                          {formatKategoriLabel(item.kategori)}
                        </span>
                        {item.nomorBerkas ? (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono inline-block">
                            Ref: {item.nomorBerkas}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tanpa No. Berkas</span>
                        )}
                      </td>

                      {/* Uraian */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {item.uraian}
                        </p>
                        {item.tanggapanPetugas && (
                          <div className="mt-1 text-[10px] text-blue-900 bg-blue-50/80 p-1.5 rounded border border-blue-100 line-clamp-1">
                            <strong>Respon:</strong> {item.tanggapanPetugas}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 align-top text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white text-[11px] font-semibold transition-colors shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Tindak Lanjut</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL & TINDAK LANJUT PENGADUAN */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-xs">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Pengaduan Dumas BPN
                  </span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedComplaint.nomorTiket}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Identitas Pelapor & Kontak */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Identitas Pelapor
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-semibold text-slate-900">{selectedComplaint.namaPelapor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">NIK:</span>
                  <span className="font-mono text-slate-800">{selectedComplaint.nikPelapor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kontak WhatsApp:</span>
                  <a
                    href={`https://wa.me/${selectedComplaint.noWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{selectedComplaint.noWhatsapp}</span>
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Alamat Email:</span>
                  <span className="text-slate-700">{selectedComplaint.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Rincian Aduan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Klasifikasi: {formatKategoriLabel(selectedComplaint.kategori)}
                </span>
                {selectedComplaint.nomorBerkas && (
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    No. Berkas: {selectedComplaint.nomorBerkas}
                  </span>
                )}
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-line leading-relaxed text-xs">
                {selectedComplaint.uraian}
              </div>
            </div>

            {/* Form Respon & Perubahan Status */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs">
                Tindak Lanjut &amp; Tanggapan Petugas Loket
              </h4>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Status pengaduan dan tanggapan resmi berhasil disimpan.</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Status Penanganan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                >
                  <option value="BARU">BARU (Belum Ditindaklanjuti)</option>
                  <option value="DIPERIKSA">DIPERIKSA (Sedang Klarifikasi Seksi Terkait)</option>
                  <option value="DITINDAKLANJUTI">DITINDAKLANJUTI (Dalam Proses Penyelesaian)</option>
                  <option value="SELESAI">SELESAI (Masalah Teratasi / Selesai)</option>
                  <option value="DITOLAK">DITOLAK (Laporan Tidak Sesuai Ketentuan)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tanggapan &amp; Catatan Resmi Petugas BPN
                </label>
                <textarea
                  rows={4}
                  value={editTanggapan}
                  onChange={(e) => setEditTanggapan(e.target.value)}
                  placeholder="Tuliskan hasil klarifikasi, solusi yang diberikan kepada pemohon, atau instruksi tindak lanjut..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveUpdate}
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white font-semibold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
