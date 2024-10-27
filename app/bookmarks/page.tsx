import { BlogList } from "@/components/blog-list"

export default function BookmarksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Bookmarks</h1>
      <BlogList />
    </div>
  )
}