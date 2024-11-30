'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
  Icon,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TermsPage() {
  const router = useRouter();

  return (
    <Container maxW="6xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Logo e Título */}
        <VStack spacing={6} align="center">
          <Box position="relative" w="150px" h="150px">
            <Image
              src="/assets/logo/logo.png"
              alt="18Games Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            mb={2}
          >
            18Games
          </Heading>
          <Heading
            as="h2"
            size="xl"
            textAlign="center"
            color="gray.400"
          >
            Termos e Condições
          </Heading>
        </VStack>

        {/* Conteúdo */}
        <Box
          bg="gray.800"
          p={12}
          borderRadius="2xl"
          boxShadow="2xl"
          w="100%"
          position="relative"
        >
          <Button
            position="absolute"
            top={2}
            left={0}
            p={0}
            bg="transparent"
            _hover={{ bg: 'transparent' }}
            onClick={() => router.push('/register')}
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

          <VStack spacing={8} align="stretch" mt={8}>
            <Text fontSize="lg" lineHeight="tall">
              Bem-vindo ao 18Games, um fórum dedicado à comunidade de jogos adultos traduzidos para português. 
              Ao usar nossa plataforma, você concorda com os seguintes termos:
            </Text>

            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="lg" mb={4}>
                  1. Conteúdo Permitido
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Apenas jogos adultos legais e traduzidos para português</ListItem>
                  <ListItem>Conteúdo deve respeitar direitos autorais</ListItem>
                  <ListItem>Proibido conteúdo ilegal ou inadequado</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  2. Responsabilidade do Usuário
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Você é totalmente responsável por todo conteúdo que postar</ListItem>
                  <ListItem>Proibido compartilhar arquivos com vírus ou malware</ListItem>
                  <ListItem>Posts falsos ou enganosos resultarão em banimento</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  3. Penalidades
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Contas serão permanentemente desativadas em caso de:</ListItem>
                  <ListItem>- Postagem de conteúdo ilegal</ListItem>
                  <ListItem>- Compartilhamento de vírus ou malware</ListItem>
                  <ListItem>- Posts falsos ou enganosos</ListItem>
                  <ListItem>- Violação repetida das regras</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  4. Moderação
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>A equipe 18Games reserva o direito de remover qualquer conteúdo</ListItem>
                  <ListItem>Decisões de moderação são finais</ListItem>
                  <ListItem>Contas suspeitas podem ser investigadas</ListItem>
                </UnorderedList>
              </Box>
            </VStack>

            <Text fontSize="md" color="gray.400">
              Ao criar uma conta, você confirma que leu e concorda com todos estes termos.
              O não cumprimento resultará em ação imediata da moderação.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
