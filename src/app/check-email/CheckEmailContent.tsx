import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/firebase/config';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useEffect } from 'react';

export default function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const mode = searchParams.get('mode');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user && mode !== 'registration') {
      router.replace('/login');
    }
  }, [router, mode]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/login'
      });
      toast({
        title: "Email enviado",
        description: "Um novo email de verificação foi enviado para sua caixa de entrada",
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar email de verificação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const checkEmailVerification = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Recarrega o usuário para obter o status mais recente
      await reload(auth.currentUser);
      
      if (auth.currentUser.emailVerified) {
        toast({
          title: "Email verificado",
          description: "Seu email foi verificado com sucesso! Você já pode fazer login.",
        });
        router.push('/login');
      } else {
        toast({
          title: "Email não verificado",
          description: "Por favor, verifique seu email e clique no link enviado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar email. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-6 space-y-4 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Verifique seu Email</h1>
        <p className="text-center text-muted-foreground">
          Um email de verificação foi enviado para sua caixa de entrada. 
          Por favor, verifique seu email e clique no link enviado para ativar sua conta.
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleResendVerification}
            className="btn-primary w-full"
          >
            Reenviar Email de Verificação
          </button>
          <button
            onClick={checkEmailVerification}
            className="btn-secondary w-full"
          >
            Já verifiquei meu email
          </button>
        </div>
      </div>
    </div>
  );
}
