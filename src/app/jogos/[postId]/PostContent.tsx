'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Text,
  Image,
  Wrap,
  IconButton,
  HStack,
  VStack,
  useToast,
  Icon,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FaStar, FaDownload, FaTimes } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { gameTags } from '@/constants/gameTags';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';

interface Rating {
  userId: string;
  rating: number;
  timestamp: number;
}

interface Post {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  tags: string[];
  createdAt: any;
  userId: string;
  username: string;
  status: string;
  ratings?: Rating[];
  downloadSite?: string;
  downloadUrl?: string;
  userPhotoURL?: string;
}

interface PostContentProps {
  postId: string;
}

const downloadSites = [
  { id: 'mega', label: 'Mega', domain: 'mega.nz' },
  { id: 'mediafire', label: 'MediaFire', domain: 'mediafire.com' },
  { id: 'drive', label: 'Google Drive', domain: 'drive.google.com' },
  { id: 'dropbox', label: 'Dropbox', domain: 'dropbox.com' },
  { id: 'onedrive', label: 'OneDrive', domain: 'onedrive.live.com' },
  { id: 'pixeldrain', label: 'Pixeldrain', domain: 'pixeldrain.com' },
  { id: 'catbox', label: 'Catbox', domain: 'files.catbox.moe' },
];

const getDownloadUrl = (url: string, site: string): string => {
  switch (site) {
    case 'mediafire':
      return url.includes('/download/') ? url : url.replace('/file/', '/download/');
    case 'mega':
      return url.includes('/file/') ? url : url.replace('#!', '/file/');
    case 'drive':
      return url.includes('/uc?') ? url : url.replace('/file/d/', '/uc?id=').replace(/\/view.*$/, '&export=download');
    case 'dropbox':
      return url.includes('dl=1') ? url : url + '?dl=1';
    case 'onedrive':
      return url.includes('download=1') ? url : url.replace('view.aspx', 'download.aspx');
    case 'pixeldrain':
      return url.includes('/api/file/') ? url : url.replace('/u/', '/api/file/') + '/download';
    case 'catbox':
      return url; // Catbox já fornece link direto de download
    default:
      return url;
  }
};

export default function PostContent({ postId }: PostContentProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const router = useRouter();
  const { user, profile } = useUserContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const getRoleLevel = (role: string): number => {
    switch (role) {
      case 'admin': return 4;
      case 'vip+': return 3;
      case 'vip': return 2;
      case 'membro+': return 1;
      case 'membro': return 0;
      default: return 0;
    }
  };

  const canRate = profile && getRoleLevel(profile.role || 'membro') >= getRoleLevel('membro+');

  const canDeletePost = user && post && (
    user.uid === post.userId || 
    (profile?.role && ['admin', 'vip+'].includes(profile.role))
  );

  const getAverageRating = () => {
    if (!post?.ratings || post.ratings.length === 0) return 0;
    const sum = post.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / post.ratings.length;
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;

      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const data = postDoc.data();
          console.log('Raw post data:', data); // Log dos dados brutos
          
          // Buscar dados do usuário
          const userDoc = await getDoc(doc(db, 'users', data.userId || ''));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          const postData: Post = {
            id: postDoc.id,
            title: data.title || '',
            description: data.description || '',
            mainImage: data.mainImage || '',
            galleryImages: data.galleryImages || [],
            tags: data.tags || [],
            createdAt: data.createdAt,
            userId: data.userId || '',
            username: data.username || userData?.displayName || 'Anônimo',
            userPhotoURL: userData?.photoURL || '/default-avatar.png',
            status: data.status || 'active',
            downloadSite: data.downloadSite || '',
            downloadUrl: data.downloadUrl || '',
            ratings: data.ratings || []
          };
          
          console.log('Processed post data:', postData); // Log dos dados processados
          console.log('Gallery images:', postData.galleryImages); // Log específico das imagens
          
          setPost(postData);
          
          if (user) {
            const userRating = postData.ratings?.find(r => r.userId === user.uid);
            if (userRating) {
              setUserRating(userRating.rating);
            }
          }
        } else {
          console.error('Post não encontrado');
          router.push('/jogos');
        }
      } catch (error) {
        console.error('Erro ao carregar post:', error);
        router.push('/jogos');
      }
    };

    loadPost();
  }, [postId, router, user]);

  const handleRating = async (newRating: number) => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para avaliar posts.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (profile?.role === 'membro') {
      toast({
        title: 'Acesso restrito',
        description: 'Apenas membros+ ou superior podem avaliar posts. Continue usando a plataforma por 3 dias para se tornar membro+!',
        status: 'warning',
        duration: 5000,
      });
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        toast({
          title: "Erro",
          description: "Post não encontrado",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const post = postDoc.data();
      const ratings = post.ratings || [];
      const existingRating = ratings.find((r: any) => r.userId === user.uid);

      let updatedRatings;
      if (existingRating) {
        // Se está atualizando uma avaliação existente
        updatedRatings = ratings.map((r: any) =>
          r.userId === user.uid ? { ...r, rating: newRating } : r
        );
      } else {
        // Se é uma nova avaliação
        updatedRatings = [...ratings, { 
          userId: user.uid, 
          rating: newRating,
          timestamp: Date.now()
        }];

        // Atualizar ratingCount do autor do post apenas para novas avaliações
        const postAuthorRef = doc(db, 'users', post.userId);
        await updateDoc(postAuthorRef, {
          ratingCount: increment(1)
        });
      }

      // Atualizar as avaliações do post
      await updateDoc(postRef, {
        ratings: updatedRatings,
      });

      setUserRating(newRating);
    } catch (error) {
      console.error('Erro ao avaliar:', error);
      toast({
        title: "Erro ao avaliar",
        description: "Tente novamente mais tarde",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDownload = () => {
    if (!post.downloadUrl) {
      toast({
        title: 'Link indisponível',
        description: 'O link de download não está disponível no momento.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Processar e abrir o URL
    let processedUrl = post.downloadUrl;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    window.open(processedUrl, '_blank');
  };

  const handleDeletePost = async () => {
    if (!post || !user) return;

    try {
      // Buscar dados atuais do post para calcular ajustes
      const postRef = doc(db, 'posts', post.id);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();
      const ratings = postData?.ratings || [];
      
      // Calcular total de avaliações a serem removidas
      const totalRatingsToRemove = ratings.length;

      // Atualizar o perfil do autor do post
      const authorRef = doc(db, 'users', post.userId);
      await updateDoc(authorRef, {
        ratingCount: increment(-totalRatingsToRemove),
        postCount: increment(-1)
      });

      // Deletar o post
      await deleteDoc(postRef);

      toast({
        title: 'Post deletado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirecionar para a página de posts
      router.push('/jogos');
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      toast({
        title: 'Erro ao deletar post',
        description: 'Ocorreu um erro ao tentar deletar o post. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!post) {
    return <div>Carregando...</div>;
  }

  const averageRating = getAverageRating();

  return (
    <Box maxW="container.xl" mx="auto" p={4}>
      <Box position="relative">
        {canDeletePost && (
          <IconButton
            aria-label="Deletar post"
            icon={<Icon as={FaTimes} />}
            position="absolute"
            right={2}
            top={2}
            colorScheme="red"
            size="sm"
            onClick={onOpen}
            zIndex={2}
            borderRadius="full"
            boxShadow="md"
            _hover={{ bg: 'red.500', color: 'white' }}
          />
        )}
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          {post.title}
        </Text>
        <Box 
          as="button" 
          onClick={() => router.push(`/profile/${post.userId}`)}
          display="flex" 
          alignItems="center"
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
          mb={4}
        >
          <Image 
            src={post.userPhotoURL || '/default-avatar.png'} 
            alt={post.username} 
            w="40px" 
            h="40px" 
            borderRadius="full" 
            mr={3}
          />
          <Text fontWeight="medium">{post.username}</Text>
        </Box>
      </Box>

      {/* Avaliação */}
      <Box>
        <HStack spacing={4} mb={2}>
          <Text fontSize="lg" fontWeight="medium">
            Avaliação: {averageRating.toFixed(1)} ({post.ratings?.length || 0} votos)
          </Text>
        </HStack>
        <HStack spacing={0} mt={4}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Tooltip
              key={star}
              label={
                !user 
                  ? "Faça login para avaliar"
                  : profile?.role === 'membro'
                  ? "Você poderá avaliar posts após 3 dias de conta. Continue usando a plataforma!"
                  : userRating 
                  ? "Clique para mudar sua avaliação" 
                  : "Clique para avaliar"
              }
              placement="top"
            >
              <IconButton
                aria-label={`Rate ${star} stars`}
                icon={<Icon as={FaStar} />}
                onClick={() => handleRating(star)}
                isDisabled={!user || profile?.role === 'membro'}
                color={userRating && userRating >= star ? "yellow.400" : "gray.300"}
                variant="ghost"
                _hover={user && profile?.role !== 'membro' ? {
                  color: "yellow.400"
                } : undefined}
                size="sm"
                p={0}
                minW="auto"
              />
            </Tooltip>
          ))}
          <Text ml={2}>
            ({post?.ratings?.length || 0} avaliações)
          </Text>
        </HStack>
      </Box>

      {/* Imagem Principal */}
      <Box
        borderRadius="lg"
        overflow="hidden"
        borderWidth="2px"
        borderColor="pink.400"
        mt={4}
      >
        <Image
          src={post.mainImage}
          alt={post.title}
          w="full"
          h={{ base: "300px", md: "500px" }}
          objectFit="cover"
        />
      </Box>

      {/* Tags */}
      <Wrap spacing={1} mt={4}>
        {post.tags.map(tagId => {
          const tag = gameTags.find(t => t.value === tagId);
          return tag ? (
            <Button
              key={tag.value}
              variant="solid"
              borderWidth="1px"
              borderColor="purple.500"
              bg="rgba(128, 90, 213, 0.3)"
              color="white"
              _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
              size="xs"
              height="min-content"
              minH={0}
              minW="min-content"
              width="auto"
              px={2}
              py={0.5}
              borderRadius="full"
              fontSize="24px"
              lineHeight="1.2"
              fontWeight="medium"
            >
              {tag.label}
            </Button>
          ) : null;
        })}
      </Wrap>

      {/* Descrição */}
      <Box mt={4}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Descrição
        </Text>
        <Text whiteSpace="pre-wrap">{post.description}</Text>
      </Box>

      {/* Galeria */}
      {post.galleryImages?.length > 0 && (
        <Box mt={4}>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Galeria
          </Text>
          <Wrap spacing={4}>
            {post.galleryImages.map((image, index) => (
              <Box
                key={index}
                borderRadius="lg"
                overflow="hidden"
                borderWidth="2px"
                borderColor="pink.400"
              >
                <Image
                  src={image}
                  objectFit="cover"
                  alt={`${post.title} - Imagem ${index + 1}`}
                  w="full"
                  h="200px"
                />
              </Box>
            ))}
          </Wrap>
        </Box>
      )}

      {/* Download */}
      <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg="gray.900">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Download
        </Text>
        <Box>
          <Text mb={2}>
            Site: {post.downloadSite || 'Não especificado'}
          </Text>
          <Button
            leftIcon={<FaDownload />}
            colorScheme="purple"
            onClick={handleDownload}
            isDisabled={!post.downloadUrl}
            w="100%"
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* AlertDialog para confirmação */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deletar Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={() => {
                handleDeletePost();
                onClose();
              }} ml={3}>
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin':
      return 'red';
    case 'vip+':
      return 'yellow';
    case 'vip':
      return 'purple';
    case 'membro+':
      return 'blue';
    default:
      return 'gray';
  }
}
