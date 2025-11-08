'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Subscription {
  id: number;
  plan: 'BASIC' | 'PREMIUM' | 'PRO';
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

const plans = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 'Free',
    description: 'Essential features for casual travelers',
    features: [
      'Browse destinations',
      'Basic messaging',
      'Limited satellite imagery',
      'Community support'
    ],
    popular: false,
    buttonText: 'Current Plan'
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: '$9.99/month',
    description: 'Enhanced features for serious travelers',
    features: [
      'All Basic features',
      'Advanced trip planning',
      'Priority messaging to businesses',
      'High-resolution satellite imagery',
      'Offline maps',
      'Email support'
    ],
    popular: true,
    buttonText: 'Upgrade to Premium'
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$19.99/month',
    description: 'Professional tools for travel experts',
    features: [
      'All Premium features',
      'Custom itinerary builder',
      'Direct business connections',
      'Real-time satellite data',
      'Advanced analytics',
      'Priority support',
      'API access'
    ],
    popular: false,
    buttonText: 'Upgrade to Pro'
  }
];

export default function SubscriptionPlans() {
  const { data: session } = useSession();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      setCurrentSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!session?.user) return;

    setUpgrading(planId);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Subscription updated successfully!');
        fetchSubscription(); // Refresh subscription data
      } else {
        alert(data.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription');
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!currentSubscription) return;

    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchSubscription();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscription...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600">
          Unlock the full potential of Pacific Explorer with our premium features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan === plan.id;
          const canUpgrade = !isCurrentPlan && currentSubscription;

          return (
            <div key={plan.id} className={`relative bg-white rounded-lg shadow-md border ${plan.popular ? 'border-blue-500' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <div className="text-3xl font-bold text-gray-900 mt-4">
                    {plan.price}
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrentPlan ? (
                    <button
                      className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                      disabled
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-900 text-white'
                      }`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id}
                    >
                      {upgrading === plan.id ? 'Processing...' : canUpgrade ? 'Upgrade' : plan.buttonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentSubscription && currentSubscription.plan !== 'BASIC' && (
        <div className="text-center">
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-800 font-medium underline"
          >
            Cancel Subscription
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your subscription will remain active until {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        </div>
      )}

      {!currentSubscription && (
        <div className="text-center text-gray-600">
          <p>You don&apos;t have an active subscription. Choose a plan above to get started!</p>
        </div>
      )}
    </div>
  );
}
