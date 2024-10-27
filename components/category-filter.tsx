"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  "All",
  "Technology",
  "Lifestyle",
  "Travel",
  "Food",
  "Health",
  "Business",
  "Art",
]

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              selected === category && "bg-secondary"
            )}
            onClick={() => onSelect(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </Card>
  )
}