import { NextResponse } from 'next/server';
import admin from '@/lib/admin';
import { getAuth } from 'firebase-admin/auth';

// Listar usuários
export async function GET() {
  try {
    const listUsers = await getAuth().listUsers();
    return NextResponse.json({ users: listUsers.users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Atualizar usuário (ex: dar role de admin)
export async function PATCH(request: Request) {
  try {
    const { uid, claims } = await request.json();
    
    // Definir custom claims (ex: { admin: true })
    await getAuth().setCustomUserClaims(uid, claims);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Desativar/Reativar usuário
export async function PUT(request: Request) {
  try {
    const { uid, disabled } = await request.json();
    
    await getAuth().updateUser(uid, { disabled });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Deletar usuário
export async function DELETE(request: Request) {
  try {
    const { uid } = await request.json();
    
    await getAuth().deleteUser(uid);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
