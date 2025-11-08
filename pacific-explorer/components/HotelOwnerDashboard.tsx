"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MessageInbox from "@/components/messaging/MessageInbox";

interface Hotel {
  id: number;
  name: string;
  province: string;
  city: string | null;
  active: boolean;
  verified: boolean;
  featured: boolean;
  starRating: number | null;
  priceRange: string | null;
}

interface HotelOwnerDashboardProps {
  hotels: Hotel[];
}

export default function HotelOwnerDashboard({ hotels }: HotelOwnerDashboardProps) {
  const { data: session } = useSession();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const getStatusColor = (hotel: Hotel) => {
    if (!hotel.active) return "bg-gray-100 text-gray-800";
    if (hotel.verified && hotel.featured) return "bg-green-100 text-green-800";
    if (hotel.verified) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (hotel: Hotel) => {
    if (!hotel.active) return "Inactive";
    if (hotel.verified && hotel.featured) return "Verified & Featured";
    if (hotel.verified) return "Verified";
    return "Pending Verification";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-png-black mb-4">
          Welcome back, {session?.user?.name || "Hotel Owner"}! 🏨
        </h1>
        <p className="text-lg text-gray-600">
          Manage your hotels and connect with tourists
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{hotels.length}</p>
              <p className="text-gray-600">Total Hotels</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{hotels.filter(h => h.verified).length}</p>
              <p className="text-gray-600">Verified</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783-.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{hotels.filter(h => h.featured).length}</p>
              <p className="text-gray-600">Featured</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">New Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white rounded-2xl shadow-lg">
        <MessageInbox />
      </div>

      {/* Hotels Management */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-png-black">Your Hotels</h2>
          <button className="px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Hotel</span>
          </button>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first hotel to connect with tourists</p>
            <button className="px-6 py-3 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600">
              Add Your First Hotel
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedHotel(hotel)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{hotel.name}</h3>
                    <p className="text-gray-600 text-sm">{hotel.city}, {hotel.province}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel)}`}>
                    {getStatusText(hotel)}
                  </span>
                </div>

                <div className="space-y-2">
                  {hotel.starRating && (
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{hotel.starRating} stars</span>
                    </div>
                  )}

                  {hotel.priceRange && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price Range:</span> {hotel.priceRange}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-ocean-500 text-white text-sm rounded hover:bg-ocean-600">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Detail Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedHotel.name}</h3>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location</span>
                    <p className="text-gray-900">{selectedHotel.city}, {selectedHotel.province}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedHotel)}`}>
                      {getStatusText(selectedHotel)}
                    </span>
                  </div>
                  {selectedHotel.starRating && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Rating</span>
                      <div className="flex items-center space-x-1 mt-1">
                        {Array.from({ length: selectedHotel.starRating }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedHotel.priceRange && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Price Range</span>
                      <p className="text-gray-900">{selectedHotel.priceRange}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button className="flex-1 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600">
                  Edit Hotel
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Bookings
                </button>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
