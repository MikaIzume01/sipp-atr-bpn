import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { username, password, namaLengkap, email, nik, noWhatsapp, alamat, role } = await req.json();

    if (!username || !password || !namaLengkap) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, username, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username minimal 3 karakter.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal 6 karakter.' },
        { status: 400 }
      );
    }

    // Default pendaftaran dari portal publik adalah WARGA
    const userRole = role === 'VERIFIKATOR' || role === 'ADMIN' ? role : 'WARGA';

    if (userRole === 'WARGA' && !email) {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi untuk pengiriman tautan verifikasi akun.' },
        { status: 400 }
      );
    }

    // Cek apakah username sudah dipakai
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Username sudah digunakan, silakan pilih username lain.' },
        { status: 409 }
      );
    }

    // Cek apakah email sudah dipakai jika diisi
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: 'Alamat email sudah terdaftar, silakan gunakan email lain atau langsung masuk.' },
          { status: 409 }
        );
      }
    }

    const passwordHash = hashPassword(password);
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const isWarga = userRole === 'WARGA';

    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        namaLengkap,
        nik: nik || null,
        noWhatsapp: noWhatsapp || null,
        alamat: alamat || null,
        passwordHash,
        role: userRole,
        isVerified: !isWarga, // Petugas langsung aktif, warga perlu verifikasi email
        verificationToken: isWarga ? verificationToken : null,
        isActive: true,
      },
    });

    // Jika warga, wajib verifikasi email terlebih dahulu (belum dibuatkan session cookie)
    if (isWarga) {
      return NextResponse.json({
        success: true,
        needVerification: true,
        email: newUser.email,
        username: newUser.username,
        token: newUser.verificationToken,
        message: `Pendaftaran berhasil. Tautan verifikasi telah dikirimkan ke alamat email ${newUser.email}.`,
      });
    }

    // Jika petugas, buatkan session cookie langsung
    const redirectUrl = '/admin';
    const response = NextResponse.json({
      success: true,
      message: 'Pendaftaran akun petugas berhasil.',
      redirectUrl,
      user: {
        id: newUser.id,
        username: newUser.username,
        namaLengkap: newUser.namaLengkap,
        role: newUser.role,
        nik: newUser.nik,
        noWhatsapp: newUser.noWhatsapp,
      },
    });

    response.cookies.set('sipp_officer_session', JSON.stringify({
      id: newUser.id,
      username: newUser.username,
      nama: newUser.namaLengkap,
      role: newUser.role,
      nik: newUser.nik,
      noWhatsapp: newUser.noWhatsapp,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 jam
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
