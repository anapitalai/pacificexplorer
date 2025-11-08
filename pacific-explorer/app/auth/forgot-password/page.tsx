'use client';

import { useState } from 'react';
import Link from 'next/link';
import BirdOfParadise from '@/components/BirdOfParadise';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
    console.error(err);
    setError('An error occurred. Please try again.');
    setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-700 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <BirdOfParadise className="w-24 h-24" animated />
          </div>
            <h2 className="text-3xl font-bold text-png-black mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The link will expire in 1 hour. If you don&apos;t receive the email, check your spam folder.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-png-red text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-700 flex items-center justify-center px-4">
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
          <p className="text-ocean-100 text-lg">Reset your password</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-png-black mb-2">Forgot Password?</h2>
            <p className="text-gray-600 text-sm">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                disabled={isLoading}
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
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-ocean-600 hover:text-ocean-700 font-medium text-sm">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
