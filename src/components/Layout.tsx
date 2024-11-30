'use client';

import { Box, Container, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import Navbar from './Navbar';
import { User } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export default function Layout({ children, user }: LayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Banner de Membro */}
      {user && user.role === 'membro' && (
        <Box 
          bg="blue.500" 
          color="white" 
          p={2} 
          textAlign="center"
          position="fixed"
          top="0"
          left="0"
          right="0"
          zIndex={1000}
        >
          <Text fontSize="sm">
            🎮 Você será promovido a Membro+ em breve! Continue usando a plataforma.
          </Text>
        </Box>
      )}

      {/* Navbar com ajuste de padding quando tem banner */}
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={999}
        pt={user?.role === 'membro' ? '40px' : '0'}
      >
        <Navbar />
      </Box>

      {/* Conteúdo principal com ajuste de margin para não ficar sob o Navbar */}
      <Container 
        maxW="container.xl" 
        pt={{ 
          base: user?.role === 'membro' ? '120px' : '80px',
          md: user?.role === 'membro' ? '140px' : '100px' 
        }}
        px={{ base: 4, md: 6 }}
      >
        {children}
      </Container>
    </Box>
  );
}
