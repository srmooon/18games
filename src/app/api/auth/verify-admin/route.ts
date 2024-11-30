import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = await cookieStore.get('18games_auth_token');

    if (!authToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = JSON.parse(authToken.value);
    const isAdmin = token.role === 'admin';

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error verifying admin:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
