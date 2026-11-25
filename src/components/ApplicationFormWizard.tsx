'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  Upload, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  X,
  Lock,
  User
} from 'lucide-react';

interface Requirement {
  id: string;
  namaDokumen: string;
  deskripsi: string | null;
  isWajib: boolean;
  allowedTypes: string;
  maxSizeMB: number;
  templateUrl: string | null;
}

interface ServiceData {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  estimasiHari: number;
  rumusBiaya: string;
  biayaTetap: number;
  isBiayaRumus: boolean;
  persyaratan: Requirement[];
}

export default function ApplicationFormWizard({ service }: { service: ServiceData }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authentication Guard State
  const [authUser, setAuthUser] = useState<{
    id: string;
    username: string;
    nama?: string;
    namaLengkap?: string;
    role: string;
    nik?: string;
    noWhatsapp?: string;
    email?: string;
  } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.loggedIn && data.user) {
          setAuthUser(data.user);
          const name = data.user.nama || data.user.namaLengkap;
          if (name) setNamaPemohon(name);
          if (data.user.nik) setNikPemohon(data.user.nik);
          if (data.user.noWhatsapp) setNoWhatsapp(data.user.noWhatsapp);
          if (data.user.email) setEmail(data.user.email);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  // Success State
  const [successData, setSuccessData] = useState<{
    nomorRegistrasi: string;
    accessPin: string;
    applicationId: string;
    qrCodeDataUrl: string;
  } | null>(null);

  // Step 1: Identitas
  const [tipePemohon, setTipePemohon] = useState<'SENDIRI' | 'KUASA'>('SENDIRI');
  const [namaPemohon, setNamaPemohon] = useState('');
  const [nikPemohon, setNikPemohon] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [alamatPemohon, setAlamatPemohon] = useState('');
  const [namaKuasa, setNamaKuasa] = useState('');
  const [nikKuasa, setNikKuasa] = useState('');
  const [noSuratKuasa, setNoSuratKuasa] = useState('');

  // Step 2: Data Objek Tanah
  const [nomorHak, setNomorHak] = useState('');
  const [jenisHak, setJenisHak] = useState('Hak Milik (SHM)');
  const [luasTanahM2, setLuasTanahM2] = useState<number>(150);
  const [nilaiTanahPerM2, setNilaiTanahPerM2] = useState<number>(12500000);
  const [alamatObjek, setAlamatObjek] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('Gambir');
  const [kota, setKota] = useState('Kota Administrasi Jakarta Pusat');
  const [pbbNop, setPbbNop] = useState('');

  // Step 3: Files (requirementId -> File)
  const [selectedFiles, setSelectedFiles] = useState<{ [reqId: string]: File }>({});
  const [fileErrors, setFileErrors] = useState<{ [reqId: string]: string }>({});

  // Step 4: Pakta Integritas Checkboxes
  const [agreeTidakSengketa, setAgreeTidakSengketa] = useState(false);
  const [agreeKebenaranData, setAgreeKebenaranData] = useState(false);
  const [agreeSanksiHukum, setAgreeSanksiHukum] = useState(false);

  const estimasiPNBP = service.isBiayaRumus
    ? Math.round((luasTanahM2 * nilaiTanahPerM2) / 1000) + (service.biayaTetap || 50000)
    : service.biayaTetap;

  const handleFileChange = (req: Requirement, file: File | null) => {
    if (!file) {
      const nextFiles = { ...selectedFiles };
      delete nextFiles[req.id];
      setSelectedFiles(nextFiles);
      return;
    }

    const maxBytes = req.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileErrors((prev) => ({
        ...prev,
        [req.id]: `Ukuran file melebihi batas maksimal ${req.maxSizeMB} MB.`,
      }));
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = req.allowedTypes.split(',').map((t) => t.trim().toLowerCase());
    if (!allowed.includes(ext) && !allowed.includes('*')) {
      setFileErrors((prev) => ({
        ...prev,
        [req.id]: `Format file .${ext} tidak didukung. Format: ${req.allowedTypes.toUpperCase()}`,
      }));
      return;
    }

    setFileErrors((prev) => {
      const nextErr = { ...prev };
      delete nextErr[req.id];
      return nextErr;
    });

    setSelectedFiles((prev) => ({
      ...prev,
      [req.id]: file,
    }));
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 1) {
      if (!namaPemohon.trim()) {
        setErrorMessage('Nama Pemohon wajib diisi sesuai KTP.');
        return false;
      }
      if (!nikPemohon.trim() || nikPemohon.trim().length !== 16 || !/^\d+$/.test(nikPemohon)) {
        setErrorMessage('NIK wajib berupa 16 digit angka.');
        return false;
      }
      if (!noWhatsapp.trim() || noWhatsapp.trim().length < 9) {
        setErrorMessage('Nomor WhatsApp aktif wajib diisi.');
        return false;
      }
      if (!alamatPemohon.trim()) {
        setErrorMessage('Alamat domisili wajib diisi.');
        return false;
      }
      if (tipePemohon === 'KUASA') {
        if (!namaKuasa.trim() || !nikKuasa.trim() || !noSuratKuasa.trim()) {
          setErrorMessage('Harap lengkapi identitas kuasa dan nomor surat kuasa.');
          return false;
        }
      }
    }

    if (step === 2) {
      if (!nomorHak.trim()) {
        setErrorMessage('Nomor Hak / Sertifikat tanah wajib diisi.');
        return false;
      }
      if (luasTanahM2 <= 0) {
        setErrorMessage('Luas tanah harus lebih besar dari 0 m².');
        return false;
      }
      if (!alamatObjek.trim() || !kelurahan.trim()) {
        setErrorMessage('Alamat letak tanah dan kelurahan wajib diisi.');
        return false;
      }
    }

    if (step === 3) {
      for (const req of service.persyaratan) {
        if (req.isWajib && !selectedFiles[req.id]) {
          setErrorMessage(`Dokumen wajib "${req.namaDokumen}" belum diunggah.`);
          return false;
        }
      }
    }

    if (step === 4) {
      if (!agreeTidakSengketa || !agreeKebenaranData || !agreeSanksiHukum) {
        setErrorMessage('Anda wajib mencentang seluruh pernyataan pakta integritas.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('serviceId', service.id);
      formData.append('tipePemohon', tipePemohon);
      formData.append('namaPemohon', namaPemohon);
      formData.append('nikPemohon', nikPemohon);
      formData.append('noWhatsapp', noWhatsapp);
      formData.append('email', email);
      formData.append('alamatPemohon', alamatPemohon);

      if (tipePemohon === 'KUASA') {
        formData.append('namaKuasa', namaKuasa);
        formData.append('nikKuasa', nikKuasa);
        formData.append('noSuratKuasa', noSuratKuasa);
      }

      const dataObjek = {
        nomorHak,
        jenisHak,
        luasTanahM2,
        nilaiTanahPerM2,
        alamatObjek,
        kelurahan,
        kecamatan,
        kota,
        pbbNop,
        agreeTidakSengketa,
        agreeKebenaranData,
      };
      formData.append('dataObjek', JSON.stringify(dataObjek));

      Object.entries(selectedFiles).forEach(([reqId, file]) => {
        formData.append(`file_${reqId}`, file);
      });

      const res = await fetch('/api/permohonan', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengirimkan permohonan.');
      }

      const qrData = await QRCode.toDataURL(
        `${window.location.origin}/tracking?nomor=${result.nomorRegistrasi}&pin=${result.accessPin}`,
        { width: 200, margin: 1 }
      );

      setSuccessData({
        nomorRegistrasi: result.nomorRegistrasi,
        accessPin: result.accessPin,
        applicationId: result.applicationId,
        qrCodeDataUrl: qrData,
      });
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: '1. Identitas Pemohon' },
    { num: 2, label: '2. Objek Tanah' },
    { num: 3, label: '3. Unggah Dokumen' },
    { num: 4, label: '4. Konfirmasi' },
  ];

  // Success Screen: Official Government Receipt (STPD)
  if (currentStep === 5 && successData) {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border-2 border-slate-300 p-6 space-y-5 print:border-black print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-bpn.png"
                alt="Logo BPN"
                className="w-12 h-12 object-contain"
              />
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase block">
                  KEMENTERIAN AGRARIA DAN TATA RUANG / BADAN PERTANAHAN NASIONAL
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  KANTOR PERTANAHAN KOTA ADMINISTRASI JAKARTA PUSAT
                </h3>
                <span className="text-[10px] text-slate-400 block">
                  KILAT BPN • Layanan Mandiri
                </span>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200 shrink-0">
              STPD RESMI
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 uppercase">
              TANDA TERIMA PENDAFTARAN PERMOHONAN
            </h4>
            <p className="text-xs text-slate-500 font-mono">
              Nomor: <strong className="text-slate-900">{successData.nomorRegistrasi}</strong>
            </p>
          </div>

          {/* Details */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-400 text-[10px] block">Nomor Registrasi:</span>
                <span className="text-xl font-mono font-bold text-slate-900">
                  {successData.nomorRegistrasi}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">PIN Keamanan:</span>
                <span className="font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs">
                  {successData.accessPin}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="shrink-0 bg-white p-2 rounded-lg border border-slate-200 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={successData.qrCodeDataUrl}
                alt="QR Code"
                className="w-24 h-24"
              />
              <span className="text-[9px] text-slate-400 font-mono block mt-1">SCAN UNTUK LACAK</span>
            </div>
          </div>

          {/* Table summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Layanan:</span>
              <span className="font-semibold text-slate-900">{service.nama}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Nama Pemohon:</span>
              <span className="font-semibold text-slate-900">{namaPemohon}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Nomor Sertifikat:</span>
              <span className="font-mono text-slate-900">{nomorHak}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Waktu SOP:</span>
              <span className="font-semibold text-slate-900">
                {service.estimasiHari} Hari Kerja
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
            Petugas loket Kantah Jakarta Pusat akan memverifikasi berkas Anda dalam 1×24 jam kerja. Simpan tanda terima ini untuk memantau status permohonan.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Tanda Terima</span>
          </button>

          <Link
            href={`/tracking?nomor=${successData.nomorRegistrasi}&pin=${successData.accessPin}`}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>Pantau Status Berkas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Wajib Login Guard: Jika belum login, cegah pengisian form dan arahkan ke login
  if (!checkingAuth && !authUser) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-4 my-6 shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Wajib Masuk / Login untuk Pendaftaran Online
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Untuk melakukan pendaftaran berkas pertanahan secara mandiri, Anda harus masuk ke akun Anda terlebih dahulu agar berkas permohonan dapat dipantau langsung melalui dashboard warga Anda.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/admin/login?redirect=${encodeURIComponent(`/layanan/${service.kode}/daftar`)}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Masuk ke Akun Sekarang</span>
          </Link>
          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200"
          >
            <span>Daftar Akun Baru</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 space-y-6">
      {/* Stepper */}
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {stepsList.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div key={step.num} className="flex flex-col items-center gap-1 text-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-slate-700 text-white'
                      : isCurrent
                      ? 'bg-[#0b2f57] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                </div>
                <span
                  className={`text-[10px] hidden sm:inline ${
                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: IDENTITAS */}
      {currentStep === 1 && (
        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Identitas Pemohon</h3>
            <p className="text-slate-500 text-[11px]">
              Sesuai dengan Kartu Tanda Penduduk Elektronik (e-KTP).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label
              className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-colors ${
                tipePemohon === 'SENDIRI'
                  ? 'border-[#0b2f57] bg-slate-50 font-semibold'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="tipePemohon"
                checked={tipePemohon === 'SENDIRI'}
                onChange={() => setTipePemohon('SENDIRI')}
                className="w-3.5 h-3.5 text-[#0b2f57]"
              />
              <span className="text-xs text-slate-800">Atas Nama Sendiri</span>
            </label>

            <label
              className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-colors ${
                tipePemohon === 'KUASA'
                  ? 'border-[#0b2f57] bg-slate-50 font-semibold'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="tipePemohon"
                checked={tipePemohon === 'KUASA'}
                onChange={() => setTipePemohon('KUASA')}
                className="w-3.5 h-3.5 text-[#0b2f57]"
              />
              <span className="text-xs text-slate-800">Melalui Kuasa / PPAT</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="form-nama-f" className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-600">*</span>
              </label>
              <input
                id="form-nama-f"
                type="text"
                value={namaPemohon}
                onChange={(e) => setNamaPemohon(e.target.value)}
                placeholder="Ahmad Fauzi Supriyadi"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="form-nik-f" className="block font-semibold text-slate-700 mb-1">
                NIK (16 Digit) <span className="text-rose-600">*</span>
              </label>
              <input
                id="form-nik-f"
                type="text"
                maxLength={16}
                value={nikPemohon}
                onChange={(e) => setNikPemohon(e.target.value.replace(/\D/g, ''))}
                placeholder="3171011208850003"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="form-wa-f" className="block font-semibold text-slate-700 mb-1">
                Nomor WhatsApp <span className="text-rose-600">*</span>
              </label>
              <input
                id="form-wa-f"
                type="tel"
                value={noWhatsapp}
                onChange={(e) => setNoWhatsapp(e.target.value)}
                placeholder="081289123456"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="form-email-f" className="block font-semibold text-slate-700 mb-1">
                Email (Opsional)
              </label>
              <input
                id="form-email-f"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fauzi@email.com"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="form-alamat-f" className="block font-semibold text-slate-700 mb-1">
                Alamat Domisili <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="form-alamat-f"
                rows={2}
                value={alamatPemohon}
                onChange={(e) => setAlamatPemohon(e.target.value)}
                placeholder="Jl. Kebon Sirih No. 42, RT 002 / RW 001, Kel. Gambir, Jakarta Pusat"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>
          </div>

          {tipePemohon === 'KUASA' && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="font-semibold text-xs text-slate-800 block">Identitas Kuasa / PPAT:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label htmlFor="form-kuasa-nama-f" className="block text-slate-600 mb-1 text-[11px]">
                    Nama Kuasa *
                  </label>
                  <input
                    id="form-kuasa-nama-f"
                    type="text"
                    value={namaKuasa}
                    onChange={(e) => setNamaKuasa(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="form-kuasa-nik-f" className="block text-slate-600 mb-1 text-[11px]">
                    NIK Kuasa *
                  </label>
                  <input
                    id="form-kuasa-nik-f"
                    type="text"
                    maxLength={16}
                    value={nikKuasa}
                    onChange={(e) => setNikKuasa(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="form-kuasa-nosurat-f" className="block text-slate-600 mb-1 text-[11px]">
                    No. Surat Kuasa *
                  </label>
                  <input
                    id="form-kuasa-nosurat-f"
                    type="text"
                    value={noSuratKuasa}
                    onChange={(e) => setNoSuratKuasa(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: DATA OBJEK TANAH */}
      {currentStep === 2 && (
        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Data Objek Tanah</h3>
            <p className="text-slate-500 text-[11px]">
              Data warkah bidang tanah di Jakarta Pusat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="form-obj-nomorhak-f" className="block font-semibold text-slate-700 mb-1">
                Nomor Sertifikat / Hak <span className="text-rose-600">*</span>
              </label>
              <input
                id="form-obj-nomorhak-f"
                type="text"
                value={nomorHak}
                onChange={(e) => setNomorHak(e.target.value)}
                placeholder="SHM No. 1284 / Gambir"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label htmlFor="form-obj-jenishak-f" className="block font-semibold text-slate-700 mb-1">
                Jenis Hak <span className="text-rose-600">*</span>
              </label>
              <select
                id="form-obj-jenishak-f"
                value={jenisHak}
                onChange={(e) => setJenisHak(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
              >
                <option value="Hak Milik (SHM)">Hak Milik (SHM)</option>
                <option value="Hak Guna Bangunan (HGB)">Hak Guna Bangunan (HGB)</option>
                <option value="Hak Pakai (HP)">Hak Pakai (HP)</option>
                <option value="Hak Milik Sarusun (HMSRS)">Hak Milik Sarusun (Apartemen)</option>
                <option value="Hak Pengelolaan (HPL)">Hak Pengelolaan (HPL)</option>
              </select>
            </div>

            <div>
              <label htmlFor="form-obj-luas-f" className="block font-semibold text-slate-700 mb-1">
                Luas Tanah (m²) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="form-obj-luas-f"
                  type="number"
                  min={1}
                  value={luasTanahM2 || ''}
                  onChange={(e) => setLuasTanahM2(Number(e.target.value))}
                  placeholder="150"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  m²
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="form-obj-njop-f" className="block font-semibold text-slate-700 mb-1">
                NJOP per m² (Rp) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="form-obj-njop-f"
                  type="number"
                  step={500000}
                  value={nilaiTanahPerM2 || ''}
                  onChange={(e) => setNilaiTanahPerM2(Number(e.target.value))}
                  placeholder="12500000"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  /m²
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="form-obj-alamat-f" className="block font-semibold text-slate-700 mb-1">
                Alamat / Letak Tanah Objek <span className="text-rose-600">*</span>
              </label>
              <input
                id="form-obj-alamat-f"
                type="text"
                value={alamatObjek}
                onChange={(e) => setAlamatObjek(e.target.value)}
                placeholder="Jl. Kebon Sirih Barat No. 15, RT 003 / RW 002"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="form-obj-kel-f" className="block font-semibold text-slate-700 mb-1">
                Kelurahan <span className="text-rose-600">*</span>
              </label>
              <input
                id="form-obj-kel-f"
                type="text"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                placeholder="Gambir"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="form-obj-kec-f" className="block font-semibold text-slate-700 mb-1">
                Kecamatan <span className="text-rose-600">*</span>
              </label>
              <select
                id="form-obj-kec-f"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
              >
                <option value="Gambir">Gambir</option>
                <option value="Menteng">Menteng</option>
                <option value="Tanah Abang">Tanah Abang</option>
                <option value="Senen">Senen</option>
                <option value="Cempaka Putih">Cempaka Putih</option>
                <option value="Johar Baru">Johar Baru</option>
                <option value="Kemayoran">Kemayoran</option>
                <option value="Sawah Besar">Sawah Besar</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Estimasi Waktu SOP:</span>
            <span className="font-semibold text-slate-900">
              {service.estimasiHari} Hari Kerja
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: UNGGAH DOKUMEN */}
      {currentStep === 3 && (
        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Unggah Dokumen Warkah</h3>
            <p className="text-slate-500 text-[11px]">
              Format file: PDF, JPG, atau PNG.
            </p>
          </div>

          <div className="space-y-2.5">
            {service.persyaratan.map((req, idx) => {
              const file = selectedFiles[req.id];
              const error = fileErrors[req.id];

              return (
                <div
                  key={req.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{req.namaDokumen}</span>
                        {req.isWajib && (
                          <span className="text-[9px] text-rose-700 uppercase">
                            *Wajib
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Maks {req.maxSizeMB} MB
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-7 sm:pl-0">
                    {file ? (
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-300">
                        <span className="font-medium text-slate-700 truncate max-w-[140px] text-[11px]">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleFileChange(req, null)}
                          className="p-0.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-medium rounded transition-colors">
                        <Upload className="w-3 h-3 text-slate-600" />
                        <span>Pilih File</span>
                        <input
                          type="file"
                          className="hidden"
                          accept={req.allowedTypes.split(',').map((ext) => `.${ext.trim()}`).join(',')}
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            handleFileChange(req, f);
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {error && (
                    <div className="w-full text-[11px] text-rose-600 pl-7">
                      {error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: PAKTA INTEGRITAS */}
      {currentStep === 4 && (
        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Pakta Integritas &amp; Konfirmasi</h3>
            <p className="text-slate-500 text-[11px]">
              Tinjau ringkasan data sebelum mengirimkan berkas.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Layanan:</span>
              <span className="font-semibold text-slate-900">{service.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Pemohon:</span>
              <span className="font-semibold text-slate-900">{namaPemohon}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Nomor Sertifikat:</span>
              <span className="font-mono text-slate-900">{nomorHak}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Waktu SOP:</span>
              <span className="font-semibold text-slate-900">
                {service.estimasiHari} Hari Kerja
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2 p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTidakSengketa}
                onChange={(e) => setAgreeTidakSengketa(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0b2f57] rounded mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-slate-700 leading-relaxed">
                Tanah yang dimohon dikuasai secara fisik dan tidak dalam perkara/sengketa di pengadilan.
              </span>
            </label>

            <label className="flex items-start gap-2 p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeKebenaranData}
                onChange={(e) => setAgreeKebenaranData(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0b2f57] rounded mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-slate-700 leading-relaxed">
                Seluruh data dan dokumen pindaian yang dilampirkan adalah benar dan sah.
              </span>
            </label>

            <label className="flex items-start gap-2 p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeSanksiHukum}
                onChange={(e) => setAgreeSanksiHukum(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0b2f57] rounded mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-slate-700 leading-relaxed">
                Bersedia dituntut pidana pemalsuan dokumen (Pasal 263 KUHP) apabila keterangan terbukti palsu.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Nav Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Kembali</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-semibold flex items-center gap-1"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white font-bold flex items-center gap-1 disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirimkan...' : 'Kirim Permohonan'}
          </button>
        )}
      </div>
    </div>
  );
}
