'use client';

import { auth } from './firebase';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';

export function initializeFirebase() {
  setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });
}
