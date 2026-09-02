import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Cuerpo de petición inválido o vacío' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Devolver usuario Y token al cliente (el store lo necesita para el interceptor de Axios)
    const response = NextResponse.json({
      access_token: data.access_token,
      usuario: data.usuario,
    });

    // Cookie httpOnly — expiración alineada con JWT (24h)
    response.cookies.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24h — alineado con JWT expiresIn
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Error de conexión con el servidor' }, { status: 503 });
  }
}
