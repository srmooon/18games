'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, VStack, Heading, Text, Button, useToast, Spinner } from '@chakra-ui/react';
import { auth, db } from '@/config/firebase';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    if (mode === 'resetPassword' && oobCode) {
      // Redirecionar para a página de reset com o código
      router.replace(`/reset-password?oobCode=${oobCode}`);
    } else if (mode === 'verifyEmail' && oobCode) {
      verifyEmail(oobCode);
    } else if (mode === 'verifyAndChangeEmail' && oobCode) {
      verifyAndChangeEmail(oobCode);
    } else if (mode === 'recoverEmail' && oobCode) {
      recoverEmail(oobCode);
    } else {
      setIsVerifying(false);
      setError('Link inválido');
    }
  }, [searchParams, router]);

  const verifyEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);
      setIsVerifying(false);
      toast({
        title: 'Email verificado!',
        description: 'Seu email foi verificado com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      setIsVerifying(false);
      setError('Não foi possível verificar seu email. O link pode ter expirado.');
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const verifyAndChangeEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);
      setIsVerifying(false);
      
      // Fazer logout após verificar o email
      await auth.signOut();

      toast({
        title: 'Email atualizado!',
        description: 'Seu novo email foi verificado. Por favor, faça login novamente com seu novo email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirecionar para login após um breve delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      setIsVerifying(false);
      setError('Não foi possível atualizar seu email. O link pode ter expirado.');
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const recoverEmail = async (oobCode: string) => {
    try {
      // Primeiro, vamos pegar o email antigo
      const info = await checkActionCode(auth, oobCode);
      const oldEmail = info.data.email;

      // Aplicar o código de ação para reverter o email
      await applyActionCode(auth, oobCode);

      // Se temos o usuário atual, atualizar o Firestore
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          email: oldEmail,
          updatedAt: new Date(),
        });
      }

      setIsVerifying(false);
      
      // Fazer logout após reverter o email
      await auth.signOut();

      toast({
        title: 'Email revertido!',
        description: 'Seu email foi revertido para o anterior. Por favor, faça login novamente.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirecionar para login após um breve delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao reverter email:', error);
      setIsVerifying(false);
      setError('Não foi possível reverter seu email. O link pode ter expirado.');
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isVerifying) {
    return (
      <Container maxW="sm" py={10}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Heading size="lg">Verificando...</Heading>
          <Text color="gray.400">Por favor, aguarde um momento.</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="sm" py={10}>
      <VStack spacing={6} align="center">
        <Heading
          size="xl"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          fontWeight="extrabold"
        >
          {error ? 'Erro na Verificação' : 'Email Verificado!'}
        </Heading>
        
        <Text color="gray.400" textAlign="center">
          {error 
            ? error 
            : searchParams.get('mode') === 'verifyAndChangeEmail'
              ? 'Seu novo email foi verificado. Por favor, faça login novamente com seu novo email.'
              : searchParams.get('mode') === 'recoverEmail'
                ? 'Seu email foi revertido para o anterior. Por favor, faça login novamente.'
                : 'Seu email foi verificado com sucesso. Agora você pode fazer login na sua conta.'}
        </Text>

        <Button
          onClick={() => router.replace('/login')}
          width="full"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          _hover={{
            bgGradient: 'linear(to-l, #6928CA, #FF0070)',
          }}
          color="white"
          borderRadius="full"
          size="lg"
        >
          Ir para Login
        </Button>
      </VStack>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Container maxW="sm" py={10}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Heading size="lg">Carregando...</Heading>
          <Text color="gray.400">Por favor, aguarde um momento.</Text>
        </VStack>
      </Container>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
