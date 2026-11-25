import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('sipp_officer_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const sessionUser = JSON.parse(sessionCookie.value);
    if (sessionUser?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          username: true,
          email: true,
          namaLengkap: true,
          role: true,
          nik: true,
          noWhatsapp: true,
          alamat: true,
          isVerified: true,
        },
      });
      if (dbUser) {
        return NextResponse.json({
          loggedIn: true,
          user: {
            ...dbUser,
            nama: dbUser.namaLengkap,
          },
        });
      }
    }
    return NextResponse.json({
      loggedIn: true,
      user: sessionUser,
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
