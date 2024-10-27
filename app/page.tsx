import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pen, Users, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-12 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold sm:text-6xl">Welcome to Inkwell</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Where ideas flourish and stories come to life. Join our community of writers and readers.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" asChild>
            <Link href="/explore">Explore Posts</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card className="p-6 space-y-2">
          <Pen className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-semibold">Write & Share</h3>
          <p className="text-muted-foreground">
            Create beautiful blog posts and share your thoughts with the world.
          </p>
        </Card>
        <Card className="p-6 space-y-2">
          <Users className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-semibold">Connect</h3>
          <p className="text-muted-foreground">
            Join a community of writers and readers who share your interests.
          </p>
        </Card>
        <Card className="p-6 space-y-2">
          <MessageSquare className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-semibold">Engage</h3>
          <p className="text-muted-foreground">
            Like, comment, and discuss posts with other community members.
          </p>
        </Card>
      </div>
    </div>
  )
}