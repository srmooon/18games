'use client';

import { Box, Container, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function HomePage() {
  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" pt={20}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bg="gray.800"
          p={8}
          borderRadius="xl"
          boxShadow="2xl"
          border="1px"
          borderColor="gray.700"
        >
          <VStack spacing={6} align="stretch">
            <Text
              fontSize="4xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
              textAlign="center"
            >
              Bem-vindo ao 18Games
            </Text>
            
            <Text fontSize="xl" color="gray.300" textAlign="center" lineHeight="tall">
              Nossa plataforma foi criada com um propósito único: ser o lugar ideal para compartilhar e descobrir jogos traduzidos para o português brasileiro.
            </Text>

            <Text fontSize="xl" color="gray.300" textAlign="center" lineHeight="tall">
              Embora sejamos uma comunidade voltada para conteúdo adulto (+18), mantemos um compromisso rigoroso com nossas diretrizes. Não toleramos conteúdo ilegal ou prejudicial, e todos os jogos passam por uma análise cuidadosa antes da publicação.
            </Text>

            <Text fontSize="xl" color="gray.300" textAlign="center" lineHeight="tall">
              Para garantir a qualidade e segurança de nossa comunidade, implementamos algumas regras:
            </Text>

            <Box bg="gray.700" p={6} borderRadius="lg">
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" color="white">
                  • Para postar jogos, é necessário ter uma conta registrada
                </Text>
                <Text fontSize="lg" color="white">
                  • Sua conta precisa ter pelo menos 3 dias de existência antes de poder fazer postagens
                </Text>
                <Text fontSize="lg" color="white">
                  • Todo conteúdo deve seguir nossas diretrizes da comunidade
                </Text>
              </VStack>
            </Box>

            <Text fontSize="xl" color="gray.300" textAlign="center" lineHeight="tall">
              Junte-se a nós nesta jornada de tornar jogos mais acessíveis para a comunidade brasileira. Registre-se agora e faça parte desta comunidade em crescimento!
            </Text>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
}
