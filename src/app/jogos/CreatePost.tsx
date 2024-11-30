'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Box,
  Image,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Flex,
  IconButton,
  Select,
  Tooltip,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react';
import { ChevronDownIcon, CloseIcon, DeleteIcon, AddIcon, InfoIcon } from '@chakra-ui/icons';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { gameTags, tagCategories, downloadSites } from '@/constants/gameTags';
import { useUserContext } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { cloudinaryConfig } from '@/config/cloudinary';
import { logger } from '@/utils/logger';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

const getDownloadUrl = (url: string): string => {
  if (!url) return '';
  return url.trim();
};

const downloadSites = [
  { id: 'mega', label: 'MEGA', domain: 'mega.nz' },
  { id: 'mediafire', label: 'MediaFire', domain: 'mediafire.com' },
  { id: 'gdrive', label: 'Google Drive', domain: 'drive.google.com' },
  { id: 'pixeldrain', label: 'PixelDrain', domain: 'pixeldrain.com' }
];

const validateDownloadUrl = (url: string, site: string): boolean => {
  const selectedSite = downloadSites.find(s => s.id === site);
  if (!selectedSite) return false;

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.includes(selectedSite.domain);
  } catch {
    return false;
  }
};

const CreatePost = ({ isOpen, onClose }: CreatePostProps) => {
  const [user] = useAuthState(auth);
  const { user: firebaseUser, profile } = useUserContext();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [downloadLink, setDownloadLink] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [downloadSite, setDownloadSite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const toast = useToast();

  const [showMainImageWidget, setShowMainImageWidget] = useState(false);
  const [showGalleryWidget, setShowGalleryWidget] = useState(false);

  const [mainWidgetReady, setMainWidgetReady] = useState(false);
  const [galleryWidgetReady, setGalleryWidgetReady] = useState(false);
  const mainWidgetRef = useRef<any>(null);
  const galleryWidgetRef = useRef<any>(null);

  const openMainWidget = useCallback(() => {
    if (mainWidgetRef.current?.open) {
      mainWidgetRef.current.open();
    }
  }, []);

  const openGalleryWidget = useCallback(() => {
    if (galleryWidgetRef.current?.open) {
      galleryWidgetRef.current.open();
    }
  }, []);

  useEffect(() => {
    if (mainWidgetReady && mainWidgetRef.current?.open) {
      mainWidgetRef.current.open();
      setMainWidgetReady(false);
    }
  }, [mainWidgetReady]);

  useEffect(() => {
    if (galleryWidgetReady && galleryWidgetRef.current?.open) {
      galleryWidgetRef.current.open();
      setGalleryWidgetReady(false);
    }
  }, [galleryWidgetReady]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = 'Título é obrigatório';
    }
    if (!description.trim()) {
      errors.description = 'Descrição é obrigatória';
    }
    if (!mainImage) {
      errors.mainImage = 'Imagem principal é obrigatória';
    }
    if (!downloadLink.trim()) {
      errors.downloadLink = 'Link de download é obrigatório';
    }
    if (!downloadSite) {
      errors.downloadSite = 'Site de download é obrigatório';
    }
    if (selectedTags.length === 0) {
      errors.tags = 'Selecione pelo menos uma tag';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Iniciando submissão do formulário', { title, description, mainImage });

    try {
      setIsSubmitting(true);
      setFormErrors({});

      // Verificar se o usuário está autenticado
      if (!user || !user.uid) {
        throw new Error('Usuário não está autenticado');
      }

      // Validação
      const errors: { [key: string]: string } = {};
      if (!title.trim()) {
        errors.title = 'Título é obrigatório';
      }
      if (!description.trim()) {
        errors.description = 'Descrição é obrigatória';
      }
      if (!mainImage) {
        errors.mainImage = 'Imagem principal é obrigatória';
      }
      if (!downloadSite) {
        errors.downloadSite = 'Site de download é obrigatório';
      }
      if (!downloadLink) {
        errors.downloadLink = 'Link de download é obrigatório';
      } else if (!validateDownloadUrl(downloadLink, downloadSite)) {
        errors.downloadLink = `O link deve ser do domínio ${downloadSites.find(s => s.id === downloadSite)?.domain}`;
      }

      if (Object.keys(errors).length > 0) {
        logger.warn('Erros de validação encontrados', errors);
        setFormErrors(errors);
        return;
      }

      // Criar post
      const postData = {
        title: title.trim(),
        description: description.trim(),
        mainImage,
        galleryImages,
        tags: selectedTags,
        createdAt: serverTimestamp(),
        userId: user.uid,
        username: user.displayName || 'Anônimo',
        status: 'active',
        downloadSite,
        downloadUrl: downloadLink,
        ratings: []
      };

      logger.info('Dados do post preparados', postData);

      // Referência para a coleção posts
      const postsRef = collection(db, 'posts');
      
      // Tentar criar o post
      const docRef = await addDoc(postsRef, postData);
      logger.info('Post criado com sucesso', { postId: docRef.id });

      // Atualizar o postCount do usuário e inicializar campos de avaliação se necessário
      const userRef = doc(db, 'users', user?.uid || '');
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const updateData: any = {
        postCount: increment(1)
      };

      // Inicializar ratingCount se não existir
      if (!userData?.ratingCount) {
        updateData.ratingCount = 0;
      }

      await updateDoc(userRef, updateData);
      logger.info('Dados do usuário atualizados');

      // Mostrar mensagem de sucesso
      toast({
        title: 'Post criado com sucesso!',
        description: 'Seu post foi publicado.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Fechar o modal e resetar o form
      setTimeout(() => {
        onClose();
        setTitle('');
        setDescription('');
        setMainImage('');
        setGalleryImages([]);
        setSelectedTags([]);
        setDownloadSite('');
        setDownloadLink('');
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      logger.error('Erro ao criar post', error);
      
      // Mensagens de erro específicas
      let errorMessage = 'Erro ao criar post. Tente novamente.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para criar posts. Por favor, faça login novamente.';
      } else if (error.message === 'Usuário não está autenticado') {
        errorMessage = 'Você precisa estar logado para criar um post.';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      setFormErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <style jsx global>{`
        .cloudinary-overlay {
          margin: 0 !important;
          padding: 0 !important;
        }
        .cloudinary-widget {
          margin: 0 !important;
          padding: 0 !important;
        }
        #upload-widget-main, #upload-widget-gallery {
          margin: 0 !important;
          padding: 0 !important;
        }
        .cloudinary-button {
          margin: 0 !important;
          padding: 8px !important;
        }
      `}</style>
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text color="white">Criar Novo Post</Text>
            <Button
              variant="link"
              color="blue.300"
              fontSize="sm"
              display="flex"
              alignItems="center"
              onClick={() => router.push('/regras')}
              _hover={{ color: "blue.400", textDecoration: "underline" }}
              leftIcon={<InfoIcon />}
            >
              Regras de Postagem
            </Button>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={2} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired isInvalid={!!formErrors.title}>
              <FormLabel color="white" mb={1}>Título</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do jogo"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
              {formErrors.title && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.title}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.description}>
              <FormLabel color="white" mb={1}>Descrição</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição do jogo"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                size="sm"
                resize="vertical"
                minH="100px"
              />
              {formErrors.description && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.description}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.mainImage}>
              <FormLabel color="white" mb={1}>Imagem Principal</FormLabel>
              <Box>
                {showMainImageWidget && (
                  <Box id="upload-widget-main">
                    <CldUploadWidget
                      ref={mainWidgetRef}
                      uploadPreset={cloudinaryConfig.uploadPreset}
                      options={{
                        multiple: false,
                        maxFiles: 1,
                        clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                        maxFileSize: 10485760,
                        resourceType: "auto",
                        folder: "18games",
                        tags: ["game"],
                        sources: ["local", "url"],
                        secure: true
                      }}
                      onUpload={(result: any) => {
                        logger.debug('Upload callback acionado', { result });
                      }}
                      onSuccess={(result: any) => {
                        logger.info('Upload concluído com sucesso', { result });
                        if (result.info) {
                          const imageUrl = result.info.secure_url;
                          logger.debug('URL da imagem', { imageUrl });
                          setMainImage(imageUrl);
                          setFormErrors(prev => ({ ...prev, mainImage: '' }));
                          setShowMainImageWidget(false);
                        }
                      }}
                      onError={(error: any) => {
                        logger.error('Erro no upload', { error });
                        toast({
                          title: 'Erro no upload',
                          description: 'Houve um problema ao fazer o upload da imagem. Por favor, tente novamente.',
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      }}
                      onClose={() => setShowMainImageWidget(false)}
                    >
                      {({ open }) => {
                        mainWidgetRef.current = { open };
                        return (
                          <Button 
                            onClick={() => {
                              setMainWidgetReady(true);
                              setTimeout(() => {
                                if (mainWidgetRef.current?.open) {
                                  mainWidgetRef.current.open();
                                }
                              }, 100);
                            }}
                            colorScheme="blue" 
                            w="full"
                            isDisabled={!user}
                            mb={2}
                          >
                            Upload Imagem Principal
                          </Button>
                        );
                      }}
                    </CldUploadWidget>
                  </Box>
                )}
                {!showMainImageWidget && (
                  <Button 
                    onClick={() => setShowMainImageWidget(true)} 
                    colorScheme="blue" 
                    w="full"
                    isDisabled={!user}
                    mb={2}
                  >
                    Upload Imagem Principal
                  </Button>
                )}
                {mainImage && (
                  <Box mt={2}>
                    <Image 
                      src={mainImage} 
                      alt="Main" 
                      maxH="200px" 
                      w="full"
                      objectFit="cover"
                      onError={() => {
                        logger.error('Erro ao carregar imagem', { src: mainImage });
                      }}
                    />
                  </Box>
                )}
                {formErrors.mainImage && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.mainImage}
                  </Text>
                )}
              </Box>
            </FormControl>

            <FormControl id="galleryImages">
              <FormLabel color="white" mb={1}>Galeria de Imagens</FormLabel>
              <Box>
                {showGalleryWidget && (
                  <Box id="upload-widget-gallery">
                    <CldUploadWidget
                      ref={galleryWidgetRef}
                      uploadPreset={cloudinaryConfig.uploadPreset}
                      options={{
                        multiple: true,
                        maxFiles: 5,
                        clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                        maxFileSize: 10485760,
                        resourceType: "auto",
                        folder: "18games",
                        tags: ["game"],
                        sources: ["local", "url"],
                        secure: true
                      }}
                      onUpload={(result: any) => {
                        logger.debug('Upload da galeria acionado', { result });
                      }}
                      onSuccess={(result: any) => {
                        logger.info('Upload da galeria concluído com sucesso', { result });
                        if (result.info) {
                          const images = Array.isArray(result.info) ? result.info : [result.info];
                          const imageUrls = images.map((info: any) => info.secure_url);
                          logger.debug('URLs das imagens da galeria', { imageUrls });
                          setGalleryImages(prev => [...prev, ...imageUrls]);
                          setShowGalleryWidget(false);
                        }
                      }}
                      onError={(error: any) => {
                        logger.error('Erro no upload da galeria', { error });
                        toast({
                          title: 'Erro no upload',
                          description: 'Houve um problema ao fazer o upload da imagem. Por favor, tente novamente.',
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      }}
                      onClose={() => setShowGalleryWidget(false)}
                    >
                      {({ open }) => {
                        galleryWidgetRef.current = { open };
                        return (
                          <Button
                            onClick={() => {
                              setGalleryWidgetReady(true);
                              setTimeout(() => {
                                if (galleryWidgetRef.current?.open) {
                                  galleryWidgetRef.current.open();
                                }
                              }, 100);
                            }}
                            colorScheme="pink"
                            size="lg"
                            width="full"
                            mb={2}
                            isDisabled={!user}
                          >
                            Upload de Imagens
                          </Button>
                        );
                      }}
                    </CldUploadWidget>
                  </Box>
                )}
                {!showGalleryWidget && (
                  <Button
                    onClick={() => setShowGalleryWidget(true)}
                    colorScheme="pink"
                    size="lg"
                    width="full"
                    mb={2}
                    isDisabled={!user}
                  >
                    Upload de Imagens
                  </Button>
                )}
                <Wrap spacing={4} mt={2}>
                  {galleryImages.map((image, index) => (
                    <Box key={index} position="relative">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        size="sm"
                        colorScheme="pink"
                        aria-label="Remove image"
                        position="absolute"
                        top={-2}
                        right={-2}
                        borderRadius="full"
                        onClick={() => {
                          const newImages = galleryImages.filter((_, i) => i !== index);
                          setGalleryImages(newImages);
                        }}
                      />
                    </Box>
                  ))}
                </Wrap>
              </Box>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.tags}>
              <FormLabel color="white" mb={1}>Tags</FormLabel>
              <Box>
                {tagCategories.map((category) => {
                  // Filtra as tags únicas para esta categoria
                  const uniqueTags = new Set(category.tags);
                  const categoryTags = Array.from(uniqueTags).map(tagId => 
                    gameTags.find(tag => tag.id === tagId)
                  ).filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);
                  
                  return (
                    <Box key={category.id} mb={2}>
                      <Text color="white" fontWeight="bold" mb={1}>
                        {category.label}
                      </Text>
                      <Wrap spacing={2}>
                        {categoryTags.map(tag => (
                          <Tag
                            key={`${category.id}-${tag.id}`}
                            size="md"
                            variant={selectedTags.includes(tag.id) ? 'solid' : 'outline'}
                            colorScheme={tag.color}
                            cursor="pointer"
                            onClick={() => {
                              if (selectedTags.includes(tag.id)) {
                                setSelectedTags(selectedTags.filter(t => t !== tag.id));
                              } else {
                                setSelectedTags([...selectedTags, tag.id]);
                              }
                              setFormErrors(prev => ({ ...prev, tags: '' }));
                            }}
                          >
                            <TagLabel>{tag.label}</TagLabel>
                          </Tag>
                        ))}
                      </Wrap>
                    </Box>
                  );
                })}
                {formErrors.tags && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.tags}
                  </Text>
                )}
              </Box>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.downloadSite}>
              <FormLabel color="white" mb={1}>Site de Download</FormLabel>
              <Select
                value={downloadSite}
                onChange={(e) => setDownloadSite(e.target.value)}
                placeholder="Selecione o site"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              >
                {downloadSites.map((site) => (
                  <option key={site.id} value={site.id} style={{ backgroundColor: '#2D3748' }}>
                    {site.label}
                  </option>
                ))}
              </Select>
              {formErrors.downloadSite && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.downloadSite}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.downloadLink}>
              <FormLabel color="white" mb={1}>URL de Download</FormLabel>
              <Input
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                placeholder="Digite a URL de download"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
              {formErrors.downloadLink && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.downloadLink}
                </Text>
              )}
            </FormControl>

            <Button type="submit" colorScheme="blue" w="full" isLoading={isSubmitting}>
              Criar Post
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default CreatePost;
