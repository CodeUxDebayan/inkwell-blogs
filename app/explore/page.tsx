"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BlogList } from "@/components/blog-list"
import { CategoryFilter } from "@/components/category-filter"

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-64">
          <CategoryFilter 
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </div>
        <div className="flex-1 space-y-6">
          <Input
            placeholder="Search posts..."
            className="max-w-xl"
          />
          <BlogList selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  )
}