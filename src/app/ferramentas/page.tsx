'use client';

import { Box, Container, Grid, Heading, Link, Text, VStack, Flex, Icon } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { FaDiscord, FaWindows, FaGlobe, FaStar } from 'react-icons/fa';
import { SiAndroid } from 'react-icons/si';

export default function FerramentasPage() {
  return (
    <Layout>
      <VStack spacing={12} align="stretch">
        <Box>
          <Heading 
            as="h1" 
            size="2xl" 
            color="brand.500"
            mb={4}
          >
            Ferramentas
          </Heading>
          <Text color="gray.300" fontSize="lg">
            Ferramentas essenciais para jogadores e tradutores
          </Text>
        </Box>

        {/* Seção de Tradutores */}
        <VStack align="stretch" spacing={6}>
          <Heading 
            as="h2" 
            size="xl" 
            color="brand.500"
            mb={2}
          >
            Para Tradutores
          </Heading>
          <Grid 
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={8}
          >
            {/* Card do Zenpy */}
            <Box
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              p={6}
              _hover={{ 
                transform: 'translateY(-4px)', 
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={4}>
                <Box position="relative" width="100%">
                  <Heading size="lg" color="brand.500">
                    Zenpy
                  </Heading>
                  <Flex
                    position="absolute"
                    top={0}
                    right={0}
                    alignItems="center"
                    bg="rgba(255, 0, 163, 0.4)"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    boxShadow="sm"
                    border="1px"
                    borderColor="brand.400"
                  >
                    <Icon as={FaStar} mr={1} />
                    <Text>Recomendado</Text>
                  </Flex>
                </Box>
                <Text color="gray.300" lineHeight="tall">
                  Uma ferramenta poderosa para tradução de jogos Renpy, oferecendo suporte a múltiplas APIs de tradução como Google, Azure, DeepL, Yandex e muito mais. Em breve, também estará disponível para jogos RPGM!
                </Text>
                <Link 
                  href="https://discord.com/invite/ewRk2mHFrg"
                  isExternal
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="brand.400"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  <FaDiscord size={24} />
                  Discord Oficial do Zenpy
                </Link>
              </VStack>
            </Box>

            {/* Card do Translator++ */}
            <Box
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              p={6}
              _hover={{ 
                transform: 'translateY(-4px)', 
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="brand.500">
                  Translator++
                </Heading>
                <Text color="gray.300" lineHeight="tall">
                  Ferramenta versátil de tradução compatível com diversas engines de jogos, com foco especial em RPG Maker e Renpy. Uma opção robusta para tradutores que trabalham com múltiplas plataformas.
                </Text>
                <Link 
                  href="https://dreamsavior.net/download/"
                  isExternal
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="brand.400"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  <FaWindows size={24} />
                  Baixe o Translator++
                </Link>
              </VStack>
            </Box>

            {/* Card do Game Text Editor */}
            <Box
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              p={6}
              _hover={{ 
                transform: 'translateY(-4px)', 
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="brand.500">
                  Game Text Editor
                </Heading>
                <Text color="gray.300" lineHeight="tall">
                  Website especializado em tradução de jogos, com suporte para RPG Maker (VX Ace, MV, MZ), Renpy, Wolf (experimental) e HTML. Destaca-se pela possibilidade de traduzir jogos diretamente pelo celular de forma eficiente.
                </Text>
                <Link 
                  href="https://translate.saveeditonline.com/"
                  isExternal
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="brand.400"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  <FaGlobe size={24} />
                  Acesse o Game Text Editor
                </Link>
              </VStack>
            </Box>
          </Grid>
        </VStack>

        {/* Seção de Jogadores */}
        <VStack align="stretch" spacing={6}>
          <Heading 
            as="h2" 
            size="xl" 
            color="brand.500"
            mb={2}
          >
            Para Jogadores
          </Heading>
          <Grid 
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={8}
          >
            {/* Card do Joiplay */}
            <Box
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              p={6}
              _hover={{ 
                transform: 'translateY(-4px)', 
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="brand.500">
                  Joiplay
                </Heading>
                <Text color="gray.300" lineHeight="tall">
                  Um aplicativo revolucionário para Android que permite jogar seus jogos favoritos no celular, mesmo quando não há uma versão APK disponível. Perfeito para jogadores que querem levar seus jogos para qualquer lugar!
                </Text>
                <Link 
                  href="https://joiplay.net/"
                  isExternal
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="brand.400"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  <SiAndroid size={24} />
                  Baixe o Joiplay
                </Link>
              </VStack>
            </Box>

            {/* Card do Winlator */}
            <Box
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              p={6}
              _hover={{ 
                transform: 'translateY(-4px)', 
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="brand.500">
                  Winlator
                </Heading>
                <Text color="gray.300" lineHeight="tall">
                  Um aplicativo avançado para Android que permite executar aplicativos e jogos Windows (32 ou 64 bits) diretamente no seu celular. Ideal para dispositivos Android mais potentes que desejam rodar programas Windows.
                </Text>
                <Link 
                  href="https://github.com/brunodev85/winlator/releases/tag/v8.0.0"
                  isExternal
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="brand.400"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  <SiAndroid size={24} />
                  Baixe o Winlator (APK)
                </Link>
              </VStack>
            </Box>

            {/* Card do Maldives Player */}
            <Box
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              p={6}
              _hover={{ 
                transform: 'translateY(-4px)', 
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="brand.500">
                  Maldives Player
                </Heading>
                <Text color="gray.300" lineHeight="tall">
                  Um aplicativo Android especializado em executar jogos RPG Maker MV e MZ. Uma excelente opção para jogar seus RPGs favoritos no celular com uma interface otimizada para dispositivos móveis.
                </Text>
                <Link 
                  href="https://play.google.com/store/apps/details?id=net.miririt.maldivesplayer"
                  isExternal
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="brand.400"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  <SiAndroid size={24} />
                  Baixe o Maldives Player
                </Link>
              </VStack>
            </Box>
          </Grid>
        </VStack>

        {/* Espaço extra no final da página */}
        <Box pb={12} />
      </VStack>
    </Layout>
  );
}
