'use client';

import { createContext } from 'react';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
  updateUserPreferences: (preferences: any) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
