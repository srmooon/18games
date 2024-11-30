'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/config/firebase';
import { confirmPasswordReset } from 'firebase/auth';
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

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const oobCode = searchParams.get('oobCode');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      toast({
        title: "Erro",
        description: "Código de redefinição inválido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      router.push('/login');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({
        title: "Sucesso",
        description: "Senha redefinida com sucesso",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao redefinir senha",
        status: "error",
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
          <Image
            src="/logo.png"
            alt="18Games Logo"
            width={150}
            height={150}
            className="rounded-full"
          />
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
          >
            Redefinir Senha
          </Heading>
          <Box
            w="100%"
            p={8}
            borderWidth={1}
            borderRadius="xl"
            borderColor="whiteAlpha.200"
            bgColor="whiteAlpha.50"
            backdropFilter="blur(10px)"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Nova Senha</FormLabel>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    bg="whiteAlpha.50"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    _hover={{
                      borderColor: "brand.500",
                    }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                    }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    bg="whiteAlpha.50"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    _hover={{
                      borderColor: "brand.500",
                    }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                    }}
                  />
                </FormControl>
                <Button
                  type="submit"
                  w="100%"
                  size="lg"
                  bgGradient="linear(to-r, brand.500, purple.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, brand.600, purple.600)",
                  }}
                  _active={{
                    bgGradient: "linear(to-r, brand.700, purple.700)",
                  }}
                  isLoading={isLoading}
                >
                  Redefinir Senha
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
