import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebase/config';
import { applyActionCode } from 'firebase/auth';

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const oobCode = searchParams.get('oobCode');

  const verifyEmail = async () => {
    if (!oobCode) {
      toast({
        title: "Erro",
        description: "Código de verificação inválido",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    try {
      await applyActionCode(auth, oobCode);
      toast({
        title: "Email verificado",
        description: "Seu email foi verificado com sucesso!",
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar email",
        variant: "destructive",
      });
      router.push('/login');
    }
  };

  // Verificar email assim que o componente carregar
  if (oobCode) {
    verifyEmail();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-6 space-y-4 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Verificando seu Email</h1>
        <p className="text-center text-muted-foreground">
          Por favor, aguarde enquanto verificamos seu email...
        </p>
      </div>
    </div>
  );
}
