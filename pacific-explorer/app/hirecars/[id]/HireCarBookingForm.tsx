'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, CreditCard } from 'lucide-react';

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

interface HireCarBookingFormProps {
  hireCar: HireCar;
}

export default function HireCarBookingForm({ hireCar }: HireCarBookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    returnLocation: '',
    specialRequests: '',
  });

  const calculateTotal = () => {
    if (!formData.pickupDate || !formData.returnDate || !hireCar.pricePerDay) {
      return 0;
    }

    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays * hireCar.pricePerDay;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate total amount
      const totalAmount = calculateTotal();

      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'hire_car',
          hireCarId: hireCar.id,
          pickupDate: formData.pickupDate,
          returnDate: formData.returnDate,
          pickupLocation: formData.pickupLocation,
          returnLocation: formData.returnLocation,
          specialRequests: formData.specialRequests,
          totalAmount,
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // Redirect to payment page
      router.push(`/hirecars/${hireCar.id}/payment?payment_intent=${data.paymentIntentId}&hireCarBookingId=${data.hireCarBookingId}`);

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
        <h2 className="text-2xl font-bold text-gray-900">Book This Car</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Date */}
        <div>
          <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="pickupDate"
              value={formData.pickupDate}
              onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Return Date */}
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
            Return Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="returnDate"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              min={formData.pickupDate || new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="pickupLocation"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="Enter pickup location"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Return Location */}
        <div>
          <label htmlFor="returnLocation" className="block text-sm font-medium text-gray-700 mb-2">
            Return Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="returnLocation"
              value={formData.returnLocation}
              onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
              placeholder="Enter return location"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
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
            <div className="flex justify-between text-sm">
              <span>Daily Rate:</span>
              <span>${hireCar.pricePerDay}/day</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Number of Days:</span>
              <span>
                {Math.ceil(
                  Math.abs(
                    new Date(formData.returnDate).getTime() - new Date(formData.pickupDate).getTime()
                  ) / (1000 * 60 * 60 * 24)
                )}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
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
