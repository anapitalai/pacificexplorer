'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { X, Eye, Target } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl: string;
  type: 'BANNER' | 'SPONSORED_LISTING' | 'FEATURED_DESTINATION';
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED';
  targetLocations: string[];
  targetInterests: string[];
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export default function AdvertisingDashboard() {
  const { data: session } = useSession();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    type: 'BANNER' as 'BANNER' | 'SPONSORED_LISTING' | 'FEATURED_DESTINATION',
    targetLocations: [] as string[],
    targetInterests: [] as string[],
    budget: 0,
    startDate: '',
    endDate: '',
  });

  const loadAds = useCallback(async () => {
    try {
      const response = await fetch(`/api/ads?advertiserId=${session?.user?.id}`);
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadAds();
    }
  }, [session?.user?.id, loadAds]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          advertiserId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          targetUrl: '',
          type: 'BANNER',
          targetLocations: [],
          targetInterests: [],
          budget: 0,
          startDate: '',
          endDate: '',
        });
        loadAds();
        alert('Ad created successfully! It will be reviewed by our team before going live.');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      alert('Failed to create ad');
    }
  };

  const handlePauseAd = async (adId: number) => {
    try {
      const response = await fetch(`/api/ads/${adId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PAUSED' }),
      });

      if (response.ok) {
        loadAds();
      }
    } catch (error) {
      console.error('Error pausing ad:', error);
    }
  };

  const handleResumeAd = async (adId: number) => {
    try {
      const response = await fetch(`/api/ads/${adId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });

      if (response.ok) {
        loadAds();
      }
    } catch (error) {
      console.error('Error resuming ad:', error);
    }
  };

  const totalSpent = ads.reduce((sum, ad) => sum + ad.spent, 0);
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00';

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Advertising Dashboard</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Ad
        </button>
      </div>

      {/* Ad Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spent</h3>
          <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Impressions</h3>
          <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Clicks</h3>
          <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg CTR</h3>
          <div className="text-2xl font-bold">{avgCTR}%</div>
        </div>
      </div>

      {/* Create Ad Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create New Advertisement</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleCreateAd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ad title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BANNER">Banner Ad</option>
                  <option value="SPONSORED_LISTING">Sponsored Listing</option>
                  <option value="FEATURED_DESTINATION">Featured Destination</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your ad..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Budget ($) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Locations (Optional)
              </label>
              <input
                type="text"
                value={formData.targetLocations.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  targetLocations: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Port Moresby, Lae, Madang (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Interests (Optional)
              </label>
              <input
                type="text"
                value={formData.targetInterests.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  targetInterests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hiking, Diving, Culture (comma separated)"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Ad
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Advertisements</h2>
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{ad.title}</h3>
                  <p className="text-gray-600 text-sm">{ad.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Type: {ad.type.replace('_', ' ')}</span>
                    <span>Budget: ${ad.budget}/day</span>
                    <span>Spent: ${ad.spent.toFixed(2)}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ad.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  ad.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  ad.status === 'PAUSED' ? 'bg-gray-100 text-gray-800' :
                  ad.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ad.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold">{ad.impressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Impressions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{ad.clicks.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Clicks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {ad.impressions > 0 ? (ad.clicks / ad.impressions * 100).toFixed(2) : '0.00'}%
                  </div>
                  <div className="text-sm text-gray-600">CTR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    ${ad.impressions > 0 ? (ad.spent / ad.impressions * 1000).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">CPM</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {new Date(ad.startDate).toLocaleDateString()}
                  {ad.endDate && ` - ${new Date(ad.endDate).toLocaleDateString()}`}
                </div>
                <div className="flex space-x-2">
                  {ad.status === 'ACTIVE' && (
                    <button
                      onClick={() => handlePauseAd(ad.id)}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    >
                      Pause
                    </button>
                  )}
                  {ad.status === 'PAUSED' && (
                    <button
                      onClick={() => handleResumeAd(ad.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                    >
                      Resume
                    </button>
                  )}
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No advertisements yet. Create your first ad to start reaching customers!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
