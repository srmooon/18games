import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function migrateUserProfile(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return;

  const userData = userDoc.data();
  const updates: any = {};

  // Adicionar campos faltantes com valores padrão
  if (!userData.username) {
    updates.username = userData.email?.split('@')[0] || 'user' + Math.random().toString(36).slice(2, 7);
  }
  if (!userData.description) {
    updates.description = '';
  }
  if (!userData.postCount) {
    updates.postCount = 0;
  }
  if (!userData.rating) {
    updates.rating = 0;
  }

  // Atualizar apenas se houver mudanças
  if (Object.keys(updates).length > 0) {
    await updateDoc(userRef, updates);
  }
}
