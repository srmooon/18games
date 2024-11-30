import Cookies from 'js-cookie';
import { User } from '@/lib/db';

const AUTH_COOKIE_NAME = '18games_auth_token';
const COOKIE_EXPIRY_DAYS = 3;

interface AuthToken {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const authUtils = {
  setAuthCookie: (userData: User, emailVerified: boolean) => {
    const createdDate = new Date(userData.createdAt);
    const updatedDate = new Date(userData.updatedAt);

    const token: AuthToken = {
      uid: userData.uid,
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      emailVerified,
      role: userData.role || 'membro',
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString()
    };

    // Remove qualquer cookie antigo
    Cookies.remove('18games_auth');
    
    // Define o novo cookie
    Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(token), {
      expires: COOKIE_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return token;
  },

  getAuthCookie: (): AuthToken | null => {
    // Tenta primeiro o novo nome do cookie
    let cookie = Cookies.get(AUTH_COOKIE_NAME);
    
    // Se não encontrar, tenta o nome antigo
    if (!cookie) {
      cookie = Cookies.get('18games_auth');
      // Se encontrar o cookie antigo, atualiza para o novo formato
      if (cookie) {
        const token = JSON.parse(cookie) as AuthToken;
        Cookies.remove('18games_auth');
        Cookies.set(AUTH_COOKIE_NAME, cookie, {
          expires: COOKIE_EXPIRY_DAYS,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        });
      }
    }
    
    if (!cookie) return null;

    try {
      return JSON.parse(cookie) as AuthToken;
    } catch {
      return null;
    }
  },

  removeAuthCookie: () => {
    // Remove ambos os cookies para garantir
    Cookies.remove('18games_auth');
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getAuthCookie();
  }
};
