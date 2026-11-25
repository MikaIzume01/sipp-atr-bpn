'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface CostCalculatorProps {
  isBiayaRumus: boolean;
  biayaTetap: number;
  rumusBiaya: string;
  namaLayanan: string;
}

export default function CostCalculator({
  isBiayaRumus,
  biayaTetap,
  rumusBiaya,
  namaLayanan,
}: CostCalculatorProps) {
  const [luasTanah, setLuasTanah] = useState<number>(120);
  const [nilaiTanah, setNilaiTanah] = useState<number>(12500000);
  const biayaPendaftaran = 50000;

  const nilaiTotalObjek = luasTanah * nilaiTanah;
  const tarifPNBP = isBiayaRumus
    ? Math.round(nilaiTotalObjek / 1000) + biayaPendaftaran
    : biayaTetap;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-xs">Simulasi Tarif PNBP</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          PP No. 128 / 2015
        </span>
      </div>

      {isBiayaRumus ? (
        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="luas-tanah-field" className="block font-semibold text-slate-700 mb-1">
                Luas Tanah (m²)
              </label>
              <div className="relative">
                <input
                  id="luas-tanah-field"
                  type="number"
                  min={1}
                  value={luasTanah || ''}
                  onChange={(e) => setLuasTanah(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  placeholder="120"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  m²
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="njop-tanah-field" className="block font-semibold text-slate-700 mb-1">
                NJOP per m² (Rp)
              </label>
              <div className="relative">
                <input
                  id="njop-tanah-field"
                  type="number"
                  step={500000}
                  min={0}
                  value={nilaiTanah || ''}
                  onChange={(e) => setNilaiTanah(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  placeholder="12500000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  /m²
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Nilai Objek Tanah:</span>
              <span className="font-semibold text-slate-800">
                Rp {nilaiTotalObjek.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pelayanan (Nilai ÷ 1.000):</span>
              <span className="font-mono font-medium text-slate-800">
                Rp {Math.round(nilaiTotalObjek / 1000).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pendaftaran:</span>
              <span className="font-semibold text-slate-800">
                Rp {biayaPendaftaran.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">Total Tarif PNBP Resmi:</span>
              <span className="font-bold text-sm text-slate-900">
                Rp {tarifPNBP.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 text-xs">
          <span className="text-[11px] text-slate-500 block">Tarif Tetap:</span>
          <div className="text-xl font-bold text-slate-900">
            Rp {biayaTetap.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-600 pt-1">
            {rumusBiaya}
          </p>
        </div>
      )}

      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
        Tarif ini merupakan PNBP resmi Kas Negara melalui sistem SIMPONI. Belum termasuk pajak daerah BPHTB atau PPh jika dipersyaratkan.
      </p>
    </div>
  );
}
