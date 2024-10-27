"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"
import { Pen, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold">
              Inkwell
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/explore" className={`flex items-center space-x-1 ${pathname === '/explore' ? 'text-primary' : 'text-muted-foreground'}`}>
                <BookOpen className="w-4 h-4" />
                <span>Explore</span>
              </Link>
              {user && (
                <>
                  <Link href="/write" className={`flex items-center space-x-1 ${pathname === '/write' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Pen className="w-4 h-4" />
                    <span>Write</span>
                  </Link>
                  <Link href="/profile" className={`flex items-center space-x-1 ${pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <AuthButton />
          </div>
        </nav>
      </div>
    </header>
  )
}