import { Posts } from '@/components/Posts'
import { supabase } from "@/lib/supabase/config"

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
  
  return posts?.map((post) => ({
    id: post.id,
  })) || []
}

export default function PostPage({ params }: { params: { id: string } }) {
  return <Posts id={params.id} />
}