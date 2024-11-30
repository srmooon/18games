'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/db';
import { authUtils } from '@/utils/auth';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { initializeFirebase } from '@/config/firebase-init';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Inicializa o Firebase apenas no lado do cliente
    initializeFirebase();

    // Verificar cookie ao carregar
    const authCookie = authUtils.getAuthCookie();
    if (authCookie) {
      setUser({
        uid: authCookie.uid,
        email: authCookie.email,
        username: authCookie.username,
        displayName: authCookie.displayName,
        photoURL: authCookie.photoURL,
        createdAt: new Date(authCookie.createdAt),
        updatedAt: new Date(authCookie.updatedAt)
      });
      setIsAuthenticated(true);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      authUtils.removeAuthCookie();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated,
        signOut: handleSignOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
