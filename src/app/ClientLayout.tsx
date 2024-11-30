'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <Layout user={user}>
      {children}
    </Layout>
  );
}
