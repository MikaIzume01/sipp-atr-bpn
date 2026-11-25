import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { User, LogOut, Inbox, ShieldAlert } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sipp_officer_session');

  let officer: { nama: string; role: string; username?: string } | null = null;

  if (sessionCookie?.value) {
    try {
      officer = JSON.parse(sessionCookie.value);
    } catch {
      officer = null;
    }
  }

  // Jika akun adalah warga, arahkan ke portal warga
  if (officer && officer.role === 'WARGA') {
    redirect('/warga');
  }

  // Jika belum login (misal di halaman /admin/login), jangan tampilkan header internal
  if (!officer) {
    return <div className="min-h-screen bg-slate-100 flex flex-col text-xs">{children}</div>;
  }

  let baruComplaintCount = 0;
  try {
    baruComplaintCount = await prisma.complaint.count({ where: { status: 'BARU' } });
  } catch {}

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-xs">
      {/* Officer Top Navbar (Khusus Internal Petugas) */}
      <header className="bg-[#0b2f57] text-white border-b border-[#08223f] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-bpn.png"
                  alt="Logo BPN"
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-white block">
                    KILAT BPN • Portal Petugas
                  </span>
                  <span className="text-[10px] text-slate-300 block -mt-0.5">
                    Kanal Informasi &amp; Layanan Administrasi Tanah • Badan Pertanahan Nasional
                  </span>
                </div>
              </Link>
            </div>

            {/* Center Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/admin"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Antrean Berkas</span>
              </Link>

              <Link
                href="/admin/pengaduan"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Pengaduan Dumas</span>
                {baruComplaintCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {baruComplaintCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right User & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-900 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {officer.nama}
                  </div>
                  <div className="text-[9px] text-amber-300 font-mono">
                    PETUGAS ({officer.role})
                  </div>
                </div>
              </div>

              <a
                href="/api/admin/logout"
                className="p-1.5 px-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/60 transition-colors flex items-center gap-1.5"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Keluar</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Sub Navigation Bar */}
        <div className="bg-[#08223f] border-t border-[#05172b] text-white md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs">
            <Link
              href="/admin"
              className="flex-1 py-1.5 text-center font-semibold rounded bg-white/10 flex items-center justify-center gap-1.5"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Antrean Berkas</span>
            </Link>
            <Link
              href="/admin/pengaduan"
              className="flex-1 py-1.5 text-center font-semibold rounded bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Pengaduan Dumas</span>
              {baruComplaintCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
                  {baruComplaintCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
