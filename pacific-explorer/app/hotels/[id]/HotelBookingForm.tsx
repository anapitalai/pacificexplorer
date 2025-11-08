'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CreditCard } from 'lucide-react';

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
  ownerId: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface HotelBookingFormProps {
  hotel: Hotel;
}

export default function HotelBookingForm({ hotel }: HotelBookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    rooms: 1,
    specialRequests: '',
  });

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      return 0;
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Estimate price based on price range (this is a simple estimation)
    let basePricePerNight = 100; // Default moderate price
    switch (hotel.priceRange) {
      case 'Budget': basePricePerNight = 50; break;
      case 'Moderate': basePricePerNight = 100; break;
      case 'Upscale': basePricePerNight = 200; break;
      case 'Luxury': basePricePerNight = 400; break;
    }

    return diffDays * basePricePerNight * formData.rooms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate total amount
      const totalAmount = calculateTotal();

      // Create hotel booking record
      const bookingResponse = await fetch('/api/hotel-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: hotel.id,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          guests: formData.guests,
          rooms: formData.rooms,
          specialRequests: formData.specialRequests,
          totalAmount,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || 'Failed to create hotel booking');
      }

      // Create payment intent for hotel booking
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'hotel',
          bookingId: bookingData.id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to create payment intent');
      }

      // Redirect to hotel payment page
      router.push(`/hotels/${hotel.id}/payment?payment_intent=${paymentData.paymentIntentId}&booking_id=${bookingData.id}`);

    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to initiate booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="w-6 h-6 text-ocean-600" />
        <h2 className="text-2xl font-bold text-gray-900">Book This Hotel</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Check-in Date */}
        <div>
          <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="checkInDate"
              value={formData.checkInDate}
              onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="checkOutDate"
              value={formData.checkOutDate}
              onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
              min={formData.checkInDate || new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              id="guests"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guest{i !== 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rooms */}
        <div>
          <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Rooms
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-sm font-semibold text-gray-600">
              🏨
            </div>
            <select
              id="rooms"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            >
              {[...Array(5)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Room{i !== 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            placeholder="Any special requirements or requests..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          />
        </div>

        {/* Price Summary */}
        {totalAmount > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-gray-600">
              Estimated total for {Math.ceil(Math.abs(new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500">
              Includes 10% platform fee (${(totalAmount * 0.1).toFixed(2)})
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || totalAmount === 0}
          className="w-full bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Book Now - $${totalAmount.toFixed(2)}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You will be redirected to secure payment processing.
        </p>
      </form>
    </div>
  );
}
