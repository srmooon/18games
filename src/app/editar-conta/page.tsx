'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  Grid,
  GridItem,
  Badge,
  Flex,
  Spinner,
  Heading,
  HStack,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaEnvelope, FaCalendar, FaClock, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { auth, db } from '@/config/firebase';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { isPasswordPreviouslyUsed, addPasswordToHistory } from '@/utils/passwordUtils';
import { useUserContext } from '@/contexts/UserContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const MotionBox = motion(Box);

export default function EditarContaPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { user, profile } = useUserContext();
  const router = useRouter();
  const toast = useToast();
  const [lastSignIn, setLastSignIn] = useState<Date | null>(null);

  useEffect(() => {
    if (user?.metadata?.lastSignInTime) {
      setLastSignIn(new Date(user.metadata.lastSignInTime));
    }
  }, [user]);

  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return 'N/A';
    
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'N/A';
    }
  };

  // Carregar dados do usuário do Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Tentar recarregar o objeto de usuário primeiro
        try {
          await user.reload();
        } catch (reloadError: any) {
          if (reloadError.code === 'auth/user-token-expired') {
            toast({
              title: 'Sessão expirada',
              description: 'Por favor, faça login novamente.',
              status: 'warning',
              duration: 5000,
              position: 'top-right',
            });
            router.push('/login');
            return;
          }
        }

        // Buscar dados do Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();

          // Se o email no Firestore for diferente do Firebase Auth, atualizar o Firestore
          if (data.email !== user.email) {
            await updateDoc(userRef, {
              email: user.email,
              updatedAt: new Date()
            });
            data.email = user.email;
          }

          // Converter timestamps para Date
          if (data.createdAt) {
            data.createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          }
          if (data.updatedAt) {
            data.updatedAt = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
          }
          setUserData(data);
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados do usuário:', error);
        if (error.code === 'auth/user-token-expired') {
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, faça login novamente.',
            status: 'warning',
            duration: 5000,
            position: 'top-right',
          });
          router.push('/login');
        }
      }
    };

    loadUserData();
  }, [user, router, toast]);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || !userData) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Carregando...</Text>
        </VStack>
      </Container>
    );
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Reautenticar o usuário
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Atualizar o email no Firebase Auth com verificação
      await verifyBeforeUpdateEmail(user, newEmail, {
        url: `${window.location.origin}/verify-email`
      });

      // Atualizar o email no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: new Date(),
        isEmailVerified: true
      });

      toast({
        title: 'Solicitação enviada!',
        description: 'Um email de verificação foi enviado para o novo endereço.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
      });

      setCurrentPassword('');
      setNewEmail('');
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      let errorMessage = 'Ocorreu um erro ao atualizar seu email.';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por favor, faça login novamente para continuar.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta.';
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se as senhas coincidem
      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Verificar se a senha já foi usada
      if (await isPasswordPreviouslyUsed(user.uid, newPassword)) {
        throw new Error('Esta senha já foi usada anteriormente');
      }

      // Reautenticar o usuário
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Atualizar a senha
      await updatePassword(user, newPassword);

      // Adicionar a nova senha ao histórico
      await addPasswordToHistory(user.uid, newPassword);

      // Fazer logout após trocar a senha
      await auth.signOut();

      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi atualizada com sucesso. Por favor, faça login novamente.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
      });

      // Redirecionar para login
      router.push('/login');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      let errorMessage = 'Ocorreu um erro ao atualizar sua senha.';
      
      if (error.message === 'As senhas não coincidem') {
        errorMessage = error.message;
      } else if (error.message === 'Esta senha já foi usada anteriormente') {
        errorMessage = error.message;
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por favor, faça login novamente para continuar.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta.';
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
    <Box minH="100vh" bg="gray.900" py={20}>
      <Container maxW="container.md">
        <VStack spacing={12}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            w="full"
          >
            <Text
              fontSize="4xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
              textAlign="center"
              mb={12}
            >
              Configurações da Conta
            </Text>

            {/* Informações da Conta */}
            <Box
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="2xl"
              border="1px"
              borderColor="gray.700"
              mb={8}
            >
              <Text fontSize="2xl" fontWeight="bold" color="white" mb={6}>
                Informações da Conta
              </Text>
              
              <VStack spacing={6} align="stretch" bg="whiteAlpha.50" p={6} borderRadius="xl">
                <Heading size="md" color="white">Informações da Conta</Heading>
                
                <HStack spacing={4}>
                  <FaEnvelope color="gray" />
                  <Text color="gray.300">Email: {userData?.email || user?.email || 'N/A'}</Text>
                </HStack>
                
                <HStack spacing={4}>
                  <FaCalendar color="gray" />
                  <Text color="gray.300">
                    Criado em: {userData?.createdAt ? userData.createdAt.toLocaleDateString('pt-BR') : 'N/A'}
                  </Text>
                </HStack>
                
                <HStack spacing={4}>
                  <FaClock color="gray" />
                  <Text color="gray.300">
                    Última atualização: {userData?.updatedAt ? userData.updatedAt.toLocaleDateString('pt-BR') : 'N/A'}
                  </Text>
                </HStack>
                
                <HStack spacing={4}>
                  <FaShieldAlt color="gray" />
                  <Text color="gray.300">
                    Email verificado: {userData?.isEmailVerified ? 'Sim' : 'Não'}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Divider my={8} borderColor="gray.700" />

            {/* Formulário de Atualização de Email */}
            <Box
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="2xl"
              border="1px"
              borderColor="gray.700"
              mb={8}
            >
              <form onSubmit={handleUpdateEmail}>
                <VStack spacing={6}>
                  <Text fontSize="2xl" fontWeight="bold" color="white" mb={4}>
                    Atualizar Email
                  </Text>

                  <FormControl isRequired>
                    <FormLabel color="gray.300">Novo Email</FormLabel>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      bg="gray.900"
                      color="white"
                      borderColor="gray.600"
                      borderRadius="xl"
                      _hover={{ borderColor: 'pink.400' }}
                      _focus={{ borderColor: 'pink.400', boxShadow: 'none' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.300">Senha Atual</FormLabel>
                    <InputGroup>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        bg="gray.900"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="xl"
                        _hover={{ borderColor: 'pink.400' }}
                        _focus={{ borderColor: 'pink.400', boxShadow: 'none' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          icon={showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'pink.400' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    bgGradient="linear(to-r, pink.400, purple.500)"
                    color="white"
                    size="lg"
                    w="full"
                    borderRadius="xl"
                    isLoading={isLoading}
                    loadingText="Atualizando..."
                    _hover={{
                      bgGradient: "linear(to-r, pink.500, purple.600)",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.2s"
                  >
                    Atualizar Email
                  </Button>
                </VStack>
              </form>
            </Box>

            {/* Formulário de Atualização de Senha */}
            <Box
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="2xl"
              border="1px"
              borderColor="gray.700"
            >
              <form onSubmit={handleUpdatePassword}>
                <VStack spacing={6}>
                  <Text fontSize="2xl" fontWeight="bold" color="white" mb={4}>
                    Atualizar Senha
                  </Text>

                  <FormControl isRequired>
                    <FormLabel color="gray.300">Senha Atual</FormLabel>
                    <InputGroup>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        bg="gray.900"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="xl"
                        _hover={{ borderColor: 'pink.400' }}
                        _focus={{ borderColor: 'pink.400', boxShadow: 'none' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          icon={showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'pink.400' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.300">Nova Senha</FormLabel>
                    <InputGroup>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        bg="gray.900"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="xl"
                        _hover={{ borderColor: 'pink.400' }}
                        _focus={{ borderColor: 'pink.400', boxShadow: 'none' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          icon={showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'pink.400' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.300">Confirmar Nova Senha</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        bg="gray.900"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="xl"
                        _hover={{ borderColor: 'pink.400' }}
                        _focus={{ borderColor: 'pink.400', boxShadow: 'none' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'pink.400' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    bgGradient="linear(to-r, pink.400, purple.500)"
                    color="white"
                    size="lg"
                    w="full"
                    borderRadius="xl"
                    isLoading={isLoading}
                    loadingText="Atualizando..."
                    _hover={{
                      bgGradient: "linear(to-r, pink.500, purple.600)",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.2s"
                  >
                    Atualizar Senha
                  </Button>
                </VStack>
              </form>
            </Box>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
