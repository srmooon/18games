'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useToast } from '@chakra-ui/react';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  bannerURL: string;
  role: string;
  status: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (userData?.status === 'banned') {
        // Se o usuário estiver banido, fazer logout
        await signOut(auth);
        toast({
          title: 'Acesso Negado',
          description: 'Sua conta foi banida. Entre em contato com o suporte para mais informações.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (userData?.status === 'disabled') {
        // Se a conta estiver desabilitada, fazer logout
        await signOut(auth);
        toast({
          title: 'Conta Desabilitada',
          description: 'Sua conta está temporariamente desabilitada. Entre em contato com o suporte para reativá-la.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(user);
      setProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: userData.displayName || '',
        username: userData.username || '',
        photoURL: userData.photoURL || '',
        bannerURL: userData.bannerURL || '',
        role: userData.role || 'user',
        status: userData.status || 'active'
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <UserContext.Provider value={{ user, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
