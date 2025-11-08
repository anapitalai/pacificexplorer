import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import BirdOfParadise from "@/components/BirdOfParadise";
import HotelCard from "@/components/HotelCard";

export default async function HotelsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // Fetch hotels from API
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/hotels?active=true`, {
    cache: 'no-store',
  });

  const data = await response.json();
  const hotels = data.hotels || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-ocean-50 via-white to-paradise-sand/20">
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
              <Link href="/dashboard" className="text-gray-600 hover:text-png-red transition-colors">
                Dashboard
              </Link>
              <Link href="/hotels" className="text-png-red font-semibold">
                Hotels
              </Link>
              <Link href="/hirecars" className="text-gray-600 hover:text-png-red transition-colors">
                Hire Cars
              </Link>
              <Link href="/api/auth/signout" className="px-4 py-2 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-png-black mb-4">
            Find Your Perfect Stay in PNG
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover comfortable and authentic accommodation options across Papua New Guinea,
            from luxury resorts to traditional guesthouses.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="province" className="font-medium text-gray-700">Province:</label>
              <select id="province" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent">
                <option value="">All Provinces</option>
                <option value="Central">Central</option>
                <option value="Western">Western</option>
                <option value="Eastern Highlands">Eastern Highlands</option>
                <option value="Madang">Madang</option>
                <option value="Morobe">Morobe</option>
                <option value="New Ireland">New Ireland</option>
                <option value="West New Britain">West New Britain</option>
                <option value="East New Britain">East New Britain</option>
                <option value="West Sepik">West Sepik</option>
                <option value="East Sepik">East Sepik</option>
                <option value="Enga">Enga</option>
                <option value="Gulf">Gulf</option>
                <option value="Hela">Hela</option>
                <option value="Jiwaka">Jiwaka</option>
                <option value="Milne Bay">Milne Bay</option>
                <option value="Oro">Oro</option>
                <option value="Southern Highlands">Southern Highlands</option>
                <option value="West Sepik">West Sepik</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="priceRange" className="font-medium text-gray-700">Price Range:</label>
              <select id="priceRange" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent">
                <option value="">Any Price</option>
                <option value="Budget">Budget ($)</option>
                <option value="Mid-range">Mid-range ($$)</option>
                <option value="Luxury">Luxury ($$$)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="starRating" className="font-medium text-gray-700">Stars:</label>
              <select id="starRating" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent">
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>

            <button className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="mb-12">
          {hotels.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel: {
                id: number;
                name: string;
                province: string;
                city: string | null;
                latitude: number;
                longitude: number;
                address: string | null;
                description: string | null;
                website: string | null;
                phone: string | null;
                email: string | null;
                starRating: number | null;
                roomCount: number | null;
                priceRange: string | null;
                amenities: string[];
                images: string[];
                featuredImage: string | null;
                osmId: string | null;
                osmType: string | null;
                verified: boolean;
                featured: boolean;
                active: boolean;
                destination: {
                  id: number;
                  name: string;
                  category: string;
                } | null;
                ownerId: string | null;
                owner: {
                  id: string;
                  name: string | null;
                  email: string | null;
                } | null;
                createdAt: string;
                updatedAt: string;
              }) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Hotels Found</h3>
              <p className="text-gray-600 mb-6">
                We&apos;re working on adding more accommodation options across PNG.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
              >
                Explore Destinations Instead
              </Link>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-linear-to-br from-png-red via-png-red/90 to-paradise-coral text-white rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
          <p className="text-xl mb-6 opacity-90">
            Help us expand our accommodation database by suggesting new hotels or guesthouses.
          </p>
          <Link
            href="/contacts"
            className="inline-block px-8 py-4 bg-white text-png-red font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </main>
    </div>
  );
}
