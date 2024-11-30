'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';

export default function RulesPage() {
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="white" mb={4}>
          Regras de Postagem
        </Heading>

        <Box bg="gray.800" p={6} borderRadius="lg" color="white">
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading as="h2" size="lg" mb={3} color="blue.300">
                Regras Gerais
              </Heading>
              <UnorderedList spacing={2}>
                <ListItem>Todos os posts devem estar relacionados a jogos.</ListItem>
                <ListItem>Não é permitido postar conteúdo ilegal ou prejudicial.</ListItem>
                <ListItem>Respeite os direitos autorais e as licenças dos jogos.</ListItem>
                <ListItem>Mantenha um ambiente respeitoso e profissional.</ListItem>
              </UnorderedList>
            </Box>

            <Divider my={4} />

            <Box>
              <Heading as="h2" size="lg" mb={3} color="blue.300">
                Regras de Postagem
              </Heading>
              <UnorderedList spacing={2}>
                <ListItem>Use títulos claros e descritivos.</ListItem>
                <ListItem>Adicione tags relevantes para facilitar a busca.</ListItem>
                <ListItem>Forneça uma descrição detalhada do jogo.</ListItem>
                <ListItem>Inclua screenshots ou imagens representativas.</ListItem>
                <ListItem>Verifique se os links de download estão funcionando.</ListItem>
              </UnorderedList>
            </Box>

            <Divider my={4} />

            <Box>
              <Heading as="h2" size="lg" mb={3} color="blue.300">
                Conteúdo Proibido
              </Heading>
              <UnorderedList spacing={2}>
                <ListItem>Conteúdo que viole direitos autorais.</ListItem>
                <ListItem>Links maliciosos ou vírus.</ListItem>
                <ListItem>Spam ou publicidade não relacionada.</ListItem>
                <ListItem>Conteúdo ofensivo ou discriminatório.</ListItem>
              </UnorderedList>
            </Box>

            <Divider my={4} />

            <Box>
              <Heading as="h2" size="lg" mb={3} color="blue.300">
                Dicas para um Bom Post
              </Heading>
              <UnorderedList spacing={2}>
                <ListItem>Use imagens de boa qualidade.</ListItem>
                <ListItem>Forneça informações sobre requisitos do sistema.</ListItem>
                <ListItem>Mencione a engine utilizada no desenvolvimento.</ListItem>
                <ListItem>Indique se há atualizações ou patches disponíveis.</ListItem>
                <ListItem>Responda aos comentários e dúvidas dos usuários.</ListItem>
              </UnorderedList>
            </Box>
          </VStack>
        </Box>

        <Box bg="gray.800" p={6} borderRadius="lg" color="white">
          <Heading as="h2" size="lg" mb={3} color="blue.300">
            Observações Importantes
          </Heading>
          <Text>
            O não cumprimento dessas regras pode resultar na remoção do post e possíveis sanções
            à conta do usuário. Em caso de dúvidas, entre em contato com a moderação.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
