import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Username atau kata sandi salah.' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Username atau kata sandi salah.' },
        { status: 401 }
      );
    }

    // Cek verifikasi email untuk akun warga
    if (user.role === 'WARGA' && user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          notVerified: true,
          email: user.email,
          username: user.username,
          message: 'Akun Anda belum diverifikasi. Silakan periksa email aktivasi Anda atau lakukan verifikasi terlebih dahulu.',
        },
        { status: 403 }
      );
    }

    const redirectUrl = user.role === 'WARGA' ? '/warga' : '/admin';

    // Set secure session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      redirectUrl,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        namaLengkap: user.namaLengkap,
        role: user.role,
        nip: user.nip,
        nik: user.nik,
        noWhatsapp: user.noWhatsapp,
      },
    });

    response.cookies.set('sipp_officer_session', JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email || null,
      nama: user.namaLengkap,
      role: user.role,
      nik: user.nik || null,
      noWhatsapp: user.noWhatsapp || null,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 jam kerja
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
