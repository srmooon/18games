'use client';

import { Box, Container, Grid, Heading, Text, VStack, Badge } from '@chakra-ui/react';
import Image from 'next/image';
import Layout from '@/components/Layout';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  roleColor: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Baphomet',
    role: 'Dono',
    image: 'https://files.catbox.moe/tqrqtt.jpg',
    roleColor: 'red.500'
  },
  {
    name: 'Hawtch',
    role: 'Administrador',
    image: 'https://files.catbox.moe/0gv56s.jpg',
    roleColor: 'purple.500'
  },
  {
    name: 'Zero',
    role: 'Moderador',
    image: 'https://files.catbox.moe/9eu9xu.jpg',
    roleColor: 'blue.500'
  },
  {
    name: 'Sr.Moon',
    role: 'Desenvolvedor',
    image: 'https://files.catbox.moe/qc1pnz.gif',
    roleColor: 'brand.500'
  }
];

export default function EquipePage() {
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
            Nossa Equipe
          </Heading>
          <Text color="gray.300" fontSize="lg">
            Conheça as pessoas por trás do 18Games
          </Text>
        </Box>

        <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={8}
        >
          {teamMembers.map((member) => (
            <Box
              key={member.name}
              bg="gray.800"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="dark-lg"
              _hover={{ 
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(255, 0, 163, 0.2)',
                borderColor: 'brand.500',
                borderWidth: '1px'
              }}
              transition="all 0.2s"
            >
              <Box position="relative" width="100%" height="300px">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </Box>
              <VStack p={4} spacing={2} align="center">
                <Heading size="md" color="white">
                  {member.name}
                </Heading>
                <Badge 
                  colorScheme={member.roleColor.split('.')[0]}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  {member.role}
                </Badge>
              </VStack>
            </Box>
          ))}
        </Grid>

        {/* Espaço extra no final da página */}
        <Box pb={12} />
      </VStack>
    </Layout>
  );
}
