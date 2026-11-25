'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  PenLine, 
  Search, 
  Printer, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  User,
  RotateCcw,
  Sparkles,
  FileText,
  Folder,
  Layers,
  HelpCircle,
  Eye,
  Edit3,
  Lock
} from 'lucide-react';
import { DRIVE_FORM_GROUPS, ALL_DRIVE_FILES, DriveFormItem } from '@/lib/driveForms';

function FormulirContent() {
  const searchParams = useSearchParams();
  const formParam = searchParams.get('form');
  const terkaitParam = searchParams.get('terkait');

  const [activeTab, setActiveTab] = useState<'katalog' | 'editor'>('katalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Currently selected form to fill
  const [currentForm, setCurrentForm] = useState<DriveFormItem>(ALL_DRIVE_FILES[0]);

  // Auth Guard State
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

  // Form Fields State
  const [formData, setFormData] = useState({
    // Pemohon
    namaPemohon: '',
    nikPemohon: '',
    tempatTanggalLahir: '',
    pekerjaan: '',
    alamatPemohon: '',
    noWhatsapp: '',
    email: '',

    // Kuasa
    adaKuasa: false,
    namaKuasa: '',
    nikKuasa: '',
    alamatKuasa: '',
    noSuratKuasa: '',

    // Tanah / Objek
    jenisHak: 'Hak Milik (SHM)',
    nomorSertifikat: '',
    nib: '',
    luasTanah: '',
    letakTanah: '',
    kelurahan: '',
    kecamatan: '',
    kota: 'Jakarta Pusat',

    // Data Tambahan Khusus Jenis Formulir
    namaPihakKedua: '', // Penjual/Pembeli/Ahli Waris
    namaKreditur: '', // Bank/Kreditur untuk Roya
    nomorSHT: '', // Sertifikat Hak Tanggungan
    nomorLaporanPolisi: '', // Untuk Sertifikat Hilang
    alasanPermohonan: '',
    batasUtara: '',
    batasTimur: '',
    batasSelatan: '',
    batasBarat: '',

    // Pernyataan
    setujuPernyataan: true,
  });

  // Handle URL query parameters to auto-select form
  useEffect(() => {
    if (formParam) {
      const found = ALL_DRIVE_FILES.find((f) => f.name.toLowerCase().includes(formParam.toLowerCase()));
      if (found) {
        setCurrentForm(found);
        setActiveTab('editor');
      }
    } else if (terkaitParam) {
      const found = ALL_DRIVE_FILES.find((f) => f.terkaitLayanan === terkaitParam);
      if (found) {
        setCurrentForm(found);
        setActiveTab('editor');
      }
    }
  }, [formParam, terkaitParam]);

  // Check auth user status
  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.loggedIn && data.user) {
          setAuthUser(data.user);
          const name = data.user.nama || data.user.namaLengkap;
          setFormData((prev) => ({
            ...prev,
            namaPemohon: prev.namaPemohon || name || '',
            nikPemohon: prev.nikPemohon || data.user.nik || '',
            noWhatsapp: prev.noWhatsapp || data.user.noWhatsapp || '',
            email: prev.email || data.user.email || '',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    DRIVE_FORM_GROUPS.forEach((g) => {
      g.items.forEach((item) => set.add(item.category));
    });
    return ['Semua', ...Array.from(set)];
  }, []);

  // Filtered Groups for catalog
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return DRIVE_FORM_GROUPS.map((group) => {
      const matchGroupName = group.folderName.toLowerCase().includes(q);
      const matchingItems = group.items.filter((item) => {
        const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
        const matchQuery =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.deskripsi.toLowerCase().includes(q) ||
          group.folderName.toLowerCase().includes(q);
        return matchCategory && (matchQuery || matchGroupName);
      });

      return {
        ...group,
        items: matchingItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery, selectedCategory]);

  // Select form and switch to editor
  const handleSelectForm = (item: DriveFormItem) => {
    setCurrentForm(item);
    setActiveTab('editor');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Demo autofill
  const handleFillDemo = () => {
    setFormData({
      namaPemohon: 'Bambang Sudirman, S.E.',
      nikPemohon: '3171051809850003',
      tempatTanggalLahir: 'Jakarta, 18 September 1985',
      pekerjaan: 'Wiraswasta',
      alamatPemohon: 'Jl. Percetakan Negara No. 45 RT 004 / RW 002',
      noWhatsapp: '081289123456',
      email: 'bambang.sudirman@gmail.com',
      adaKuasa: false,
      namaKuasa: '',
      nikKuasa: '',
      alamatKuasa: '',
      noSuratKuasa: '',
      jenisHak: 'Hak Milik (SHM)',
      nomorSertifikat: 'SHM No. 01482 / Cempaka Putih Timur',
      nib: '09.01.03.04.01234',
      luasTanah: '185',
      letakTanah: 'Jl. Rawasari Barat IX No. 12',
      kelurahan: 'Cempaka Putih Timur',
      kecamatan: 'Cempaka Putih',
      kota: 'Jakarta Pusat',
      namaPihakKedua: 'H. Suryadi Pratama',
      namaKreditur: 'PT. Bank Rakyat Indonesia (Persero) Tbk',
      nomorSHT: 'SHT No. 08291/2021',
      nomorLaporanPolisi: 'LP/B/1429/XI/2026/SPKT/POLRES JAKPUS',
      alasanPermohonan: 'Untuk tertib administrasi pertanahan dan kepastian hak atas tanah yang sah.',
      batasUtara: 'Tanah Rumah Bapak Hendra Gunawan',
      batasTimur: 'Jalan Lingkungan / Saluran Air',
      batasSelatan: 'Tanah Ibu Siti Nurhaliza',
      batasBarat: 'Jalan Rawasari Barat IX',
      setujuPernyataan: true,
    });
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Print Specific Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Hero Header */}
      <section className="no-print bg-[#0b2f57] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <PenLine className="w-4 h-4 text-slate-300" />
            <span>Sistem E-Formulir Mandiri Kementerian ATR / BPN</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Pusat E-Formulir Pertanahan Online
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Pemohon kini tidak perlu mengunduh blangko kosong secara manual. Isi formulir permohonan, surat kuasa, dan surat pernyataan langsung di halaman ini, lalu pratinjau dan cetak dokumen resmi yang siap ditandatangani.
              </p>
            </div>


          </div>

          {/* Mode Switcher Tabs */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('katalog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'katalog'
                  ? 'bg-white text-[#0b2f57] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Pilih Formulir ({ALL_DRIVE_FILES.length} Template)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-white text-[#0b2f57] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>2. Lembar Pengisian &amp; Pratinjau Cetak</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: KATALOG PILIH FORMULIR                              */}
        {/* ========================================================= */}
        {activeTab === 'katalog' && (
          <div className="no-print space-y-6">
            {/* Search & Category Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari formulir untuk diisi (Peralihan Jual Beli, Roya, Hilang, Pengukuran, Blokir, SKPT)..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1.5 self-end md:self-center">
                  <span className="w-2 h-2 rounded-full bg-[#0b2f57]"></span>
                  <span>Tersedia {ALL_DRIVE_FILES.length} Formulir Resmi</span>
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-[#0b2f57] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Folder Groups & Interactive Action Cards */}
            <div className="space-y-8">
              {filteredGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-[#0b2f57] fill-[#0b2f57]/20" />
                      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {group.folderName}
                      </h2>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                        {group.items.length} Formulir
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              BPN
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0b2f57] transition-colors">
                            {item.name.replace(/\.pdf$/i, '')}
                          </h3>

                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {item.deskripsi}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {item.terkaitLayanan ? (
                            <Link
                              href={`/layanan/${item.terkaitLayanan}`}
                              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                            >
                              SOP Layanan
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400">Blangko Standar</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSelectForm(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold transition-colors shadow-2xs"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                            <span>Isi Formulir Ini</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BELUM LOGIN / WAJIB LOGIN                          */}
        {/* ========================================================= */}
        {activeTab === 'editor' && !checkingAuth && !authUser && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-4 my-8 shadow-sm">
            <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Wajib Masuk / Login untuk Mengisi Formulir
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesuai ketentuan keamanan dan keabsahan warkah permohonan pertanahan, Anda harus masuk ke akun Anda terlebih dahulu sebelum dapat mengisi, menyimpan, dan mencetak formulir resmi ini.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/admin/login?redirect=${encodeURIComponent('/formulir?form=' + encodeURIComponent(currentForm.name))}`}
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
        )}

        {/* ========================================================= */}
        {/* TAB 2: EDITOR PENGISIAN FORMULIR & LIVE PRINT PREVIEW     */}
        {/* ========================================================= */}
        {activeTab === 'editor' && (authUser || checkingAuth) && (
          <div className="space-y-6">
            {/* Top Toolbar in Editor */}
            <div className="no-print bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('katalog')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ← Ganti Formulir
                </button>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Sedang Mengisi Formulir:
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md">
                    {currentForm.name.replace(/\.pdf$/i, '')}
                  </h2>
                </div>
              </div>


            </div>

            {/* Split Screen: Form Editor (Kiri) & Live Surat Preview (Kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* KOLOM KIRI: INPUT FORMULIR INTERAKTIF (5 Kolom) */}
              <div className="no-print lg:col-span-5 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 text-xs shadow-xs">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wide">
                      Data Permohonan Formulir
                    </h3>
                    <span className="text-[10px] text-slate-400">Otomatis terisi ke surat</span>
                  </div>

                  {/* Section 1: Identitas Pemohon */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <User className="w-3.5 h-3.5" />
                      <span>1. Identitas Pemohon</span>
                    </h4>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.namaPemohon}
                        onChange={(e) => setFormData({ ...formData, namaPemohon: e.target.value })}
                        placeholder="Contoh: Bambang Sudirman, S.E."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          NIK (16 Digit) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nikPemohon}
                          onChange={(e) => setFormData({ ...formData, nikPemohon: e.target.value })}
                          placeholder="3171..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Pekerjaan
                        </label>
                        <input
                          type="text"
                          value={formData.pekerjaan}
                          onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                          placeholder="Contoh: Karyawan Swasta"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Tempat &amp; Tanggal Lahir
                      </label>
                      <input
                        type="text"
                        value={formData.tempatTanggalLahir}
                        onChange={(e) => setFormData({ ...formData, tempatTanggalLahir: e.target.value })}
                        placeholder="Jakarta, 18 September 1985"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Alamat Domisili Sesuai KTP <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.alamatPemohon}
                        onChange={(e) => setFormData({ ...formData, alamatPemohon: e.target.value })}
                        placeholder="Jl. Melati No. 10 RT 001 RW 002"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          No. WhatsApp / HP <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.noWhatsapp}
                          onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value })}
                          placeholder="081234567890"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="nama@email.com"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Data Tanah / Objek */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>2. Data Bidang Tanah / Objek</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Jenis Hak
                        </label>
                        <select
                          value={formData.jenisHak}
                          onChange={(e) => setFormData({ ...formData, jenisHak: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        >
                          <option value="Hak Milik (SHM)">Hak Milik (SHM)</option>
                          <option value="Hak Guna Bangunan (HGB)">Hak Guna Bangunan (HGB)</option>
                          <option value="Hak Pakai (HP)">Hak Pakai (HP)</option>
                          <option value="Hak Milik Atas Satuan Rumah Susun (HMSRS)">HMSRS</option>
                          <option value="Tanah Bekas Milik Adat / Girik">Girik / Adat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Luas Tanah (m²) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.luasTanah}
                          onChange={(e) => setFormData({ ...formData, luasTanah: e.target.value })}
                          placeholder="Contoh: 200"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Nomor Sertifikat / Hak <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nomorSertifikat}
                          onChange={(e) => setFormData({ ...formData, nomorSertifikat: e.target.value })}
                          placeholder="No. 01234/Kelurahan"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          NIB (Jika Ada)
                        </label>
                        <input
                          type="text"
                          value={formData.nib}
                          onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
                          placeholder="09.01.03..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Alamat Letak Bidang Tanah <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.letakTanah}
                        onChange={(e) => setFormData({ ...formData, letakTanah: e.target.value })}
                        placeholder="Nama jalan, nomor rumah, RT / RW"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Kelurahan / Desa
                        </label>
                        <input
                          type="text"
                          value={formData.kelurahan}
                          onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                          placeholder="Nama Kelurahan"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Kecamatan
                        </label>
                        <input
                          type="text"
                          value={formData.kecamatan}
                          onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                          placeholder="Nama Kecamatan"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Data Khusus Formulir Terkait */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>3. Data Tambahan Permohonan</span>
                    </h4>

                    {/* Conditional Fields based on form category */}
                    {currentForm.category === 'Peralihan Hak' && (
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Nama Pihak Kedua (Penjual / Penerima Hibah / Ahli Waris)
                        </label>
                        <input
                          type="text"
                          value={formData.namaPihakKedua}
                          onChange={(e) => setFormData({ ...formData, namaPihakKedua: e.target.value })}
                          placeholder="Nama pihak kedua sesuai akta PPAT"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                        />
                      </div>
                    )}

                    {currentForm.category === 'Roya & Jaminan' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">
                            Nama Bank / Kreditur
                          </label>
                          <input
                            type="text"
                            value={formData.namaKreditur}
                            onChange={(e) => setFormData({ ...formData, namaKreditur: e.target.value })}
                            placeholder="PT. Bank ..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">
                            No. Sertifikat Hak Tanggungan (SHT)
                          </label>
                          <input
                            type="text"
                            value={formData.nomorSHT}
                            onChange={(e) => setFormData({ ...formData, nomorSHT: e.target.value })}
                            placeholder="SHT No. ..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {currentForm.category === 'Pemeliharaan Sertifikat' && (
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          No. Laporan Kehilangan Kepolisian (Jika Hilang)
                        </label>
                        <input
                          type="text"
                          value={formData.nomorLaporanPolisi}
                          onChange={(e) => setFormData({ ...formData, nomorLaporanPolisi: e.target.value })}
                          placeholder="LP/B/.../SPKT"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-mono"
                        />
                      </div>
                    )}

                    {currentForm.category === 'Pengukuran & Pemetaan' && (
                      <div className="space-y-2">
                        <label className="block text-slate-700 font-medium">
                          Batas-Batas Bidang Tanah:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={formData.batasUtara}
                            onChange={(e) => setFormData({ ...formData, batasUtara: e.target.value })}
                            placeholder="Utara: Tanah Bpk..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                          />
                          <input
                            type="text"
                            value={formData.batasTimur}
                            onChange={(e) => setFormData({ ...formData, batasTimur: e.target.value })}
                            placeholder="Timur: Jalan..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                          />
                          <input
                            type="text"
                            value={formData.batasSelatan}
                            onChange={(e) => setFormData({ ...formData, batasSelatan: e.target.value })}
                            placeholder="Selatan: Tanah Ibu..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                          />
                          <input
                            type="text"
                            value={formData.batasBarat}
                            onChange={(e) => setFormData({ ...formData, batasBarat: e.target.value })}
                            placeholder="Barat: Saluran..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Keperluan / Alasan Permohonan
                      </label>
                      <textarea
                        rows={3}
                        value={formData.alasanPermohonan}
                        onChange={(e) => setFormData({ ...formData, alasanPermohonan: e.target.value })}
                        placeholder="Tuliskan keterangan pendukung atau alasan pengajuan permohonan..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Section 4: Pernyataan & Tombol Aksi */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="flex items-start gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.setujuPernyataan}
                        onChange={(e) => setFormData({ ...formData, setujuPernyataan: e.target.checked })}
                        className="mt-0.5 rounded text-[#0b2f57] focus:ring-[#0b2f57]"
                      />
                      <span className="text-[11px] text-slate-700 leading-relaxed">
                        Saya menyatakan dengan sebenarnya bahwa data yang diisi di atas adalah sah, tanah tidak dalam sengketa, dan dikuasai secara fisik dengan iktikad baik.
                      </span>
                    </label>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="w-full py-2.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak / Simpan Lembar Formulir Terisi</span>
                      </button>

                      <Link
                        href={`/layanan/${currentForm.terkaitLayanan || 'jualb'}/daftar`}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
                      >
                        <span>Lanjut ke Pendaftaran Berkas Online</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: PRATINJAU DOKUMEN SURAT RESMI (7 Kolom) */}
              <div className="lg:col-span-7">
                <div className="sticky top-20">
                  <div className="no-print pb-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                      <Eye className="w-4 h-4 text-[#0b2f57]" />
                      <span>Lembar Pratinjau Dokumen Format Resmi ATR/BPN</span>
                    </span>

                  </div>

                  {/* KERTAS RESMI BERKAS (ID #print-area untuk window.print) */}
                  <div
                    id="print-area"
                    className="bg-white rounded-xl border border-slate-300 shadow-md p-8 sm:p-10 font-serif text-slate-900 leading-relaxed text-xs space-y-6"
                    style={{ minHeight: '800px' }}
                  >
                    {/* Kop Surat Resmi Kementerian ATR/BPN */}
                    <div className="border-b-2 border-slate-900 pb-3 mb-3">
                      <div className="flex items-center gap-4">
                        {/* Logo Instansi ATR/BPN */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logo-bpn.png"
                          alt="Logo Kementerian ATR/BPN"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
                        />
                        <div className="text-center flex-1 font-serif">
                          <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-900 leading-tight">
                            KEMENTERIAN AGRARIA DAN TATA RUANG /
                          </h3>
                          <h2 className="font-black text-xs sm:text-sm uppercase tracking-tight text-slate-950 leading-tight">
                            BADAN PERTANAHAN NASIONAL REPUBLIK INDONESIA
                          </h2>
                          <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-wide text-slate-800 mt-0.5">
                            KANTOR PERTANAHAN KOTA ADMINISTRASI {formData.kota.toUpperCase()}
                          </h4>
                          <p className="text-[9px] font-sans text-slate-600 mt-1 leading-normal">
                            Jl. H. Samanhudi No. 28, Pasar Baru, Sawah Besar, Jakarta Pusat 10710
                            <br />
                            Telepon: (021) 3845084 • Laman: https://jakartapusat.atrbpn.go.id
                          </p>
                        </div>
                      </div>
                      {/* Garis Ganda Surat Resmi Pemerintah */}
                      <div className="mt-3 space-y-0.5">
                        <div className="border-b-2 border-slate-950"></div>
                        <div className="border-b border-slate-950"></div>
                      </div>
                    </div>

                    {/* Judul Formulir */}
                    <div className="text-center space-y-1 pt-1">
                      <h1 className="font-bold text-sm sm:text-base uppercase underline underline-offset-4 tracking-wide">
                        SURAT PERMOHONAN PENDAFTARAN / PELAYANAN
                      </h1>
                      <p className="text-xs font-semibold text-slate-800">
                        {currentForm.name.replace(/\.pdf$/i, '').toUpperCase()}
                      </p>
                    </div>

                    {/* Lampiran & Kepada */}
                    <div className="pt-2 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Perihal : Permohonan Pelayanan Pertanahan</span>
                        <span className="font-sans text-[11px]">
                          Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <p>
                        Kepada Yth.<br />
                        <strong>Kepala Kantor Pertanahan Kota Administrasi {formData.kota}</strong><br />
                        di Tempat
                      </p>
                    </div>

                    {/* Pembuka */}
                    <p className="text-xs text-justify">
                      Yang bertanda tangan di bawah ini, saya mengajukan permohonan pelayanan pertanahan dengan rincian data sebagai berikut:
                    </p>

                    {/* Tabel Data Pemohon */}
                    <div className="space-y-1.5 pl-2 font-sans text-[11px]">
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">1. Nama Lengkap</span>
                        <span className="col-span-8 font-bold text-slate-900">: {formData.namaPemohon || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">2. NIK</span>
                        <span className="col-span-8 font-mono">: {formData.nikPemohon || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">3. Tempat, Tgl Lahir</span>
                        <span className="col-span-8">: {formData.tempatTanggalLahir || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">4. Pekerjaan</span>
                        <span className="col-span-8">: {formData.pekerjaan || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">5. Alamat Domisili</span>
                        <span className="col-span-8">: {formData.alamatPemohon || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">6. No. Telepon / WA</span>
                        <span className="col-span-8">: {formData.noWhatsapp || '...................................................'}</span>
                      </div>
                    </div>

                    {/* Tabel Data Objek Tanah */}
                    <div className="space-y-1.5 pl-2 font-sans text-[11px] pt-1">
                      <p className="font-serif font-bold text-xs text-slate-900 -ml-2">Mengenai bidang tanah dengan data:</p>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">1. Jenis &amp; Nomor Hak</span>
                        <span className="col-span-8 font-bold">: {formData.jenisHak} {formData.nomorSertifikat || '........................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">2. NIB</span>
                        <span className="col-span-8 font-mono">: {formData.nib || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">3. Luas Tanah</span>
                        <span className="col-span-8">: {formData.luasTanah ? `${formData.luasTanah} m²` : '................ m²'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">4. Letak Tanah</span>
                        <span className="col-span-8">: {formData.letakTanah || '...................................................'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 font-semibold text-slate-700">5. Kelurahan / Kec.</span>
                        <span className="col-span-8">: Kel. {formData.kelurahan || '..................'}, Kec. {formData.kecamatan || '..................'}</span>
                      </div>
                    </div>

                    {/* Keterangan Khusus Formulir Terkait (Format Resmi & Rapi) */}
                    {(formData.namaPihakKedua || formData.namaKreditur || formData.nomorLaporanPolisi || formData.alasanPermohonan) && (
                      <div className="space-y-1.5 pl-2 font-sans text-[11px] pt-1">
                        <p className="font-serif font-bold text-xs text-slate-900 -ml-2">Keterangan Khusus Permohonan:</p>
                        {formData.namaPihakKedua && (
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-slate-700">• Pihak Terkait</span>
                            <span className="col-span-8 font-medium text-slate-900">: {formData.namaPihakKedua}</span>
                          </div>
                        )}
                        {formData.namaKreditur && (
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-slate-700">• Kreditur / Bank</span>
                            <span className="col-span-8 font-medium text-slate-900">: {formData.namaKreditur} {formData.nomorSHT ? `(No. SHT: ${formData.nomorSHT})` : ''}</span>
                          </div>
                        )}
                        {formData.nomorLaporanPolisi && (
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-slate-700">• Laporan Kehilangan</span>
                            <span className="col-span-8 font-mono text-slate-900">: {formData.nomorLaporanPolisi}</span>
                          </div>
                        )}
                        {formData.alasanPermohonan && (
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold text-slate-700">• Alasan / Keperluan</span>
                            <span className="col-span-8 text-slate-900">: {formData.alasanPermohonan}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pernyataan Tanggung Jawab */}
                    <div className="pt-2 text-justify text-[11px] leading-relaxed">
                      <p>
                        Dengan ini saya menyatakan bahwa tanah tersebut di atas benar-benar dikuasai secara fisik dengan iktikad baik, tidak sedang menjadi jaminan hutang lain, dan tidak dalam sengketa baik batas maupun pemilikan dengan pihak mana pun.
                      </p>
                      <p className="mt-1">
                        Demikian surat permohonan ini saya buat dengan sebenarnya dengan penuh tanggung jawab menurut hukum.
                      </p>
                    </div>

                    {/* Tanda Tangan & Kotak Meterai */}
                    <div className="pt-6 grid grid-cols-2 gap-4 text-center text-xs">
                      <div>
                        <p className="text-[11px]">Petugas Penerima Berkas,</p>
                        <div className="h-20"></div>
                        <p className="font-semibold underline">...................................................</p>
                        <p className="text-[10px] text-slate-500 font-sans">NIP. .........................................</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px]">
                          {formData.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[11px]">Pemohon,</p>
                        <div className="h-16 flex items-center justify-center">
                          <div className="w-20 h-10 border border-dashed border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-400 font-sans">
                            Meterai 10.000
                          </div>
                        </div>
                        <p className="font-bold underline">
                          ( {formData.namaPemohon || '...........................................'} )
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormulirPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Memuat Formulir Digital...</div>}>
      <FormulirContent />
    </Suspense>
  );
}
