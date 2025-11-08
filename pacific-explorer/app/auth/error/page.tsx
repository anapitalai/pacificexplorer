import Link from "next/link"
import BirdOfParadise from "@/components/BirdOfParadise"

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <BirdOfParadise className="w-24 h-24" />
        </div>
        
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-png-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-png-black mb-4">Authentication Error</h2>
        
        <p className="text-gray-600 mb-6">
          There was a problem signing you in. This could be because:
        </p>

        <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
          <li className="flex items-start">
            <span className="text-png-red mr-2">•</span>
            The link has expired (links are valid for 24 hours)
          </li>
          <li className="flex items-start">
            <span className="text-png-red mr-2">•</span>
            The link has already been used
          </li>
          <li className="flex items-start">
            <span className="text-png-red mr-2">•</span>
            There was a technical issue
          </li>
        </ul>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block px-8 py-3 bg-png-red hover:bg-opacity-90 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="block text-ocean-600 hover:text-ocean-700 font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
