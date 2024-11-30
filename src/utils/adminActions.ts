import { auth, db } from '@/config/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useForumPermissions } from '@/hooks/useForumPermissions';

// Função para deletar uma postagem
export async function deletePost(postId: string) {
  const { permissions } = useForumPermissions();
  
  if (!permissions.canDeleteAnyPost) {
    throw new Error('Você não tem permissão para deletar postagens');
  }

  try {
    await deleteDoc(doc(db, 'posts', postId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar postagem:', error);
    throw error;
  }
}

// Função para desativar uma conta de usuário
export async function deactivateUser(userId: string) {
  const { permissions } = useForumPermissions();
  
  if (!permissions.canManageUsers) {
    throw new Error('Você não tem permissão para gerenciar usuários');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica se o alvo também é admin
    if (userDoc.data().role === 'admin') {
      throw new Error('Não é possível desativar conta de outro administrador');
    }

    // Atualiza o status do usuário
    await updateDoc(userRef, {
      isActive: false,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: auth.currentUser?.uid
    });

    return true;
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    throw error;
  }
}

// Função para reativar uma conta de usuário
export async function reactivateUser(userId: string) {
  const { permissions } = useForumPermissions();
  
  if (!permissions.canManageUsers) {
    throw new Error('Você não tem permissão para gerenciar usuários');
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isActive: true,
      reactivatedAt: new Date().toISOString(),
      reactivatedBy: auth.currentUser?.uid,
      deactivatedAt: null,
      deactivatedBy: null
    });

    return true;
  } catch (error) {
    console.error('Erro ao reativar usuário:', error);
    throw error;
  }
}
