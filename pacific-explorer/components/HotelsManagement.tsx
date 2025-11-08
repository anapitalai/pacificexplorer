'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

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

export default function HotelsManagement() {
  const { data: session } = useSession();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'featured'>('all');

  const [formData, setFormData] = useState({
    name: '',
    province: '',
    city: '',
    latitude: '',
    longitude: '',
    address: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    starRating: '',
    roomCount: '',
    priceRange: 'Moderate',
    amenities: [] as string[],
    featuredImage: '',
    verified: false,
    featured: false,
    active: true,
  });

  // ensure fetchHotels is stable so it can be used in deps
  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/hotels';
      if (filter === 'featured') url += '?featured=true';
      if (filter === 'active') url += '?active=true';

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setHotels(data.hotels);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingHotel ? `/api/hotels/${editingHotel.id}` : '/api/hotels';
      const method = editingHotel ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingHotel ? 'Hotel updated successfully!' : 'Hotel created successfully!');
        setShowForm(false);
        setEditingHotel(null);
        resetForm();
        fetchHotels();
      } else {
        alert(data.error || 'Failed to save hotel');
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('Failed to save hotel');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      province: hotel.province,
      city: hotel.city || '',
      latitude: hotel.latitude.toString(),
      longitude: hotel.longitude.toString(),
      address: hotel.address || '',
      description: hotel.description || '',
      website: hotel.website || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      starRating: hotel.starRating?.toString() || '',
      roomCount: hotel.roomCount?.toString() || '',
      priceRange: hotel.priceRange || 'Moderate',
      amenities: hotel.amenities || [],
      featuredImage: hotel.featuredImage || '',
      verified: hotel.verified,
      featured: hotel.featured,
      active: hotel.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const response = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Hotel deleted successfully!');
        fetchHotels();
      } else {
        alert(data.error || 'Failed to delete hotel');
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  const toggleFeatured = async (hotel: Hotel) => {
    try {
      const response = await fetch(`/api/hotels/${hotel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !hotel.featured }),
      });

      if (response.ok) {
        fetchHotels();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const toggleActive = async (hotel: Hotel) => {
    try {
      const response = await fetch(`/api/hotels/${hotel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !hotel.active }),
      });

      if (response.ok) {
        fetchHotels();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      province: '',
      city: '',
      latitude: '',
      longitude: '',
      address: '',
      description: '',
      website: '',
      phone: '',
      email: '',
      starRating: '',
      roomCount: '',
      priceRange: 'Moderate',
      amenities: [],
      featuredImage: '',
      verified: false,
      featured: false,
      active: true,
    });
  };

  const amenitiesList = ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Gym', 'Bar', 'Parking', 'Room Service', 'Airport Shuttle', 'Conference Room'];

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotels Management</h2>
          <p className="text-gray-600 mt-1">Manage hotels and accommodations across PNG</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingHotel(null);
            resetForm();
          }}
          className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
        >
          + Add Hotel
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-ocean-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Hotels ({hotels.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-ocean-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('featured')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'featured'
              ? 'bg-ocean-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Featured
        </button>
      </div>

      {/* Hotel Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  >
                    <option value="">Select Province</option>
                    <option value="Central">Central</option>
                    <option value="Western">Western</option>
                    <option value="Eastern Highlands">Eastern Highlands</option>
                    <option value="Western Highlands">Western Highlands</option>
                    <option value="Morobe">Morobe</option>
                    <option value="East New Britain">East New Britain</option>
                    <option value="West New Britain">West New Britain</option>
                    <option value="Manus">Manus</option>
                    <option value="Madang">Madang</option>
                    <option value="Milne Bay">Milne Bay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City/Town
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Star Rating
                  </label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData({ ...formData, starRating: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  >
                    <option value="">Not Rated</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Count
                  </label>
                  <input
                    type="number"
                    value={formData.roomCount}
                    onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={formData.priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  >
                    <option value="Budget">Budget ($ - Under 200 PGK)</option>
                    <option value="Moderate">Moderate ($$ - 200-500 PGK)</option>
                    <option value="Upscale">Upscale ($$$ - 500-1000 PGK)</option>
                    <option value="Luxury">Luxury ($$$$ - Over 1000 PGK)</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>

              {/* Address & Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 text-ocean-500 rounded focus:ring-ocean-500"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-5 h-5 text-ocean-500 rounded focus:ring-ocean-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-ocean-500 rounded focus:ring-ocean-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-ocean-500 rounded focus:ring-ocean-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHotel(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hotels Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating & Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-lg font-medium">No hotels found</p>
                      <p className="text-sm mt-1">Get started by adding your first hotel</p>
                    </div>
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">
                          {hotel.osmType && <span className="capitalize">{hotel.osmType}</span>}
                          {hotel.roomCount && <span> • {hotel.roomCount} rooms</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{hotel.city || hotel.province}</div>
                        <div className="text-gray-500">{hotel.province}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {hotel.starRating && (
                          <div className="flex items-center text-yellow-400 mb-1">
                            {'★'.repeat(hotel.starRating)}
                            {'☆'.repeat(5 - hotel.starRating)}
                          </div>
                        )}
                        {hotel.priceRange && (
                          <span className="text-gray-600">{hotel.priceRange}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {hotel.active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {hotel.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        {hotel.verified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(hotel)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleFeatured(hotel)}
                          className="text-yellow-600 hover:text-yellow-900 font-medium"
                        >
                          {hotel.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => toggleActive(hotel)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          {hotel.active ? 'Deactivate' : 'Activate'}
                        </button>
                        {session?.user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(hotel.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-ocean-600">{hotels.length}</div>
          <div className="text-sm text-gray-600">Total Hotels</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {hotels.filter(h => h.active).length}
          </div>
          <div className="text-sm text-gray-600">Active Hotels</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {hotels.filter(h => h.featured).length}
          </div>
          <div className="text-sm text-gray-600">Featured</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {hotels.filter(h => h.verified).length}
          </div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
      </div>
    </div>
  );
}
