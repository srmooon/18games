'use client';

import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useToast,
  VStack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  IconButton,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { getUser } from '@/lib/db';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const toast = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(
      z.object({
        email: z
          .string()
          .min(1, 'Email é obrigatório')
          .email('Email inválido')
          .transform((value) => value.toLowerCase()),
        password: z
          .string()
          .min(6, 'Senha deve ter no mínimo 6 caracteres')
          .regex(/^\S*$/, 'Senha não pode conter espaços'),
      })
    ),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Verifica se o email foi verificado
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        toast({
          title: 'Email não verificado',
          description: 'Enviamos um novo email de verificação. Por favor, verifique sua caixa de entrada.',
          status: 'warning',
          duration: 5000,
          position: 'top-right',
        });
        router.push('/verify-email');
        return;
      }

      // Busca dados adicionais do usuário
      const userData = await getUser(userCredential.user.uid);
      if (!userData) {
        throw new Error('Erro ao recuperar dados do usuário');
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo${userData?.displayName ? `, ${userData.displayName}` : ''}!`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
      });

      // Redireciona para a página inicial ou página anterior
      const returnUrl = new URLSearchParams(window.location.search).get('from');
      router.push(returnUrl || '/');
      router.refresh();

    } catch (error: any) {
      console.error('Erro no login:', error);
      let errorMessage = 'Ocorreu um erro ao fazer login';

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={3} textAlign="center">
          <Heading
            as="h1"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
            fontSize="4xl"
            fontWeight="extrabold"
          >
            18Games
          </Heading>
          <Text color="gray.500" fontSize="lg">
            Entre com sua conta para continuar
          </Text>
        </VStack>

        <Box
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bg="gray.800"
          p={8}
          borderRadius="2xl"
          boxShadow="2xl"
        >
          <Stack spacing={6}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel color="gray.300">Email</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiMail} color="gray.500" />
                </InputLeftElement>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  bg="gray.900"
                  border="none"
                  _placeholder={{ color: 'gray.500' }}
                  color="white"
                  borderRadius="full"
                />
              </InputGroup>
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel color="gray.300">Senha</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiLock} color="gray.500" />
                </InputLeftElement>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Sua senha"
                  bg="gray.900"
                  border="none"
                  _placeholder={{ color: 'gray.500' }}
                  color="white"
                  borderRadius="full"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                    icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.password && (
                <FormErrorMessage>{errors.password.message}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              type="submit"
              bgGradient="linear(to-r, pink.500, purple.500)"
              _hover={{ bgGradient: "linear(to-r, pink.600, purple.600)" }}
              size="lg"
              fontSize="md"
              isLoading={isLoading}
              loadingText="Entrando..."
              color="white"
              borderRadius="full"
            >
              Entrar
            </Button>
          </Stack>
        </Box>

        <Stack spacing={3} align="center">
          <Link
            href="/forgot-password"
            color="brand.500"
            _hover={{ color: 'brand.400' }}
            fontWeight="medium"
          >
            Esqueceu sua senha?
          </Link>

          <Divider borderColor="gray.600" />

          <Text color="gray.400">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              color="brand.500"
              _hover={{ color: 'brand.400' }}
              fontWeight="medium"
            >
              Cadastre-se
            </Link>
          </Text>
        </Stack>
      </VStack>
    </Container>
  );
}
