'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Text,
  Badge,
  HStack,
  VStack,
  Heading,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import {
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  writeBatch,
  where,
  getDocs,
  increment
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/Post';
import { useUserContext } from '@/contexts/UserContext';
import CreatePost from '@/app/jogos/CreatePost';

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const { profile } = useUserContext();

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchPosts();
  }, [profile, router]);

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map(doc => ({

        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Erro ao carregar posts',
        description: 'Não foi possível carregar a lista de posts.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    onEditOpen();
  };

  const handleDeleteClick = (post: Post) => {
    setSelectedPost(post);
    onDeleteOpen();
  };

  const handleAction = async () => {
    if (!selectedPost) return;

    try {
      // Primeiro, excluir todos os comentários do post
      const commentsRef = collection(db, `posts/${selectedPost.id}/comments`);
      const commentsSnapshot = await getDocs(commentsRef);
      const batch = writeBatch(db);

      commentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Atualizar o perfil do autor do post
      const authorRef = doc(db, 'users', selectedPost.userId);
      await updateDoc(authorRef, {
        postCount: increment(-1),
        ratingCount: increment(-(selectedPost.ratings?.length || 0))
      });

      // Executar o batch para deletar todos os comentários
      await batch.commit();

      // Deletar o post
      await deleteDoc(doc(db, 'posts', selectedPost.id));

      toast({
        title: 'Sucesso',
        description: 'Post excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      setSelectedPost(null);
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <VStack spacing={6} align="center" w="100%" py={10}>
        <Spinner size="xl" color="brand.500" />
        <Text>Carregando...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <Heading size="lg" mb={4}>Gerenciamento de Posts</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Título</Th>
              <Th>Autor</Th>
              <Th>Data de Criação</Th>
              <Th>Categoria</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {posts.map((post) => (
              <Tr key={post.id}>
                <Td>{post.title}</Td>
                <Td>{post.userName}</Td>
                <Td>
                  {formatDistanceToNow(new Date(post.createdAt.seconds * 1000), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Td>
                <Td>{post.category}</Td>
                <Td>
                  {post.status === 'published' ? (
                    <Badge colorScheme="green">Publicado</Badge>
                  ) : (
                    <Badge colorScheme="yellow">Rascunho</Badge>
                  )}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleEdit(post)}
                    >
                      Editar
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteClick(post)}
                    >
                      Deletar
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Edição */}
      <CreatePost
        isOpen={isEditOpen}
        onClose={onEditClose}
        editPost={selectedPost ? {
          id: selectedPost.id || '',
          title: selectedPost.title,
          description: selectedPost.description,
          mainImage: selectedPost.mainImage,
          galleryImages: selectedPost.galleryImages || [],
          downloadSite: selectedPost.downloadSite || '',
          downloadUrl: selectedPost.downloadUrl || '',
          tags: selectedPost.tags,
          translationSite: selectedPost.translationSite,
          translationUrl: selectedPost.translationUrl,
          dlcSite: selectedPost.dlcSite,
          dlcUrl: selectedPost.dlcUrl,
          patchSite: selectedPost.patchSite,
          patchUrl: selectedPost.patchUrl
        } : undefined}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={undefined}
        onClose={onDeleteClose}
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
              <Button onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleAction} ml={3}>
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
