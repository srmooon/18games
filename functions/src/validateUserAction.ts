import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Função para validar ações do usuário antes de permitir
export const validateUserAction = functions.firestore
  .document('{collection}/{docId}')
  .onCreate(async (snap, context) => {
    const db = admin.firestore();
    const data = snap.data();
    const collection = context.params.collection;

    // Se for uma criação de post ou avaliação
    if (collection === 'posts' || (collection === 'posts' && data.ratings)) {
      try {
        // Buscar dados do usuário
        const userRef = db.collection('users').doc(data.createdBy.uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data();

        // Se o usuário for membro normal, não permitir a ação
        if (userData?.role === 'membro') {
          // Deletar o documento criado
          await snap.ref.delete();

          console.log(`Ação bloqueada: usuário ${data.createdBy.uid} (membro) tentou ${collection === 'posts' ? 'criar post' : 'avaliar'}`);
          
          return {
            error: true,
            message: 'Membros normais não podem realizar esta ação'
          };
        }

        return {
          success: true,
          message: 'Ação permitida'
        };
      } catch (error) {
        console.error('Erro ao validar ação do usuário:', error);
        // Em caso de erro, bloquear por segurança
        await snap.ref.delete();
        return { error: true, message: 'Erro ao validar permissões' };
      }
    }

    // Para outras coleções, permitir normalmente
    return { success: true };
  });
