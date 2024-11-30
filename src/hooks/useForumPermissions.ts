import { useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ForumRole, RolePermissions, ROLE_PERMISSIONS } from '@/types/forum';

export function useForumPermissions() {
  const [role, setRole] = useState<ForumRole>('membro');
  const [permissions, setPermissions] = useState<RolePermissions>(ROLE_PERMISSIONS.membro);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setRole('membro');
          setPermissions(ROLE_PERMISSIONS.membro);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userRole = userDoc.data().role as ForumRole;
          setRole(userRole);
          setPermissions(ROLE_PERMISSIONS[userRole]);
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, []);

  return {
    role,
    permissions,
    loading,
    isAdmin: role === 'admin',
    isVip: role === 'vip' || role === 'vip+' || role === 'admin',
    isMemberPlus: role === 'membro+' || role === 'vip' || role === 'vip+' || role === 'admin'
  };
}
