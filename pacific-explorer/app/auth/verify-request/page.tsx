import Link from "next/link"
import BirdOfParadise from "@/components/BirdOfParadise"

export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <BirdOfParadise className="w-24 h-24" animated />
        </div>
        
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-paradise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-png-black mb-4">Check Your Email</h2>
        
        <p className="text-gray-600 mb-6">
          A sign in link has been sent to your email address.
        </p>
        
        <div className="bg-ocean-50 border-l-4 border-ocean-500 p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> The link will expire in 24 hours.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-png-red hover:bg-opacity-90 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
