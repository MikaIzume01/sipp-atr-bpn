import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { token, username } = await req.json();

    if (!token && !username) {
      return NextResponse.json(
        { success: false, message: 'Token atau username verifikasi tidak valid.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: token ? { verificationToken: token } : { username },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Tautan atau data verifikasi tidak ditemukan / sudah kadaluwarsa.' },
        { status: 404 }
      );
    }

    // Update status user menjadi verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Akun Anda berhasil diverifikasi. Silakan masuk menggunakan username dan kata sandi Anda.',
      username: user.username,
      email: user.email,
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
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Token verifikasi tidak disertakan.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Tautan verifikasi tidak valid atau akun sudah aktif.' },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  // Redirect ke halaman login dengan notifikasi verifikasi sukses
  return NextResponse.redirect(new URL('/admin/login?verified=true&user=' + encodeURIComponent(user.username), req.url), 303);
}
