'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Icon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FiUsers, FiActivity, FiMessageSquare } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import UserManagement from '@/components/admin/UserManagement';
import PostManagement from '@/components/admin/PostManagement';

interface Stats {
  activeUsers: number;
  engagementRate: number;
  totalPosts: number;
  activeUsersTrend: number;
  engagementTrend: number;
  postsTrend: number;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    engagementRate: 0,
    totalPosts: 0,
    activeUsersTrend: 0,
    engagementTrend: 0,
    postsTrend: 0
  });
  const { user, profile } = useUserContext();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        if (profile) {
          if (profile.role !== 'admin') {
            toast({
              title: 'Acesso negado',
              description: 'Você não tem permissão para acessar esta página.',
              status: 'error',
              duration: 5000,
              position: 'top-right',
            });
            router.push('/');
            return;
          }
          await fetchStats();
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar esta página.',
            status: 'error',
            duration: 5000,
            position: 'top-right',
          });
          router.push('/');
          return;
        }

        await fetchStats();
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [user, profile, router, toast]);

  const fetchStats = async () => {
    try {
      // Primeiro, vamos verificar se o documento statistics/general existe
      const statsRef = doc(db, 'statistics', 'general');
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        // Se não existir, vamos criar com valores iniciais
        await setDoc(statsRef, {
          activeUsers: 0,
          totalPosts: 0,
          engagementRate: 0,
          activeUsersTrend: 0,
          engagementTrend: 0,
          postsTrend: 0,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Agora vamos buscar os dados atualizados
      const usersQuery = query(collection(db, 'users'));
      const postsQuery = query(collection(db, 'posts'));

      const [usersSnapshot, postsSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(postsQuery),
      ]);

      const totalUsers = usersSnapshot.size;
      const totalPosts = postsSnapshot.size;

      // Calcular taxa de engajamento (usuários que fizeram posts)
      const usersWithPosts = new Set();
      postsSnapshot.forEach((post) => {
        usersWithPosts.add(post.data().userId);
      });

      const engagementRate = totalUsers > 0 
        ? Math.round((usersWithPosts.size / totalUsers) * 100) 
        : 0;

      // Atualizar estatísticas
      await setDoc(statsRef, {
        activeUsers: totalUsers,
        totalPosts,
        engagementRate,
        activeUsersTrend: 0,
        engagementTrend: 0,
        postsTrend: 0,
        lastUpdated: new Date().toISOString(),
      });

      // Atualizar estado
      setStats({
        activeUsers: totalUsers,
        totalPosts,
        engagementRate,
        activeUsersTrend: 0,
        engagementTrend: 0,
        postsTrend: 0
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      
      // Se for erro de permissão, mostrar mensagem específica
      if (error.code === 'permission-denied') {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar as estatísticas. Entre em contato com um administrador.',
          status: 'error',
          duration: 5000,
          position: 'top-right',
        });
        router.push('/');
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as estatísticas. Tente novamente mais tarde.',
          status: 'error',
          duration: 5000,
          position: 'top-right',
        });
      }
      
      // Mesmo com erro, vamos mostrar a página com zeros
      setStats({
        activeUsers: 0,
        engagementRate: 0,
        totalPosts: 0,
        activeUsersTrend: 0,
        engagementTrend: 0,
        postsTrend: 0
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
          >
            Painel Administrativo
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Usuários Ativos</StatLabel>
                  <StatNumber>{stats.activeUsers}</StatNumber>
                  <StatHelpText>
                    <Icon as={FiUsers} mr={2} />
                    Total de usuários
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Taxa de Engajamento</StatLabel>
                  <StatNumber>{stats.engagementRate}%</StatNumber>
                  <StatHelpText>
                    <Icon as={FiActivity} mr={2} />
                    Usuários ativos
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total de Posts</StatLabel>
                  <StatNumber>{stats.totalPosts}</StatNumber>
                  <StatHelpText>
                    <Icon as={FiMessageSquare} mr={2} />
                    Posts publicados
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="xl">
            <Heading size="lg" mb={6}>Gerenciamento de Usuários</Heading>
            <UserManagement />
          </Box>

          <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="xl">
            <Heading size="lg" mb={6}>Gerenciamento de Posts</Heading>
            <PostManagement />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
