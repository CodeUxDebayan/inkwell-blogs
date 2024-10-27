// app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClientComponentClient()
    
    const code = new URL(window.location.href).searchParams.get('code')
    
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(() => {
          router.push('/')
        })
    }
  }, [router])

  return null
}