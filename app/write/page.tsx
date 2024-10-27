"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImagePlus } from "lucide-react"
import { supabase } from "@/lib/supabase/config"

export default function WritePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to create a post")
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            category,
            author_id: user.id,
          },
        ])

      if (error) throw error

      toast.success("Post created successfully")
      router.push("/explore")
    } catch (error) {
      toast.error("Error creating post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter your blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your blog post here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px]"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Add Cover Image
            </Button>
            <Button type="submit" className="ml-auto" disabled={loading}>
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}