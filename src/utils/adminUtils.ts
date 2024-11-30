import { db } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function promoteToAdmin(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: 'admin'
    });
    return true;
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    return false;
  }
}
