import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import BirdOfParadise from "@/components/BirdOfParadise";
import HireCarBookingForm from "./HireCarBookingForm";
import { MapPin, Users, Car, Shield, Navigation, Phone, Mail, Globe, Calendar, Clock } from 'lucide-react';

interface HireCarDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function HireCarDetailPage({
  params,
}: HireCarDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const hireCarId = parseInt(resolvedParams.id);

  if (isNaN(hireCarId)) {
    redirect("/hirecars");
  }

  // Fetch hire car details
  const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3005');
  const response = await fetch(`${baseUrl}/api/hirecars/${hireCarId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect("/hirecars");
  }

  const data = await response.json();
  const hireCar = data.hireCar;

  if (!hireCar) {
    redirect("/hirecars");
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

  const renderFeatures = (features: string[]) => {
    const featureIcons: { [key: string]: React.ReactNode } = {
      'AC': <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-sm">❄️</div>,
      'GPS': <Navigation className="w-5 h-5" />,
      'Insurance': <Shield className="w-5 h-5" />,
      '24/7 Support': <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-sm">24</div>,
      'Airport Pickup': <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-sm">✈️</div>,
    };

    return features.map(feature => (
      <div key={feature} className="flex items-center space-x-2 text-gray-700">
        {featureIcons[feature] || <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-sm">✓</span>}
        <span>{feature}</span>
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
              <Link href="/hotels" className="text-gray-600 hover:text-png-red transition-colors">
                Hotels
              </Link>
              <Link href="/hirecars" className="text-png-red font-semibold">
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
              <Link href="/hirecars" className="text-gray-700 hover:text-blue-600">
                Hire Cars
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{hireCar.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-96 bg-linear-to-br from-gray-400 to-gray-600 rounded-2xl overflow-hidden">
              {hireCar.featuredImage ? (
                <Image
                  src={hireCar.featuredImage}
                  alt={hireCar.name}
                  fill
                  className="object-cover"
                />
              ) : null}
              <div className={`w-full h-full ${hireCar.featuredImage ? 'hidden image-fallback' : 'flex'} items-center justify-center`}>
                <Car className="w-24 h-24 text-white" />
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {hireCar.featured && (
                  <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
                {hireCar.verified && (
                  <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Verified
                  </span>
                )}
                <span className={`bg-white/90 text-sm px-3 py-1 rounded-full font-medium ${getPriceRangeColor(hireCar.priceRange)}`}>
                  {getPriceRangeSymbol(hireCar.priceRange)}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hireCar.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{hireCar.city ? `${hireCar.city}, ` : ''}{hireCar.province}</span>
                  </div>
                  {hireCar.vehicleType && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {hireCar.vehicleType}
                    </span>
                  )}
                </div>
                {hireCar.pricePerDay && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-ocean-600">
                      ${hireCar.pricePerDay}
                    </div>
                    <div className="text-sm text-gray-500">per day</div>
                  </div>
                )}
              </div>

              {/* Key Details */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {hireCar.passengerCapacity && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{hireCar.passengerCapacity} passengers</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Daily rental</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">24/7 available</span>
                </div>
              </div>

              {/* Description */}
              {hireCar.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{hireCar.description}</p>
                </div>
              )}

              {/* Features */}
              {hireCar.features && hireCar.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Features & Amenities</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {renderFeatures(hireCar.features)}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(hireCar.phone || hireCar.email || hireCar.website) && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {hireCar.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{hireCar.phone}</span>
                      </div>
                    )}
                    {hireCar.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{hireCar.email}</span>
                      </div>
                    )}
                    {hireCar.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <a
                          href={hireCar.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {hireCar.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {hireCar.images && hireCar.images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {hireCar.images.slice(1).map((image: string, index: number) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={image}
                        alt={`${hireCar.name} ${index + 2}`}
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
              <HireCarBookingForm hireCar={hireCar} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
