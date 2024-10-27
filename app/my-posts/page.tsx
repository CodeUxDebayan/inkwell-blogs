"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/config"
import { toast } from "sonner"
import Link from "next/link"
import { Pen, Trash2 } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export default function MyPostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPosts()
    }
  }, [user])

  async function loadPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      toast.error("Error loading your posts")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      toast.success("Post deleted successfully")
      loadPosts()
    } catch (error) {
      toast.error("Error deleting post")
    }
  }

  if (loading) {
    return <div>Loading your posts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Button asChild>
          <Link href="/write">Create New Post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">You haven't created any posts yet.</p>
          <Button asChild className="mt-4">
            <Link href="/write">Write Your First Post</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{post.category}</div>
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/write/${post.id}`}>
                      <Pen className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}