import { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  VStack,
  useToast,
  Image,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  Text,
} from '@chakra-ui/react';
import { CldUploadWidget } from 'next-cloudinary';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useUserContext } from '@/contexts/UserContext';
import { gameTags } from '@/constants/gameTags';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { profile: currentUser } = useUserContext();
  const toast = useToast();

  const canCreatePost = currentUser?.role && ['admin', 'vip+', 'vip', 'membro+'].includes(currentUser.role);

  const handleCreatePost = async () => {
    if (!currentUser?.uid || !title || !imageUrl || selectedTags.length === 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos e selecione pelo menos uma tag',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!canCreatePost) {
      toast({
        title: 'Erro',
        description: 'Você não tem permissão para criar posts',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      // Criar o post
      const postData = {
        userId: currentUser.uid,
        title,
        imageUrl,
        tags: selectedTags,
        createdAt: Date.now(),
        createdBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        }
      };

      const postRef = await addDoc(collection(db, 'posts'), postData);

      // Atualizar o contador de posts do usuário
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        postsCreated: increment(1)
      });

      toast({
        title: 'Post criado com sucesso',
        status: 'success',
        duration: 3000,
      });

      onClose();
      setTitle('');
      setImageUrl('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: 'Erro ao criar post',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleUploadSuccess = (result: any) => {
    if (result?.info?.secure_url) {
      setImageUrl(result.info.secure_url);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!canCreatePost) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Novo Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Input
              placeholder="Título do post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            {imageUrl ? (
              <Box position="relative" width="full">
                <Image 
                  src={imageUrl} 
                  alt="Preview" 
                  maxH="200px" 
                  objectFit="cover" 
                  width="full"
                />
                <Button
                  position="absolute"
                  bottom={2}
                  right={2}
                  size="sm"
                  onClick={() => setImageUrl('')}
                >
                  Remover
                </Button>
              </Box>
            ) : (
              <CldUploadWidget
                uploadPreset="18games_preset"
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <Button onClick={() => open()} width="full">
                    Upload Imagem
                  </Button>
                )}
              </CldUploadWidget>
            )}

            <Box width="full">
              <Text mb={2} fontWeight="bold">Tags (selecione pelo menos uma):</Text>
              <Wrap spacing={2}>
                {gameTags.map(tag => (
                  <WrapItem key={tag.id}>
                    <Tag 
                      size="md" 
                      variant={selectedTags.includes(tag.id) ? "solid" : "outline"}
                      colorScheme={tag.color}
                      cursor="pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      <TagLabel>{tag.label}</TagLabel>
                      {selectedTags.includes(tag.id) && (
                        <TagCloseButton onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(tag.id);
                        }} />
                      )}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Button
              colorScheme="blue"
              onClick={handleCreatePost}
              isDisabled={!title || !imageUrl || selectedTags.length === 0}
              width="full"
            >
              Criar Post
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
