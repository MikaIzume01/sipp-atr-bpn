'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Eye, 
  ExternalLink, 
  Check, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Send,
  Building2,
  Calendar
} from 'lucide-react';

interface DocumentData {
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
    maxSizeMB: number;
  };
}

interface LogData {
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
  email: string | null;
  alamatPemohon: string;
  tipePemohon: string;
  namaKuasa: string | null;
  nikKuasa: string | null;
  noSuratKuasa: string | null;
  dataObjek: string;
  estimasiBiaya: number;
  status: string;
  catatanRevisi: string | null;
  nomorSK: string | null;
  tanggalPengajuan: string;
  service: {
    nama: string;
    kategori: string;
    estimasiHari: number;
  };
  dokumen: DocumentData[];
  logs: LogData[];
}

export default function OfficerVerificationWorkspace({ app }: { app: ApplicationData }) {
  const router = useRouter();
  const [selectedDocId, setSelectedDocId] = useState<string>(
    app.dokumen[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal / Inputs state for actions
  const [actionModal, setActionModal] = useState<
    'REVISI' | 'SELESAI' | 'TOLAK' | null
  >(null);
  const [modalCatatan, setModalCatatan] = useState('');
  const [modalNomorSK, setModalNomorSK] = useState('');

  const selectedDoc = app.dokumen.find((d) => d.id === selectedDocId);

  let parsedObjek: Record<string, string | number> = {};
  try {
    parsedObjek = JSON.parse(app.dataObjek);
  } catch {
    parsedObjek = {};
  }

  // Handle Per-Document Verification Toggle
  const handleVerifyDocument = async (docId: string, status: 'VALID' | 'TIDAK_VALID', catatan?: string) => {
    setIsProcessing(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/admin/verifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          actionType: 'UPDATE_DOC',
          documentId: docId,
          docStatus: status,
          docCatatan: catatan || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui dokumen.');
      }

      setFeedbackMessage({ text: 'Status dokumen berhasil diperbarui.', type: 'success' });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setFeedbackMessage({ text: msg, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Application Milestone Status Change
  const handleChangeAppStatus = async (
    newStatus: string,
    catatanText?: string,
    skText?: string
  ) => {
    setIsProcessing(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/admin/verifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          actionType: 'CHANGE_STATUS',
          newStatus,
          catatan: catatanText,
          nomorSK: skText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengubah status permohonan.');
      }

      setActionModal(null);
      setModalCatatan('');
      setModalNomorSK('');
      setFeedbackMessage({ text: `Permohonan berhasil diubah menjadi ${newStatus}.`, type: 'success' });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setFeedbackMessage({ text: msg, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Kembali ke Antrean"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-slate-900">
                {app.nomorRegistrasi}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
                PIN: {app.accessPin}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {app.service.nama} • Diajukan:{' '}
              {new Date(app.tanggalPengajuan).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status Saat Ini:</span>
          {app.status === 'DIAJUKAN' && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200">
              Menunggu Verifikasi
            </span>
          )}
          {app.status === 'DIVERIFIKASI' && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200">
              Terverifikasi Lengkap
            </span>
          )}
          {app.status === 'PERLU_REVISI' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-medium text-xs border border-amber-200">
              Perlu Revisi Pemohon
            </span>
          )}
          {app.status === 'DIPROSES' && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200">
              Diproses Teknis
            </span>
          )}
          {app.status === 'SELESAI' && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 font-medium text-xs border border-emerald-200">
              Selesai (Siap Diambil)
            </span>
          )}
          {app.status === 'DITOLAK' && (
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 font-medium text-xs border border-rose-200">
              Ditolak
            </span>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-slate-100 text-slate-900 border border-slate-300'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split-Screen Workspace (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SISI KIRI: Data Pemohon & Checklist Berkas (5 Kolom) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Data Identitas & Objek */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-800 font-bold text-xs">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Data Pemohon &amp; Objek Tanah</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Pemohon:</span>
                <span className="font-semibold text-slate-900">{app.namaPemohon}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NIK Pemohon:</span>
                <span className="font-mono text-slate-900">{app.nikPemohon}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                <span className="font-mono text-slate-900">{app.noWhatsapp}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tipe Pengurusan:</span>
                <span className="text-slate-800">{app.tipePemohon}</span>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px]">Nomor Sertifikat / Hak:</span>
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

              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Alamat Objek:</span>
                <span className="text-slate-700">{parsedObjek.alamatObjek || '-'}</span>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Estimasi PNBP:</span>
                <span className="font-bold text-slate-900 text-sm">
                  Rp {app.estimasiBiaya.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Checklist Dokumen Persyaratan */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-800 font-bold text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>Dokumen Persyaratan ({app.dokumen.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk melihat</span>
            </div>

            <div className="space-y-2">
              {app.dokumen.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#0b2f57] bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {doc.requirement.namaDokumen}
                          </span>
                          {doc.requirement.isWajib && (
                            <span className="text-[9px] text-rose-700 font-medium">
                              Wajib
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                          {doc.originalFilename} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>

                      {/* Status Verifikasi Badge */}
                      <div className="shrink-0">
                        {doc.statusVerifikasi === 'VALID' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Valid
                          </span>
                        )}
                        {doc.statusVerifikasi === 'TIDAK_VALID' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <X className="w-3 h-3" />
                            Tidak Valid
                          </span>
                        )}
                        {doc.statusVerifikasi === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Belum Diperiksa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Riwayat Timeline Log */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-800 font-bold text-xs">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Log Audit Aktivitas</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
              {app.logs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(log.createdAt).toLocaleDateString('id-ID')}</span>
                    <span className="font-medium text-slate-600">{log.aktor}</span>
                  </div>
                  <p className="text-slate-800 text-[11px] leading-relaxed">{log.catatan}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SISI KANAN: Live Document Viewer & Verification Action Deck (7 Kolom) */}
        <div className="lg:col-span-7 space-y-5 sticky top-20">
          {/* Document Viewer Frame */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            {selectedDoc ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900">
                      Pratinjau: {selectedDoc.requirement.namaDokumen}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {selectedDoc.originalFilename} • {selectedDoc.mimeType}
                    </span>
                  </div>

                  {/* Actions for this specific document */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyDocument(selectedDoc.id, 'VALID')}
                      disabled={isProcessing}
                      className="px-2.5 py-1 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-medium text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Valid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const note = prompt('Masukkan catatan kekurangan dokumen ini:', 'File tidak terbaca / buram');
                        if (note) handleVerifyDocument(selectedDoc.id, 'TIDAK_VALID', note);
                      }}
                      disabled={isProcessing}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tidak Valid</span>
                    </button>

                    <a
                      href={`/api/files/${selectedDoc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="Buka Tab Baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Embedded Viewer */}
                <div className="w-full h-[460px] bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                  {selectedDoc.mimeType.includes('pdf') ? (
                    <iframe
                      src={`/api/files/${selectedDoc.id}#toolbar=0`}
                      title={selectedDoc.originalFilename}
                      className="w-full h-full border-none"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/files/${selectedDoc.id}`}
                      alt={selectedDoc.originalFilename}
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Pilih salah satu berkas di sebelah kiri untuk melihat pratinjau dokumen.
              </div>
            )}
          </div>

          {/* Master Application Decision Action Deck */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Keputusan Status Permohonan
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih tindakan untuk memperbarui progres berkas ini.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {/* Button 1: Verifikasi / Setujui */}
              <button
                type="button"
                onClick={() =>
                  handleChangeAppStatus(
                    'DIVERIFIKASI',
                    'Berkas digital telah diperiksa petugas loket dan dinyatakan lengkap serta sesuai warkah.'
                  )
                }
                disabled={isProcessing}
                className="py-2 px-2.5 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Setujui Berkas</span>
              </button>

              {/* Button 2: Minta Revisi */}
              <button
                type="button"
                onClick={() => setActionModal('REVISI')}
                disabled={isProcessing}
                className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
                <span>Minta Revisi</span>
              </button>

              {/* Button 3: Selesaikan Permohonan */}
              <button
                type="button"
                onClick={() => setActionModal('SELESAI')}
                disabled={isProcessing}
                className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Sahkan Selesai</span>
              </button>

              {/* Button 4: Tolak Permohonan */}
              <button
                type="button"
                onClick={() => setActionModal('TOLAK')}
                disabled={isProcessing}
                className="py-2 px-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Tolak Berkas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal (Revisi / Selesai / Tolak) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-lg space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {actionModal === 'REVISI' && 'Instruksi Perbaikan Berkas'}
                {actionModal === 'SELESAI' && 'Penyelesaian Berkas & Penerbitan Sertifikat'}
                {actionModal === 'TOLAK' && 'Penolakan Permohonan Berkas'}
              </h3>
              <button onClick={() => setActionModal(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionModal === 'REVISI' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Tuliskan instruksi perbaikan dokumen. Catatan ini akan tampil pada status pelacakan pemohon.
                </p>
                <div>
                  <label htmlFor="catatan-revisi-input" className="block font-semibold text-slate-700 mb-1">
                    Catatan Perbaikan <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="catatan-revisi-input"
                    rows={3}
                    value={modalCatatan}
                    onChange={(e) => setModalCatatan(e.target.value)}
                    placeholder="Contoh: Dokumen sertifikat kurang jelas pada lembar surat ukur. Harap unggah ulang."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeAppStatus('PERLU_REVISI', modalCatatan)}
                    disabled={!modalCatatan.trim() || isProcessing}
                    className="px-3.5 py-1.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white font-medium rounded-lg text-xs disabled:opacity-50"
                  >
                    Kirim Catatan
                  </button>
                </div>
              </div>
            )}

            {actionModal === 'SELESAI' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Berkas telah tervalidasi dan pembayaran PNBP telah tercatat. Masukkan nomor produk hukum yang telah diterbitkan.
                </p>
                <div>
                  <label htmlFor="nomor-sk-input" className="block font-semibold text-slate-700 mb-1">
                    Nomor Sertifikat / SK Terbit <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="nomor-sk-input"
                    type="text"
                    value={modalNomorSK}
                    onChange={(e) => setModalNomorSK(e.target.value)}
                    placeholder="Contoh: SK-KANTAH/2026/XI/0045"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="catatan-selesai-input" className="block font-semibold text-slate-700 mb-1">
                    Catatan Penyerahan (Opsional)
                  </label>
                  <input
                    id="catatan-selesai-input"
                    type="text"
                    value={modalCatatan}
                    onChange={(e) => setModalCatatan(e.target.value)}
                    placeholder="Sertifikat siap diambil di loket penyerahan."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChangeAppStatus(
                        'SELESAI',
                        modalCatatan || 'Permohonan selesai dan produk telah disahkan siap diserahkan.',
                        modalNomorSK
                      )
                    }
                    disabled={!modalNomorSK.trim() || isProcessing}
                    className="px-3.5 py-1.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white font-medium rounded-lg text-xs disabled:opacity-50"
                  >
                    Sahkan Selesai
                  </button>
                </div>
              </div>
            )}

            {actionModal === 'TOLAK' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Penolakan permohonan akan mengakhiri proses berkas ini. Pastikan alasan yuridis dicantumkan dengan jelas.
                </p>
                <div>
                  <label htmlFor="alasan-tolak-input" className="block font-semibold text-slate-700 mb-1">
                    Alasan Yuridis Penolakan <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="alasan-tolak-input"
                    rows={3}
                    value={modalCatatan}
                    onChange={(e) => setModalCatatan(e.target.value)}
                    placeholder="Contoh: Tanah tercatat dalam status sengketa perdata berdasarkan surat blokir pengadilan."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeAppStatus('DITOLAK', modalCatatan)}
                    disabled={!modalCatatan.trim() || isProcessing}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs disabled:opacity-50"
                  >
                    Tolak Permohonan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
