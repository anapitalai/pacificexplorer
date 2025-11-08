"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import BirdOfParadise from "./BirdOfParadise";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <BirdOfParadise className="w-12 h-12" />
            <span className="text-2xl font-bold text-png-black">
              Pacific <span className="text-png-red">Explorer</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Show navigation links only when user is NOT logged in */}
            {!session?.user && (
              <>
                <Link
                  href="/explore"
                  className="text-gray-600 hover:text-png-red transition-colors font-medium"
                >
                  Explore
                </Link>
                {/* <Link
                  href="/discover"
                  className="text-gray-600 hover:text-png-red transition-colors font-medium flex items-center space-x-1"
                >
                  <span>🛰️</span>
                  <span>Discover</span>
                </Link> */}
                {/* <Link
                  href="/destinations"
                  className="text-gray-600 hover:text-png-red transition-colors font-medium"
                >
                  Destinations
                </Link> */}
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-png-red transition-colors font-medium"
                >
                  About
                </Link>
                <Link
                  href="/contacts"
                  className="text-gray-600 hover:text-png-red transition-colors font-medium"
                >
                  Contact
                </Link>
              </>
            )}

            {/* Auth Section */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-png-red transition-colors font-medium"
                >
                  Dashboard
                </Link>
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-linear-to-br from-png-red to-png-yellow rounded-full flex items-center justify-center text-white font-bold">
                      {session.user.email?.[0].toUpperCase()}
                    </div>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {session.user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {session.user.role?.toLowerCase() || 'tourist'}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Profile Settings
                      </Link>
                      <Link
                        href="/saved"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Saved Places
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="block w-full text-left px-4 py-2 text-sm text-png-red hover:bg-gray-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-png-red transition-colors font-medium"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-3">
              {/* Show navigation links only when user is NOT logged in */}
              {!session?.user && (
                <>
                  <Link
                    href="/explore"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Explore
                  </Link>
                  <Link
                    href="/discover"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2 flex items-center space-x-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🛰️</span>
                    <span>Satellite Discover</span>
                  </Link>
                  <Link
                    href="/destinations"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Destinations
                  </Link>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contacts"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
              
              {session?.user ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm font-medium text-gray-800 mb-3">
                      {session.user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-png-red transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-png-red font-medium py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Link
                    href="/auth/signin"
                    className="block text-center px-4 py-2 border-2 border-png-red text-png-red rounded-lg hover:bg-png-red hover:text-white transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
