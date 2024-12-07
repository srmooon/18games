import { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  params: { postId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await Promise.resolve(props.params);
  
  try {
    const postRef = doc(db, 'posts', params.postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      return {
        title: 'Post não encontrado - 18Games',
        description: 'O post que você procura não foi encontrado.',
      };
    }

    const post = postSnap.data();
    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: `${post.title} - 18Games`,
      description: post.description || 'Tradução disponível no 18Games',
      openGraph: {
        title: `${post.title} - 18Games`,
        description: post.description || 'Tradução disponível no 18Games',
        images: [post.mainImage, ...previousImages],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} - 18Games`,
        description: post.description || 'Tradução disponível no 18Games',
        images: [post.mainImage],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: '18Games - Traduções +18',
      description: 'Site de traduções de jogos +18 para português do Brasil',
    };
  }
}
