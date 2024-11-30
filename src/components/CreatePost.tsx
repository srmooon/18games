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
  Form,
  FormControl,
  FormLabel,
  Tooltip,
} from '@chakra-ui/react';
import { CldUploadWidget } from 'next-cloudinary';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useUserContext } from '@/contexts/UserContext';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { profile: currentUser } = useUserContext();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar um post.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (currentUser.role === 'membro') {
      toast({
        title: 'Acesso Restrito',
        description: 'Apenas membros+ ou superior podem criar posts. Continue usando a plataforma para se tornar membro+!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!title || !imageUrl) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
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
        createdAt: Date.now(),
        createdBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Novo Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Título do post</FormLabel>
                <Input
                  placeholder="Título do post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
              
              {imageUrl ? (
                <Image src={imageUrl} alt="Preview" maxH="200px" objectFit="cover" />
              ) : (
                <CldUploadWidget
                  uploadPreset="18games_preset"
                  onSuccess={handleUploadSuccess}
                >
                  {({ open }) => (
                    <Button onClick={() => open()}>
                      Upload Imagem
                    </Button>
                  )}
                </CldUploadWidget>
              )}

              <Button
                colorScheme="blue"
                type="submit"
                isDisabled={!title || !imageUrl || currentUser?.role === 'membro'}
              >
                {currentUser?.role === 'membro' ? (
                  <Tooltip 
                    label="Você poderá criar posts após 3 dias de conta. Continue usando a plataforma!" 
                    placement="top"
                  >
                    <span>Criar Post</span>
                  </Tooltip>
                ) : (
                  "Criar Post"
                )}
              </Button>
            </VStack>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
