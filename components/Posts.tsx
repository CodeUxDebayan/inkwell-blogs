"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react"
import { supabase } from "@/lib/supabase/config"
import { toast } from "sonner"
import { notFound } from "next/navigation"

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  author: {
    username: string
    avatar_url: string | null
  }
  likes: number
  user_has_liked: boolean
  user_has_bookmarked: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    username: string
    avatar_url: string | null
  }
}

export function Posts({ id }: { id: string }) {
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    loadPost()
    loadComments()
  }) 

  async function loadPost() {
    try {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, avatar_url),
          likes(count),
          user_likes:likes!inner(user_id)
        `)
        .eq('id', id)
        .single()

      if (postError) {
        if (postError.code === 'PGRST116') {
          notFound()
        }
        throw postError
      }

      const formattedPost = {
        ...postData,
        likes: postData.likes?.[0]?.count || 0,
        user_has_liked: postData.user_likes?.some((like: { user_id: string | undefined }) => like.user_id === user?.id) || false,
        user_has_bookmarked: false
      }

      if (user) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single()

        formattedPost.user_has_bookmarked = !!bookmarkData
      }

      setPost(formattedPost)
    } catch (error) {
      toast.error("Error loading post")
    } finally {
      setLoading(false)
    }
  }

  async function loadComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      toast.error("Error loading comments")
    }
  }

  const handleLike = async () => {
    if (!user || !post) {
      toast.error("Please login to like posts")
      return
    }

    try {
      if (post.user_has_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: user.id })
      }

      await loadPost()
    } catch (error) {
      toast.error("Error updating like")
    }
  }

  const handleBookmark = async () => {
    if (!user || !post) {
      toast.error("Please login to bookmark posts")
      return
    }

    try {
      if (post.user_has_bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
        toast.success("Bookmark removed")
      } else {
        await supabase
          .from('bookmarks')
          .insert({ post_id: post.id, user_id: user.id })
        toast.success("Post bookmarked")
      }

      await loadPost()
    } catch (error) {
      toast.error("Error updating bookmark")
    }
  }

  const handleComment = async () => {
    if (!user || !post) {
      toast.error("Please login to comment")
      return
    }

    if (!commentText.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: commentText
        })

      if (error) throw error

      toast.success("Comment added")
      setCommentText("")
      await loadComments()
    } catch (error) {
      toast.error("Error adding comment")
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    } catch (error) {
      toast.error("Error copying link")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading post...</div>
  }

  if (!post) {
    return notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="p-8">
        <article className="space-y-8">
          <header className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground uppercase">{post.category}</div>
              <h1 className="text-4xl font-bold">{post.title}</h1>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-secondary" />
                <div>
                  <div className="font-medium">{post.author?.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLike}
                  className={post.user_has_liked ? "text-primary" : ""}
                >
                  <Heart className="w-4 h-4" fill={post.user_has_liked ? "currentColor" : "none"} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleBookmark}
                  className={post.user_has_bookmarked ? "text-primary" : ""}
                >
                  <Bookmark 
                    className="w-4 h-4" 
                    fill={post.user_has_bookmarked ? "currentColor" : "none"} 
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content}
          </div>
        </article>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Comments</h2>
        
        <Card className="p-6">
          <div className="flex gap-4">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button onClick={handleComment}>Comment</Button>
          </div>
        </Card>

        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{comment.user?.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}