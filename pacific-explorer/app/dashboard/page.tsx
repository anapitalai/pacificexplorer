import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import InteractiveMap from '@/components/InteractiveMap';
import BirdOfParadise from "@/components/BirdOfParadise";
import AdminDashboard from "@/components/AdminDashboard";
import HotelOwnerDashboard from "@/components/HotelOwnerDashboard";
import MessageInbox from "@/components/messaging/MessageInbox";
import TouristBookingsDashboard from "@/components/tourist/TouristBookingsDashboard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // Check user role
  const userRole = session.user.role as string;
  const isAdmin = userRole === 'ADMIN';
  const isHotelOwner = userRole === 'HOTEL_OWNER';
  const isHireCarOwner = userRole === 'HIRE_CAR_OWNER';
  const isDestinationOwner = userRole === 'DESTINATION_OWNER';

  // Fetch admin data if user is admin
  let adminData = null;
  if (isAdmin) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        province: true,
        category: true,
        featured: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalDestinations = destinations.length;
    const featuredDestinations = destinations.filter(d => d.featured).length;

    adminData = {
      users,
      destinations,
      stats: {
        totalUsers,
        activeUsers,
        totalDestinations,
        featuredDestinations,
      },
    };
  }

  // Fetch hotel owner data if user is hotel owner
  let hotelOwnerData = null;
  if (isHotelOwner) {
    const hotels = await prisma.hotel.findMany({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        name: true,
        province: true,
        city: true,
        active: true,
        verified: true,
        featured: true,
        starRating: true,
        priceRange: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    hotelOwnerData = { hotels };
  }

  // Fetch all destinations for regular users (TOURIST, HOTEL_OWNER)
  let touristDestinations = null;
  if (!isAdmin) {
    touristDestinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        province: true,
        category: true,
        description: true,
        image: true,
        featured: true,
  latitude: true,
  longitude: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
    });
  }

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
              {/* Hide Explore for ADMIN users */}
              {!isAdmin && (
                <Link href="/explore" className="text-gray-600 hover:text-png-red transition-colors">
                  Explore
                </Link>
              )}
              <Link href="/dashboard" className="text-png-red font-semibold">
                Dashboard
              </Link>
              {isAdmin && (
                <span className="px-3 py-1 bg-png-red text-white text-sm rounded-full font-semibold">
                  ADMIN
                </span>
              )}
              {isHotelOwner && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-semibold">
                  HOTEL OWNER
                </span>
              )}
              {isHireCarOwner && (
                <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full font-semibold">
                  HIRE CAR OWNER
                </span>
              )}
              {isDestinationOwner && (
                <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full font-semibold">
                  DESTINATION OWNER
                </span>
              )}
              <Link href="/api/auth/signout" className="px-4 py-2 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Show Admin Dashboard if user is admin */}
        {isAdmin && adminData && (
          <AdminDashboard
            users={adminData.users}
            destinations={adminData.destinations}
            stats={adminData.stats}
          />
        )}

        {/* Show Hotel Owner Dashboard if user is hotel owner */}
        {isHotelOwner && hotelOwnerData && (
          <HotelOwnerDashboard hotels={hotelOwnerData.hotels} />
        )}

        {/* Show Regular Dashboard for tourists and other roles */}
        {!isAdmin && !isHotelOwner && (<>
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-png-black mb-4">
            Welcome back, {session.user.name || session.user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your Pacific exploration hub
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-png-black mb-8">Explore by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Coastal */}
            <Link href="/dashboard/categories/Coastal" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 bg-linear-to-br from-ocean-400 to-ocean-600">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">Coastal</h3>
                    <p className="text-sm opacity-90">Beaches, reefs, marine life</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">Discover pristine beaches and coral reefs across PNG&apos;s coastline</p>
                </div>
              </div>
            </Link>

            {/* Inland */}
            <Link href="/dashboard/categories/Inland" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 bg-linear-to-br from-paradise-green to-paradise-green/80">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">Inland</h3>
                    <p className="text-sm opacity-90">Mountains, valleys, wildlife</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">Explore PNG&apos;s majestic mountains, valleys, and diverse wildlife</p>
                </div>
              </div>
            </Link>

            {/* Geothermal */}
            <Link href="/dashboard/categories/Geothermal" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 bg-linear-to-br from-png-red to-paradise-coral">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">Geothermal</h3>
                    <p className="text-sm opacity-90">Volcanoes, hot springs</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">Experience PNG&apos;s volcanic landscapes and geothermal wonders</p>
                </div>
              </div>
            </Link>

            {/* Cultural */}
            <Link href="/dashboard/categories/Cultural" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 bg-linear-to-br from-png-yellow to-png-yellow/80">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-png-black">
                    <h3 className="text-2xl font-bold mb-1">Cultural</h3>
                    <p className="text-sm opacity-90">Villages, festivals, history</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">Immerse yourself in PNG&apos;s rich cultural heritage and traditions</p>
                </div>
              </div>
            </Link>

            {/* Hotels */}
            <Link href="/hotels" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 bg-linear-to-br from-blue-500 to-blue-700">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">Hotels</h3>
                    <p className="text-sm opacity-90">Accommodation options</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">Find and book hotels across Papua New Guinea</p>
                </div>
              </div>
            </Link>

            {/* Hire Cars */}
            <Link href="/hirecars" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 bg-linear-to-br from-gray-600 to-gray-800">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">Hire Cars</h3>
                    <p className="text-sm opacity-90">Vehicle rentals</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">Rent cars and explore PNG at your own pace</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="mb-12">
          <TouristBookingsDashboard />
        </div>

        {/* Messages Section */}
        <div className="mb-12">
          <MessageInbox />
        </div>

        {/* Saved Destinations */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-png-black">Quick Stats</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-png-black">{touristDestinations?.length || 0}</p>
              <p className="text-gray-600">Total Destinations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-png-black">{touristDestinations?.filter(d => d.featured).length || 0}</p>
              <p className="text-gray-600">Featured Places</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-png-black">{touristDestinations ? new Set(touristDestinations.map(d => d.category)).size : 0}</p>
              <p className="text-gray-600">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-png-black">{touristDestinations ? new Set(touristDestinations.map(d => d.province)).size : 0}</p>
              <p className="text-gray-600">Provinces</p>
            </div>
          </div>
        </div>

        {/* Interactive map for tourists */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
          {/* Client component - render InteractiveMap with coordinates */}
          <div style={{ height: '400px' }}>
            {touristDestinations ? (
              <InteractiveMap destinations={touristDestinations.map(d => ({ id: d.id, name: d.name, coordinates: { lat: d.latitude, lng: d.longitude }, category: d.category, province: d.province }))} />
            ) : null}
          </div>
        </div>
        </>)}
      </main>
    </div>
  );
}
