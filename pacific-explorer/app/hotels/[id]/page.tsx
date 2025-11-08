import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import BirdOfParadise from "@/components/BirdOfParadise";
import HotelBookingForm from "./HotelBookingForm";
import { MapPin, Star, Wifi, Car, Utensils, Dumbbell, Phone, Mail, Globe, Calendar, Users } from 'lucide-react';

interface HotelDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function HotelDetailPage({
  params,
}: HotelDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const hotelId = parseInt(resolvedParams.id);

  if (isNaN(hotelId)) {
    redirect("/hotels");
  }

  // Fetch hotel details
  const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3005');
  const response = await fetch(`${baseUrl}/api/hotels/${hotelId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect("/hotels");
  }

  const data = await response.json();
  const hotel = data.hotel;

  if (!hotel) {
    redirect("/hotels");
  }

  const getPriceRangeSymbol = (priceRange: string | null) => {
    switch (priceRange) {
      case 'Budget': return '$';
      case 'Moderate': return '$$';
      case 'Upscale': return '$$$';
      case 'Luxury': return '$$$$';
      default: return '$$';
    }
  };

  const getPriceRangeColor = (priceRange: string | null) => {
    switch (priceRange) {
      case 'Budget': return 'text-green-600';
      case 'Moderate': return 'text-blue-600';
      case 'Upscale': return 'text-purple-600';
      case 'Luxury': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderAmenities = (amenities: string[]) => {
    const amenityIcons: { [key: string]: React.ReactNode } = {
      'WiFi': <Wifi className="w-5 h-5" />,
      'Parking': <Car className="w-5 h-5" />,
      'Restaurant': <Utensils className="w-5 h-5" />,
      'Gym': <Dumbbell className="w-5 h-5" />,
    };

    return amenities.map(amenity => (
      <div key={amenity} className="flex items-center space-x-2 text-gray-700">
        {amenityIcons[amenity] || <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-sm">✓</span>}
        <span>{amenity}</span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/hotels" className="text-gray-700 hover:text-blue-600">
                Hotels
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{hotel.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-96 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl overflow-hidden">
              {hotel.featuredImage ? (
                <Image
                  src={hotel.featuredImage}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <div className="text-white text-4xl">🏨</div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {hotel.featured && (
                  <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
                {hotel.verified && (
                  <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Verified
                  </span>
                )}
                <span className={`bg-white/90 text-sm px-3 py-1 rounded-full font-medium ${getPriceRangeColor(hotel.priceRange)}`}>
                  {getPriceRangeSymbol(hotel.priceRange)}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{hotel.city ? `${hotel.city}, ` : ''}{hotel.province}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {renderStars(hotel.starRating)}
                    {hotel.starRating && (
                      <span className="text-sm text-gray-600">{hotel.starRating} stars</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${getPriceRangeColor(hotel.priceRange)}`}>
                    {getPriceRangeSymbol(hotel.priceRange)}
                  </span>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {hotel.roomCount && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{hotel.roomCount}</span>
                    </div>
                    <span className="text-gray-700">rooms</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Check-in/out available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Family friendly</span>
                </div>
              </div>

              {/* Description */}
              {hotel.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                </div>
              )}

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Amenities & Facilities</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {renderAmenities(hotel.amenities)}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(hotel.phone || hotel.email || hotel.website) && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {hotel.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{hotel.email}</span>
                      </div>
                    )}
                    {hotel.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <a
                          href={hotel.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {hotel.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {hotel.images && hotel.images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {hotel.images.slice(1).map((image: string, index: number) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${hotel.name} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <HotelBookingForm hotel={hotel} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
