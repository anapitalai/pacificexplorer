'use client';

import { useState, useEffect, useCallback } from 'react';

interface Commission {
  id: number;
  amount: number;
  percentage: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  processedAt?: string;
  booking: {
    id: number;
    totalAmount: number;
    destination: {
      name: string;
    };
    tourist?: {
      name?: string;
      email: string;
    };
  };
  business?: {
    name?: string;
    email: string;
  };
}

export default function CommissionsManagement() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/commissions?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch commissions: ${response.status}`);
      }
      
      const data = await response.json();
      setCommissions(data.commissions || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleProcessCommission = async (commissionId: number) => {
    try {
      const response = await fetch(`/api/commissions?id=${commissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSED' }),
      });

      if (response.ok) {
        alert('Commission processed successfully');
        fetchCommissions();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to process commission');
      }
    } catch (error) {
      console.error('Error processing commission:', error);
      alert('Failed to process commission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading commissions...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Error loading commissions</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchCommissions();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalPending = commissions?.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalProcessed = commissions?.filter(c => c.status === 'PROCESSED').reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Commission Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Pending Commissions</span>
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalPending.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {commissions?.filter(c => c.status === 'PENDING').length || 0} pending payments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Processed Commissions</span>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalProcessed.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {commissions?.filter(c => c.status === 'PROCESSED').length || 0} completed payments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Commissions</span>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">${(totalPending + totalProcessed).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {commissions?.length || 0} total transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSED">Processed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Commission Management</h2>
          <p className="text-gray-600 mt-1">Track and process platform commission payments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions?.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      Booking #{commission.booking.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {commission.booking.destination.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {commission.booking.tourist?.name || commission.booking.tourist?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {commission.business?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {commission.business?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      ${commission.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {commission.percentage * 100}% of ${commission.booking.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                      {commission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {commission.status === 'PENDING' && (
                      <button
                        onClick={() => handleProcessCommission(commission.id)}
                        className="text-green-600 hover:text-green-900 font-semibold"
                      >
                        Process Payment
                      </button>
                    )}
                    {commission.status === 'PROCESSED' && (
                      <span className="text-gray-500">
                        Processed {commission.processedAt ? new Date(commission.processedAt).toLocaleDateString() : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!commissions || commissions.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">No commissions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
