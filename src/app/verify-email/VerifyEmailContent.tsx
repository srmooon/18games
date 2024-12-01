'use client';

import { useRouter, useSearchParams, useEffect } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  const verifyEmail = async () => {
    if (!email || !userId) {
      toast({
        title: "Erro",
        description: "Link de verificação inválido",
        variant: "destructive",
      });
      router.push('/register');
      return;
    }

    try {
      // Atualizar o status de verificação no Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isEmailVerified: true
      });

      // Redirecionar para login
      router.push('/login');

      toast({
        title: "Sucesso!",
        description: "Email verificado com sucesso! Você já pode fazer login.",
      });
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar seu email. Tente novamente.",
        variant: "destructive",
      });
      router.push('/register');
    }
  };

  // Chamar verifyEmail assim que o componente montar
  useEffect(() => {
    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verificando seu email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Aguarde enquanto verificamos seu email...
          </p>
        </div>
      </div>
    </div>
  );
}
