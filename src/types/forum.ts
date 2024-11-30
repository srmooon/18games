export type ForumRole = 'membro' | 'membro+' | 'vip' | 'vip+' | 'admin';

export interface RolePermissions {
  // Permissões básicas
  canCreatePosts: boolean;      // Pode criar postagens
  canComment: boolean;          // Pode comentar
  canViewContent: boolean;      // Pode ver conteúdo
  canUseProfilePicture: boolean; // Pode alterar foto de perfil
  canUseGif: boolean;          // Pode usar GIFs
  hasVipBadge: boolean;        // Tem distintivo VIP
  hasAnimatedPosts: boolean;    // Postagens com animação especial
  accountAgeDays: number;       // Idade mínima da conta em dias
  isPurchaseable: boolean;      // Se o cargo pode ser comprado
  
  // Permissões de moderação
  canDeleteAnyPost: boolean;    // Pode deletar qualquer postagem
  canManageUsers: boolean;      // Pode gerenciar usuários (desativar contas)
}

export const ROLE_PERMISSIONS: Record<ForumRole, RolePermissions> = {
  membro: {
    canCreatePosts: false,
    canComment: false,
    canViewContent: true,
    canUseProfilePicture: false,
    canUseGif: false,
    hasVipBadge: false,
    hasAnimatedPosts: false,
    accountAgeDays: 0,
    isPurchaseable: false,
    canDeleteAnyPost: false,
    canManageUsers: false
  },
  'membro+': {
    canCreatePosts: true,
    canComment: true,
    canViewContent: true,
    canUseProfilePicture: true,
    canUseGif: false,
    hasVipBadge: false,
    hasAnimatedPosts: false,
    accountAgeDays: 3,
    isPurchaseable: false,
    canDeleteAnyPost: false,
    canManageUsers: false
  },
  vip: {
    canCreatePosts: true,
    canComment: true,
    canViewContent: true,
    canUseProfilePicture: true,
    canUseGif: true,
    hasVipBadge: true,
    hasAnimatedPosts: false,
    accountAgeDays: 0,
    isPurchaseable: true,
    canDeleteAnyPost: false,
    canManageUsers: false
  },
  'vip+': {
    canCreatePosts: true,
    canComment: true,
    canViewContent: true,
    canUseProfilePicture: true,
    canUseGif: true,
    hasVipBadge: true,
    hasAnimatedPosts: true,
    accountAgeDays: 0,
    isPurchaseable: true,
    canDeleteAnyPost: false,
    canManageUsers: false
  },
  admin: {
    canCreatePosts: true,
    canComment: true,
    canViewContent: true,
    canUseProfilePicture: true,
    canUseGif: true,
    hasVipBadge: true,
    hasAnimatedPosts: true,
    accountAgeDays: 0,
    isPurchaseable: false,
    canDeleteAnyPost: true,    // Admin pode deletar qualquer post
    canManageUsers: true      // Admin pode gerenciar usuários
  }
};
