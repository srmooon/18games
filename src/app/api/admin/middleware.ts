import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import admin from '@/lib/admin';

export async function middleware(request: NextRequest) {
  try {
    // Pegar o token do header de autorização
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar o token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Verificar se o usuário é admin
    if (!decodedToken.admin) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/admin/:path*',
};
