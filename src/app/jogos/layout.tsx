'use client';

import { AuthProvider } from '@/providers/AuthProvider';

export default function JogosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
