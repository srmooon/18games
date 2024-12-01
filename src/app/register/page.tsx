'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Heading,
  Icon,
  Link,
  Image,
  Checkbox,
} from '@chakra-ui/react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !username) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: 'Erro',
        description: 'Você precisa aceitar os termos e a política de privacidade.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar displayName
      await updateProfile(user, {
        displayName: username
      });

      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username,
        displayName: username,
        role: 'membro', // Cargo inicial padrão
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        passwordHistory: [],
        memberSince: Timestamp.now() // Adicionando data de início da assinatura
      });

      // Enviar email de verificação e redirecionar
      await sendEmailVerification(user, {
        url: process.env.NEXT_PUBLIC_URL,
      });

      // Redirecionar para a página inicial
      router.push('/');

      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Ocorreu um erro ao criar sua conta.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else {
        errorMessage = `Erro: ${error.message}`;
      }

      toast({
        title: 'Erro no registro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
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
            Crie sua conta para começar
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
              <FormLabel>Nome de usuário</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiUser} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  bg="gray.900"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                  borderRadius="full"
                />
              </InputGroup>
            </FormControl>

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
                  placeholder="seu@email.com"
                  bg="gray.900"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                  borderRadius="full"
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  bg="gray.900"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                  borderRadius="full"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirmar Senha</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="******"
                  bg="gray.900"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                  borderRadius="full"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                colorScheme="brand"
              >
                <Text fontSize="sm" color="gray.400">
                  Li e aceito os{' '}
                  <Link
                    href="/terms"
                    color="brand.500"
                    _hover={{ textDecoration: 'none', color: 'brand.600' }}
                  >
                    termos de uso
                  </Link>
                  {' '}e a{' '}
                  <Link
                    href="/privacy"
                    color="brand.500"
                    _hover={{ textDecoration: 'none', color: 'brand.600' }}
                  >
                    política de privacidade
                  </Link>
                </Text>
              </Checkbox>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Criando conta..."
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
              Criar conta
            </Button>

            <Text color="gray.400" fontSize="sm" textAlign="center">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                color="brand.500"
                _hover={{ textDecoration: 'none', color: 'brand.600' }}
              >
                Faça login
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
