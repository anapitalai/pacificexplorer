'use client';

import dynamic from 'next/dynamic';

// Load SatelliteDiscovery only on client-side to avoid SSR issues with Leaflet
const SatelliteDiscovery = dynamic(
  () => import('@/components/SatelliteDiscovery'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-600 to-green-600">
        <div className="text-white text-2xl">
          🛰️ Loading Satellite Discovery...
        </div>
      </div>
    )
  }
);

export default function DiscoverPage() {
  return <SatelliteDiscovery />;
}
