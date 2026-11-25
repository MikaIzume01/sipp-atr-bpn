'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  FileText, 
  PenLine,
  Search, 
  User, 
  Menu, 
  X, 
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  LogOut,
  LayoutDashboard,
  FolderOpen
} from 'lucide-react';

interface AuthUser {
  nama: string;
  role: string;
  username: string;
  nik?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Cek status sesi login
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn && data.user) {
          setAuthUser(data.user);
        } else {
          setAuthUser(null);
        }
      })
      .catch(() => setAuthUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setAuthUser(null);
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  // Sembunyikan Navbar publik bila sedang berada di portal internal petugas (/admin)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Informasi Layanan', href: '/layanan', icon: FileText },
    { name: 'E-Formulir (Isi Online)', href: '/formulir', icon: PenLine },
    { name: 'Pendaftaran Online', href: '/pendaftaran', icon: FileSpreadsheet },
    { name: 'Lacak Berkas', href: '/tracking', icon: Search },
    ...(authUser && authUser.role === 'WARGA' ? [
      { name: 'Berkas Saya', href: '/warga', icon: FolderOpen }
    ] : []),
    { name: 'Pengaduan', href: '/pengaduan', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      {/* Top Bar Minimalis Resmi */}
      <div className="bg-[#0b2f57] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row justify-between items-center gap-1 text-[11px] text-slate-200">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-white">Badan Pertanahan Nasional</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300">Kanal Informasi &amp; Layanan Administrasi Tanah (KILAT BPN)</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              <span>Senin – Jumat: 08.00 – 15.00 WIB</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-bpn.png"
              alt="Logo BPN"
              className="w-9 h-9 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                KILAT BPN
              </span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">
                Kanal Informasi &amp; Layanan Administrasi Tanah • Badan Pertanahan Nasional
              </span>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-[#0b2f57] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Akses Masuk / Profil User Setelah Login */}
          <div className="hidden lg:flex items-center gap-2">
            {authUser ? (
              <div className="flex items-center gap-2">
                {authUser.role === 'WARGA' ? (
                  <Link
                    href="/warga"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-700" />
                    <span>Berkas Saya ({authUser.nama.split(' ')[0]})</span>
                  </Link>
                ) : (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#0b2f57]" />
                    <span>Portal Petugas ({authUser.nama.split(' ')[0]})</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Masuk</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-slate-100 text-[#0b2f57]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            {authUser ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                {authUser.role === 'WARGA' ? (
                  <Link
                    href="/warga"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-700" />
                    <span>Berkas Saya ({authUser.nama})</span>
                  </Link>
                ) : (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span>Portal Petugas ({authUser.nama})</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-600 font-medium hover:underline text-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
