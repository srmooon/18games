'use client';

import { 
  Box, 
  Image, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Tag, 
  Avatar,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { gameTags } from '@/constants/gameTags';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Link from 'next/link';

type Merge<P, T> = Omit<P, keyof T> & T;
type MotionBoxProps = Merge<HTMLMotionProps<"div">, Omit<React.ComponentProps<typeof Box>, "transition">>;

const MotionBox = motion(Box) as React.FC<MotionBoxProps>;

interface UserData {
  displayName: string;
  photoURL: string;
  role: string;
}

interface GameCardProps {
  game: {
    id: string;
    title: string;
    description: string;
    mainImage: string;
    tags: string[];
    createdAt: any;
    createdBy: {
      uid: string;
      displayName: string;
      photoURL: string;
      role: string;
    };
  };
}

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!game.createdBy?.uid) return;
      
      try {
        const userRef = doc(db, 'users', game.createdBy.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          setUserData(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, [game.createdBy?.uid]);

  const handleClick = () => {
    router.push(`/jogos/${game.id}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      // Caso 1: Timestamp do Firestore
      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
      }
      
      // Caso 2: Timestamp numérico
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleDateString('pt-BR');
      }
      
      // Caso 3: Data ISO string
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString('pt-BR');
      }
      
      return '';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'moderator':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const createdBy = game.createdBy || {
    displayName: 'Usuário',
    photoURL: '',
    role: 'membro'
  };

  return (
    <MotionBox
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      cursor="pointer"
      position="relative"
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0,
        transition: 'opacity 0.2s',
        bgGradient: 'linear(to-r, brand.500, purple.500)',
        filter: 'blur(15px)',
        transform: 'scale(0.95)',
        zIndex: -1,
      }}
      _hover={{
        '&::after': {
          opacity: 0.3,
        }
      }}
    >
      <Box
        borderRadius="lg"
        overflow="hidden"
        bg="gray.800"
        boxShadow="dark-lg"
        _hover={{ boxShadow: '2xl' }}
        transition="all 0.2s"
        border="1px"
        borderColor="gray.700"
      >
        <Image
          src={game.mainImage || '/placeholder.jpg'}
          alt={game.title}
          w="full"
          h="200px"
          objectFit="cover"
          fallback={<Box w="full" h="200px" bg="gray.700" />}
        />
        
        <VStack p={6} align="start" spacing={3}>
          <Heading size="md" color="white" noOfLines={1}>
            {game.title}
          </Heading>
          
          <Text color="gray.300" noOfLines={2}>
            {game.description}
          </Text>
          
          <HStack spacing={2} flexWrap="wrap">
            {(game.tags || []).slice(0, 3).map((tag) => {
              const tagInfo = gameTags.find(t => t.id === tag);
              return (
                <Tag
                  key={tag}
                  size="sm"
                  variant="solid"
                  colorScheme={tagInfo?.color || 'gray'}
                  borderRadius="full"
                >
                  {tagInfo?.label || tag}
                </Tag>
              );
            })}
            {(game.tags || []).length > 3 && (
              <Tag
                size="sm"
                variant="outline"
                colorScheme="gray"
                borderRadius="full"
              >
                +{game.tags.length - 3}
              </Tag>
            )}
          </HStack>

          <HStack spacing={2} mt={2} onClick={(e) => e.stopPropagation()}>
            <Link href={`/profile/${game.createdBy?.uid}`} style={{ textDecoration: 'none' }}>
              <HStack spacing={2} _hover={{ opacity: 0.8 }}>
                <Avatar 
                  size="sm" 
                  src={userData?.photoURL || createdBy.photoURL}
                  name={userData?.displayName || createdBy.displayName}
                  bg="brand.500"
                  color="white"
                  border="2px"
                  borderColor="brand.500"
                />
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="medium" color="white">
                    {userData?.displayName || createdBy.displayName}
                  </Text>
                  <Tag size="sm" colorScheme={getRoleColor(userData?.role || createdBy.role)}>
                    {userData?.role || createdBy.role}
                  </Tag>
                </VStack>
              </HStack>
            </Link>
            <Text fontSize="sm" color="gray.500" ml="auto">
              {formatDate(game.createdAt)}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </MotionBox>
  );
}
