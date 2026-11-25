import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUploadDir } from '@/lib/storage';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const serviceId = formData.get('serviceId') as string;
    const tipePemohon = (formData.get('tipePemohon') as string) || 'SENDIRI';
    const namaPemohon = formData.get('namaPemohon') as string;
    const nikPemohon = formData.get('nikPemohon') as string;
    const noWhatsapp = formData.get('noWhatsapp') as string;
    const email = (formData.get('email') as string) || null;
    const alamatPemohon = formData.get('alamatPemohon') as string;

    const namaKuasa = (formData.get('namaKuasa') as string) || null;
    const nikKuasa = (formData.get('nikKuasa') as string) || null;
    const noSuratKuasa = (formData.get('noSuratKuasa') as string) || null;

    const dataObjekRaw = formData.get('dataObjek') as string;

    // Validasi Dasar
    if (!serviceId || !namaPemohon || !nikPemohon || !noWhatsapp || !alamatPemohon) {
      return NextResponse.json(
        { success: false, message: 'Harap lengkapi semua data identitas pemohon yang wajib diisi.' },
        { status: 400 }
      );
    }

    if (nikPemohon.length !== 16 || !/^\d+$/.test(nikPemohon)) {
      return NextResponse.json(
        { success: false, message: 'Format NIK tidak valid. NIK wajib terdiri dari 16 digit angka.' },
        { status: 400 }
      );
    }

    // Cek keberadaan Layanan & Persyaratannya
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { persyaratan: true },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Layanan yang dipilih tidak ditemukan.' },
        { status: 404 }
      );
    }

    let parsedDataObjek: Record<string, unknown> = {};
    try {
      parsedDataObjek = JSON.parse(dataObjekRaw || '{}');
    } catch {
      parsedDataObjek = {};
    }

    // Hitung Estimasi Biaya PNBP
    let estimasiBiaya = service.biayaTetap;
    if (service.isBiayaRumus) {
      const luas = Number(parsedDataObjek.luasTanahM2) || 0;
      const nilai = Number(parsedDataObjek.nilaiTanahPerM2) || 0;
      estimasiBiaya = Math.round((luas * nilai) / 1000) + (service.biayaTetap || 50000);
    }

    // Generate Nomor Registrasi Unik (Format: REG-YYYYMM-XXXX)
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const countThisMonth = await prisma.application.count({
      where: {
        nomorRegistrasi: {
          startsWith: `REG-${yearMonth}`,
        },
      },
    });
    const nomorRegistrasi = `REG-${yearMonth}-${String(countThisMonth + 1).padStart(4, '0')}`;

    // Generate PIN Keamanan 6 Digit
    const accessPin = String(Math.floor(100000 + Math.random() * 900000));

    // Simpan Permohonan dalam Transaksi Database
    const newApplication = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          nomorRegistrasi,
          accessPin,
          serviceId: service.id,
          tipePemohon,
          namaPemohon,
          nikPemohon,
          noWhatsapp,
          email,
          alamatPemohon,
          namaKuasa,
          nikKuasa,
          noSuratKuasa,
          dataObjek: JSON.stringify(parsedDataObjek),
          estimasiBiaya,
          status: 'DIAJUKAN',
        },
      });

      // Buat folder penyimpanan spesifik permohonan
      const uploadDir = getUploadDir(app.id);

      // Proses Berkas Dokumen yang diunggah
      for (const reqItem of service.persyaratan) {
        const file = formData.get(`file_${reqItem.id}`) as File | null;

        if (file && file.size > 0) {
          // Validasi ekstensi
          const ext = path.extname(file.name).toLowerCase().replace('.', '');
          const allowedList = reqItem.allowedTypes.split(',').map((t) => t.trim().toLowerCase());
          if (!allowedList.includes(ext) && !allowedList.includes('*')) {
            throw new Error(
              `Format file "${file.name}" tidak diizinkan untuk dokumen "${reqItem.namaDokumen}". Format yang diizinkan: ${reqItem.allowedTypes}.`
            );
          }

          // Validasi ukuran
          const maxBytes = reqItem.maxSizeMB * 1024 * 1024;
          if (file.size > maxBytes) {
            throw new Error(
              `Ukuran file "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB) melebihi batas maksimal ${reqItem.maxSizeMB} MB.`
            );
          }

          const fileId = crypto.randomUUID();
          const safeStoredName = `${fileId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const targetFilePath = path.join(uploadDir, safeStoredName);

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          fs.writeFileSync(targetFilePath, buffer);

          const relativePath = path.join('storage', 'uploads', app.id, safeStoredName);

          await tx.applicationDocument.create({
            data: {
              applicationId: app.id,
              requirementId: reqItem.id,
              originalFilename: file.name,
              storedFilename: safeStoredName,
              filePath: relativePath,
              fileSize: file.size,
              mimeType: file.type || 'application/octet-stream',
              statusVerifikasi: 'PENDING',
            },
          });
        } else if (reqItem.isWajib) {
          throw new Error(`Dokumen wajib "${reqItem.namaDokumen}" belum diunggah.`);
        }
      }

      // Catat log histori pendaftaran awal
      await tx.applicationLog.create({
        data: {
          applicationId: app.id,
          statusLama: null,
          statusBaru: 'DIAJUKAN',
          aktor: 'PEMOHON',
          catatan: 'Permohonan pendaftaran berhasil dikirimkan secara mandiri via Portal Publik SIPP.',
        },
      });

      return app;
    });

    return NextResponse.json({
      success: true,
      message: 'Permohonan berhasil didaftarkan.',
      nomorRegistrasi: newApplication.nomorRegistrasi,
      accessPin: newApplication.accessPin,
      applicationId: newApplication.id,
    });
  } catch (error: unknown) {
    console.error('Error submitting application:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat menyimpan permohonan.';
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
