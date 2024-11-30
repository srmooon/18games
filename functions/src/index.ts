import * as admin from 'firebase-admin';
import { autoPromoteMember } from './autoPromoteMember';
import { validateUserAction } from './validateUserAction';

// Inicializar o app
admin.initializeApp();

// Exportar as funções
export {
  autoPromoteMember,
  validateUserAction
};
