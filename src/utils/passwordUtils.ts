import { auth } from '@/config/firebase';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import bcrypt from 'bcryptjs';

// Função para verificar se a senha já foi usada
export async function isPasswordPreviouslyUsed(userId: string, newPassword: string): Promise<boolean> {
    try {
        // Buscar o documento do usuário
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return false;
        }

        const userData = userDoc.data();
        const passwordHistory = userData.passwordHistory || [];

        // Hash da nova senha
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Verificar se a senha já existe no histórico
        for (const oldPasswordHash of passwordHistory) {
            if (await bcrypt.compare(newPassword, oldPasswordHash)) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar histórico de senhas:', error);
        return false;
    }
}

// Função para adicionar senha ao histórico
export async function addPasswordToHistory(userId: string, password: string) {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await setDoc(doc(db, 'users', userId), {
            passwordHistory: arrayUnion(passwordHash)
        }, { merge: true });
    } catch (error) {
        console.error('Erro ao adicionar senha ao histórico:', error);
    }
}

// Função para verificar se é a senha atual
export async function isCurrentPassword(email: string, password: string): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) {
            return false;
        }

        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
        return true;
    } catch (error) {
        return false;
    }
}
