'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  Image,
  useToast,
  Grid,
  GridItem,
  Flex,
  HStack,
  VStack,
  Tag,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useDisclosure,
  Link
} from '@chakra-ui/react';
import { FaDownload, FaStar, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { useUserContext } from '@/contexts/UserContext';
import CreatePost from '../CreatePost';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

interface Post {
  id?: string;
  title: string;
  description: string;
  mainImage: string;
  galleryImages?: string[];
  tags: string[];
  ratings?: Rating[];
  userId: string;
  downloadSite?: string;
  downloadUrl?: string;
  translationSite?: string;
  translationUrl?: string;
  dlcSite?: string;
  dlcUrl?: string;
  patchSite?: string;
  patchUrl?: string;
  author?: {
    name: string;
    role: string;
  };
}

interface Rating {
  userId: string;
  rating: number;
  timestamp: number;
}

interface PostContentProps {
  postId: string;
}

const downloadSites = [
  { id: 'mega', label: 'MEGA' },
  { id: 'mediafile', label: 'MediaFire' },
  { id: 'gdrive', label: 'Google Drive' },
  { id: 'pixeldrain', label: 'Pixeldrain' },
  { id: 'torrent', label: 'Torrent' },
  { id: 'uptobox', label: 'Uptobox' },
  { id: 'fichier', label: '1fichier' },
  { id: 'zippyshare', label: 'Zippyshare' }
];

const optionalDownloads = [
  { id: 'translation', label: 'Tradução' },
  { id: 'dlc', label: 'DLC' },
  { id: 'patch', label: 'Patch' }
];

const getDownloadUrl = (url: string, site: string): string => {
  if (!url || !site) return url;
  switch (site) {
    case 'mediafile':
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
      return url;
    default:
      return url;
  }
};

const renderDownloadButton = (site: string, url: string, label: string) => {
  const siteInfo = downloadSites.find(site => site.id === site);
  if (!siteInfo || !url) return null;

  const downloadUrl = getDownloadUrl(url, site);

  return (
    <Button
      as="a"
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      leftIcon={<Image src={siteInfo.id === 'mega' ? '/sites/mega.png' : siteInfo.id === 'mediafile' ? '/sites/mediafire.png' : siteInfo.id === 'gdrive' ? '/sites/drive.png' : '/sites/pixeldrain.png'} alt={siteInfo.label} boxSize="20px" />}
      colorScheme="blue"
      size="lg"
      width="full"
      mb={2}
    >
      {label}
    </Button>
  );
};

const linkify = (text: string) => {
  // Regex melhorada para pegar URLs com ou sem protocolo
  const urlRegex = /(https?:\/\/[^\s]+)|(?<!@)([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part && part.match(urlRegex)) {
      const url = part.startsWith('http') ? part : `https://${part}`;
      return (
        <Link 
          key={i} 
          href={url}
          color="pink.400"
          textDecoration="underline"
          isExternal
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};

export default function PostContent({ postId }: PostContentProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const { user: firebaseUser, profile } = useUserContext();
  const router = useRouter();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Efeito para carregar o post
  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;

      try {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Post data:', data); // Debug
          setPost({
            id: postId,
            title: data.title || '',
            description: data.description || '',
            mainImage: data.mainImage || '',
            galleryImages: data.galleryImages || [],
            tags: data.tags || [],
            ratings: data.ratings || [],
            userId: data.userId || '',
            downloadSite: data.downloadSite || '',
            downloadUrl: data.downloadUrl || '',
            translationSite: data.translationSite || '',
            translationUrl: data.translationUrl || '',
            dlcSite: data.dlcSite || '',
            dlcUrl: data.dlcUrl || '',
            patchSite: data.patchSite || '',
            patchUrl: data.patchUrl || '',
            author: {
              name: data.author?.name || '',
              role: data.author?.role || ''
            }
          });
          console.log('Post state:', post); // Debug
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error);
        toast({
          title: 'Erro ao carregar post',
          description: 'Não foi possível carregar os dados do post.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadPost();
  }, [postId]); // Apenas postId como dependência

  // Efeito para atualizar o rating do usuário
  useEffect(() => {
    if (!post?.ratings || !firebaseUser) return;
    
    const rating = post.ratings.find(r => r.userId === firebaseUser.uid);
    if (rating) {
      setUserRating(rating.rating);
    }
  }, [post?.ratings, firebaseUser?.uid]); // Dependências específicas

  // Memoize o cálculo do rating médio
  const averageRating = useMemo(() => {
    if (!post?.ratings || post.ratings.length === 0) return 0;
    const sum = post.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / post.ratings.length;
  }, [post?.ratings]);

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

  const canDeletePost = firebaseUser && post && (
    firebaseUser.uid === post.userId || 
    (profile?.role && ['admin', 'vip+'].includes(profile.role))
  );

  const canEditPost = firebaseUser && post && (
    firebaseUser.uid === post.userId || 
    (profile?.role && ['admin', 'vip+'].includes(profile.role))
  );

  const handleRating = async (newRating: number) => {
    if (!firebaseUser) {
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
      const existingRating = ratings.find((r: any) => r.userId === firebaseUser.uid);

      let updatedRatings;
      if (existingRating) {
        // Se está atualizando uma avaliação existente
        updatedRatings = ratings.map((r: any) =>
          r.userId === firebaseUser.uid ? { ...r, rating: newRating } : r
        );
      } else {
        // Se é uma nova avaliação
        updatedRatings = [...ratings, { 
          userId: firebaseUser.uid, 
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

  const handleDeletePost = async () => {
    if (!post || !firebaseUser) return;

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

  return (
    <Box maxW="container.xl" py={8} mx="auto">
      {post && (
        <Box p={6} bg="gray.800" borderRadius="lg">
          <Box position="relative">
            {/* Imagem Principal */}
            <Box mb={6}>
              <Image
                src={post.mainImage}
                alt={post.title}
                width="100%"
                height="400px"
                objectFit="cover"
                borderRadius="md"
              />
            </Box>

            {/* Título e Botões de Ação */}
            <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {post.title}
              </Text>
              {canEditPost && (
                <HStack spacing={2} position="absolute" top={4} right={4}>
                  <Button
                    leftIcon={<EditIcon />}
                    colorScheme="blue"
                    onClick={onEditOpen}
                  >
                    Editar
                  </Button>
                  <Button
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={onDeleteOpen}
                  >
                    Excluir
                  </Button>
                </HStack>
              )}
            </Flex>

            {/* Sistema de Avaliação */}
            <Box mb={6}>
              <HStack spacing={0}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    aria-label={`Rate ${star} stars`}
                    icon={<FaStar />}
                    onClick={() => handleRating(star)}
                    isDisabled={!firebaseUser || profile?.role === 'membro'}
                    color={userRating && userRating >= star ? "yellow.400" : "gray.300"}
                    variant="ghost"
                    size="lg"
                    p={0}
                    minW="auto"
                  />
                ))}
                <Text color="white" ml={2}>
                  ({averageRating.toFixed(1)})
                </Text>
              </HStack>
            </Box>

            {/* Descrição */}
            <Text color="gray.300" mb={6} whiteSpace="pre-wrap">
              {linkify(post.description)}
            </Text>

            {/* Tags */}
            <HStack mb={6}>
              {post.tags?.map((tag, index) => (
                <Tag key={index} colorScheme="pink">
                  {tag}
                </Tag>
              ))}
            </HStack>

            {/* Galeria de Imagens */}
            {post.galleryImages && post.galleryImages.length > 0 && (
              <Box mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4} color="white">
                  Galeria
                </Text>
                <Grid templateColumns="repeat(5, 1fr)" gap={4}>
                  {post.galleryImages.map((image, index) => (
                    <GridItem key={index}>
                      <Box 
                        border="2px"
                        borderColor="white"
                        borderRadius="lg"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() => {
                          setSelectedImage(image);
                          onImageOpen();
                        }}
                      >
                        <Image
                          src={image}
                          alt={`Imagem ${index + 1}`}
                          width="100%"
                          height="100px"
                          objectFit="cover"
                        />
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Links de Download */}
            <Box mb={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4} color="white">
                Downloads
              </Text>
              {console.log('Download URLs:', { 
                main: post.downloadUrl,
                translation: post.translationUrl,
                dlc: post.dlcUrl,
                patch: post.patchUrl
              })}
              <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                {/* Download Principal */}
                {post.downloadUrl && (
                  <GridItem>
                    <Box 
                      p={4} 
                      bg="gray.700"
                      borderRadius="lg"
                      border="1px"
                      borderColor="pink.500"
                      height="100%"
                    >
                      <VStack spacing={2}>
                        <Text color="white" fontWeight="bold">
                          Download Principal
                        </Text>
                        <Button
                          as="a"
                          href={post.downloadUrl.startsWith('http') ? post.downloadUrl : `https://${post.downloadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          colorScheme="pink"
                          width="100%"
                          leftIcon={<FaDownload />}
                        >
                          mega
                        </Button>
                      </VStack>
                    </Box>
                  </GridItem>
                )}

                {/* Downloads Opcionais */}
                {[
                  { id: 'translation', label: 'Tradução', url: post.translationUrl },
                  { id: 'dlc', label: 'DLC', url: post.dlcUrl },
                  { id: 'patch', label: 'Patch', url: post.patchUrl }
                ].map((type) => type.url && (
                  <GridItem key={type.id}>
                    <Box 
                      p={4} 
                      bg="gray.700"
                      borderRadius="lg"
                      border="1px"
                      borderColor="gray.600"
                      height="100%"
                    >
                      <VStack spacing={2}>
                        <Text color="white" fontWeight="bold">
                          {type.label}
                        </Text>
                        <Button
                          as="a"
                          href={type.url.startsWith('http') ? type.url : `https://${type.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          colorScheme="pink"
                          width="100%"
                          leftIcon={<FaDownload />}
                        >
                          mega
                        </Button>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </Box>

            {/* Modal para visualização da imagem */}
            <Modal isOpen={isImageOpen} onClose={onImageClose} size="6xl">
              <ModalOverlay />
              <ModalContent bg="gray.800">
                <ModalCloseButton color="white" />
                <ModalBody p={0}>
                  {selectedImage && (
                    <Image
                      src={selectedImage}
                      alt="Imagem ampliada"
                      width="100%"
                      height="auto"
                      maxH="90vh"
                      objectFit="contain"
                    />
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>

            {/* Modal de Edição */}
            <CreatePost
              isOpen={isEditOpen}
              onClose={onEditClose}
              editPost={post ? {
                id: post.id || '',
                title: post.title,
                description: post.description,
                mainImage: post.mainImage,
                galleryImages: post.galleryImages || [],
                downloadSite: post.downloadSite || '',
                downloadUrl: post.downloadUrl || '',
                tags: post.tags,
                translationSite: post.translationSite,
                translationUrl: post.translationUrl,
                dlcSite: post.dlcSite,
                dlcUrl: post.dlcUrl,
                patchSite: post.patchSite,
                patchUrl: post.patchUrl
              } : undefined}
            />

            {/* Diálogo de Confirmação de Exclusão */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
              <ModalOverlay />
              <ModalContent bg="gray.800">
                <ModalHeader fontSize="lg" fontWeight="bold" color="white">
                  Excluir Post
                </ModalHeader>
                <ModalCloseButton color="white" />
                <ModalBody>
                  Tem certeza? Esta ação não pode ser desfeita.
                </ModalBody>
                <ModalFooter>
                  <Button ref={cancelRef} onClick={onDeleteClose}>
                    Cancelar
                  </Button>
                  <Button colorScheme="red" onClick={handleDeletePost} ml={3}>
                    Excluir
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Box>
      )}
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
