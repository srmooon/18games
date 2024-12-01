import { NextResponse } from 'next/server';
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    // Verificar se o username já existe
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Nome de usuário já está em uso. Por favor, escolha outro.' },
        { status: 400 }
      );
    }

    // Criar usuário temporariamente para enviar o email de verificação
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Enviar email de verificação
    await sendEmailVerification(user, {
      url: `${process.env.NEXT_PUBLIC_URL}/verify-email?email=${email}&username=${username}`
    });

    // Deletar o usuário temporário - será recriado após verificação
    await user.delete();

    // Armazenar os dados temporariamente no Firestore
    const tempUserRef = doc(db, 'tempUsers', email);
    await setDoc(tempUserRef, {
      email,
      username: username.toLowerCase(), // Guardar em lowercase para consistência
      password,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro no pré-registro:', error);
    
    // Mensagens de erro mais amigáveis
    let errorMessage = 'Ocorreu um erro ao tentar registrar.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está cadastrado.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
