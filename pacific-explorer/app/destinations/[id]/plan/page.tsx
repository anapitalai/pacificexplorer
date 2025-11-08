"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BirdOfParadise from "@/components/BirdOfParadise";
import InteractiveMap from "@/components/InteractiveMap";

interface PlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

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
  bestTimeToVisit: string;
  accessibility: string;
  highlights: string[];
  activities: string[];
  featured: boolean;
  owner?: {
    id: string;
    name: string | null;
    username: string;
    email: string;
    role: string;
  };
}

export default function PlanVisitPage({ params }: PlanPageProps) {
  const { data: session } = useSession();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Planning state
  const [visitDates, setVisitDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Message state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/destinations/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch destination");
        }
        const data = await response.json();
        setDestination(data);
      } catch {
        setError("Failed to load destination");
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [params]);

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSendMessage = async () => {
    if (!session?.user) {
      alert("Please log in to send messages");
      return;
    }

    if (!destination?.owner || !messageContent.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: destination.owner.id,
          content: messageContent.trim(),
        }),
      });

      if (response.ok) {
        setMessageContent("");
        setShowMessageModal(false);
        alert("Message sent successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send message");
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSavePlan = async () => {
    if (!destination) return;

    setSaving(true);
    try {
      // Here you would typically save to a database
      // For now, we'll just show a success message
      alert("Plan saved successfully! (This would be saved to your account in a real implementation)");
    } catch {
      alert("Failed to save plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-ocean-50 via-white to-paradise-sand/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ocean-700 font-medium">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-linear-to-br from-ocean-50 via-white to-paradise-sand/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Destination</h2>
          <p className="text-gray-600 mb-6">{error || "Destination not found"}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const mapDestinations = [{
    id: destination.id,
    name: destination.name,
    coordinates: { lat: destination.latitude, lng: destination.longitude },
    category: destination.category,
    province: destination.province,
  }];

  return (
    <div className="min-h-screen bg-linear-to-br from-ocean-50 via-white to-paradise-sand/10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <BirdOfParadise className="w-12 h-12" />
              <span className="text-2xl font-bold text-png-black">
                Pacific <span className="text-png-red">Explorer</span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href={`/destinations/${destination.id}`} className="text-gray-600 hover:text-png-red transition-colors">
                ← Back to {destination.name}
              </Link>
              <Link href="/dashboard" className="text-png-red font-semibold">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Planning Form */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-png-black mb-4">
                Plan Your Visit to {destination.name}
              </h1>
              <p className="text-xl text-gray-600">
                Create a personalized itinerary for your adventure in {destination.province}
              </p>
            </div>

            {/* Visit Dates */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-png-black mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Visit Dates
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={visitDates.startDate}
                    onChange={(e) => setVisitDates(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={visitDates.endDate}
                    onChange={(e) => setVisitDates(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-ocean-50 rounded-lg">
                <p className="text-sm text-ocean-700">
                  <strong>Best time to visit:</strong> {destination.bestTimeToVisit}
                </p>
              </div>
            </div>

            {/* Activities Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-png-black mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-paradise-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select Activities
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {destination.activities.map((activity, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity)}
                      onChange={() => handleActivityToggle(activity)}
                      className="w-4 h-4 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
                    />
                    <span className="text-gray-700">{activity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-png-black mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-png-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Additional Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requirements, preferences, or notes for your visit..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Save Plan Button */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-4">
                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="w-full px-8 py-4 bg-png-red text-white font-bold text-lg rounded-lg hover:bg-opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Plan...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>Save My Visit Plan</span>
                    </>
                  )}
                </button>

                {destination.owner && session?.user && (
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="w-full px-8 py-4 bg-ocean-500 text-white font-bold text-lg rounded-lg hover:bg-ocean-600 transition-all shadow-lg flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Send Message to Destination Owner</span>
                  </button>
                )}

                {destination.owner && !session?.user && (
                  <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/auth/signin" className="text-ocean-600 hover:text-ocean-700 font-medium">
                        Sign in
                      </Link>
                      {" "}to send messages to the destination owner
                    </p>
                  </div>
                )}
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                Your plan will be saved to your account and you can access it anytime
              </p>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-png-black mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Location & Nearby Services
              </h2>
              <div className="h-[600px] rounded-xl overflow-hidden border-4 border-ocean-200 shadow-xl">
                <InteractiveMap destinations={mapDestinations} />
              </div>
              <div className="mt-4 p-4 bg-ocean-50 rounded-lg">
                <p className="text-sm text-ocean-700">
                  <strong>Interactive Map Features:</strong> Click on the destination marker to explore nearby hotels, restaurants, and transportation options. The map shows real-time satellite imagery and route planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Message Modal */}
      {showMessageModal && destination?.owner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Send Message to {destination.owner.name || destination.owner.username}
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Destination:</strong> {destination.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Recipient:</strong> {destination.owner.name || destination.owner.username} ({destination.owner.role.replace("_", " ")})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message to the destination owner..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendingMessage}
                  className="flex-1 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
