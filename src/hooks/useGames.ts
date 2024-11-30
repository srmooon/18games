import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { app } from '@/firebase/config';
import { Game } from '@/types/Game';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchGames = async () => {
      try {
        const db = getFirestore(app);
        const gamesRef = collection(db, 'posts');
        const q = query(gamesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadedGames = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdBy: {
              uid: data.userId || data.createdBy?.uid,
              displayName: data.userName || data.createdBy?.displayName || 'Usuário',
              photoURL: data.userPhotoURL || data.createdBy?.photoURL || '',
              role: data.userRole || data.createdBy?.role || 'membro'
            }
          };
        }) as Game[];

        setGames(loadedGames);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar jogos:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar jogos');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return { games, loading, error };
}
