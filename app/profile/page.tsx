"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/config"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Profile {
  username: string
  full_name: string
  avatar_url: string | null
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (user) {
      loadProfile()
      loadPosts()
      loadLikedPosts()
      loadBookmarkedPosts()
    }
  })

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      toast.error("Error loading profile")
    }
  }

  async function loadPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } finally {
      setLoading(false)
    }
  }

  async function loadLikedPosts() {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('posts(*)')
        .eq('user_id', user?.id)

      if (error) throw error
      setLikedPosts(data?.map(item => item.posts as unknown as Post) || [])
    } catch (error) {
      toast.error("Error loading liked posts")
    }
  }

  async function loadBookmarkedPosts() {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('posts(*)')
        .eq('user_id', user?.id)

      if (error) throw error
      setBookmarkedPosts(data?.map(item => item.posts as unknown as Post) || [])
    } catch (error) {
      toast.error("Error loading bookmarked posts")
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Signed out successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
        })
        .eq("id", user.id)

      if (error) throw error
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Error updating profile")
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      toast.success("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error("Error updating password")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('author_id', user?.id)

      if (postsError) throw postsError

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id)

      if (profileError) throw profileError

      const { error: authError } = await supabase.auth.admin.deleteUser(
        user?.id as string
      )

      if (authError) throw authError

      await supabase.auth.signOut()
      toast.success("Account deleted successfully")
      router.push("/")
    } catch (error) {
      toast.error("Error deleting account")
    }
  }

  if (!user || loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="interactions">My Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile?.username}
                  onChange={(e) => setProfile(prev => ({ ...prev!, username: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                />
              </div>

              <div className="flex justify-between">
                <Button type="submit">Update Profile</Button>
                
              </div>
            </form>
          </Card><Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button type="submit">Change Password</Button>
            </form>

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">You havent written any posts yet.</p>
              <Button asChild className="mt-4">
                <Link href="/write">Write Your First Post</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/post/${post.id}`}>View Post</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Liked Posts</h3>
            {likedPosts.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">You havent liked any posts yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {likedPosts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/post/${post.id}`}>View Post</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Bookmarked Posts</h3>
            {bookmarkedPosts.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">You havent bookmarked any posts yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookmarkedPosts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/post/${post.id}`}>View Post</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}