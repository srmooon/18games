'use client';

import { useEffect, useState, useContext } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  IconButton,
  Input,
  Flex,
  Image,
  useToast,
  Tooltip,
  useColorModeValue,
  Spinner,
  Grid,
  Wrap,
  Tag,
  Center,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { EditIcon, StarIcon, AddIcon } from '@chakra-ui/icons';
import CreatePost from '@/components/CreatePost';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CldUploadWidget } from 'next-cloudinary';
import { useUserContext } from '@/contexts/UserContext';

interface Rating {
  userId: string;
  rating: number;
  timestamp: number;
}

interface Post {
  id: string;
  title: string;
  mainImage: string;
  createdAt: number;
  createdBy: {
    uid: string;
    displayName: string;
    photoURL: string;
    role: string;
  };
  ratings?: Rating[];
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bannerURL: string;
  role: string;
  description: string;
  postCount: number;
  ratingCount: number;
  totalRating: number;
  averageRating: number;
  posts?: Post[];
  createdAt: any;
  username: string;
}

export default function ProfileClient({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  const toast = useToast();
  const { user: currentUser } = useUserContext();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const gray500 = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        toast({
          title: 'Perfil não encontrado',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      
      // Carregar posts do usuário
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('userId', '==', userId)
      );
      
      const postsSnap = await getDocs(postsQuery);
      const posts = postsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // Ordenar posts por data no cliente
      posts.sort((a, b) => b.createdAt - a.createdAt);

      const updatedProfile: UserProfile = {
        uid: userId,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        bannerURL: userData.bannerURL || '',
        role: userData.role || 'membro',
        description: userData.description || '',
        postCount: posts.length,
        ratingCount: userData.ratingCount || 0,
        totalRating: userData.totalRating || 0,
        averageRating: userData.averageRating || 0,
        posts: posts,
        createdAt: userData.createdAt,
        username: userData.username || ''
      };

      setProfile(updatedProfile);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: 'Erro ao carregar perfil',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilMemberPlus = (createdAt: any) => {
    if (!createdAt) return null;

    let createdAtDate;
    try {
      // Tenta converter para Date se for Timestamp do Firestore
      if (createdAt?.toDate) {
        createdAtDate = createdAt.toDate();
      } else if (typeof createdAt === 'string') {
        createdAtDate = new Date(createdAt);
      } else if (createdAt instanceof Date) {
        createdAtDate = createdAt;
      } else {
        return null;
      }

      const createdAtMs = createdAtDate.getTime();
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      const timeElapsed = Date.now() - createdAtMs;
      const timeRemaining = threeDaysInMs - timeElapsed;

      if (timeRemaining <= 0) return null;

      const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

      return { days, hours, minutes };
    } catch (error) {
      console.error('Erro ao calcular tempo restante:', error);
      return null;
    }
  };

  // Funções auxiliares para verificar permissões
  function canEditDisplayName(role: string) {
    return ['admin', 'vip+', 'vip', 'membro+'].includes(role);
  }

  function canEditPhoto(role: string) {
    return ['admin', 'vip+', 'vip', 'membro+'].includes(role);
  }

  function canEditBanner(role: string) {
    return ['admin', 'vip+', 'vip'].includes(role);
  }

  function getCloudinaryOptions(role: string, type: 'photo' | 'banner') {
    const maxSize = role === 'admin' ? 10 * 1024 * 1024 : // 10MB
                 role === 'vip+' ? 5 * 1024 * 1024 : // 5MB
                 role === 'vip' ? 3 * 1024 * 1024 : // 3MB
                 2 * 1024 * 1024; // 2MB

    return {
      maxFiles: 1,
      maxFileSize: maxSize,
      resourceType: "image",
      clientAllowedFormats: ["png", "jpg", "jpeg", "gif"],
      maxImageWidth: type === 'banner' ? 1920 : 500,
      maxImageHeight: type === 'banner' ? 1080 : 500,
    };
  }

  const rainbowBackgroundKeyframes = keyframes`
    0% { 
      background-color: #cc0000;
      border-color: #ff3333;
    }
    16.666% { 
      background-color: #ffa500;
      border-color: #ffcc00;
    }
    33.333% { 
      background-color: #ffff00;
      border-color: #ffff66;
    }
    50% { 
      background-color: #008000;
      border-color: #33cc33;
    }
    66.666% { 
      background-color: #0000ff;
      border-color: #3399ff;
    }
    83.333% { 
      background-color: #4b0082;
      border-color: #9933ff;
    }
    100% { 
      background-color: #cc0000;
      border-color: #ff3333;
    }
  `;

  const pinkPulseKeyframes = keyframes`
    0% { box-shadow: 0 0 10px #ff69b4; }
    50% { box-shadow: 0 0 10px #ff1493; }
    100% { box-shadow: 0 0 10px #ff69b4; }
  `;

  const handleUploadSuccess = async (result: any, type: 'photo' | 'banner') => {
    if (!userId || !result?.info?.secure_url) {
      toast({
        title: 'Erro no upload',
        description: 'Dados inválidos recebidos do servidor',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const imageUrl = result.info.secure_url;
      const docRef = doc(db, 'users', userId);
      
      await updateDoc(docRef, {
        [type === 'photo' ? 'photoURL' : 'bannerURL']: imageUrl
      });

      setProfile(prev => prev ? {
        ...prev,
        [type === 'photo' ? 'photoURL' : 'bannerURL']: imageUrl
      } : null);

      toast({
        title: `${type === 'photo' ? 'Foto' : 'Banner'} atualizado com sucesso`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, editedProfile);
      
      setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
      setIsEditing(false);
      setEditedProfile({});
      
      toast({
        title: 'Perfil atualizado com sucesso',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const defaultBanner = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!profile) {
    return (
      <Center h="100vh">
        <Text>Perfil não encontrado</Text>
      </Center>
    );
  }

  const timeUntilPromotion = profile?.createdAt ? getTimeUntilMemberPlus(profile.createdAt) : null;
  console.log('Profile createdAt:', profile?.createdAt); // Debug

  return (
    <Box w="full" bg={bgColor} minH="100vh" pb={8}>
      {profile?.role === 'membro' && (
        <Box 
          bg="blue.500" 
          p={4} 
          textAlign="center" 
          color="white"
        >
          {timeUntilPromotion ? (
            <Text>
              Faltam {timeUntilPromotion.days} dias, {timeUntilPromotion.hours} horas e {timeUntilPromotion.minutes} minutos para sua promoção automática para Membro+
            </Text>
          ) : profile?.createdAt ? (
            <Text>
              Você já completou 3 dias! Sua promoção para Membro+ acontecerá automaticamente na próxima atualização do sistema (meia-noite).
            </Text>
          ) : (
            <Text>
              Erro ao calcular o tempo para promoção. Por favor, contate o suporte.
            </Text>
          )}
        </Box>
      )}
      
      {/* Banner */}
      <Box position="relative" h={{ base: "200px", md: "300px" }} overflow="hidden">
        <Image
          src={profile?.bannerURL || defaultBanner}
          alt=""
          w="full"
          h="full"
          objectFit="cover"
        />
        {currentUser?.uid === userId && canEditBanner(profile?.role || '') && (
          <Box position="absolute" bottom={4} right={4}>
            <CldUploadWidget
              uploadPreset="18games_preset"
              onSuccess={(result) => handleUploadSuccess(result, 'banner')}
              options={getCloudinaryOptions(profile?.role || '', 'banner')}
            >
              {({ open }) => (
                <Button
                  onClick={() => open()}
                  size="md"
                  colorScheme="blue"
                  leftIcon={<EditIcon />}
                  bg="blackAlpha.700"
                  _hover={{ bg: 'blackAlpha.800' }}
                >
                  Editar Banner
                </Button>
              )}
            </CldUploadWidget>
          </Box>
        )}
      </Box>

      {/* Profile Card */}
      <Box 
        maxW="800px" 
        mx="auto" 
        mt="-80px" 
        position="relative" 
        zIndex={1}
        bg={bgColor}
        boxShadow="xl"
        rounded="lg"
        p={6}
      >
        <VStack spacing={6} align="stretch">
          {/* Avatar and Basic Info */}
          <Flex align="center" gap={4}>
            {/* Avatar com decoração baseada no cargo */}
            <Box position="relative">
              {/* Decoração do avatar */}
              <Box
                position="absolute"
                top="-6px"
                left="-6px"
                right="-6px"
                bottom="-6px"
                rounded="full"
                bg={
                  profile?.role === 'admin'
                    ? '#cc0000'  // Mesmo vermelho escuro do botão
                    : profile?.role === 'vip+'
                    ? 'pink.400'
                    : profile?.role === 'vip'
                    ? 'purple.400'
                    : profile?.role === 'membro+'
                    ? 'blue.400'
                    : 'transparent'
                }
              />
              <Avatar
                src={profile?.photoURL || '/default-avatar.png'}
                name={profile?.displayName}
                size="2xl"
                position="relative"
                border="3px solid"
                borderColor="white"
              />
              {currentUser?.uid === userId && canEditPhoto(profile?.role || '') && (
                <Box position="absolute" bottom={-2} right={-2}>
                  <CldUploadWidget
                    uploadPreset="18games_preset"
                    onSuccess={(result) => handleUploadSuccess(result, 'photo')}
                  >
                    {({ open }) => (
                      <IconButton
                        onClick={() => open()}
                        aria-label="Editar foto"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        rounded="full"
                      />
                    )}
                  </CldUploadWidget>
                </Box>
              )}
            </Box>

            <VStack align="start" flex={1} spacing={2}>
              <Flex align="center" w="100%" justify="space-between">
                <Box>
                  {isEditing ? (
                    <Flex gap={2}>
                      <Input
                        defaultValue={profile?.displayName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                        size="lg"
                        fontWeight="bold"
                      />
                      <Button onClick={handleSaveProfile} colorScheme="blue">
                        Salvar
                      </Button>
                      <Button onClick={() => {
                        setIsEditing(false);
                        setEditedProfile({});
                      }}>
                        Cancelar
                      </Button>
                    </Flex>
                  ) : (
                    <Flex align="center" gap={2}>
                      <Text 
                        fontSize="3xl" 
                        fontWeight="bold"
                      >
                        {profile?.displayName}
                      </Text>
                      {currentUser?.uid === userId && canEditDisplayName(profile?.role || '') && (
                        <IconButton
                          aria-label="Editar nome"
                          icon={<EditIcon />}
                          onClick={() => setIsEditing(true)}
                          size="sm"
                          variant="ghost"
                        />
                      )}
                    </Flex>
                  )}
                </Box>
                <Tag
                  size="lg"
                  px={6}
                  py={2}
                  fontSize="xl"
                  fontWeight="bold"
                  variant="solid"
                  color="white"
                  borderRadius="full"
                  bg={
                    profile?.role === 'admin' 
                      ? '#cc0000'
                      : profile?.role === 'vip+'
                      ? 'pink.400'
                      : profile?.role === 'vip'
                      ? 'purple.400'
                      : profile?.role === 'membro+'
                      ? 'blue.400'
                      : 'gray.500'
                  }
                  sx={
                    profile?.role === 'admin'
                      ? {
                          animation: `${rainbowBackgroundKeyframes} 6s linear infinite`,
                          border: '2px solid',
                          borderColor: '#ff3333',
                        }
                      : profile?.role === 'vip+'
                      ? {
                          animation: `${pinkPulseKeyframes} 2s ease-in-out infinite`,
                          border: '2px solid pink.400',
                          borderRadius: 'full',
                        }
                      : profile?.role === 'vip'
                      ? {
                          border: '2px solid purple.400',
                          borderRadius: 'full',
                        }
                      : profile?.role === 'membro+'
                      ? {
                          border: '2px solid blue.400',
                          borderRadius: 'full',
                        }
                      : {
                          border: '2px solid gray.500',
                          borderRadius: 'full',
                        }
                  }
                >
                  {profile?.role?.toUpperCase()}
                </Tag>
              </Flex>
              
              <Text color={gray500}>@{profile?.displayName?.toLowerCase().replace(/\s+/g, '')}</Text>
            </VStack>
          </Flex>

          {/* Stats */}
          <HStack spacing={8} mt={4}>
            <VStack>
              <Text fontSize="xl" fontWeight="bold">{profile.postCount}</Text>
              <Text color={gray500}>Posts</Text>
            </VStack>
            <VStack>
              <Text fontSize="xl" fontWeight="bold">
                {profile.averageRating.toFixed(1)}
              </Text>
              <Text color={gray500}>Média</Text>
            </VStack>
            <VStack>
              <Text fontSize="xl" fontWeight="bold">{profile.ratingCount}</Text>
              <Text color={gray500}>Avaliações</Text>
            </VStack>
          </HStack>

          {/* Posts Grid */}
          {profile?.posts && profile.posts.length > 0 && (
            <Box mt={8} w="full">
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Posts
              </Text>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {profile.posts.map((post) => (
                  <Box
                    key={post.id}
                    bg={cardBg}
                    rounded="lg"
                    overflow="hidden"
                    shadow="md"
                  >
                    <Image
                      src={post.mainImage}
                      alt={post.title}
                      w="full"
                      h="200px"
                      objectFit="cover"
                    />
                    <Box p={4}>
                      <Text fontWeight="bold" mb={2}>{post.title}</Text>
                      <HStack mt={2} spacing={2}>
                        <StarIcon color="yellow.400" />
                        <Text>
                          {post.ratings && post.ratings.length > 0
                            ? (post.ratings.reduce((sum, r) => sum + r.rating, 0) / post.ratings.length).toFixed(1)
                            : '0.0'}
                        </Text>
                        <Text color={gray500}>
                          ({post.ratings?.length || 0})
                        </Text>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'red';
    case 'vip+': return 'purple';
    case 'vip': return 'blue';
    case 'membro+': return 'green';
    default: return 'gray';
  }
};
