'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signInWithGoogle, signUp } from '@/auth/login'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      alert('Confirmation email sent! Please check your inbox.')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-lg rounded-[20px]">
        <div className="text-center">
          {/* Logo */}
          <h1 className="text-[#2E7D32] text-[36px] font-russo mb-2">
            WattGuard
          </h1>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-black font-inter">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 font-outfit">
            Analyze your bill and start saving today
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="relative block w-full rounded-[12px] border-0 p-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#2E7D32] sm:text-sm sm:leading-6 bg-gray-50"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-[12px] border-0 p-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#2E7D32] sm:text-sm sm:leading-6 bg-gray-50"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-[12px] bg-[#2E7D32] px-3 py-3 text-sm font-bold text-white hover:bg-[#1b5e20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32] disabled:opacity-50 transition-colors font-inter"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="group relative flex w-full justify-center rounded-[12px] bg-white px-3 py-3 text-sm font-bold text-[#2E7D32] ring-1 ring-inset ring-[#2E7D32] hover:bg-green-50 disabled:opacity-50 transition-colors font-inter"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 font-outfit">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full justify-center items-center gap-3 rounded-[12px] bg-white px-3 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors font-inter"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Continue with Google
        </button>
      </div>
    </div>
  )
}
