'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, DollarSign, Car, Shield, Navigation } from 'lucide-react';

interface HireCar {
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
  vehicleType: string | null;
  passengerCapacity: number | null;
  pricePerDay: number | null;
  priceRange: string | null;
  features: string[];
  images: string[];
  featuredImage: string | null;
  verified: boolean;
  featured: boolean;
  active: boolean;
  ownerId: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface HireCarCardProps {
  hireCar: HireCar;
}

export default function HireCarCard({ hireCar }: HireCarCardProps) {
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
      'AC': <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-xs">❄️</div>,
      'GPS': <Navigation className="w-4 h-4" />,
      'Insurance': <Shield className="w-4 h-4" />,
      '24/7 Support': <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-xs">24</div>,
      'Airport Pickup': <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center text-xs">✈️</div>,
    };

    return features.slice(0, 3).map(feature => (
      <div key={feature} className="flex items-center text-gray-500 text-xs">
        {featureIcons[feature] || <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs">✓</span>}
        <span className="ml-1">{feature}</span>
      </div>
    ));
  };

  return (
    <Link href={`/hirecars/${hireCar.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-linear-to-br from-gray-400 to-gray-600">
          {hireCar.featuredImage ? (
            <Image
              src={hireCar.featuredImage}
              alt={hireCar.name}
              fill
              className="object-cover"
            />
          ) : null}
          <div className={`w-full h-full ${hireCar.featuredImage ? 'hidden image-fallback' : 'flex'} items-center justify-center`}>
            <Car className="w-16 h-16 text-white" />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {hireCar.featured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            {hireCar.verified && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            )}
          </div>

          {/* Price Range */}
          <div className="absolute top-3 right-3">
            <span className={`bg-white/90 text-xs px-2 py-1 rounded-full font-medium ${getPriceRangeColor(hireCar.priceRange)}`}>
              {getPriceRangeSymbol(hireCar.priceRange)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-ocean-600 transition-colors">
              {hireCar.name}
            </h3>
            {hireCar.vehicleType && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {hireCar.vehicleType}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {hireCar.city ? `${hireCar.city}, ` : ''}{hireCar.province}
            </span>
          </div>

          {/* Capacity and Price */}
          <div className="flex items-center justify-between mb-3">
            {hireCar.passengerCapacity && (
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">{hireCar.passengerCapacity} passengers</span>
              </div>
            )}
            {hireCar.pricePerDay && (
              <div className="flex items-center text-ocean-600 font-semibold">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm">{hireCar.pricePerDay}/day</span>
              </div>
            )}
          </div>

          {/* Description */}
          {hireCar.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {hireCar.description}
            </p>
          )}

          {/* Features */}
          {hireCar.features && hireCar.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {renderFeatures(hireCar.features)}
              {hireCar.features.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{hireCar.features.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hireCar.owner?.name && `By ${hireCar.owner.name}`}
            </div>
            <div className="text-ocean-600 font-semibold text-sm group-hover:text-ocean-700 transition-colors">
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
