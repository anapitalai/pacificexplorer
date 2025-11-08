import Link from "next/link";
import BirdOfParadise from "@/components/BirdOfParadise";

export default function AboutPage() {
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
                Explore
              </Link>
              <Link href="/discover" className="text-gray-600 hover:text-png-red transition-colors">
                Discover
              </Link>
              <Link href="/about" className="text-png-red font-semibold">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-png-red via-ocean-500 to-paradise-green text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About Pacific Explorer
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Discovering Papua New Guinea through the eyes of satellites and the hearts of explorers
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-png-black mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Pacific Explorer is Papua New Guinea&apos;s comprehensive tourism ecosystem, combining cutting-edge
                satellite technology with a complete booking platform that empowers both travelers and local businesses.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We leverage ESA&apos;s Copernicus Sentinel satellites to provide real-time environmental insights while
                offering a full-service booking system with integrated payments, commission management, and business tools
                for hotel owners, destination managers, and transportation providers.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our platform promotes sustainable tourism, supports local economies through fair commission structures,
                and uses space technology to protect PNG&apos;s precious natural resources.
              </p>
            </div>
            <div className="bg-gradient-to-br from-ocean-500 to-paradise-green rounded-2xl shadow-2xl p-8 text-white">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <svg className="w-8 h-8 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Satellite-Powered Discovery</h3>
                    <p className="text-white/90">
                      Real-time Sentinel-1, Sentinel-2, and Sentinel-3 satellite imagery for environmental monitoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <svg className="w-8 h-8 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Complete Booking Platform</h3>
                    <p className="text-white/90">
                      Integrated payments, commission tracking, and business management tools
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <svg className="w-8 h-8 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Multi-Stakeholder Platform</h3>
                    <p className="text-white/90">
                      Tourists, hotel owners, destination managers, and administrators united
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-png-black mb-12 text-center">
            Comprehensive Tourism Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-png-red">
              <div className="w-16 h-16 bg-png-red/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-png-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-png-black mb-4">Multi-Role User System</h3>
              <p className="text-gray-700 leading-relaxed">
                Complete user management with roles for tourists, hotel owners, destination managers,
                hire car operators, and administrators. Each role has tailored dashboards and permissions.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-ocean-500">
              <div className="w-16 h-16 bg-ocean-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-png-black mb-4">Integrated Booking System</h3>
              <p className="text-gray-700 leading-relaxed">
                Full booking platform with Stripe payment integration, automated commission tracking,
                and business owner payouts. Supports destination bookings with real-time availability.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-paradise-green">
              <div className="w-16 h-16 bg-paradise-green/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-paradise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-png-black mb-4">Business Management Tools</h3>
              <p className="text-gray-700 leading-relaxed">
                Comprehensive tools for hotel owners, destination managers, and transportation providers
                including listing management, booking tracking, commission monitoring, and analytics.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-png-black mb-12 text-center">
            Powered by Advanced Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-png-red">
              <div className="w-16 h-16 bg-png-red/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-png-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-png-black mb-4">Copernicus Sentinel-2</h3>
              <p className="text-gray-700 leading-relaxed">
                High-resolution optical imagery with 10m resolution and 13 spectral bands for detailed
                land monitoring, vegetation analysis, and coastal observation.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-ocean-500">
              <div className="w-16 h-16 bg-ocean-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-png-black mb-4">Copernicus Sentinel-1</h3>
              <p className="text-gray-700 leading-relaxed">
                All-weather, day and night radar imaging that penetrates clouds to monitor land
                deformation, track vessels, and observe ocean conditions regardless of weather.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-paradise-green">
              <div className="w-16 h-16 bg-paradise-green/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-paradise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-png-black mb-4">Copernicus Sentinel-3</h3>
              <p className="text-gray-700 leading-relaxed">
                Ocean and land monitoring including sea surface temperature, ocean color, and vegetation
                indices for comprehensive environmental analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-png-black mb-12 text-center">
            What Makes Us Special
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">�</div>
              <h3 className="text-xl font-bold text-png-black mb-2">Integrated Payments</h3>
              <p className="text-gray-600">
                Secure Stripe payments with automated commission tracking and business owner payouts
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">�</div>
              <h3 className="text-xl font-bold text-png-black mb-2">Business Management</h3>
              <p className="text-gray-600">
                Complete tools for hotel owners, destination managers, and transportation providers
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-png-black mb-2">Admin Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive admin panel for user management, content moderation, and analytics
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">�</div>
              <h3 className="text-xl font-bold text-png-black mb-2">Messaging System</h3>
              <p className="text-gray-600">
                Built-in messaging for user-to-user communication and customer support
              </p>
            </div>
          </div>
        </section>

        {/* Papua New Guinea Section */}
        <section className="mb-20 bg-gradient-to-r from-png-red/5 via-ocean-500/5 to-paradise-green/5 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-png-black mb-6 text-center">
            About Papua New Guinea
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Papua New Guinea (PNG) is a country of extraordinary diversity located in the southwestern Pacific Ocean. 
              With over 600 islands, PNG encompasses a vast array of ecosystems ranging from pristine coral reefs and 
              coastal mangroves to cloud-shrouded mountain ranges exceeding 4,000 meters.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              The nation is home to over 800 indigenous languages, making it the most linguistically diverse country 
              on Earth. Its cultural heritage spans thousands of years, with traditions that remain vibrant and deeply 
              connected to the land and sea.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-png-red mb-2">600+</div>
                <p className="text-gray-700 font-medium">Islands & Atolls</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-ocean-500 mb-2">800+</div>
                <p className="text-gray-700 font-medium">Indigenous Languages</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-paradise-green mb-2">21</div>
                <p className="text-gray-700 font-medium">Provinces</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-png-black mb-12 text-center">
            Built for the Cassini Hackathon 2025
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Pacific Explorer evolved from a satellite exploration tool into Papua New Guinea&apos;s comprehensive
              tourism ecosystem during the Cassini Hackathon. Our platform demonstrates how space technology can
              power real-world business solutions while supporting sustainable tourism and local economic development.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-png-red to-ocean-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-800">ESA Copernicus</p>
                <p className="text-sm text-gray-600">Satellite Data Provider</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-paradise-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-800">Multi-Stakeholder Platform</p>
                <p className="text-sm text-gray-600">Tourists & Businesses</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-paradise-green to-png-yellow rounded-full flex items-center justify-center mx-auto mb-3">
                  <BirdOfParadise className="w-12 h-12 text-white" />
                </div>
                <p className="font-semibold text-gray-800">Pacific Explorer</p>
                <p className="text-sm text-gray-600">Tourism Ecosystem</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-png-red to-ocean-500 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Explore Papua New Guinea?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Discover hidden treasures, pristine landscapes, and vibrant cultures through the power of satellite technology
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/explore"
              className="px-8 py-4 bg-white text-png-red rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Exploring
            </Link>
            <Link
              href="/discover"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Discover Features
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-png-black text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BirdOfParadise className="w-8 h-8" />
                <span className="font-bold text-xl">Pacific Explorer</span>
              </div>
              <p className="text-gray-400 text-sm">
                Discovering Papua New Guinea through satellite technology
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Explore</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/explore" className="hover:text-white transition-colors">Destinations</Link></li>
                <li><Link href="/discover" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Booking System</li>
                <li>Business Management</li>
                <li>Commission Tracking</li>
                <li>Admin Dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <p className="text-sm text-gray-400">
                Built for Cassini Hackathon 2025
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Powered by ESA Copernicus
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Pacific Explorer. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ for Papua New Guinea</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
