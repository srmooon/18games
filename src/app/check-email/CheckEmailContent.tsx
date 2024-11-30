import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebase/config';
import { sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth';

export default function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const email = searchParams.get('email');

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
      await sendEmailVerification(auth.currentUser);
      toast({
        title: "Email enviado",
        description: "Um novo email de verificação foi enviado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email de verificação",
        variant: "destructive",
      });
    }
  };

  const checkEmailVerification = async () => {
    if (!email) return;

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        router.push('/login');
      } else {
        toast({
          title: "Email não verificado",
          description: "Por favor, verifique seu email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-6 space-y-4 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Verifique seu Email</h1>
        <p className="text-center text-muted-foreground">
          Um email de verificação foi enviado para {email}. Por favor, verifique sua caixa de entrada.
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
