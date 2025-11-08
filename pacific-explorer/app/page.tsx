import BirdOfParadise from "@/components/BirdOfParadise";
import Chatbot from "@/components/Chatbot";
import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section with PNG Colors */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-700">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32">
            <BirdOfParadise className="w-full h-full" animated />
          </div>
          <div className="absolute bottom-40 right-20 w-24 h-24">
            <BirdOfParadise className="w-full h-full" animated />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Bird of Paradise Hero */}
          <div className="mb-8 flex justify-center animate-fade-in">
            <BirdOfParadise className="w-48 h-48 md:w-64 md:h-64" animated />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
            Pacific <span className="text-png-yellow">Explorer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-ocean-50 mb-4 max-w-3xl mx-auto animate-slide-up">
            Discover the Hidden Wonders of Papua New Guinea
          </p>
          
          <p className="text-lg md:text-xl text-ocean-100 mb-12 max-w-2xl mx-auto animate-slide-up">
            Explore remote islands, pristine reefs, majestic mountains, and vibrant cultures—powered by space technology
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link 
              href="/explore" 
              className="px-8 py-4 bg-png-red hover:bg-opacity-90 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Exploring
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 bg-png-yellow hover:bg-opacity-90 text-png-black font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-png-black">
            Explore PNG Like Never Before
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Combining satellite data, local knowledge, and sustainable tourism for authentic Pacific experiences
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Satellite Imagery */}
            <div className="bg-gradient-to-br from-ocean-50 to-ocean-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-ocean-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-ocean-900">Satellite-Powered Discovery</h3>
              <p className="text-gray-700">
                View real-time Copernicus satellite imagery of destinations. See current conditions before you visit.
              </p>
            </div>

            {/* Feature 2: Hidden Destinations */}
            <div className="bg-gradient-to-br from-paradise-sand to-png-yellow/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-png-red rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-png-red">Hidden Gems</h3>
              <p className="text-gray-700">
                Discover remote beaches, pristine reefs, waterfalls, and cultural sites across all PNG provinces.
              </p>
            </div>

            {/* Feature 3: Sustainable Tourism */}
            <div className="bg-gradient-to-br from-paradise-green/20 to-paradise-sky/20 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-paradise-green rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-paradise-green">Eco-Conscious Travel</h3>
              <p className="text-gray-700">
                Monitor coral health and coastal conditions. Support environmental preservation through informed tourism.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-ocean-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-png-black">
            What Will You Discover?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Coastal */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-ocean-400 to-ocean-600"></div>
              <div className="relative p-8 h-64 flex flex-col justify-end text-white">
                <svg className="w-12 h-12 mb-4 group-hover:animate-float" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">Coastal</h3>
                <p className="text-ocean-100">Beaches, reefs, marine life, island resorts</p>
              </div>
            </div>

            {/* Inland */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-paradise-green to-paradise-green/80"></div>
              <div className="relative p-8 h-64 flex flex-col justify-end text-white">
                <svg className="w-12 h-12 mb-4 group-hover:animate-float" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">Inland</h3>
                <p className="text-green-100">Mountains, valleys, wildlife, waterfalls</p>
              </div>
            </div>

            {/* Geothermal */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-png-red to-paradise-coral"></div>
              <div className="relative p-8 h-64 flex flex-col justify-end text-white">
                <svg className="w-12 h-12 mb-4 group-hover:animate-float" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">Geothermal</h3>
                <p className="text-red-100">Volcanoes, hot springs, geysers</p>
              </div>
            </div>

            {/* Cultural */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-png-yellow to-png-yellow/80"></div>
              <div className="relative p-8 h-64 flex flex-col justify-end text-png-black">
                <svg className="w-12 h-12 mb-4 group-hover:animate-float" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">Cultural</h3>
                <p className="text-png-black/80">Villages, festivals, historical sites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-png-red via-png-red/90 to-paradise-coral">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <BirdOfParadise className="w-32 h-32" animated />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Explore Paradise?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join us in discovering and preserving PNG&apos;s natural and cultural treasures
          </p>
          <Link 
            href="/explore" 
            className="inline-block px-12 py-4 bg-png-yellow hover:bg-png-yellow/90 text-png-black font-bold text-lg rounded-lg shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-png-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-png-yellow">Pacific Explorer</h3>
              <p className="text-gray-400">
                Powered by Copernicus, Galileo, and IRIS² space technologies
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-png-yellow">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-png-yellow transition-colors">About</Link></li>
                <li><Link href="/destinations" className="hover:text-png-yellow transition-colors">Destinations</Link></li>
                <li><Link href="/contacts" className="hover:text-png-yellow transition-colors">Contact Us</Link></li>
                <li><Link href="/contribute" className="hover:text-png-yellow transition-colors">Contribute</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-png-yellow">Connect</h3>
              <p className="text-gray-400">
                Part of the Cassini Hackathon 2025<br />
                Beyond Horizons Challenge
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Pacific Explorer. Open Source. Built with ❤️ for Papua New Guinea.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
