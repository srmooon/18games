'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  Image,
} from '@chakra-ui/react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const mode = searchParams.get('mode');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user && mode !== 'registration') {
      router.replace('/login');
    }
  }, [router, mode]);

  const handleResendEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: window.location.origin + '/verify-email'
        });
        
        toast({
          title: 'Email enviado!',
          description: 'Um novo link de verificação foi enviado para seu email.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Usuário não encontrado. Tente fazer login novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o email. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkEmail = async () => {
    try {
      setIsLoading(true);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length > 0) {
        toast({
          title: 'Email encontrado',
          description: `Este email está registrado e pode fazer login usando: ${methods.join(', ')}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Email disponível',
          description: 'Este email não está registrado e pode ser usado para criar uma nova conta.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" py={20} px={4} bg="gray.900">
      <Container maxW="md">
        <VStack spacing={8} align="center">
          {/* Logo */}
          <Box position="relative" w="150px" h="150px">
            <Image
              src="/assets/logo/logo.png"
              alt="18Games Logo"
              fill
              sizes="150px"
              priority="true"
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {/* Título */}
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
          >
            Verifique seu Email
          </Heading>

          {/* Card com a mensagem */}
          <Box
            bg="gray.800"
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            w="100%"
            textAlign="center"
          >
            <VStack spacing={6}>
              <Text fontSize="lg" color="gray.300">
                Enviamos um link de verificação para o seu email. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
              </Text>

              <Text fontSize="md" color="gray.400">
                Não recebeu o email? Verifique sua pasta de spam ou solicite um novo link.
              </Text>

              <Button
                onClick={handleResendEmail}
                colorScheme="brand"
                size="lg"
                width="full"
                bgGradient="linear(to-r, brand.500, purple.500)"
                _hover={{
                  bgGradient: 'linear(to-r, brand.600, purple.600)',
                  transform: 'scale(1.02)',
                }}
                _active={{
                  bgGradient: 'linear(to-r, brand.700, purple.700)',
                  transform: 'scale(0.98)',
                }}
                transition="all 0.2s"
              >
                Reenviar Email
              </Button>

              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                colorScheme="whiteAlpha"
                size="lg"
                width="full"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Voltar para Login
              </Button>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o email para verificar"
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={checkEmail}
                isLoading={isLoading}
                w="100%"
              >
                Verificar Email
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" py={20} px={4} bg="gray.900">
        <Container maxW="md">
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
      <CheckEmailContent />
    </Suspense>
  );
}
