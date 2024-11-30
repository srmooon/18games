'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Box, 
  Container, 
  Grid, 
  Heading, 
  Stack, 
  Text, 
  Button, 
  useColorMode, 
  VStack, 
  useToast 
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DashboardCard = ({ title, value, color }: any) => (
  <MotionBox
    whileHover={{ y: -5 }}
    p={6}
    bg="white"
    rounded="xl"
    boxShadow="lg"
    borderTop="4px solid"
    borderColor={color}
  >
    <Text color="gray.500" fontSize="sm" fontWeight="semibold">
      {title}
    </Text>
    <Text fontSize="3xl" fontWeight="bold" mt={2}>
      {value}
    </Text>
  </MotionBox>
);

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer logout',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (typeof window !== 'undefined' && location.pathname === '/dashboard' && !user) {
    router.push('/login');
    return null;
  }

  return (
    <Box minH="100vh" py={20} px={4} bg="gray.900">
      <Container maxW="xl">
        <Stack spacing={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack>
              <Heading size="lg">Dashboard</Heading>
              <Text color="gray.600">
                Bem-vindo, {user?.email || 'Usuário'}
              </Text>
            </Stack>
            <Stack direction="row" spacing={4}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              </Button>
              <Button colorScheme="red" onClick={handleLogout}>
                Sair
              </Button>
            </Stack>
          </Box>

          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={6}
          >
            <DashboardCard
              title="Total de Visitas"
              value="1,234"
              color="blue.400"
            />
            <DashboardCard
              title="Usuários Ativos"
              value="789"
              color="green.400"
            />
            <DashboardCard
              title="Novos Registros"
              value="123"
              color="purple.400"
            />
          </Grid>

          <Box bg="white" p={8} rounded="xl" boxShadow="lg">
            <Heading size="md" mb={4}>
              Atividades Recentes
            </Heading>
            <Stack spacing={4}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  p={4}
                  bg="gray.50"
                  rounded="md"
                  transition="all 0.2s"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Text>Atividade {i}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Há {i} hora{i > 1 ? 's' : ''}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default function DashboardPage() {
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
      <DashboardContent />
    </Suspense>
  );
}
