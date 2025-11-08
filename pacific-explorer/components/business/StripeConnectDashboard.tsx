'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  status?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

interface Commission {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  booking: {
    id: number;
    totalAmount: number;
  };
}

interface Payout {
  id: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  commissions: Commission[];
}

export default function StripeConnectDashboard() {
  const { data: session } = useSession();
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Get Stripe Connect status
      const statusResponse = await fetch('/api/stripe-connect/create-account');
      const statusData = await statusResponse.json();
      setConnectStatus(statusData);

      // Get commissions
      const commissionsResponse = await fetch(`/api/commissions?businessId=${session?.user?.id}`);
      const commissionsData = await commissionsResponse.json();
      setCommissions(commissionsData.commissions || []);

      // Get payouts
      const payoutsResponse = await fetch(`/api/commissions/payout?businessId=${session?.user?.id}`);
      const payoutsData = await payoutsResponse.json();
      setPayouts(payoutsData.payouts || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id, loadData]);

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      alert('Failed to connect to Stripe');
    } finally {
      setConnecting(false);
    }
  };

  const handlePayout = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/commissions/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId: session.user.id }),
      });
      const data = await response.json();

      if (data.success) {
        alert(`Payout processed successfully! Amount: $${data.amount}`);
        loadData(); // Refresh data
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    }
  };

  const pendingCommissions = commissions.filter(c => c.status === 'PENDING');
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stripe Connect Dashboard</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${connectStatus?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connectStatus?.connected ? 'Connected' : 'Not Connected'}
        </span>
      </div>

      {/* Stripe Connect Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Stripe Account Status
        </h2>
        {connectStatus?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Stripe account connected</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Account ID:</span> {connectStatus.accountId}
              </div>
              <div>
                <span className="font-medium">Status:</span> {connectStatus.status}
              </div>
              <div>
                <span className="font-medium">Charges:</span>{' '}
                {connectStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <span className="font-medium">Payouts:</span>{' '}
                {connectStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Connect your Stripe account to receive payments</span>
            </div>
            <button
              onClick={handleConnectStripe}
              disabled={connecting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? 'Connecting...' : 'Connect Stripe Account'}
            </button>
          </div>
        )}
      </div>

      {/* Commission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Commissions</h3>
          <div className="text-2xl font-bold">${commissions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Payout</h3>
          <div className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Paid Out</h3>
          <div className="text-2xl font-bold text-green-600">
            ${commissions.filter(c => c.status === 'PROCESSED').reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Payout Actions */}
      {connectStatus?.connected && connectStatus.payoutsEnabled && totalPending > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Process Payout</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                You have ${totalPending.toFixed(2)} in pending commissions from {pendingCommissions.length} bookings.
              </p>
            </div>
            <button
              onClick={handlePayout}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Payout Now
            </button>
          </div>
        </div>
      )}

      {/* Recent Commissions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Commissions</h2>
        <div className="space-y-4">
          {commissions.slice(0, 10).map((commission) => (
            <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Booking #{commission.booking.id}</p>
                <p className="text-sm text-gray-600">
                  ${commission.amount.toFixed(2)} commission on ${commission.booking.totalAmount.toFixed(2)} booking
                </p>
                <p className="text-xs text-gray-500">{new Date(commission.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${commission.status === 'PROCESSED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {commission.status}
              </span>
            </div>
          ))}
          {commissions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No commissions yet</p>
          )}
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Payout History</h2>
        <div className="space-y-4">
          {payouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">${payout.amount.toFixed(2)} {payout.currency}</p>
                <p className="text-sm text-gray-600">
                  {payout.commissions.length} commission{payout.commissions.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(payout.createdAt).toLocaleDateString()}
                  {payout.processedAt && ` • Processed: ${new Date(payout.processedAt).toLocaleDateString()}`}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                payout.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                payout.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {payout.status}
              </span>
            </div>
          ))}
          {payouts.length === 0 && (
            <p className="text-center text-gray-500 py-8">No payouts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
