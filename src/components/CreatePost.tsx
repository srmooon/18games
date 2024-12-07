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
  Select,
  Textarea,
  Divider,
  Text,
  Box,
} from '@chakra-ui/react';
import { CldUploadWidget } from 'next-cloudinary';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useUserContext } from '@/contexts/UserContext';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [downloadSite, setDownloadSite] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  
  // Novos campos opcionais
  const [translationSite, setTranslationSite] = useState('');
  const [translationUrl, setTranslationUrl] = useState('');
  const [dlcSite, setDlcSite] = useState('');
  const [dlcUrl, setDlcUrl] = useState('');
  const [patchSite, setPatchSite] = useState('');
  const [patchUrl, setPatchUrl] = useState('');
  
  const { profile: currentUser } = useUserContext();
  const toast = useToast();

  const validateUrl = (url: string, site: string): boolean => {
    if (!url) return true; // URLs vazias são permitidas para campos opcionais
    const selectedSite = downloadSites.find(s => s.id === site);
    if (!selectedSite) return true;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      // Aceita tanto o domínio original quanto stfly.biz
      return urlObj.hostname.includes(selectedSite.domain) || urlObj.hostname.includes('stfly.biz');
    } catch {
      return false;
    }
  };

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

    if (!title || !imageUrl || !downloadSite || !downloadUrl) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validar URLs
    const urlValidations = [
      { url: downloadUrl, site: downloadSite, name: 'Download' },
      { url: translationUrl, site: translationSite, name: 'Tradução' },
      { url: dlcUrl, site: dlcSite, name: 'DLC' },
      { url: patchUrl, site: patchSite, name: 'Patch' }
    ];

    for (const validation of urlValidations) {
      if (validation.url && !validateUrl(validation.url, validation.site)) {
        toast({
          title: 'URL Inválida',
          description: `A URL de ${validation.name} não corresponde ao site selecionado`,
          status: 'error',
          duration: 3000,
        });
        return;
      }
    }

    try {
      // Criar o post
      const postData = {
        userId: currentUser.uid,
        title,
        description,
        mainImage: imageUrl,
        createdAt: Date.now(),
        createdBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        },
        // Download principal (obrigatório)
        downloadSite,
        downloadUrl,
        // Downloads opcionais
        ...(translationSite && translationUrl && {
          translationSite,
          translationUrl
        }),
        ...(dlcSite && dlcUrl && {
          dlcSite,
          dlcUrl
        }),
        ...(patchSite && patchUrl && {
          patchSite,
          patchUrl
        }),
        // Inicializar arrays vazios
        ratings: [],
        tags: [],
        galleryImages: []
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

      // Limpar todos os campos
      setTitle('');
      setDescription('');
      setImageUrl('');
      setDownloadSite('');
      setDownloadUrl('');
      setTranslationSite('');
      setTranslationUrl('');
      setDlcSite('');
      setDlcUrl('');
      setPatchSite('');
      setPatchUrl('');
      
      onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Novo Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Título do post</FormLabel>
                <Input
                  placeholder="Título do post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  placeholder="Descrição do post"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minH="150px"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Imagem Principal</FormLabel>
                {imageUrl ? (
                  <Box position="relative">
                    <Image src={imageUrl} alt="Preview" maxH="200px" objectFit="cover" />
                    <Button
                      position="absolute"
                      top={2}
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
                      <Button onClick={() => open()}>
                        Upload Imagem
                      </Button>
                    )}
                  </CldUploadWidget>
                )}
              </FormControl>

              {/* Download Principal (Obrigatório) */}
              <Box>
                <Text fontWeight="bold" mb={2}>Download Principal *</Text>
                <FormControl isRequired mb={3}>
                  <FormLabel>Site</FormLabel>
                  <Select
                    value={downloadSite}
                    onChange={(e) => setDownloadSite(e.target.value)}
                    placeholder="Selecione o site"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>URL</FormLabel>
                  <Input
                    placeholder="URL do download"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                  />
                </FormControl>
              </Box>

              <Divider my={4} />

              {/* Download da Tradução (Opcional) */}
              <Box>
                <Text fontWeight="bold" mb={2}>Download da Tradução (Opcional)</Text>
                <FormControl mb={3}>
                  <FormLabel>Site</FormLabel>
                  <Select
                    value={translationSite}
                    onChange={(e) => setTranslationSite(e.target.value)}
                    placeholder="Selecione o site"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>URL</FormLabel>
                  <Input
                    placeholder="URL do download da tradução"
                    value={translationUrl}
                    onChange={(e) => setTranslationUrl(e.target.value)}
                  />
                </FormControl>
              </Box>

              <Divider my={4} />

              {/* Download da DLC (Opcional) */}
              <Box>
                <Text fontWeight="bold" mb={2}>Download da DLC (Opcional)</Text>
                <FormControl mb={3}>
                  <FormLabel>Site</FormLabel>
                  <Select
                    value={dlcSite}
                    onChange={(e) => setDlcSite(e.target.value)}
                    placeholder="Selecione o site"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>URL</FormLabel>
                  <Input
                    placeholder="URL do download da DLC"
                    value={dlcUrl}
                    onChange={(e) => setDlcUrl(e.target.value)}
                  />
                </FormControl>
              </Box>

              <Divider my={4} />

              {/* Download do Patch (Opcional) */}
              <Box>
                <Text fontWeight="bold" mb={2}>Download do Patch (Opcional)</Text>
                <FormControl mb={3}>
                  <FormLabel>Site</FormLabel>
                  <Select
                    value={patchSite}
                    onChange={(e) => setPatchSite(e.target.value)}
                    placeholder="Selecione o site"
                  >
                    {downloadSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>URL</FormLabel>
                  <Input
                    placeholder="URL do download do patch"
                    value={patchUrl}
                    onChange={(e) => setPatchUrl(e.target.value)}
                  />
                </FormControl>
              </Box>

              <Button
                colorScheme="blue"
                type="submit"
                isDisabled={!title || !imageUrl || !downloadSite || !downloadUrl || currentUser?.role === 'membro'}
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
