import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const url = new URL('/', req.url);
  const response = NextResponse.redirect(url, 303);

  response.cookies.set('sipp_officer_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function GET(req: NextRequest) {
  const url = new URL('/', req.url);
  const response = NextResponse.redirect(url, 303);

  response.cookies.set('sipp_officer_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
