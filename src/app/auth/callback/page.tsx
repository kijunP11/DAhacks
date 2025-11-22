'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // URL에서 auth code 처리 (Supabase가 자동으로 세션 설정)
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      로그인 처리 중...
    </div>
  )
}
