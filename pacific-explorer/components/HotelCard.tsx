'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Wifi, Car, Utensils, Dumbbell } from 'lucide-react';

interface Hotel {
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
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
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
      'WiFi': <Wifi className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />,
      'Restaurant': <Utensils className="w-4 h-4" />,
      'Gym': <Dumbbell className="w-4 h-4" />,
    };

    return amenities.slice(0, 3).map(amenity => (
      <div key={amenity} className="flex items-center text-gray-500 text-xs">
        {amenityIcons[amenity] || <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs">✓</span>}
        <span className="ml-1">{amenity}</span>
      </div>
    ));
  };

  return (
    <Link href={`/hotels/${hotel.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-linear-to-br from-blue-400 to-blue-600">
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
          <div className="absolute top-3 left-3 flex gap-2">
            {hotel.featured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            {hotel.verified && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            )}
          </div>

          {/* Price Range */}
          <div className="absolute top-3 right-3">
            <span className={`bg-white/90 text-xs px-2 py-1 rounded-full font-medium ${getPriceRangeColor(hotel.priceRange)}`}>
              {getPriceRangeSymbol(hotel.priceRange)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-ocean-600 transition-colors">
              {hotel.name}
            </h3>
            {hotel.starRating && renderStars(hotel.starRating)}
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {hotel.city ? `${hotel.city}, ` : ''}{hotel.province}
            </span>
          </div>

          {/* Description */}
          {hotel.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {hotel.description}
            </p>
          )}

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {renderAmenities(hotel.amenities)}
              {hotel.amenities.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hotel.roomCount && `${hotel.roomCount} rooms`}
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
