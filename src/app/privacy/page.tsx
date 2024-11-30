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

export default function PrivacyPage() {
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
            Política de Privacidade
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
              A 18Games está comprometida em proteger sua privacidade. Esta política descreve como coletamos,
              usamos e protegemos suas informações ao usar nossa plataforma de jogos adultos traduzidos.
            </Text>

            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="lg" mb={4}>
                  1. Informações que Coletamos
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Dados de registro: email, nome de usuário e senha criptografada</ListItem>
                  <ListItem>Informações de perfil que você escolher compartilhar</ListItem>
                  <ListItem>Histórico de postagens e comentários no fórum</ListItem>
                  <ListItem>Dados de uso e interação com a plataforma</ListItem>
                  <ListItem>Endereço IP e informações do dispositivo para segurança</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  2. Como Usamos suas Informações
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Fornecer acesso à plataforma e seus recursos</ListItem>
                  <ListItem>Autenticar seu acesso e manter a segurança da conta</ListItem>
                  <ListItem>Enviar notificações importantes sobre sua conta</ListItem>
                  <ListItem>Melhorar a experiência do usuário e nossos serviços</ListItem>
                  <ListItem>Detectar e prevenir atividades fraudulentas</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  3. Proteção de Dados
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Todas as senhas são armazenadas com criptografia forte</ListItem>
                  <ListItem>Dados sensíveis são transmitidos com conexão segura (HTTPS)</ListItem>
                  <ListItem>Acesso restrito aos dados por nossa equipe</ListItem>
                  <ListItem>Backups regulares para prevenir perda de dados</ListItem>
                  <ListItem>Monitoramento constante para detectar invasões</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  4. Seus Direitos
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Solicitar acesso aos seus dados pessoais</ListItem>
                  <ListItem>Corrigir informações imprecisas</ListItem>
                  <ListItem>Excluir sua conta e dados associados</ListItem>
                  <ListItem>Exportar seus dados em formato legível</ListItem>
                  <ListItem>Optar por não receber comunicações não essenciais</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>
                  5. Compartilhamento de Dados
                </Heading>
                <UnorderedList spacing={3} fontSize="lg">
                  <ListItem>Não vendemos dados pessoais a terceiros</ListItem>
                  <ListItem>Informações públicas do perfil são visíveis para outros usuários</ListItem>
                  <ListItem>Podemos compartilhar dados com autoridades mediante ordem judicial</ListItem>
                  <ListItem>Serviços essenciais (como hospedagem) têm acesso limitado</ListItem>
                </UnorderedList>
              </Box>
            </VStack>

            <Text fontSize="md" color="gray.400">
              Ao usar o 18Games, você concorda com nossa política de privacidade.
              Nos reservamos o direito de atualizar esta política, notificando os usuários sobre mudanças significativas.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
