"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageSquare, Bookmark } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/config"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  author: {
    username: string
    avatar_url: string
  }
  likes: number
  user_has_liked: boolean
  user_has_bookmarked: boolean
}

interface BlogListProps {
  selectedCategory?: string;
}

export function BlogList({ selectedCategory = "All" }: BlogListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    loadPosts()
  })

  async function loadPosts() {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, avatar_url),
          likes(count),
          user_likes:likes!inner(user_id)
        `)
        .order('created_at', { ascending: false })

      if (selectedCategory !== "All") {
        query = query.eq('category', selectedCategory.toLowerCase())
      }

      const { data, error } = await query

      if (error) throw error

      const formattedPosts = data?.map(post => ({
        ...post,
        likes: post.likes?.[0]?.count || 0,
        user_has_liked: post.user_likes?.some((like: { user_id: string | undefined }) => like.user_id === user?.id) || false,
        user_has_bookmarked: false
      }))

      if (user) {
        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('post_id')
          .eq('user_id', user.id)

        const bookmarkedPostIds = new Set(bookmarks?.map(b => b.post_id))
        formattedPosts?.forEach(post => {
          post.user_has_bookmarked = bookmarkedPostIds.has(post.id)
        })
      }

      setPosts(formattedPosts || [])
    } catch (error) {
      toast.error("Error loading posts")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please login to like posts")
      return
    }

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.user_has_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id })
      }

      await loadPosts()
    } catch (error) {
      toast.error("Error updating like")
    }
  }

  const handleBookmark = async (postId: string) => {
    if (!user) {
      toast.error("Please login to bookmark posts")
      return
    }

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.user_has_bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        toast.success("Bookmark removed")
      } else {
        await supabase
          .from('bookmarks')
          .insert({ post_id: postId, user_id: user.id })
        toast.success("Post bookmarked")
      }

      await loadPosts()
    } catch (error) {
      toast.error("Error updating bookmark")
    }
  }

  const handleComment = async (postId: string) => {
    if (!user) {
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
          post_id: postId,
          user_id: user.id,
          content: commentText
        })

      if (error) throw error

      toast.success("Comment added")
      setCommentText("")
      setShowComments(null)
      await loadPosts()
    } catch (error) {
      toast.error("Error adding comment")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>
  }

  if (posts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No posts found.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="p-6 hover:bg-muted/50 transition-colors">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{post.category}</div>
              <Link 
                href={`/post/${post.id}`}
                className="block cursor-pointer"
              >
                <h2 className="text-2xl font-semibold hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground leading-relaxed">
                {post.content.substring(0, 200)}...
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-secondary" />
                  <span className="text-sm font-medium">{post.author?.username}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleLike(post.id)}
                  className={post.user_has_liked ? "text-primary" : ""}
                >
                  <Heart className="w-4 h-4" fill={post.user_has_liked ? "currentColor" : "none"} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleBookmark(post.id)}
                  className={post.user_has_bookmarked ? "text-primary" : ""}
                >
                  <Bookmark 
                    className="w-4 h-4" 
                    fill={post.user_has_bookmarked ? "currentColor" : "none"} 
                  />
                </Button>
              </div>
            </div>

            {showComments === post.id && (
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button onClick={() => handleComment(post.id)}>Comment</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}