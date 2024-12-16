import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Input,
  Button,
  useToast,
  Divider,
  Flex,
  Icon,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useUserContext } from '@/contexts/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaStar } from 'react-icons/fa';
import { DeleteIcon } from '@chakra-ui/icons';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  userRole?: string;
  createdAt: any;
}

interface CommentsProps {
  postId: string;
  postAuthorId: string;
}

export default function Comments({ postId, postAuthorId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRatings, setUserRatings] = useState<{[key: string]: number}>({});
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const { profile: currentUser } = useUserContext();
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    if (!postId) return;

    let unsubscribe: () => void;

    const loadComments = async () => {
      try {
        // Primeira tentativa: com ordenação
        const commentsRef = collection(db, `posts/${postId}/comments`);
        const q = query(
          commentsRef,
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, async (snapshot) => {
          const commentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Comment[];
          setComments(commentsData);

          // Buscar avaliações dos usuários
          const postDoc = await getDoc(doc(db, 'posts', postId));
          if (postDoc.exists()) {
            const ratings = postDoc.data().ratings || [];
            const ratingsMap = ratings.reduce((acc: {[key: string]: number}, rating: any) => {
              acc[rating.userId] = rating.rating;
              return acc;
            }, {});
            setUserRatings(ratingsMap);
          }
        }, async (error) => {
          console.error('Erro na primeira tentativa:', error);
          
          // Segunda tentativa: sem ordenação
          const snapshot = await getDocs(commentsRef);
          const commentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Comment[];

          // Ordenar manualmente
          commentsData.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.seconds - a.createdAt.seconds;
          });

          setComments(commentsData);

          // Configurar listener para atualizações em tempo real
          unsubscribe = onSnapshot(commentsRef, (snapshot) => {
            const updatedComments = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Comment[];
            
            // Ordenar manualmente
            updatedComments.sort((a, b) => {
              if (!a.createdAt || !b.createdAt) return 0;
              return b.createdAt.seconds - a.createdAt.seconds;
            });
            
            setComments(updatedComments);
          });
        });
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os comentários',
          status: 'error',
          duration: 3000,
        });
      }
    };

    loadComments();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [postId]);

  const handleAddComment = async () => {
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para comentar',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Erro',
        description: 'O comentário não pode estar vazio',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await addDoc(collection(db, `posts/${postId}/comments`), {
        text: newComment,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        userRole: currentUser.role,
        createdAt: serverTimestamp(),
      });

      setNewComment('');
      
      toast({
        title: 'Sucesso',
        description: 'Comentário adicionado com sucesso',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'red.500';
      case 'vip+':
        return 'yellow.500';
      case 'vip':
        return 'purple.500';
      case 'membro+':
        return 'blue.500';
      default:
        return 'gray.500';
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!currentUser) return false;
    return (
      currentUser.uid === comment.userId ||
      currentUser.uid === postAuthorId ||
      currentUser.role === 'admin'
    );
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteDoc(doc(db, `posts/${postId}/comments/${commentToDelete.id}`));
      
      toast({
        title: 'Sucesso',
        description: 'Comentário excluído com sucesso',
        status: 'success',
        duration: 3000,
      });
      
      onDeleteClose();
      setCommentToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comentário',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4} color="white">
        Comentários
      </Text>

      {/* Área de input para novo comentário */}
      <HStack mb={6}>
        <Input
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          color="white"
        />
        <Button
          colorScheme="blue"
          onClick={handleAddComment}
          isDisabled={!currentUser}
        >
          Comentar
        </Button>
      </HStack>

      {/* Lista de comentários */}
      <VStack spacing={4} align="stretch">
        {comments.map((comment) => (
          <Box key={comment.id} p={4} bg="gray.700" borderRadius="md">
            <HStack spacing={4} mb={2} align="start" justify="space-between">
              <HStack spacing={4}>
                <Box position="relative">
                  <Avatar 
                    size="md" 
                    src={comment.userPhotoURL} 
                    name={comment.userName}
                    border="2px solid"
                    borderColor={getRoleColor(comment.userRole)}
                  />
                  {userRatings[comment.userId] && (
                    <Flex
                      position="absolute"
                      bottom="-2px"
                      right="-2px"
                      bg="gray.800"
                      borderRadius="full"
                      p={1}
                      alignItems="center"
                      border="2px solid"
                      borderColor={getRoleColor(comment.userRole)}
                    >
                      <Icon as={FaStar} color="yellow.400" boxSize={3} />
                      <Text fontSize="xs" color="white" ml={0.5}>
                        {userRatings[comment.userId]}
                      </Text>
                    </Flex>
                  )}
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                  <HStack>
                    <Text color="white" fontWeight="bold">
                      {comment.userName}
                    </Text>
                    {comment.userRole && (
                      <Text 
                        color={getRoleColor(comment.userRole)} 
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        ({comment.userRole})
                      </Text>
                    )}
                  </HStack>
                  <Text color="gray.400" fontSize="sm">
                    {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </Text>
                  <Text color="gray.200" mt={2}>
                    {comment.text}
                  </Text>
                </VStack>
              </HStack>
              {canDeleteComment(comment) && (
                <IconButton
                  aria-label="Excluir comentário"
                  icon={<DeleteIcon />}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    setCommentToDelete(comment);
                    onDeleteOpen();
                  }}
                />
              )}
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Excluir Comentário</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text color="white">Tem certeza que deseja excluir este comentário?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleDeleteComment}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 