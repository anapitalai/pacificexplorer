'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart3, DollarSign, Users, TrendingUp, Eye, MousePointer, Target } from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  commissionRevenue: number;
  subscriptionRevenue: number;
  advertisingRevenue: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalAds: number;
  activeAds: number;
}

interface Ad {
  id: number;
  title: string;
  advertiser: {
    name: string;
    email: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED';
  type: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export default function AdminRevenueDashboard() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'commissions' | 'subscriptions'>('overview');

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      const [metricsResponse, adsResponse] = await Promise.all([
        fetch('/api/admin/revenue/metrics'),
        fetch('/api/admin/ads'),
      ]);

      const metricsData = await metricsResponse.json();
      const adsData = await adsResponse.json();

      setMetrics(metricsData.metrics);
      setAds(adsData.ads || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdStatusChange = async (adId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error updating ad status:', error);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Revenue Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commission Revenue</p>
                <p className="text-2xl font-bold">${metrics.commissionRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">60% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subscription Revenue</p>
                <p className="text-2xl font-bold">${metrics.subscriptionRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">25% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Advertising Revenue</p>
                <p className="text-2xl font-bold">${metrics.advertisingRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">15% of total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      {metrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Commissions (60%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <span className="text-sm font-bold">${metrics.commissionRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subscriptions (25%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: '25%' }}
                  ></div>
                </div>
                <span className="text-sm font-bold">${metrics.subscriptionRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Advertising (15%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: '15%' }}
                  ></div>
                </div>
                <span className="text-sm font-bold">${metrics.advertisingRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'ads', label: 'Advertisements', icon: Target },
            { id: 'commissions', label: 'Commissions', icon: DollarSign },
            { id: 'subscriptions', label: 'Subscriptions', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'ads' | 'commissions' | 'subscriptions')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'ads' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Advertisement Management</h2>
            <div className="text-sm text-gray-600">
              {metrics?.activeAds || 0} active ads
            </div>
          </div>

          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{ad.title}</h3>
                    <p className="text-gray-600 text-sm">
                      By {ad.advertiser.name} ({ad.advertiser.email})
                    </p>
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
                    <div className="text-sm text-gray-600 flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Impressions
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{ad.clicks.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MousePointer className="h-3 w-3 mr-1" />
                      Clicks
                    </div>
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
                    Created: {new Date(ad.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    {ad.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAdStatusChange(ad.id, 'ACTIVE')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAdStatusChange(ad.id, 'REJECTED')}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {ad.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAdStatusChange(ad.id, 'PAUSED')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                      >
                        Pause
                      </button>
                    )}
                    {ad.status === 'PAUSED' && (
                      <button
                        onClick={() => handleAdStatusChange(ad.id, 'ACTIVE')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {ads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No advertisements yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{metrics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Subscriptions</span>
                <span className="font-semibold">{metrics?.activeSubscriptions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Ads</span>
                <span className="font-semibold">{metrics?.totalAds || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Ads</span>
                <span className="font-semibold">{metrics?.activeAds || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Goals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Target</span>
                <span className="font-semibold">$10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics?.totalRevenue || 0) / 10000 * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {((metrics?.totalRevenue || 0) / 10000 * 100).toFixed(1)}% of target
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Commission Management</h2>
          <p className="text-gray-600">Commission tracking and payout management coming soon...</p>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
          <p className="text-gray-600">Subscription analytics and management coming soon...</p>
        </div>
      )}
    </div>
  );
}
