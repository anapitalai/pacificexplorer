'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

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
    currency: string;
    destination: {
      name: string;
    };
    tourist: {
      name: string;
      email: string;
    };
  };
  business: {
    name: string;
    email: string;
  };
}

export default function AdminCommissionDashboard() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PROCESSED' | 'FAILED'>('ALL');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') {
        params.append('status', filter);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/commissions?${params}`);
      const data = await response.json();
      setCommissions(data.commissions || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const updateCommissionStatus = async (commissionId: number, status: 'PENDING' | 'PROCESSED' | 'FAILED') => {
    setUpdating(commissionId);
    try {
      const response = await fetch('/api/commissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commissionId,
          status,
        }),
      });

      if (response.ok) {
        await fetchCommissions(); // Refresh the list
      } else {
        alert('Failed to update commission status');
      }
    } catch (error) {
      console.error('Error updating commission:', error);
      alert('Failed to update commission status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0);
  const processedCommissions = commissions.filter(c => c.status === 'PROCESSED').reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Commissions</p>
              <p className="text-2xl font-bold">${totalCommissions.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pending Payouts</p>
              <p className="text-2xl font-bold">${pendingCommissions.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Processed</p>
              <p className="text-2xl font-bold">${processedCommissions.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex space-x-2">
          {(['ALL', 'PENDING', 'PROCESSED', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tourist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{commission.booking.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.booking.destination.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {commission.business.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.business.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {commission.booking.tourist.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.booking.tourist.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${commission.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.percentage * 100}% of ${commission.booking.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                      {getStatusIcon(commission.status)}
                      <span className="ml-1">{commission.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {commission.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'PROCESSED')}
                          disabled={updating === commission.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          {updating === commission.id ? 'Processing...' : 'Mark Paid'}
                        </button>
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'FAILED')}
                          disabled={updating === commission.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Mark Failed
                        </button>
                      </div>
                    )}
                    {commission.status === 'PROCESSED' && (
                      <span className="text-green-600">Paid on {commission.processedAt ? new Date(commission.processedAt).toLocaleDateString() : 'N/A'}</span>
                    )}
                    {commission.status === 'FAILED' && (
                      <button
                        onClick={() => updateCommissionStatus(commission.id, 'PENDING')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {commissions.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No commissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'ALL' ? 'No commissions have been generated yet.' : `No ${filter.toLowerCase()} commissions found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
