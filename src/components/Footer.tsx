'use client';

import {
  Box,
  Container,
  Stack,
  Text,
  useColorModeValue,
  Image,
  Link,
  HStack,
} from '@chakra-ui/react';

export function Footer() {
  return (
    <Box
      as="footer"
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      py={4}
    >
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <HStack spacing={3}>
          <Image
            src="/logo.png"
            alt="18Games Logo"
            height="30px"
            width="auto"
          />
          <Text>© 2024 18Games. Todos os direitos reservados</Text>
        </HStack>
        <Stack direction={'row'} spacing={6}>
          <Link href={'/'}>Início</Link>
          <Link href={'/jogos'}>Jogos</Link>
          <Link href={'/sobre'}>Sobre</Link>
          <Link href={'/contato'}>Contato</Link>
        </Stack>
      </Container>
    </Box>
  );
}
