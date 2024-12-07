import Layout from '@/components/Layout';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
