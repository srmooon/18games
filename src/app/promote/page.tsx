'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';

export default function PromotePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { profile } = useUserContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Aqui você pode adicionar a lógica para promoção quando necessário
      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação foi enviada para análise.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
      });
      router.push('/');
    } catch (error) {
      setError('Ocorreu um erro ao processar sua solicitação.');
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua solicitação.',
        status: 'error',
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="md" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
            textAlign="center"
          >
            Solicitar Promoção
          </Heading>
          
          <Text color="gray.400" fontSize="lg" textAlign="center">
            Solicite acesso especial à plataforma
          </Text>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="gray.800"
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
          >
            <VStack spacing={6}>
              <FormControl isInvalid={!!error}>
                <FormLabel color="gray.300">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  bg="gray.700"
                  border="none"
                  _placeholder={{ color: 'gray.500' }}
                />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="full"
                isLoading={isLoading}
              >
                Enviar Solicitação
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
