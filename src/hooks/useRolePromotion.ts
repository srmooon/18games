import { useEffect } from 'react';
import { auth } from '@/config/firebase';
import { ForumRole } from '@/types/forum';

export function useRolePromotion() {
  // Removido a lógica de promoção automática
  // A promoção será feita apenas pela Cloud Function
}
