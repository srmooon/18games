import { RootLayoutClient } from './RootLayoutClient';
import { Metadata } from 'next';
import { pageTitles, pageDescriptions } from '@/config/metadata';

export const metadata: Metadata = {
  title: {
    template: '%s | 18Games - Traduções +18',
    default: pageTitles.home,
  },
  description: pageDescriptions.home,
  keywords: ['jogos +18', 'traduções', 'português', 'brasil', 'games', 'adult games', 'visual novels'],
  authors: [{ name: '18Games' }],
  creator: '18Games',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://18games.xyz'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
