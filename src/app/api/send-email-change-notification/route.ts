import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase';
import { ActionCodeSettings } from 'firebase/auth';

export async function POST(request: Request) {
  try {
    const { oldEmail, newEmail, uid } = await request.json();

    if (!oldEmail || !newEmail || !uid) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Configurar o link de reversão
    const actionCodeSettings: ActionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/revert-email`,
      handleCodeInApp: true,
    };

    // Enviar o email usando o template configurado no Firebase Console
    await auth.generateEmailVerificationLink(
      oldEmail,
      actionCodeSettings
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}
