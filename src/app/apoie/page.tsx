'use client';

import { Box, Container, Text, VStack, Grid, Button, Icon, List, ListItem, ListIcon } from '@chakra-ui/react';
import { FaGift, FaPalette, FaImage, FaCrown, FaStar, FaGem } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

export default function ApoiePage() {
  const FeatureItem = ({ icon, children, color }) => (
    <ListItem display="flex" alignItems="center" gap={3}>
      <ListIcon as={icon} color={color} boxSize={5} />
      <Text color="gray.300">{children}</Text>
    </ListItem>
  );

  const VipCard = ({ title, price, features, color, secondaryColor, glowColor }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      bg="gray.800"
      p={8}
      borderRadius="xl"
      boxShadow={`0 0 20px ${glowColor}`}
      border="1px"
      borderColor={color}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        bgGradient: `linear(to-r, ${color}, ${secondaryColor})`,
      }}
    >
      <VStack spacing={6} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text 
            fontSize="3xl" 
            fontWeight="bold" 
            bgGradient={`linear(to-r, ${color}, ${secondaryColor})`} 
            bgClip="text"
            display="flex"
            alignItems="center"
            gap={2}
          >
            {title} <Icon as={title === "VIP+" ? FaGem : FaCrown} />
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={color}>
            {price}
          </Text>
        </Box>
        
        <List spacing={4}>
          {features.map((feature, index) => (
            <FeatureItem key={index} icon={feature.icon} color={color}>
              {feature.text}
            </FeatureItem>
          ))}
        </List>
      </VStack>
    </MotionBox>
  );

  return (
    <Box minH="100vh" bg="gray.900" py={20}>
      <Container maxW="container.xl">
        <VStack spacing={16}>
          {/* Header Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <Text
              fontSize={{ base: "4xl", md: "5xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, yellow.400, orange.400, red.400)"
              bgClip="text"
              mb={6}
            >
              Seja VIP no 18Games! 👑
            </Text>
            <Text fontSize="xl" color="gray.300" maxW="3xl" mx="auto" mb={12}>
              A comunidade 18games está crescendo cada dia mais, mas para continuarmos online e oferecer o melhor para vocês, precisamos da sua ajuda! 🤝
            </Text>

            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="2xl"
              border="1px"
              borderColor="orange.500"
              maxW="2xl"
              mx="auto"
            >
              <Text fontSize="2xl" fontWeight="semibold" color="white" mb={4}>
                Nossa Meta: <Text as="span" bgGradient="linear(to-r, yellow.400, orange.400, red.400)" bgClip="text">R$ 1.000</Text>
              </Text>
              <Text color="gray.300">
                Para manter o site no ar, pagar os servidores e continuar proporcionando uma experiência incrível para todos os jogadores. 💪
              </Text>
            </MotionBox>
          </MotionBox>

          {/* VIP Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8} w="full">
            <VipCard
              title="VIP"
              price="R$ 20"
              features={[
                { icon: FaImage, text: "Coloque GIFs no seu perfil!" },
                { icon: FaPalette, text: "Tenha um banner exclusivo!" },
                { icon: FaGift, text: "Personalize seu perfil com uma moldura única!" }
              ]}
              color="cyan.400"
              secondaryColor="blue.400"
              glowColor="rgba(56, 178, 172, 0.15)"
            />
            <VipCard
              title="VIP+"
              price="R$ 50"
              features={[
                { icon: FaImage, text: "GIFs no perfil e no banner!" },
                { icon: FaCrown, text: "Cor especial com animação para o seu cargo!" },
                { icon: FaStar, text: "Moldura exclusiva para a foto do perfil!" }
              ]}
              color="pink.400"
              secondaryColor="purple.400"
              glowColor="rgba(236, 72, 153, 0.15)"
            />
          </Grid>

          {/* Call to Action */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            textAlign="center"
          >
            <Text fontSize="xl" color="gray.300" mb={8}>
              Cada contribuição, por menor que seja, faz a diferença! Ajude a manter a comunidade 18games viva e crescendo! ✊
            </Text>
            
            <Button
              as="a"
              href="https://www.vakinha.com.br/5231202"
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              bgGradient="linear(to-r, yellow.400, orange.400, red.400)"
              color="white"
              px={8}
              _hover={{
                bgGradient: "linear(to-r, yellow.500, orange.500, red.500)",
                transform: "translateY(-2px)",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            >
              Fazer uma Doação
            </Button>

            <VStack mt={12} spacing={2}>
              <Text color="gray.400">
                Obrigado por fazer parte da família 18games! ❤️
              </Text>
              <Text color="gray.400" fontWeight="semibold">
                Equipe 18games
              </Text>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
