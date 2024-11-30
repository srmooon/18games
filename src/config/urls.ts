const isDevelopment = process.env.NODE_ENV === 'development';

export const BASE_URL = isDevelopment ? 'http://localhost:3000' : 'https://18games.xyz';

export const URLS = {
  BASE: BASE_URL,
  VERIFY_EMAIL: `${BASE_URL}/verify-email`,
  RESET_PASSWORD: `${BASE_URL}/reset-password`,
  ADMIN_DASHBOARD: `${BASE_URL}/admin`,
  GAMES: `${BASE_URL}/jogos`,
  API: {
    BASE: `${BASE_URL}/api`,
    USERS: `${BASE_URL}/api/users`,
    GAMES: `${BASE_URL}/api/games`,
    AUTH: `${BASE_URL}/api/auth`,
  }
};
