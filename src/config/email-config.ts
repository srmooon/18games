import { auth } from './firebase';

export const emailConfig = {
  url: process.env.NEXT_PUBLIC_VERIFICATION_URL || 'https://18games.xyz/verify-email',
  from: '18games <noreply@18games.xyz>',
  subject: 'Verifique seu email - 18games',
  handleCodeInApp: true,
};

// Função para personalizar o template do email
export const customizeEmailTemplate = async () => {
  try {
    await auth().setActionCodeSettings({
      url: emailConfig.url,
      handleCodeInApp: emailConfig.handleCodeInApp,
      iOS: {
        bundleId: 'com.18games.app'
      },
      android: {
        packageName: 'com.18games.app',
        installApp: true,
        minimumVersion: '12'
      },
      dynamicLinkDomain: process.env.NEXT_PUBLIC_DYNAMIC_LINK_DOMAIN
    });
  } catch (error) {
    console.error('Erro ao configurar template de email:', error);
  }
};
