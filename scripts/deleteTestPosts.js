const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBmqXyGTzqtGABL3IrDC2J5mhhlt1m9QkM",
  authDomain: "games-ea91b.firebaseapp.com",
  projectId: "games-ea91b",
  storageBucket: "games-ea91b.firebasestorage.app",
  messagingSenderId: "344854783508",
  appId: "1:344854783508:web:514adc4e8205c3007b2901"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllPosts() {
  try {
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(postsRef);
    
    console.log(`Encontrados ${querySnapshot.size} posts para deletar`);
    
    for (const doc of querySnapshot.docs) {
      console.log(`Deletando post: ${doc.id}`);
      try {
        await deleteDoc(doc.ref);
        console.log(`Post ${doc.id} deletado com sucesso`);
      } catch (error) {
        console.error(`Erro ao deletar post ${doc.id}:`, error);
      }
    }
    
    console.log('Operação concluída');
  } catch (error) {
    console.error('Erro ao deletar posts:', error);
  }
}

deleteAllPosts();
