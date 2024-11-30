'use client';

import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Spinner,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useUserContext } from '@/contexts/UserContext';

export default function Navbar() {
  const router = useRouter();
  const { user, profile, loading } = useUserContext();

  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Box bg="gray.900" px={4} borderBottom="1px" borderColor="whiteAlpha.200">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="7xl" mx="auto">
        <Flex alignItems="center" gap={8}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Text 
              fontSize="2xl" 
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
              _hover={{ 
                bgGradient: "linear(to-r, brand.400, purple.400)",
              }}
            >
              18Games
            </Text>
          </Link>

          <Flex gap={6}>
            <Link href="/jogos" style={{ textDecoration: 'none' }}>
              <Text
                color="white"
                position="relative"
                _hover={{
                  '&::after': {
                    width: '100%',
                  }
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: '0',
                  width: '0%',
                  height: '2px',
                  bgGradient: "linear(to-r, brand.500, purple.500)",
                  transition: 'width 0.2s ease-in-out'
                }}
              >
                Jogos
              </Text>
            </Link>
            <Link href="/ferramentas" style={{ textDecoration: 'none' }}>
              <Text
                color="white"
                position="relative"
                _hover={{
                  '&::after': {
                    width: '100%',
                  }
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: '0',
                  width: '0%',
                  height: '2px',
                  bgGradient: "linear(to-r, brand.500, purple.500)",
                  transition: 'width 0.2s ease-in-out'
                }}
              >
                Ferramentas
              </Text>
            </Link>
            <Link href="/equipe" style={{ textDecoration: 'none' }}>
              <Text
                color="white"
                position="relative"
                _hover={{
                  '&::after': {
                    width: '100%',
                  }
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: '0',
                  width: '0%',
                  height: '2px',
                  bgGradient: "linear(to-r, brand.500, purple.500)",
                  transition: 'width 0.2s ease-in-out'
                }}
              >
                Equipe
              </Text>
            </Link>
            <Link href="/apoie" style={{ textDecoration: 'none' }}>
              <Text
                color="white"
                position="relative"
                _hover={{
                  '&::after': {
                    width: '100%',
                  }
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: '0',
                  width: '0%',
                  height: '2px',
                  bgGradient: "linear(to-r, brand.500, purple.500)",
                  transition: 'width 0.2s ease-in-out'
                }}
              >
                Apoie
              </Text>
            </Link>
            {isAdmin && (
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <Text
                  color="white"
                  position="relative"
                  _hover={{
                    '&::after': {
                      width: '100%',
                    }
                  }}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: '0',
                    width: '0%',
                    height: '2px',
                    bgGradient: "linear(to-r, brand.500, purple.500)",
                    transition: 'width 0.2s ease-in-out'
                  }}
                >
                  Admin
                </Text>
              </Link>
            )}
          </Flex>
        </Flex>

        <Flex alignItems="center">
          {loading ? (
            <Spinner size="sm" color="white" />
          ) : user && profile ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  name={profile.displayName || user.email?.charAt(0)}
                  src={profile.photoURL || undefined}
                />
              </MenuButton>
              <MenuList>
                <Link href={`/profile/${profile.uid}`} style={{ textDecoration: 'none' }}>
                  <MenuItem as="div">Meu Perfil</MenuItem>
                </Link>
                <Link href="/editar-conta" style={{ textDecoration: 'none' }}>
                  <MenuItem as="div">Configurações</MenuItem>
                </Link>
                {isAdmin && (
                  <Link href="/admin" style={{ textDecoration: 'none' }}>
                    <MenuItem as="div">Admin</MenuItem>
                  </Link>
                )}
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Flex gap={4}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button
                  as="div"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button
                  as="div"
                  colorScheme="brand"
                  _hover={{ bg: 'brand.600' }}
                >
                  Cadastrar
                </Button>
              </Link>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
