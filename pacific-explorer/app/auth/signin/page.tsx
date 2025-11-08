"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import BirdOfParadise from "@/components/BirdOfParadise"

export default function SignIn() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const activated = params.get('activated');
    const reset = params.get('reset');
    if (activated === 'true') {
      setTimeout(() => setSuccessMessage("Account activated successfully! You can now sign in."), 0);
    } else if (reset === 'success') {
      setTimeout(() => setSuccessMessage("Password reset successfully! You can now sign in with your new password."), 0);
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error signing in:", error)
      setError("An error occurred during sign in")
      setIsLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-linear-to-br from-ocean-400 via-ocean-500 to-ocean-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BirdOfParadise className="w-16 h-16" animated />
              <h1 className="text-4xl font-bold text-white">
                Pacific <span className="text-png-yellow">Explorer</span>
              </h1>
            </div>
          </Link>
          <p className="text-ocean-100 text-lg">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all"
                placeholder="Your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-png-red hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-ocean-600 hover:text-ocean-700 font-medium">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-ocean-600 hover:text-ocean-700 font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white hover:text-png-yellow transition-colors font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
