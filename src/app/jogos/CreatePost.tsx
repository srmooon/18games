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
  TagCloseButton,
  Grid
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
  editPost?: {
    id: string;
    title: string;
    description: string;
    mainImage: string;
    galleryImages: string[];
    downloadSite: string;
    downloadUrl: string;
    tags: string[];
    translationSite?: string;
    translationUrl?: string;
    dlcSite?: string;
    dlcUrl?: string;
    patchSite?: string;
    patchUrl?: string;
  };
}

const getDownloadUrl = (url: string): string => {
  if (!url) return '';
  return url.trim();
};

const downloadSites = [
  { id: 'mega', label: 'MEGA', domain: 'mega.nz' },
  { id: 'mediafire', label: 'MediaFire', domain: 'mediafire.com' },
  { id: 'gdrive', label: 'Google Drive', domain: 'drive.google.com' },
  { id: 'pixeldrain', label: 'PixelDrain', domain: 'pixeldrain.com' },
  { id: 'f95zone', label: 'F95zone', domain: 'f95zone.to' }
];

const validateDownloadUrl = (url: string, site: string): boolean => {
  const selectedSite = downloadSites.find(s => s.id === site);
  if (!selectedSite) return false;

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Aceita tanto o domínio original quanto stfly.biz
    return urlObj.hostname.includes(selectedSite.domain) || urlObj.hostname.includes('stfly.biz');
  } catch {
    return false;
  }
};

const CreatePost = ({ isOpen, onClose, editPost }: CreatePostProps) => {
  const [user] = useAuthState(auth);
  const { user: firebaseUser, profile } = useUserContext();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [downloadSite, setDownloadSite] = useState('');
  
  // Estados para downloads opcionais
  const [translationSite, setTranslationSite] = useState('');
  const [translationUrl, setTranslationUrl] = useState('');
  const [dlcSite, setDlcSite] = useState('');
  const [dlcUrl, setDlcUrl] = useState('');
  const [patchSite, setPatchSite] = useState('');
  const [patchUrl, setPatchUrl] = useState('');

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

  // Carregar dados do post para edição
  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title);
      setDescription(editPost.description);
      setMainImage(editPost.mainImage);
      setGalleryImages(editPost.galleryImages);
      setDownloadSite(editPost.downloadSite);
      setDownloadUrl(editPost.downloadUrl);
      setSelectedTags(editPost.tags);
      
      if (editPost.translationSite) setTranslationSite(editPost.translationSite);
      if (editPost.translationUrl) setTranslationUrl(editPost.translationUrl);
      if (editPost.dlcSite) setDlcSite(editPost.dlcSite);
      if (editPost.dlcUrl) setDlcUrl(editPost.dlcUrl);
      if (editPost.patchSite) setPatchSite(editPost.patchSite);
      if (editPost.patchUrl) setPatchUrl(editPost.patchUrl);
    }
  }, [editPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    // Validações básicas
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = "Título é obrigatório";
    if (!description.trim()) errors.description = "Descrição é obrigatória";
    if (!mainImage) errors.mainImage = "Imagem principal é obrigatória";
    if (!downloadSite) errors.downloadSite = "Site de download é obrigatório";
    if (!downloadUrl) errors.downloadUrl = "Link de download é obrigatório";
    if (selectedTags.length === 0) errors.tags = "Selecione pelo menos uma tag";
    if (selectedTags.length > 10) errors.tags = "Selecione no máximo 10 tags";
    
    // Validar URL principal
    if (downloadUrl && !validateDownloadUrl(downloadUrl, downloadSite)) {
      errors.downloadUrl = `O link deve ser do domínio ${downloadSites.find(s => s.id === downloadSite)?.domain}`;
    }

    // Validar URLs opcionais apenas se estiverem preenchidos
    if (translationUrl) {
      if (!translationSite) {
        errors.translationUrl = "Selecione um site para o download da tradução";
      } else if (!validateDownloadUrl(translationUrl, translationSite)) {
        errors.translationUrl = `O link deve ser do domínio ${downloadSites.find(s => s.id === translationSite)?.domain}`;
      }
    }

    if (dlcUrl) {
      if (!dlcSite) {
        errors.dlcUrl = "Selecione um site para o download do DLC";
      } else if (!validateDownloadUrl(dlcUrl, dlcSite)) {
        errors.dlcUrl = `O link deve ser do domínio ${downloadSites.find(s => s.id === dlcSite)?.domain}`;
      }
    }

    if (patchUrl) {
      if (!patchSite) {
        errors.patchUrl = "Selecione um site para o download do patch";
      } else if (!validateDownloadUrl(patchUrl, patchSite)) {
        errors.patchUrl = `O link deve ser do domínio ${downloadSites.find(s => s.id === patchSite)?.domain}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        description: description.trim(),
        mainImage,
        galleryImages,
        downloadSite,
        downloadUrl,
        tags: selectedTags,
        userId: user.uid,
        username: user.displayName || 'Anônimo',
        status: 'active',
      };

      // Adicionar campos opcionais apenas se ambos site e URL estiverem preenchidos
      if (translationSite && translationUrl) {
        Object.assign(postData, {
          translationSite,
          translationUrl
        });
      }

      if (dlcSite && dlcUrl) {
        Object.assign(postData, {
          dlcSite,
          dlcUrl
        });
      }

      if (patchSite && patchUrl) {
        Object.assign(postData, {
          patchSite,
          patchUrl
        });
      }

      if (editPost) {
        // Atualizar post existente
        await updateDoc(doc(db, "posts", editPost.id), {
          ...postData,
          updatedAt: serverTimestamp()
        });
        
        toast({
          title: "Sucesso!",
          description: "Post atualizado com sucesso!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Criar novo post
        const docRef = await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
          ratings: []
        });

        // Atualizar contagem de posts do usuário
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          postCount: increment(1)
        });
        
        toast({
          title: "Sucesso!",
          description: "Post criado com sucesso!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }

      // Limpar o formulário e fechar o modal
      resetForm();
      onClose();
      
      // Recarregar a página
      router.refresh();

    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o post. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMainImage("");
    setGalleryImages([]);
    setSelectedTags([]);
    setDownloadSite("");
    setDownloadUrl("");
    setTranslationSite("");
    setTranslationUrl("");
    setDlcSite("");
    setDlcUrl("");
    setPatchSite("");
    setPatchUrl("");
  };

  const handleUploadSuccess = (result: any) => {
    if (result?.info?.secure_url) {
      const imageUrl = result.info.secure_url;
      const isGif = imageUrl.toLowerCase().endsWith('.gif');

      if (isGif && (!user?.role || user.role !== 'vip+')) {
        toast({
          title: 'Erro',
          description: 'Apenas usuários VIP+ podem usar GIFs como capa',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setMainImage(imageUrl);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
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
      <ModalContent bg="gray.800" maxW="800px">
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
          <VStack spacing={4} width="100%" as="form" onSubmit={handleSubmit}>
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
                      onSuccess={handleUploadSuccess}
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
                        w="full"
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
                                setFormErrors(prev => ({ ...prev, tags: '' }));
                              } else {
                                if (selectedTags.length >= 10) {
                                  toast({
                                    title: 'Limite de tags',
                                    description: 'Você pode selecionar no máximo 10 tags',
                                    status: 'warning',
                                    duration: 3000,
                                  });
                                  return;
                                }
                                setSelectedTags([...selectedTags, tag.id]);
                                setFormErrors(prev => ({ ...prev, tags: '' }));
                              }
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

            <FormControl isRequired isInvalid={!!formErrors.downloadSite} width="100%">
              <FormLabel color="white" mb={1}>Site de Download</FormLabel>
              <Grid templateColumns="1fr 3fr" gap={4} width="100%">
                <Select
                  value={downloadSite}
                  onChange={(e) => setDownloadSite(e.target.value)}
                  placeholder="Site"
                  isInvalid={!!formErrors.downloadSite}
                  width="100%"
                >
                  {downloadSites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.label}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="Link de download"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  isInvalid={!!formErrors.downloadUrl}
                  width="100%"
                />
              </Grid>
              {formErrors.downloadSite && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.downloadSite}
                </Text>
              )}
              {formErrors.downloadUrl && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {formErrors.downloadUrl}
                </Text>
              )}
            </FormControl>

            <Box mt={4} width="100%">
              {/* Tradução */}
              <FormControl mb={4} isInvalid={!!formErrors.translationUrl} width="100%">
                <FormLabel color="white" mb={1}>Download de Tradução (Opcional)</FormLabel>
                <Grid templateColumns="1fr 3fr" gap={4} width="100%">
                  <Select
                    value={translationSite}
                    onChange={(e) => setTranslationSite(e.target.value)}
                    placeholder="Site (Tradução)"
                    width="100%"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Link da tradução (opcional)"
                    value={translationUrl}
                    onChange={(e) => setTranslationUrl(e.target.value)}
                    isInvalid={!!formErrors.translationUrl}
                    width="100%"
                  />
                </Grid>
                {formErrors.translationUrl && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.translationUrl}
                  </Text>
                )}
              </FormControl>

              {/* DLC */}
              <FormControl mb={4} isInvalid={!!formErrors.dlcUrl} width="100%">
                <FormLabel color="white" mb={1}>Download de DLC (Opcional)</FormLabel>
                <Grid templateColumns="1fr 3fr" gap={4} width="100%">
                  <Select
                    value={dlcSite}
                    onChange={(e) => setDlcSite(e.target.value)}
                    placeholder="Site (DLC)"
                    width="100%"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Link do DLC (opcional)"
                    value={dlcUrl}
                    onChange={(e) => setDlcUrl(e.target.value)}
                    isInvalid={!!formErrors.dlcUrl}
                    width="100%"
                  />
                </Grid>
                {formErrors.dlcUrl && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.dlcUrl}
                  </Text>
                )}
              </FormControl>

              {/* Patch */}
              <FormControl mb={4} isInvalid={!!formErrors.patchUrl} width="100%">
                <FormLabel color="white" mb={1}>Download de Patch (Opcional)</FormLabel>
                <Grid templateColumns="1fr 3fr" gap={4} width="100%">
                  <Select
                    value={patchSite}
                    onChange={(e) => setPatchSite(e.target.value)}
                    placeholder="Site (Patch)"
                    width="100%"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Link do patch (opcional)"
                    value={patchUrl}
                    onChange={(e) => setPatchUrl(e.target.value)}
                    isInvalid={!!formErrors.patchUrl}
                    width="100%"
                  />
                </Grid>
                {formErrors.patchUrl && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.patchUrl}
                  </Text>
                )}
              </FormControl>
            </Box>

            <Button type="submit" colorScheme="blue" w="full" isLoading={isSubmitting}>
              {editPost ? 'Atualizar Post' : 'Criar Post'}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default CreatePost;
