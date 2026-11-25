'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Building2, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function PengaduanPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    noWhatsapp: '',
    email: '',
    kategori: 'PELAYANAN_LOKET',
    nomorBerkas: '',
    uraian: '',
  });

  // Ambil data akun yang sedang login jika ada
  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.loggedIn && data.user) {
          const u = data.user;
          setFormData((prev) => ({
            ...prev,
            nama: prev.nama || u.nama || u.namaLengkap || '',
            nik: prev.nik || u.nik || '',
            noWhatsapp: prev.noWhatsapp || u.noWhatsapp || '',
            email: prev.email || u.email || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirimkan pengaduan.');
      }

      setTicketNumber(data.nomorTiket);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-[#0b2f57] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Kanal Pelayanan &amp; Pengaduan Masyarakat (DUMAS)</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Layanan Pengaduan &amp; Aspirasi Masyarakat
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Kami berkomitmen mewujudkan pelayanan pertanahan yang transparan, akuntabel, dan bebas dari pungutan liar. Sampaikan laporan kendala atau keluhan Anda melalui formulir online resmi ini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Pengaduan (7 Kolom) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">
                  Formulir Penyampaian Pengaduan Online
                </h2>
                <p className="text-xs text-slate-500">
                  Identitas pelapor dijamin kerahasiaannya sesuai ketentuan undang-undang
                </p>
              </div>

              {submitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      Pengaduan Berhasil Terkirim
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Laporan Anda telah tercatat pada sistem penanganan pengaduan Kantor Pertanahan dengan nomor tiket pengaduan:
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-xs mx-auto">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nomor Tiket Pengaduan</span>
                    <span className="font-mono text-sm font-bold text-[#0b2f57]">{ticketNumber}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Petugas unit verifikasi pengaduan akan menindaklanjuti laporan Anda dalam waktu 1–3 hari kerja melalui WhatsApp / Email terdaftar.
                  </p>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        nama: '',
                        nik: '',
                        noWhatsapp: '',
                        email: '',
                        kategori: 'PELAYANAN_LOKET',
                        nomorBerkas: '',
                        uraian: '',
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Kirim Pengaduan Baru Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nama Lengkap Pelapor <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Sesuai e-KTP"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        NIK (Nomor Induk Kependudukan) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        placeholder="16 Digit NIK"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        No. Handphone / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.noWhatsapp}
                        onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Alamat Email (Opsional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Klasifikasi Pengaduan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      >
                        <option value="PELAYANAN_LOKET">Pelayanan Petugas Loket / Sikap Petugas</option>
                        <option value="KETERLAMBATAN_SOP">Keterlambatan Melebihi Waktu SOP</option>
                        <option value="DUGAAN_PUNGLI">Dugaan Pungutan Liar / Tarif Tidak Sesuai PNBP</option>
                        <option value="SENGKETA_BATAS">Sengketa Batas / Keberatan Pengukuran</option>
                        <option value="INFORMASI_TIDAK_JELAS">Informasi Persyaratan Tidak Jelas</option>
                        <option value="LAINNYA">Lain-lain / Saran Peningkatan Layanan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nomor Berkas / Sertifikat (Jika Ada)
                      </label>
                      <input
                        type="text"
                        value={formData.nomorBerkas}
                        onChange={(e) => setFormData({ ...formData, nomorBerkas: e.target.value })}
                        placeholder="Contoh: 12345/2026 atau SHM No. 456"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Uraian Rinci Pengaduan / Keluhan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.uraian}
                      onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                      placeholder="Jelaskan secara kronologis waktu kejadian, lokasi loket/seksi, nama petugas (jika diketahui), serta kendala yang Anda alami..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800 leading-relaxed"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-[#0b2f57] hover:bg-[#071f3a] text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Mengirimkan Laporan...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirimkan Laporan Pengaduan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Alur & Kontak Pengaduan (5 Kolom) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Alur Penanganan Pengaduan */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
                Tahapan Penanganan Pengaduan
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">Registrasi Laporan</h4>
                    <p className="text-[11px] text-slate-500">Laporan diverifikasi oleh petugas verifikator secara tertib dan akuntabel.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">Pemeriksaan &amp; Klarifikasi</h4>
                    <p className="text-[11px] text-slate-500">Koordinasi dengan seksi teknis terkait (Survei, Penetapan Hak, atau Sengketa).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">Tindak Lanjut &amp; Solusi</h4>
                    <p className="text-[11px] text-slate-500">Perbaikan kendala layanan atau penerbitan rekomendasi tertulis.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">Konfirmasi Penyelesaian</h4>
                    <p className="text-[11px] text-slate-500">Hasil tindak lanjut disampaikan kepada pelapor melalui nomor kontak resmi.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Saluran Pengaduan Lainnya */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs pb-1.5 border-b border-slate-100">
                Kanal Alternatif
              </h3>

              <div className="space-y-2.5 text-slate-600 text-[11px]">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hotline / WhatsApp Dumas: <strong>0811-1068-0000</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Email: <strong>pengaduan@atrbpn.go.id</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Loket Pelayanan Terpadu Satu Pintu (PTSP)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
