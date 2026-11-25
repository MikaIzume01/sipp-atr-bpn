import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  PenLine, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck,
  Building,
  ExternalLink,
  LogOut,
  MapPin,
  Phone
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WargaDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sipp_officer_session');

  if (!sessionCookie?.value) {
    redirect('/admin/login');
  }

  let user: { id?: string; username?: string; nama?: string; role?: string; nik?: string; noWhatsapp?: string; email?: string } = {};
  try {
    user = JSON.parse(sessionCookie.value);
  } catch {
    redirect('/admin/login');
  }

  // Cari berkas permohonan milik warga ini (berdasarkan NIK pemohon, email, atau nama)
  let myApplications: any[] = [];
  try {
    const conditions: any[] = [];
    if (user.nik) conditions.push({ nikPemohon: user.nik });
    if (user.email) conditions.push({ email: user.email });
    if (user.nama) conditions.push({ namaPemohon: { contains: user.nama } });

    myApplications = await prisma.application.findMany({
      where: conditions.length > 0 ? { OR: conditions } : undefined,
      include: {
        service: true,
        dokumen: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error('Error fetching applications for citizen:', e);
  }

  // Cari data pengaduan yang diajukan warga ini
  let myComplaints: any[] = [];
  try {
    const complaintConditions: any[] = [];
    if (user.nik) complaintConditions.push({ nikPelapor: user.nik });
    if (user.email) complaintConditions.push({ email: user.email });
    if (user.nama) complaintConditions.push({ namaPelapor: { contains: user.nama } });

    myComplaints = await prisma.complaint.findMany({
      where: complaintConditions.length > 0 ? { OR: complaintConditions } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Error fetching complaints for citizen:', e);
  }

  const countTotal = myApplications.length;
  const countDiproses = myApplications.filter(a => a.status === 'DIAJUKAN' || a.status === 'DIVERIFIKASI' || a.status === 'DIPROSES').length;
  const countRevisi = myApplications.filter(a => a.status === 'PERLU_REVISI').length;
  const countSelesai = myApplications.filter(a => a.status === 'SELESAI').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DIAJUKAN':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Menunggu Verifikasi</span>;
      case 'DIVERIFIKASI':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Diverifikasi Petugas</span>;
      case 'PERLU_REVISI':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">Perlu Perbaikan Dokumen</span>;
      case 'DIPROSES':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Sedang Diproses Buku Tanah</span>;
      case 'SELESAI':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Sertifikat Selesai</span>;
      case 'DITOLAK':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Ditolak</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Portal Layanan Warga */}
      <section className="bg-[#0b2f57] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Portal Mandiri Pemohon Pertanahan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Selamat Datang, {user.nama}
              </h1>
              <p className="text-xs text-slate-200">
                Kelola berkas permohonan tanah, isi e-formulir, dan pantau proses verifikasi dokumen secara mandiri.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/formulir"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-[#0b2f57] font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Isi E-Formulir</span>
              </Link>
              <Link
                href="/pendaftaran"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg transition-colors border border-white/20"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Pendaftaran Online</span>
              </Link>
              <a
                href="/api/admin/logout"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-medium text-xs rounded-lg transition-colors"
                title="Keluar dari Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </a>
            </div>
          </div>

          {/* Profil Warga Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-900">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Username: <strong className="text-white font-mono">{user.username}</strong></span>
            </span>
            {user.nik && (
              <span className="flex items-center gap-1.5 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-900">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>NIK: <strong className="text-white font-mono">{user.nik}</strong></span>
              </span>
            )}
            {user.noWhatsapp && (
              <span className="flex items-center gap-1.5 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-900">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>No. WA: <strong className="text-white font-mono">{user.noWhatsapp}</strong></span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Akun Warga / Pemohon Aktif</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Ringkasan Status Permohonan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Total Permohonan</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{countTotal}</div>
            <span className="text-[10px] text-slate-400 block">Berkas diajukan</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Sedang Diproses</span>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{countDiproses}</div>
            <span className="text-[10px] text-slate-400 block">Tahapan verifikasi warkah</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Perlu Perbaikan</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{countRevisi}</div>
            <span className="text-[10px] text-slate-400 block">Menunggu revisi dokumen</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Sertifikat Selesai</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{countSelesai}</div>
            <span className="text-[10px] text-slate-400 block">Siap diambil di Loket</span>
          </div>
        </div>

        {/* Daftar Permohonan Tanah Milik Warga */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Berkas Permohonan Tanah Saya
              </h2>
              <p className="text-xs text-slate-500">
                Riwayat dan status terkini seluruh pengajuan permohonan hak atas tanah Anda
              </p>
            </div>

            <Link
              href="/pendaftaran"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b2f57] hover:underline self-start sm:self-auto"
            >
              <span>+ Buat Permohonan Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800">
                  Belum Ada Berkas Permohonan Aktif
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Anda belum pernah mendaftarkan berkas permohonan tanah secara online. Mulai dengan mengisi formulir atau melakukan pendaftaran baru.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/formulir"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Isi E-Formulir Online</span>
                </Link>
                <Link
                  href="/pendaftaran"
                  className="px-3.5 py-2 bg-[#0b2f57] hover:bg-[#071f3a] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Pendaftaran Berkas Online</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myApplications.map((app) => (
                <div key={app.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#0b2f57]">
                          {app.nomorRegistrasi}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {app.service?.nama || 'Permohonan Pelayanan Pertanahan'}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Diajukan: {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>PIN Tracking: <strong className="font-mono text-slate-700">{app.accessPin}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tracking?nomor=${app.nomorRegistrasi}&pin=${app.accessPin}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Lacak Detail</span>
                      </Link>
                    </div>
                  </div>

                  {/* Catatan revisi jika ada */}
                  {app.status === 'PERLU_REVISI' && app.catatanRevisi && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Catatan Perbaikan dari Petugas Loket:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-700">
                        {app.catatanRevisi}
                      </p>
                      <div className="pt-1">
                        <Link
                          href={`/tracking?nomor=${app.nomorRegistrasi}&pin=${app.accessPin}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                        >
                          <span>Unggah Berkas Perbaikan Sekarang →</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Laporan Pengaduan & Aspirasi Dumas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pengaduan &amp; Aspirasi Saya (DUMAS)
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat penyampaian pengaduan kendala layanan dan tindak lanjut dari petugas BPN
              </p>
            </div>

            <Link
              href="/pengaduan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Sampaikan Pengaduan Baru</span>
            </Link>
          </div>

          {myComplaints.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Anda belum pernah mengajukan laporan pengaduan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myComplaints.map((c) => (
                <div key={c.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {c.nomorTiket}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.status === 'SELESAI' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : c.status === 'BARU' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {c.uraian}
                  </p>

                  {c.tanggapanPetugas && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1 text-blue-950">
                      <div className="font-bold text-[11px] text-blue-900">
                        Tindak Lanjut &amp; Solusi dari Petugas BPN ({c.namaPetugas || 'Petugas Loket'}):
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-700">
                        {c.tanggapanPetugas}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
