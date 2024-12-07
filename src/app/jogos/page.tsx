'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Box, Container, Heading, Text, VStack, Button, Flex, Menu, MenuButton, MenuList, MenuItem, SimpleGrid, useDisclosure, Tooltip, Spinner } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import CreatePost from './CreatePost';
import GameCard from '@/components/GameCard';
import { useGames } from '@/hooks/useGames';
import { useUserContext } from '@/contexts/UserContext';
import { gameTags, tagCategories } from '@/constants/gameTags';

function JogosContent() {
  const { user } = useAuth();
  const { profile } = useUserContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { games, loading, error } = useGames();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box minH="100vh" py={20} px={4} bg="gray.900">
        <Container maxW="container.xl">
          <VStack spacing={8} align="center">
            <Spinner size="xl" color="brand.500" />
          </VStack>
        </Container>
      </Box>
    );
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const filteredGames = selectedTags.length > 0
    ? games.filter(game => 
        game.tags?.some(tag => selectedTags.includes(tag))
      )
    : games;

  const canCreatePost = profile?.role && profile.role !== 'membro';

  if (loading) {
    return (
      <Box minH="100vh" py={20} px={4} bg="gray.900">
        <Container maxW="container.xl">
          <VStack spacing={8} align="center">
            <Spinner size="xl" color="brand.500" />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" py={20} px={4} bg="gray.900">
        <Container maxW="container.xl">
          <VStack spacing={8} align="center">
            <Heading
              as="h1"
              size="xl"
              textAlign="center"
              color="red.500"
            >
              Erro ao carregar jogos
            </Heading>
            <Text color="white">{error}</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" py={20} px={4} bg="gray.900">
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
            mb={8}
            lineHeight="1.4"
          >
            Jogos
          </Heading>
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Tooltip 
              label={!canCreatePost ? "Apenas membros+ ou superiores podem criar posts" : ""}
              isDisabled={canCreatePost}
            >
              <Button 
                colorScheme="blue" 
                onClick={canCreatePost ? onOpen : undefined}
                opacity={canCreatePost ? 1 : 0.6}
                cursor={canCreatePost ? "pointer" : "not-allowed"}
              >
                Criar Post
              </Button>
            </Tooltip>
          </Flex>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por tags:</Text>
            <Flex gap={2} flexWrap="wrap">
              {tagCategories.map((category) => (
                <Menu key={category.id}>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
                    {category.label}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto">
                    {category.tags.map(tagId => {
                      const tag = gameTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <MenuItem 
                          key={tag.id}
                          onClick={() => handleTagSelect(tag.id)}
                          bg={selectedTags.includes(tag.id) ? `${tag.color}.100` : undefined}
                        >
                          {tag.label}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              ))}
            </Flex>
          </Box>

          {selectedTags.length > 0 && (
            <Flex gap={2} mb={4} flexWrap="wrap">
              {selectedTags.map(tagId => {
                const tag = gameTags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <Button
                    key={tag.id}
                    size="sm"
                    colorScheme={tag.color}
                    onClick={() => handleTagSelect(tag.id)}
                    rightIcon={<ChevronDownIcon />}
                  >
                    {tag.label}
                  </Button>
                );
              })}
              <Button size="sm" variant="ghost" onClick={() => setSelectedTags([])}>
                Limpar filtros
              </Button>
            </Flex>
          )}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mt={6}>
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </SimpleGrid>

          <CreatePost isOpen={isOpen} onClose={onClose} />
        </VStack>
      </Container>
    </Box>
  );
}

export default function JogosPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" py={20} px={4} bg="gray.900">
        <Container maxW="container.xl">
          <VStack spacing={8} align="center">
            <Spinner size="xl" color="brand.500" />
          </VStack>
        </Container>
      </Box>
    }>
      <JogosContent />
    </Suspense>
  );
}
