'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Clock, 
  ArrowRight, 
  Search, 
  ChevronRight,
  PenLine
} from 'lucide-react';

interface Requirement {
  id: string;
  namaDokumen: string;
  isWajib: boolean;
}

interface ServiceItem {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  estimasiHari: number;
  persyaratan: Requirement[];
}

export default function ServiceCatalog({ services }: { services: ServiceItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const cats = ['Semua'];
    services.forEach((s) => {
      if (!cats.includes(s.kategori)) {
        cats.push(s.kategori);
      }
    });
    return cats;
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === 'Semua' || s.kategori === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        s.nama.toLowerCase().includes(q) ||
        s.deskripsi.toLowerCase().includes(q) ||
        s.kategori.toLowerCase().includes(q) ||
        s.kode.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari layanan (Jual Beli, Roya, Pengukuran, Pengakuan Hak, Pemecahan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800 placeholder-slate-400"
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

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {filteredServices.length} Layanan tersedia
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#0b2f57] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Services */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-700">Layanan tidak ditemukan</h3>
          <p className="text-xs text-slate-500">
            Tidak ada layanan yang sesuai dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => {
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  {/* Top metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px] text-slate-500 uppercase">
                      {service.kategori}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Layanan Resmi ATR/BPN
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    <Link href={`/layanan/${service.kode}`} className="hover:text-[#0b2f57]">
                      {service.nama}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {service.deskripsi}
                  </p>

                  {/* Specifications */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Metode Pengajuan:</span>
                      <span className="font-medium text-slate-800">Online &amp; Mandiri</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Wilayah:</span>
                      <span className="font-medium text-slate-800">Jakarta Pusat</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/layanan/${service.kode}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Detail Layanan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/formulir?terkait=${service.kode}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#0b2f57] hover:bg-[#071f3a] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Isi Formulir</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
