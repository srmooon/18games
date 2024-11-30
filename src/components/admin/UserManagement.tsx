'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Avatar,
  Badge,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  useDisclosure,
  VStack,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Select,
  Flex,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FiMoreVertical,
  FiMail,
  FiLock,
  FiSlash,
  FiUserX,
  FiTrash2,
  FiUserCheck,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, functions } from '@/config/firebase';
import { 
  getAuth, 
  updateEmail, 
  updatePassword 
} from 'firebase/auth';
import { useUserContext } from '@/contexts/UserContext';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bannerURL?: string;
  role: string;
  status: 'active' | 'banned' | 'disabled';
  createdAt: any;
  canUseGif: boolean;
  canUseBanner: boolean;
}

const roleOptions = [
  { value: 'membro', label: 'Membro' },
  { value: 'membro+', label: 'Membro+' },
  { value: 'vip', label: 'VIP' },
  { value: 'vip+', label: 'VIP+' },
  { value: 'admin', label: 'Admin' },
];

const pulseKeyframes = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
`;

const animation = `${pulseKeyframes} 2s infinite`;

const getRoleBadgeProps = (role: string) => {
  const baseProps = {
    px: 3,
    py: 1,
    borderRadius: 'full',
    fontWeight: 'medium',
    fontSize: 'xs',
    textTransform: 'uppercase',
    letterSpacing: 'normal',
  };

  switch (role) {
    case 'vip+':
      return {
        ...baseProps,
        fontWeight: 'bold',
        fontSize: 'sm',
        letterSpacing: 'wider',
        bgGradient: 'linear(to-r, purple.400, brand.400)',
        color: 'white',
        boxShadow: 'lg',
        position: 'relative',
        _after: {
          content: '""',
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          borderRadius: 'full',
          bgGradient: 'linear(to-r, purple.400, brand.400)',
          opacity: 0.5,
          filter: 'blur(4px)',
          animation: animation,
        },
      };
    case 'vip':
      return {
        ...baseProps,
        fontWeight: 'semibold',
        bgGradient: 'linear(to-r, purple.400, brand.400)',
        color: 'white',
      };
    case 'admin':
      return {
        ...baseProps,
        bgGradient: 'linear(to-r, red.500, orange.500)',
        color: 'white',
      };
    default:
      return {
        ...baseProps,
        bgGradient: 'linear(to-r, blue.400, teal.400)',
        color: 'white',
      };
  }
};

const getRolePermissions = (role: string) => {
  switch (role) {
    case 'vip+':
      return { canUseGif: true, canUseBanner: true };
    case 'vip':
      return { canUseGif: true, canUseBanner: true, bannerGifDisabled: true };
    default:
      return { canUseGif: false, canUseBanner: false };
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAction, setSelectedAction] = useState<'email' | 'password' | 'ban' | 'disable' | 'delete' | 'role' | 'activate'>('email');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user: currentUser } = useUserContext();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(usersQuery, 
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          const role = data.role || 'membro';
          const permissions = getRolePermissions(role);
          
          return {
            uid: doc.id,
            ...data,
            status: data.status || 'active',
            canUseGif: permissions.canUseGif,
            canUseBanner: permissions.canUseBanner,
          } as User;
        });
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao observar usuários:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de usuários.',
          status: 'error',
          duration: 5000,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, toast]);

  const handleAction = async () => {
    if (!selectedUser) return;
    
    if (selectedUser.role === 'admin') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível modificar usuários administradores.',
        status: 'error',
        duration: 3000,
      });
      onClose();
      return;
    }

    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      const batch = writeBatch(db);

      switch (selectedAction) {
        case 'email':
          if (!newEmail) {
            throw new Error('Email não pode estar vazio');
          }
          await updateEmail(getAuth().currentUser!, newEmail);
          batch.update(userRef, { 
            email: newEmail,
            updatedAt: new Date()
          });
          break;

        case 'password':
          if (!newPassword || newPassword.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
          }
          await updatePassword(getAuth().currentUser!, newPassword);
          batch.update(userRef, { 
            updatedAt: new Date()
          });
          break;

        case 'ban':
          batch.update(userRef, { 
            status: 'banned',
            updatedAt: new Date()
          });
          break;

        case 'disable':
          batch.update(userRef, { 
            status: 'disabled',
            updatedAt: new Date()
          });
          break;

        case 'activate':
          batch.update(userRef, { 
            status: 'active',
            updatedAt: new Date()
          });
          break;

        case 'delete':
          try {
            // First, delete all posts by the user
            const postsQuery = query(
              collection(db, 'posts'),
              where('userId', '==', selectedUser.uid)
            );
            const postsSnapshot = await getDocs(postsQuery);
            
            // Add post deletions to batch
            postsSnapshot.docs.forEach(postDoc => {
              batch.delete(doc(db, 'posts', postDoc.id));
            });
            
            // Add user document deletion to batch
            batch.delete(userRef);
            
            // Commit Firestore changes
            await batch.commit();

            toast({
              title: 'Sucesso',
              description: 'Usuário e seus dados foram deletados com sucesso.',
              status: 'success',
              duration: 5000,
            });
          } catch (error: any) {
            console.error('Erro ao deletar usuário:', error);
            toast({
              title: 'Erro',
              description: error.message || 'Erro ao deletar usuário. Tente novamente.',
              status: 'error',
              duration: 5000,
            });
          }
          break;

        case 'role':
          if (!newRole) {
            throw new Error('Cargo não pode estar vazio');
          }
          batch.update(userRef, { 
            role: newRole,
            updatedAt: new Date()
          });
          break;
      }

      await batch.commit();

      toast({
        title: 'Sucesso',
        description: 'Ação realizada com sucesso.',
        status: 'success',
        duration: 3000,
      });

      onClose();
      setNewEmail('');
      setNewPassword('');
      setNewRole('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao realizar a ação.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'banned':
        return 'red';
      case 'disabled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'banned':
        return 'Banido';
      case 'disabled':
        return 'Desativado';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Usuário</Th>
            <Th>Email</Th>
            <Th>Cargo</Th>
            <Th>Status</Th>
            <Th>Permissões</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.uid}>
              <Td>
                <Flex align="center">
                  <Avatar size="sm" src={user.photoURL} name={user.displayName} />
                  <Text ml={2}>{user.displayName}</Text>
                </Flex>
              </Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge {...getRoleBadgeProps(user.role)}>
                  {user.role}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={getStatusColor(user.status)}>
                  {getStatusText(user.status)}
                </Badge>
              </Td>
              <Td>
                <Flex gap={2}>
                  {user.canUseGif && (
                    <Badge colorScheme="purple" variant="subtle">
                      GIF Perfil
                    </Badge>
                  )}
                  {user.canUseBanner && (
                    <Badge colorScheme="purple" variant="subtle">
                      Banner {user.role === 'vip' && '(Estático)'}
                    </Badge>
                  )}
                </Flex>
              </Td>
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<FiMail />}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('email');
                        onOpen();
                      }}
                    >
                      Alterar Email
                    </MenuItem>
                    <MenuItem
                      icon={<FiLock />}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('password');
                        onOpen();
                      }}
                    >
                      Alterar Senha
                    </MenuItem>
                    <MenuItem
                      icon={<FiSlash />}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('ban');
                        onOpen();
                      }}
                    >
                      Banir Usuário
                    </MenuItem>
                    <MenuItem
                      icon={<FiUserX />}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('disable');
                        onOpen();
                      }}
                    >
                      Desativar Conta
                    </MenuItem>
                    <MenuItem
                      icon={<FiUserCheck />}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('activate');
                        onOpen();
                      }}
                    >
                      Ativar Conta
                    </MenuItem>
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('delete');
                        onOpen();
                      }}
                    >
                      Excluir Conta
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedAction('role');
                        setNewRole(user.role);
                        onOpen();
                      }}
                    >
                      Alterar Cargo
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAction === 'email' && 'Alterar Email'}
            {selectedAction === 'password' && 'Alterar Senha'}
            {selectedAction === 'ban' && 'Banir Usuário'}
            {selectedAction === 'disable' && 'Desativar Conta'}
            {selectedAction === 'activate' && 'Ativar Conta'}
            {selectedAction === 'delete' && 'Excluir Conta'}
            {selectedAction === 'role' && 'Alterar Cargo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAction === 'email' && (
              <Input
                placeholder="Novo email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            )}
            {selectedAction === 'password' && (
              <Input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            )}
            {selectedAction === 'ban' && (
              <Text>Tem certeza que deseja banir este usuário?</Text>
            )}
            {selectedAction === 'disable' && (
              <Text>Tem certeza que deseja desativar esta conta?</Text>
            )}
            {selectedAction === 'activate' && (
              <Text>Tem certeza que deseja ativar esta conta?</Text>
            )}
            {selectedAction === 'delete' && (
              <Text>Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.</Text>
            )}
            {selectedAction === 'role' && (
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleAction}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
