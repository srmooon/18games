import { Suspense } from 'react';
import PostContent from './PostContent';
import Layout from '@/components/Layout';
import { PageProps } from 'next';
import { getAllPosts } from '@/utils/posts';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    postId: post.id,
  }));
}

export default function PostPage({ params }: PageProps) {
  return (
    <Layout>
      <Suspense fallback={<div>Carregando...</div>}>
        <PostContent postId={params.postId} />
      </Suspense>
    </Layout>
  );
}