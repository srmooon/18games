import React, { createContext, useContext, useEffect, useState } from 'react';
import { cookieUtils } from '@/utils/cookies';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
  updateUserPreferences: (preferences: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar cookies ao carregar
    const userFromCookie = cookieUtils.get('user');
    if (userFromCookie) {
      setUser(userFromCookie);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: any) => {
    // Salvar dados do usuário em cookies seguros
    cookieUtils.set('user', userData);
    cookieUtils.set('auth_token', userData.token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Limpar cookies ao fazer logout
    cookieUtils.remove('user');
    cookieUtils.remove('auth_token');
    cookieUtils.remove('preferences');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserPreferences = (preferences: any) => {
    cookieUtils.set('preferences', preferences);
    setUser(prev => ({ ...prev, preferences }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        logout,
        updateUserPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
