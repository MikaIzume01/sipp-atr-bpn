import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { nama, nik, noWhatsapp, email, kategori, nomorBerkas, uraian } = await req.json();

    if (!nama || !nik || !noWhatsapp || !uraian) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, NIK, No. WhatsApp, dan uraian pengaduan wajib diisi.' },
        { status: 400 }
      );
    }

    if (nik.length !== 16) {
      return NextResponse.json(
        { success: false, message: 'NIK wajib terdiri dari 16 digit angka.' },
        { status: 400 }
      );
    }

    // Generate unique nomor tiket DUMAS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    let rand = Math.floor(1000 + Math.random() * 9000);
    let nomorTiket = `DUMAS-${year}${month}-${rand}`;

    // Pastikan nomor tiket unik
    let existing = await prisma.complaint.findUnique({ where: { nomorTiket } });
    while (existing) {
      rand = Math.floor(1000 + Math.random() * 9000);
      nomorTiket = `DUMAS-${year}${month}-${rand}`;
      existing = await prisma.complaint.findUnique({ where: { nomorTiket } });
    }

    const complaint = await prisma.complaint.create({
      data: {
        nomorTiket,
        namaPelapor: nama.trim(),
        nikPelapor: nik.trim(),
        noWhatsapp: noWhatsapp.trim(),
        email: email ? email.trim() : null,
        kategori: kategori || 'PELAYANAN_LOKET',
        nomorBerkas: nomorBerkas ? nomorBerkas.trim() : null,
        uraian: uraian.trim(),
        status: 'BARU',
      },
    });

    return NextResponse.json({
      success: true,
      nomorTiket: complaint.nomorTiket,
      id: complaint.id,
      message: 'Laporan pengaduan Anda berhasil diterima dan tercatat di sistem DUMAS Kantor Pertanahan.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nomorTiket = searchParams.get('nomorTiket');
    const nik = searchParams.get('nik');
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    // 1. Single tracking via nomorTiket
    if (nomorTiket) {
      const complaint = await prisma.complaint.findUnique({
        where: { nomorTiket: nomorTiket.trim() },
      });
      if (!complaint) {
        return NextResponse.json({ success: false, message: 'Nomor tiket pengaduan tidak ditemukan.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, complaint });
    }

    // 2. Filter list (misal untuk portal warga atau petugas)
    const where: any = {};

    if (nik) {
      where.nikPelapor = nik;
    }

    if (status && status !== 'SEMUA') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nomorTiket: { contains: search } },
        { namaPelapor: { contains: search } },
        { nikPelapor: { contains: search } },
        { nomorBerkas: { contains: search } },
        { uraian: { contains: search } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.complaint.count();
    const baruCount = await prisma.complaint.count({ where: { status: 'BARU' } });
    const diprosesCount = await prisma.complaint.count({ where: { status: { in: ['DIPERIKSA', 'DITINDAKLANJUTI'] } } });
    const selesaiCount = await prisma.complaint.count({ where: { status: 'SELESAI' } });

    return NextResponse.json({
      success: true,
      complaints,
      summary: {
        total,
        baruCount,
        diprosesCount,
        selesaiCount,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('sipp_officer_session');
    let officerName = 'Petugas Loket BPN';
    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        if (parsed.nama) officerName = parsed.nama;
      } catch {}
    }

    const { id, status, tanggapanPetugas } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID pengaduan wajib disertakan.' }, { status: 400 });
    }

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengaduan tidak ditemukan.' }, { status: 404 });
    }

    const updateData: any = {
      namaPetugas: officerName,
    };

    if (status) {
      updateData.status = status;
      if (status === 'SELESAI') {
        updateData.tanggalSelesai = new Date();
      }
    }

    if (tanggapanPetugas !== undefined) {
      updateData.tanggapanPetugas = tanggapanPetugas;
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      complaint: updated,
      message: 'Status tindak lanjut pengaduan berhasil disimpan.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
