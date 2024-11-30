import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const updateMemberStatus = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const threeDaysAgo = new Date(now.toDate().getTime() - 3 * 24 * 60 * 60 * 1000);

    try {
      // Buscar usuários que são 'membro' e foram criados há mais de 3 dias
      const usersSnapshot = await db
        .collection('users')
        .where('role', '==', 'membro')
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(threeDaysAgo))
        .get();

      const batch = db.batch();
      
      usersSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          role: 'membro+',
          updatedAt: now
        });
      });

      await batch.commit();

      console.log(`Updated ${usersSnapshot.size} users to membro+`);
      return null;
    } catch (error) {
      console.error('Error updating member status:', error);
      return null;
    }
  });
