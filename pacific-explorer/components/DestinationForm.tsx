'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InteractiveLocationPicker from './InteractiveLocationPicker';
import { useSession } from 'next-auth/react';

interface Destination {
  id: number;
  name: string;
  province: string;
  category: string;
  description: string;
  longDescription: string;
  latitude: number;
  longitude: number;
  image: string;
  featured: boolean;
  satelliteImageUrl: string | null;
  activities: string[];
  bestTimeToVisit: string;
  accessibility: string;
  highlights: string[];
}

interface DestinationFormProps {
  destination?: Destination;
  isEdit: boolean;
}

const PROVINCES = [
  'Central',
  'Chimbu',
  'Eastern Highlands',
  'East New Britain',
  'East Sepik',
  'Enga',
  'Gulf',
  'Hela',
  'Jiwaka',
  'Madang',
  'Manus',
  'Milne Bay',
  'Morobe',
  'National Capital District',
  'New Ireland',
  'Northern',
  'Southern Highlands',
  'Western',
  'Western Highlands',
  'West New Britain',
  'West Sepik',
];

const CATEGORIES = ['Coastal', 'Inland', 'Geothermal', 'Cultural'];
const ACCESSIBILITY_LEVELS = ['Easy', 'Moderate', 'Challenging', 'Expert'];

export default function DestinationForm({ destination, isEdit }: DestinationFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: destination?.name || '',
    province: destination?.province || '',
    category: destination?.category || 'Coastal',
    description: destination?.description || '',
    longDescription: destination?.longDescription || '',
    latitude: destination?.latitude || 0,
    longitude: destination?.longitude || 0,
    image: destination?.image || '',
    featured: destination?.featured || false,
    satelliteImageUrl: destination?.satelliteImageUrl || '',
    activities: destination?.activities?.join(', ') || '',
    bestTimeToVisit: destination?.bestTimeToVisit || '',
    accessibility: destination?.accessibility || 'Easy',
    highlights: destination?.highlights?.join(', ') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Convert comma-separated strings to arrays
      const activitiesArray = formData.activities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      
      const highlightsArray = formData.highlights
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      const payload = {
        name: formData.name,
        province: formData.province,
        category: formData.category,
        description: formData.description,
        longDescription: formData.longDescription,
        latitude: parseFloat(formData.latitude.toString()),
        longitude: parseFloat(formData.longitude.toString()),
        image: formData.image,
        featured: formData.featured,
        satelliteImageUrl: formData.satelliteImageUrl || null,
        activities: activitiesArray,
        bestTimeToVisit: formData.bestTimeToVisit,
        accessibility: formData.accessibility,
        highlights: highlightsArray,
      };

      const url = isEdit
        ? `/api/admin/destinations/${destination?.id}`
        : '/api/admin/destinations';
      
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save destination');
      }

  const savedDestination = await response.json();
  // Use savedDestination for debugging/telemetry briefly to avoid lint warnings
  console.log('Saved destination id:', savedDestination?.id ?? 'unknown');
      
  // Redirect to admin dashboard
  router.push('/dashboard');
  router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-png-black mb-4">Basic Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="e.g., Kokoda Track"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
              >
                <option value="">Select Province</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessibility *
              </label>
              <select
                required
                value={formData.accessibility}
                onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
              >
                {ACCESSIBILITY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-png-black mb-4">📍 Location Selection</h2>
          
          <p className="text-gray-600 mb-4">
            Click on the map to select a location. The system will automatically analyze the area 
            using Copernicus satellite data to recommend suitable sites for hotels, tourist attractions, and activities.
          </p>

          {/* Interactive Map Location Picker */}
          <InteractiveLocationPicker
            onLocationSelect={(location) => {
              // Start with coordinates
              const updates: Record<string, unknown> = {
                latitude: location.latitude,
                longitude: location.longitude,
              };

              // If OSM data is available, auto-populate fields
              if (location.osmData) {
                const osm = location.osmData;
                
                // Auto-fill name if empty
                if (!formData.name && osm.name) {
                  updates.name = osm.name;
                }

                // Auto-fill description if empty and available
                if (!formData.description && osm.description) {
                  updates.description = osm.description;
                }

                // Suggest category based on OSM type
                if (osm.category && ['Coastal', 'Inland', 'Geothermal', 'Cultural'].includes(osm.category)) {
                  updates.category = osm.category;
                }

                // Extract activities from OSM type
                const suggestedActivities = [];
                if (osm.osmType === 'hotel' || osm.osmType === 'resort') {
                  suggestedActivities.push('Accommodation', 'Dining');
                }
                if (osm.osmType === 'beach') {
                  suggestedActivities.push('Swimming', 'Beach activities', 'Water sports');
                }
                if (osm.osmType === 'museum') {
                  suggestedActivities.push('Cultural tours', 'Museum visits');
                }
                if (osm.osmType === 'viewpoint') {
                  suggestedActivities.push('Sightseeing', 'Photography');
                }
                if (osm.osmType === 'park') {
                  suggestedActivities.push('Hiking', 'Nature walks', 'Picnics');
                }

                // Add activities if form is empty
                if (!formData.activities && suggestedActivities.length > 0) {
                  updates.activities = suggestedActivities.join(', ');
                }

                // Add website if available
                if (osm.website && !formData.image) {
                  // Could fetch image from website later
                }

                // Show notification to user
                if (osm.name) {
                  console.log(`📍 Found OSM place: ${osm.name} (${osm.osmType}) - ${osm.distance}m away`);
                }
              }

              setFormData({
                ...formData,
                ...updates,
              });
            }}
            initialLatitude={formData.latitude || -6.314993}
            initialLongitude={formData.longitude || 143.95555}
            session={session}
          />

          {/* Manual coordinate override (optional) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center space-x-2">
              <span>⚙️</span>
              <span>Advanced: Manually enter coordinates</span>
            </summary>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                  placeholder="e.g., -6.314993"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                  placeholder="e.g., 143.95555"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Descriptions */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-png-black mb-4">Descriptions</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="A brief description (1-2 sentences)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Description *
              </label>
              <textarea
                required
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="Detailed description with history, features, and what makes it special"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-png-black mb-4">Images</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image (Tailwind gradient or URL) *
              </label>
              <input
                type="text"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="e.g., from-ocean-500 to-paradise-green or https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use Tailwind gradient classes (e.g., &quot;from-ocean-500 to-paradise-green&quot;) or a full image URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Satellite Image URL (Optional)
              </label>
              <input
                type="text"
                value={formData.satelliteImageUrl}
                onChange={(e) => setFormData({ ...formData, satelliteImageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="https://example.com/satellite-view.jpg"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-bold text-png-black mb-4">Additional Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activities (comma-separated) *
              </label>
              <input
                type="text"
                required
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="e.g., Hiking, Swimming, Photography, Cultural Tours"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlights (comma-separated) *
              </label>
              <input
                type="text"
                required
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="e.g., UNESCO World Heritage Site, Crystal clear waters, Ancient traditions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Best Time to Visit *
              </label>
              <input
                type="text"
                required
                value={formData.bestTimeToVisit}
                onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                placeholder="e.g., May to October (dry season)"
              />
            </div>
          </div>
        </div>

        {/* Featured Toggle */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 text-png-red border-gray-300 rounded focus:ring-png-red"
            />
            <span className="text-sm font-medium text-gray-700">
              Feature this destination on the homepage
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-end space-x-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Destination' : 'Create Destination'}
        </button>
      </div>
    </form>
  );
}
