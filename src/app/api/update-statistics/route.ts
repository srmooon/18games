import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

export async function POST() {
  try {
    // Calcular estatísticas
    const usersQuery = collection(db, 'users');
    const postsQuery = collection(db, 'posts');

    const [usersSnapshot, postsSnapshot] = await Promise.all([
      getDocs(usersQuery),
      getDocs(postsQuery),
    ]);

    const totalUsers = usersSnapshot.size;
    const totalPosts = postsSnapshot.size;

    // Calcular taxa de engajamento (exemplo: usuários que fizeram posts)
    const usersWithPosts = new Set();
    postsSnapshot.forEach((post) => {
      usersWithPosts.add(post.data().userId);
    });

    const engagementRate = totalUsers > 0 
      ? Math.round((usersWithPosts.size / totalUsers) * 100) 
      : 0;

    // Atualizar estatísticas no Firestore
    const statsRef = doc(db, 'statistics', 'general');
    await setDoc(statsRef, {
      activeUsers: totalUsers,
      totalPosts,
      engagementRate,
      activeUsersTrend: 0, // Será calculado comparando com o mês anterior
      engagementTrend: 0,  // Será calculado comparando com o mês anterior
      postsTrend: 0,       // Será calculado comparando com o mês anterior
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar estatísticas' },
      { status: 500 }
    );
  }
}
