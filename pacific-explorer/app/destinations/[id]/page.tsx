import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BirdOfParadise from "@/components/BirdOfParadise";
import AdvancedSatelliteViewer from "@/components/AdvancedSatelliteViewer";
import BookingForm from "@/components/booking/BookingForm";

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
  });

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-paradise-sand/10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <BirdOfParadise className="w-12 h-12" />
              <span className="text-2xl font-bold text-png-black">
                Pacific <span className="text-png-red">Explorer</span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/explore" className="text-gray-600 hover:text-png-red transition-colors">
                ← Back to Explore
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Satellite Image Placeholder */}
      <section className="relative h-96 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${destination.image}`}>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Overlay Content */}
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-4 py-1 bg-white/90 text-gray-800 font-medium rounded-full">
                {destination.category}
              </span>
              <span className="px-4 py-1 bg-png-yellow text-png-black font-medium rounded-full">
                {destination.accessibility}
              </span>
              {destination.featured && (
                <span className="px-4 py-1 bg-png-red text-white font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              {destination.name}
            </h1>
            <p className="text-2xl text-white/90 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {destination.province}
            </p>
          </div>
        </div>

        {/* Satellite View Toggle */}
        <div className="absolute top-4 right-4">
          <button className="px-4 py-2 bg-white/90 hover:bg-white text-gray-800 font-medium rounded-lg shadow-lg flex items-center space-x-2 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>View Satellite Data</span>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-png-black mb-4">About this Destination</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {destination.longDescription}
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-png-black mb-6">Highlights</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {destination.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-paradise-green flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-png-black mb-6">Activities</h2>
              <div className="flex flex-wrap gap-3">
                {destination.activities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-ocean-100 text-ocean-700 rounded-full font-medium hover:bg-ocean-200 transition-colors cursor-pointer"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>

            {/* Advanced Satellite Data Section */}
            <div className="bg-gradient-to-br from-white to-ocean-50/30 rounded-2xl shadow-2xl p-8 border-2 border-ocean-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-png-black flex items-center">
                    <svg className="w-8 h-8 mr-3 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Advanced Satellite Analysis
                  </h2>
                  <p className="text-gray-600 mt-1 ml-11">Real-time environmental monitoring with Copernicus Sentinel</p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Data</span>
                </div>
              </div>
              
              {/* Advanced Satellite Viewer */}
              <div className="h-[700px] rounded-xl overflow-hidden border-4 border-ocean-200 shadow-xl">
                <AdvancedSatelliteViewer 
                  lat={destination.latitude}
                  lng={destination.longitude}
                  name={destination.name}
                  session={session}
                />
              </div>

              {/* Advanced Features Info */}
              <div className="mt-8 grid md:grid-cols-4 gap-4">
                <div className="p-5 bg-gradient-to-br from-png-red to-red-600 text-white rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="font-bold">Sentinel-2</h4>
                  </div>
                  <p className="text-sm text-white/90">10m optical imagery with 13 spectral bands</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="font-bold">Sentinel-1 SAR</h4>
                  </div>
                  <p className="text-sm text-white/90">All-weather radar imaging through clouds</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <h4 className="font-bold">NDVI Analysis</h4>
                  </div>
                  <p className="text-sm text-white/90">Vegetation health and ecosystem monitoring</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="font-bold">Sea Temperature</h4>
                  </div>
                  <p className="text-sm text-white/90">Ocean thermal monitoring from Sentinel-3</p>
                </div>
              </div>

              {/* Key Features */}
              <div className="mt-8 p-6 bg-gradient-to-r from-ocean-100 via-paradise-green/10 to-paradise-sky/10 rounded-xl border-2 border-ocean-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  <svg className="w-6 h-6 mr-2 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  ✨ Active Features - Available Now!
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Multi-Layer Switching</p>
                      <p className="text-sm text-gray-600">7 different satellite views</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Time Range Analysis</p>
                      <p className="text-sm text-gray-600">Compare data over time</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Live Environmental Data</p>
                      <p className="text-sm text-gray-600">Real-time NDVI, temperature, coral health</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Copernicus Integration</p>
                      <p className="text-sm text-gray-600">Sentinel-1, -2, -3 satellite layers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Advanced Controls</p>
                      <p className="text-sm text-gray-600">Toggle panels, time sliders, indicators</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Interactive Metrics</p>
                      <p className="text-sm text-gray-600">Cloud cover, vegetation, sea temp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-png-black mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Best Time to Visit</p>
                  <p className="text-gray-800 font-medium">{destination.bestTimeToVisit}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Difficulty Level</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 font-medium">{destination.accessibility}</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded ${
                            i === 0 && destination.accessibility === "Easy"
                              ? "bg-paradise-green"
                              : i <= 1 && destination.accessibility === "Moderate"
                              ? "bg-png-yellow"
                              : i <= 2 && destination.accessibility === "Difficult"
                              ? "bg-png-red"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="text-gray-800 font-medium">{destination.category}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-gray-800 font-medium">{destination.province}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button className="w-full px-4 py-3 bg-png-red text-white font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Save to Wishlist</span>
                </button>

                <Link
                  href={`/destinations/${id}/plan`}
                  className="w-full px-4 py-3 bg-ocean-500 text-white font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Plan a Visit</span>
                </Link>

                <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Booking Section - Sticky */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-png-black mb-4">Book Your Visit</h3>
              <BookingForm destination={destination} />
            </div>
          </div>
        </div>

        {/* Related Destinations */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-png-black mb-8">Similar Destinations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link
                key={i}
                href={`/destinations/${i}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                <div className={`h-48 bg-linear-to-br from-ocean-400 to-ocean-600`}></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-png-black group-hover:text-png-red transition-colors mb-2">
                    Explore More
                  </h3>
                  <p className="text-gray-600">Discover similar destinations</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
