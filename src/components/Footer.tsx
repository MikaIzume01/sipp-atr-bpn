'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ExternalLink, Clock, PenLine, ShieldAlert } from 'lucide-react';
import { GOOGLE_DRIVE_MAIN_FOLDER_URL } from '@/lib/driveForms';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-[#0b2f57] text-slate-300 border-t border-[#08223f] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Profil Instansi & Logo */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-bpn.png"
                alt="Logo BPN"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight">
                  KILAT BPN
                </h3>
                <p className="text-[11px] text-slate-200 font-medium">
                  Kanal Informasi &amp; Layanan Administrasi Tanah
                </p>
                <p className="text-[10px] text-slate-400">
                  Badan Pertanahan Nasional
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Portal resmi pelayanan informasi pertanahan, pusat pengisian E-Formulir berkas secara langsung di web, pendaftaran permohonan digital, serta pelacakan status warkah publik.
            </p>
          </div>

          {/* Kolom 2: Layanan Populer */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 border-b border-slate-700/60 pb-1.5">
              Layanan Utama
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/layanan/jualb" className="text-slate-300 hover:text-white transition-colors">
                  Peralihan Hak (Jual Beli)
                </Link>
              </li>
              <li>
                <Link href="/layanan/roya" className="text-slate-300 hover:text-white transition-colors">
                  Pelayanan Roya (Hak Tanggungan)
                </Link>
              </li>
              <li>
                <Link href="/layanan/sertifikat-hilang" className="text-slate-300 hover:text-white transition-colors">
                  Penggantian Sertifikat Hilang
                </Link>
              </li>
              <li>
                <Link href="/layanan/pemecahan" className="text-slate-300 hover:text-white transition-colors">
                  Pemecahan &amp; Pemisahan Bidang Tanah
                </Link>
              </li>
              <li>
                <Link href="/layanan/pengukuran-kadastral" className="text-slate-300 hover:text-white transition-colors">
                  Pengukuran &amp; Pemetaan Kadastral
                </Link>
              </li>
              <li>
                <Link href="/layanan/skpt" className="text-slate-300 hover:text-white transition-colors">
                  Surat Keterangan Pendaftaran Tanah (SKPT)
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Tautan Cepat & Fitur */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 border-b border-slate-700/60 pb-1.5">
              Menu Portal
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-slate-300 hover:text-white transition-colors">
                  Katalog Informasi Layanan
                </Link>
              </li>
              <li>
                <Link href="/formulir" className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-1.5 text-emerald-300">
                  <PenLine className="w-3.5 h-3.5" />
                  <span>E-Formulir (Isi Langsung)</span>
                </Link>
              </li>
              <li>
                <Link href="/pendaftaran" className="text-slate-300 hover:text-white transition-colors">
                  Pendaftaran Online Mandiri
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-slate-300 hover:text-white transition-colors">
                  Lacak Status Berkas
                </Link>
              </li>
              <li>
                <Link href="/pengaduan" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Layanan Pengaduan Masyarakat</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Kontak & Jam Layanan */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 border-b border-slate-700/60 pb-1.5">
              Kontak &amp; Informasi
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Gedung Pelayanan Kantor Pertanahan</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Senin – Jumat: 08.00 – 15.00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Hotline Pengaduan: 0811-1068-0000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} KILAT BPN • Kanal Informasi &amp; Layanan Administrasi Tanah • Badan Pertanahan Nasional.</p>
          <div className="flex items-center gap-4">
            <Link href="/formulir" className="hover:text-slate-200">E-Formulir</Link>
            <Link href="/pengaduan" className="hover:text-slate-200">Pengaduan Masyarakat</Link>
            <Link href="/admin/login" className="hover:text-slate-200">Masuk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
