import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Esta função roda todos os dias à meia-noite
export const autoPromoteMember = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const threeDaysAgo = new Date(now.toDate().getTime() - 3 * 24 * 60 * 60 * 1000);

    try {
      // Buscar todos os usuários que são membros normais e têm conta criada há mais de 3 dias
      const usersSnapshot = await db
        .collection('users')
        .where('role', '==', 'membro')
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(threeDaysAgo))
        .get();

      const batch = db.batch();
      let promotionCount = 0;

      usersSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          role: 'membro+',
          promotedToMemberPlusAt: now,
          updatedAt: now
        });
        promotionCount++;
      });

      if (promotionCount > 0) {
        await batch.commit();
        console.log(`${promotionCount} usuários foram promovidos para membro+`);
      }

      return null;
    } catch (error) {
      console.error('Erro ao promover usuários:', error);
      return null;
    }
  });
