import { Suspense } from 'react';
import PostContent from './PostContent';

export default function PostPage({ params }: { params: { postId: string } }) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PostContent postId={params.postId} />
    </Suspense>
  );
}