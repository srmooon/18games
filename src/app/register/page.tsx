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
import { createUserWithEmailAndPassword, updateProfile, signOut, sendSignInLinkToEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';

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
    setIsLoading(true);

    try {
      // Validações do formulário
      if (!email || !password || !username) {
        toast({
          title: 'Erro',
          description: 'Todos os campos são obrigatórios.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: 'Erro',
          description: 'Por favor, insira um email válido.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Validar senha
      if (password.length < 6) {
        toast({
          title: 'Erro',
          description: 'A senha deve ter pelo menos 6 caracteres.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Validar username
      if (username.length < 3 || username.length > 20) {
        toast({
          title: 'Erro',
          description: 'O nome de usuário deve ter entre 3 e 20 caracteres.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Validar caracteres do username
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        toast({
          title: 'Erro',
          description: 'O nome de usuário só pode conter letras, números e underscore (_).',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Verificar se o username já existe
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          title: 'Erro',
          description: 'Este nome de usuário já existe.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Se todas as validações passarem, criar o usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar displayName do usuário
      await updateProfile(user, {
        displayName: username
      });

      // Enviar email de verificação
      await sendEmailVerification(user, {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      });

      // Criar documento do usuário
      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        displayName: username,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        role: 'membro',
        isEmailVerified: false,
        photoURL: null,
        bannerURL: null,
        passwordHistory: [{
          password: password,
          changedAt: Timestamp.now()
        }]
      });

      // Fazer logout
      await signOut(auth);

      // Redirecionar para a página de check-email
      router.push('/check-email?mode=registration');

      toast({
        title: 'Quase lá!',
        description: 'Enviamos um email de verificação para o seu endereço.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      // Log detalhado do erro
      console.error('Erro detalhado no registro:', {
        code: error.code,
        message: error.message,
        fullError: error,
        stack: error.stack,
        customData: error.customData,
        serverResponse: error.serverResponse
      });

      let errorMessage = 'Ocorreu um erro ao iniciar o registro.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está registrado. Por favor, use outro email ou faça login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido. Por favor, verifique o endereço informado.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use uma senha mais forte.';
      } else if (error.code === 'auth/invalid-continue-uri') {
        errorMessage = 'Erro na configuração de redirecionamento. Por favor, contate o suporte.';
        console.error('Detalhes do erro de continue-uri:', {
          currentURL: window.location.href,
          baseURL: window.location.origin,
          error: error
        });
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
