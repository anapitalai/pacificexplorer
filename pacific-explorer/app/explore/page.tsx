"use client";

import { useState } from "react";
import Link from "next/link";
import BirdOfParadise from "@/components/BirdOfParadise";
import InteractiveMap from "@/components/InteractiveMap";
import { destinations } from "@/lib/destinations";

const categories = ["All", "Coastal", "Inland", "Geothermal", "Cultural"];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDestinations = destinations.filter((dest) => {
    const matchesCategory = selectedCategory === "All" || dest.category === selectedCategory;
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.province.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-paradise-sand/10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <BirdOfParadise className="w-12 h-12" />
              <span className="text-2xl font-bold text-png-black">
                Pacific <span className="text-png-red">Explorer</span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/explore" className="text-png-red font-semibold">
                Explore
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-png-red transition-colors">
                Dashboard
              </Link>
              <Link href="/auth/signin" className="px-4 py-2 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean-500 to-ocean-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Papua New Guinea
          </h1>
          <p className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Discover hidden gems powered by satellite imagery and local insights
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search destinations, provinces, or activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-png-yellow"
              />
              <svg
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[73px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <span className="text-gray-600 font-medium whitespace-nowrap">Filter:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-png-red text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Found <span className="font-bold text-png-black">{filteredDestinations.length}</span> destinations
            {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
          </p>
        </div>

        {/* Destination Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <Link
              key={destination.id}
              href={`/destinations/${destination.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                {/* Image Placeholder */}
                <div className={`relative h-64 bg-gradient-to-br ${destination.image}`}>
                  {destination.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-png-yellow text-png-black font-bold text-sm rounded-full">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-all">
                      <svg className="w-5 h-5 text-gray-600 hover:text-png-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 text-gray-800 font-medium text-sm rounded-full">
                    {destination.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-png-black mb-2 group-hover:text-png-red transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {destination.province}
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {destination.description}
                  </p>

                  {/* View Satellite Button */}
                  <div className="mt-4 flex items-center text-ocean-600 group-hover:text-ocean-700 font-medium">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Satellite Data
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No destinations found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Map Section */}
      <section className="bg-gradient-to-br from-ocean-50 via-white to-paradise-sand/10 border-t border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-png-black mb-4">
              🗺️ Interactive Destination Map
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore all destinations on an interactive map powered by satellite imagery. 
              Click on markers to learn more about each location.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
            <div className="h-[600px]">
              <InteractiveMap destinations={destinations} />
            </div>
          </div>

          {/* Map Features */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Satellite Views</h3>
              <p className="text-sm text-gray-600">Toggle between street and satellite imagery to see destinations from space</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">8 Destinations</h3>
              <p className="text-sm text-gray-600">Discover unique locations across Papua New Guinea with GPS coordinates</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Interactive Markers</h3>
              <p className="text-sm text-gray-600">Click on color-coded markers to view details and explore each destination</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
