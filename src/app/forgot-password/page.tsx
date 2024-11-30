'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Heading,
  InputGroup,
  InputLeftElement,
  Icon,
  Container,
} from '@chakra-ui/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, digite seu email',
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/reset-password', // URL específica para reset de senha
        handleCodeInApp: true,
        // Template personalizado em português
        subject: "18Games - Recuperação de Senha",
        html: `
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no 18Games.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="%LINK%">Redefinir minha senha</a></p>
          <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
          <p>Por questões de segurança, este link expira em 1 hora.</p>
          <br>
          <p>Atenciosamente,</p>
          <p>Equipe 18Games</p>
        `
      });

      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
      });

      router.push('/login');
    } catch (error: any) {
      let message = 'Erro ao enviar email de recuperação';
      
      if (error.code === 'auth/user-not-found') {
        message = 'Email não encontrado';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido';
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: 'Erro',
        description: message,
        status: 'error',
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2}>
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            mb={8}
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
          >
            18Games
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Recupere sua senha
          </Text>
        </VStack>

        {/* Formulário */}
        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="gray.800"
          p={8}
          borderRadius="2xl"
          boxShadow="2xl"
          position="relative"
          maxW="sm"
          mx="auto"
        >
          <Button
            position="absolute"
            top={2}
            left={0}
            p={0}
            bg="transparent"
            _hover={{ bg: 'transparent' }}
            onClick={() => router.push('/login')}
            display="flex"
            alignItems="center"
            opacity={0.8}
            _hover={{ opacity: 1 }}
            transition="opacity 0.2s"
          >
            <Icon 
              as={FiArrowLeft} 
              w={8} 
              h={8} 
              strokeWidth={3.5}
              color="#E91E63"
            />
          </Button>

          <VStack spacing={6} mt={8}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiMail} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  bg="gray.900"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                  borderRadius="full"
                />
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Enviando..."
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
              borderRadius="full"
            >
              Enviar email de recuperação
            </Button>

            <Text color="gray.400" fontSize="sm" textAlign="center">
              Você receberá um email com instruções para redefinir sua senha.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
