'use client';

import { Suspense } from 'react';
import { Box, Container, Heading, Text, VStack, Button, useToast } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { checkActionCode, applyActionCode } from 'firebase/auth';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function RevertEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      toast({
        title: 'Código inválido',
        description: 'O link que você está tentando acessar é inválido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/');
    }
  }, [oobCode, router, toast]);

  const handleRevertEmail = async () => {
    if (!oobCode) return;

    try {
      setLoading(true);
      const actionInfo = await checkActionCode(auth, oobCode);
      await applyActionCode(auth, oobCode);

      if (auth.currentUser && actionInfo.data.email) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          email: actionInfo.data.email,
          updatedAt: Timestamp.now(),
          isEmailVerified: true
        });
      }

      toast({
        title: 'E-mail revertido com sucesso!',
        description: 'Seu e-mail foi revertido para o anterior.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/editar-conta');
    } catch (error: any) {
      console.error('Error reverting email:', error);
      setError('Não foi possível reverter seu email. O link pode ter expirado.');
      toast({
        title: 'Erro ao reverter e-mail',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" py={20} px={4} bg="gray.900">
      <Container maxW="container.md">
        <VStack spacing={8} align="center">
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
          >
            Reverter Alteração de E-mail
          </Heading>
          <Text color="white" textAlign="center">
            Clique no botão abaixo para reverter a alteração do seu e-mail.
          </Text>
          <Button
            colorScheme="brand"
            size="lg"
            onClick={handleRevertEmail}
            isLoading={loading}
            loadingText="Revertendo..."
          >
            Reverter E-mail
          </Button>
          {error && (
            <Text color="red.500" textAlign="center">
              {error}
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default function RevertEmailPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" py={20} px={4} bg="gray.900">
        <Container maxW="container.md">
          <VStack spacing={8} align="center">
            <Heading
              as="h1"
              size="2xl"
              textAlign="center"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
            >
              Carregando...
            </Heading>
          </VStack>
        </Container>
      </Box>
    }>
      <RevertEmailContent />
    </Suspense>
  );
}
