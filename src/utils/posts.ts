import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: Date;
}

export async function getAllPosts(): Promise<Post[]> {
  const postsRef = collection(db, 'posts');
  const snapshot = await getDocs(postsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as Post));
}
