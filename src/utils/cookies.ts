import Cookies from 'js-cookie';
import { getIronSession } from 'iron-session';

// Configurações de cookie seguro
const cookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  expires: 30, // 30 dias
};

// Funções para gerenciar cookies
export const cookieUtils = {
  // Definir um cookie seguro
  set: (name: string, value: any) => {
    Cookies.set(name, JSON.stringify(value), cookieOptions);
  },

  // Obter valor do cookie
  get: (name: string) => {
    const value = Cookies.get(name);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },

  // Remover cookie
  remove: (name: string) => {
    Cookies.remove(name, { path: '/' });
  },

  // Limpar todos os cookies
  clearAll: () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
  }
};

// Configuração da sessão segura com iron-session
export const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex-password-at-least-32-characters-long',
  cookieName: 'secure-session-cookie',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 30 // 30 dias
  }
};

// Tipo para a sessão
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: string;
      email: string;
      isLoggedIn: boolean;
    };
    preferences?: {
      theme: string;
      language: string;
    };
  }
}

// Helper para gerenciar sessão segura
export const getSecureSession = async (req: Request, res: Response) => {
  return getIronSession(req, res, sessionOptions);
};
