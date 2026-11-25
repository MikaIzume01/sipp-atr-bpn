'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Printer, 
  X, 
  ExternalLink,
  Calendar,
  Check
} from 'lucide-react';

interface DocumentItem {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  statusVerifikasi: string;
  catatanVerifikasi: string | null;
  requirement: {
    namaDokumen: string;
    isWajib: boolean;
    allowedTypes: string;
  };
}

interface LogItem {
  id: string;
  statusLama: string | null;
  statusBaru: string;
  aktor: string;
  namaPetugas: string | null;
  catatan: string;
  createdAt: string;
}

interface ApplicationData {
  id: string;
  nomorRegistrasi: string;
  accessPin: string;
  namaPemohon: string;
  nikPemohon: string;
  noWhatsapp: string;
  alamatPemohon: string;
  tipePemohon: string;
  dataObjek: string;
  estimasiBiaya: number;
  status: string;
  catatanRevisi: string | null;
  nomorSK: string | null;
  tanggalPengajuan: string;
  tanggalSelesai: string | null;
  service: {
    nama: string;
    kategori: string;
    estimasiHari: number;
  };
  dokumen: DocumentItem[];
  logs: LogItem[];
}

export default function TrackingViewer({
  initialApplication,
  searchedNomor,
  searchedPin,
  errorMessage,
}: {
  initialApplication: ApplicationData | null;
  searchedNomor: string;
  searchedPin: string;
  errorMessage: string | null;
}) {
  const [nomor, setNomor] = useState(searchedNomor);
  const [pin, setPin] = useState(searchedPin);
  const [app, setApp] = useState<ApplicationData | null>(initialApplication);
  const [revisingDocId, setRevisingDocId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const maskNik = (nik: string) => {
    if (!nik || nik.length < 8) return nik;
    return nik.substring(0, 4) + '**********' + nik.substring(nik.length - 2);
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    return phone.substring(0, 4) + '****' + phone.substring(phone.length - 3);
  };

  let parsedObjek: Record<string, string | number> = {};
  if (app?.dataObjek) {
    try {
      parsedObjek = JSON.parse(app.dataObjek);
    } catch {
      parsedObjek = {};
    }
  }

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case 'DIAJUKAN':
        return 1;
      case 'DIVERIFIKASI':
        return 2;
      case 'PERLU_REVISI':
        return 1.5;
      case 'DIPROSES':
        return 4;
      case 'SELESAI':
        return 5;
      case 'DITOLAK':
        return 0;
      default:
        return 1;
    }
  };

  const currentMilestone = app ? getMilestoneIndex(app.status) : 0;

  const handleUploadRevision = async (docId: string) => {
    if (!selectedFile || !app) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('applicationId', app.id);
      formData.append('accessPin', app.accessPin);
      formData.append('documentId', docId);
      formData.append('file', selectedFile);

      const res = await fetch('/api/permohonan/revisi', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengunggah perbaikan.');
      }

      setUploadMessage('Berkas perbaikan berhasil dikirimkan. Halaman akan dimuat ulang...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat unggah revisi.';
      setUploadMessage(`Error: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search Form */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <form method="GET" action="/tracking" className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-7">
              <label htmlFor="track-nomor-input-f" className="block font-semibold text-slate-700 mb-1">
                Nomor Registrasi
              </label>
              <input
                id="track-nomor-input-f"
                type="text"
                name="nomor"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
                placeholder="Contoh: REG-202611-0001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label htmlFor="track-pin-input-f" className="block font-semibold text-slate-700 mb-1">
                PIN Keamanan (6 Digit PIN / 4 Digit NIK)
              </label>
              <input
                id="track-pin-input-f"
                type="password"
                name="pin"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Contoh: 829143"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Berkas</span>
            </button>
          </div>
        </form>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Result Card */}
      {app && (
        <div className="space-y-5">
          {/* Main Status Header Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">
                  NOMOR REGISTRASI
                </span>
                <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                  {app.nomorRegistrasi}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {app.service.nama} ({app.service.kategori})
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full font-medium text-xs border ${
                    app.status === 'PERLU_REVISI'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : app.status === 'SELESAI'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : app.status === 'DITOLAK'
                      ? 'bg-rose-50 text-rose-900 border-rose-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {app.status === 'DIAJUKAN' && 'Menunggu Verifikasi'}
                  {app.status === 'DIVERIFIKASI' && 'Terverifikasi Lengkap'}
                  {app.status === 'PERLU_REVISI' && 'Perlu Revisi Dokumen'}
                  {app.status === 'DIPROSES' && 'Sedang Diproses Teknis'}
                  {app.status === 'SELESAI' && 'Selesai / Siap Diambil'}
                  {app.status === 'DITOLAK' && 'Permohonan Ditolak'}
                </span>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 no-print"
                  title="Cetak"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Milestones */}
            <div className="py-1">
              <span className="text-xs font-semibold text-slate-700 block mb-3">
                Tahapan SOP
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { step: 1, title: '1. Pendaftaran', desc: 'Diterima' },
                  { step: 2, title: '2. Verifikasi Loket', desc: 'Penelitian Berkas' },
                  { step: 3, title: '3. Billing PNBP', desc: 'Pembayaran Kas Negara' },
                  { step: 4, title: '4. Proses Teknis', desc: 'Pembukuan Buku Tanah' },
                  { step: 5, title: '5. Selesai', desc: 'Penyerahan Sertifikat' },
                ].map((m) => {
                  const isDone = currentMilestone >= m.step;
                  const isCurrent = Math.floor(currentMilestone) === m.step;

                  return (
                    <div
                      key={m.step}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        isDone
                          ? 'bg-slate-50 border-slate-300'
                          : isCurrent
                          ? 'bg-slate-100 border-[#0b2f57]'
                          : 'bg-white border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-xs text-slate-900">{m.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{m.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catatan Revisi */}
            {app.status === 'PERLU_REVISI' && (
              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-900 space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Catatan Perbaikan dari Petugas Loket:</h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    &quot;{app.catatanRevisi}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <span className="font-semibold text-xs block mb-2">Unggah Perbaikan Dokumen:</span>
                  <div className="space-y-2">
                    {app.dokumen.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 bg-white rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-slate-900 block">{doc.requirement.namaDokumen}</span>
                          <span className="text-[10px] text-slate-400 block">{doc.originalFilename}</span>
                        </div>

                        {revisingDocId === doc.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              className="text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleUploadRevision(doc.id)}
                              disabled={!selectedFile || isUploading}
                              className="px-2.5 py-1 bg-[#0b2f57] text-white rounded text-xs font-semibold disabled:opacity-50"
                            >
                              {isUploading ? 'Mengunggah...' : 'Kirim'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRevisingDocId(null);
                                setSelectedFile(null);
                              }}
                              className="p-1 text-slate-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setRevisingDocId(doc.id);
                              setSelectedFile(null);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 shrink-0"
                          >
                            Unggah Ulang File Ini
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {uploadMessage && (
                    <div className="mt-2 text-xs text-slate-800 bg-slate-100 p-2 rounded">
                      {uploadMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Summary */}
            <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs pb-2 border-b border-slate-100">
                Data Permohonan
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Pemohon:</span>
                  <span className="font-semibold text-slate-900">{app.namaPemohon}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NIK:</span>
                  <span className="font-mono text-slate-900">{maskNik(app.nikPemohon)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                  <span className="font-mono text-slate-900">{maskPhone(app.noWhatsapp)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tanggal Pengajuan:</span>
                  <span className="text-slate-800">
                    {new Date(app.tanggalPengajuan).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Nomor Hak Objek:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {parsedObjek.nomorHak || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Luas Tanah:</span>
                  <span className="text-slate-800">{parsedObjek.luasTanahM2 || '-'} m²</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Kelurahan:</span>
                  <span className="text-slate-800">{parsedObjek.kelurahan || '-'}</span>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span>Waktu SOP Layanan:</span>
                  <span className="font-semibold text-slate-900">
                    {app.service.estimasiHari} Hari Kerja
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Dokumen & Timeline */}
            <div className="lg:col-span-6 space-y-4">
              {/* Dokumen Unggahan */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2.5">
                <h3 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-100">
                  Dokumen Persyaratan ({app.dokumen.length})
                </h3>

                <div className="space-y-1.5 text-xs">
                  {app.dokumen.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-medium text-slate-900 block truncate">
                          {doc.requirement.namaDokumen}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {doc.originalFilename}
                        </span>
                      </div>

                      <a
                        href={`/api/files/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[10px] font-medium"
                      >
                        Lihat
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Log */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2.5">
                <h3 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-100">
                  Riwayat Aktivitas
                </h3>

                <div className="space-y-2 text-xs">
                  {app.logs.map((log) => (
                    <div key={log.id} className="p-2 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {new Date(log.createdAt).toLocaleDateString('id-ID')}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {log.aktor}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {log.catatan}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
