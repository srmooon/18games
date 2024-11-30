import { RootLayoutClient } from './RootLayoutClient';

export const metadata = {
  title: {
    template: '%s | 18Games',
    default: '18Games - Início',
  },
  description: 'Plataforma de jogos e entretenimento',
  keywords: ['jogos', 'games', 'entretenimento', 'diversão'],
  authors: [{ name: '18Games' }],
  creator: '18Games',
  publisher: '18Games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}