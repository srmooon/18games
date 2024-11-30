import { db } from '@/config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  QuerySnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

// Constantes para nomes de coleções
const COLLECTIONS = {
  USERS: 'users'
} as const;

export interface User {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  passwordHistory: string[];
}

export async function createUser(userData: Partial<User>): Promise<void> {
  if (!userData.uid) throw new Error('UID is required');
  if (!userData.username) throw new Error('Username is required');
  if (!userData.email) throw new Error('Email is required');
  
  // Validação de username
  const username = userData.username.toLowerCase();
  if (username.length < 3) {
    throw new Error('Username deve ter pelo menos 3 caracteres');
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new Error('Username pode conter apenas letras, números e underscore');
  }
  
  // Verifica se já existe um usuário com o mesmo username
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    throw new Error('Este nome de usuário já está em uso');
  }
  
  const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
  const now = new Date();
  
  // Prepara os dados do usuário
  const userDataToSave = {
    uid: userData.uid,
    username: username,
    email: userData.email.toLowerCase(),
    displayName: userData.displayName || null,
    photoURL: userData.photoURL || null,
    role: userData.role || '',
    isEmailVerified: userData.isEmailVerified || false,
    passwordHistory: userData.passwordHistory || [],
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };
  
  try {
    await setDoc(userRef, userDataToSave);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error('Erro ao criar usuário. Tente novamente.');
  }
}

export async function getUser(uid: string): Promise<User | null> {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data() as User;
    return {
      ...userData,
      uid: userSnap.id,
      createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt,
      updatedAt: userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate() : userData.updatedAt
    };
  }
  
  return null;
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Função auxiliar para converter dados do Firestore
function convertUserData(snapshot: QuerySnapshot<DocumentData>): User | null {
  if (snapshot.empty) return null;
  
  const userData = snapshot.docs[0].data();
  return {
    ...userData,
    createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt,
    updatedAt: userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate() : userData.updatedAt
  } as User;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  if (!username) return null;

  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const lowercaseUsername = username.toLowerCase();
    
    // Consulta específica por username com limit(1)
    const q = query(
      usersRef,
      where('username', '==', lowercaseUsername),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data();
    
    return {
      id: doc.id,
      ...userData,
      createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt,
      updatedAt: userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate() : userData.updatedAt
    } as User;
    
  } catch (error: any) {
    console.error('Erro ao buscar usuário por username:', error);
    
    // Não propaga o erro de permissão, apenas retorna null
    if (error.code === 'permission-denied' || 
        error.message?.includes('Missing or insufficient permissions')) {
      return null;
    }
    
    // Para outros erros, propaga com mensagem amigável
    throw new Error('Erro ao verificar usuário. Por favor, tente novamente.');
  }
}
