'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Ad {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl: string;
  type: 'BANNER' | 'SPONSORED_LISTING' | 'FEATURED_DESTINATION';
  targetLocations: string[];
  targetInterests: string[];
}

interface AdDisplayProps {
  type: 'BANNER' | 'SPONSORED_LISTING' | 'FEATURED_DESTINATION';
  location?: string;
  interests?: string[];
  className?: string;
}

export default function AdDisplay({ type, location, interests = [], className = '' }: AdDisplayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);

  const loadAd = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        type,
        ...(location && { location }),
        ...(interests.length > 0 && { interests: interests.join(',') }),
      });

      const response = await fetch(`/api/ads/serve?${params}`);
      const data = await response.json();

      if (data.ad) {
        setAd(data.ad);
      } else {
        setAd(null);
      }
    } catch (error) {
      console.error('Error loading ad:', error);
      setAd(null);
    } finally {
      setLoading(false);
    }
  }, [type, location, interests]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  useEffect(() => {
    if (ad && !impressionTracked) {
      // Track impression
      trackImpression(ad.id);
      setImpressionTracked(true);
    }
  }, [ad, impressionTracked]);

  const trackImpression = async (adId: number) => {
    try {
      await fetch('/api/ads/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adId,
          type: 'impression',
        }),
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId: number) => {
    try {
      await fetch('/api/ads/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adId,
          type: 'click',
        }),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = () => {
    if (ad) {
      trackClick(ad.id);
      window.open(ad.targetUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
        <div className="h-full bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!ad) {
    return null; // No ad to display
  }

  // Banner Ad
  if (type === 'BANNER') {
    return (
      <div
        className={`cursor-pointer border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
        onClick={handleAdClick}
      >
        {ad.imageUrl ? (
          <div className="relative h-32">
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-32 bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <h3 className="font-semibold text-sm">{ad.title}</h3>
              {ad.description && (
                <p className="text-xs mt-1 opacity-90">{ad.description}</p>
              )}
            </div>
          </div>
        )}
        <div className="p-2 bg-white">
          <p className="text-xs text-gray-500">Sponsored</p>
        </div>
      </div>
    );
  }

  // Sponsored Listing
  if (type === 'SPONSORED_LISTING') {
    return (
      <div
        className={`cursor-pointer border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors ${className}`}
        onClick={handleAdClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">{ad.title}</h3>
            {ad.description && (
              <p className="text-sm text-blue-700 mt-1">{ad.description}</p>
            )}
          </div>
          {ad.imageUrl && (
            <div className="relative w-16 h-16 ml-4 shrink-0">
              <Image
                src={ad.imageUrl}
                alt={ad.title}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-blue-600 font-medium">SPONSORED</span>
          <span className="text-xs text-blue-500">Learn More →</span>
        </div>
      </div>
    );
  }

  // Featured Destination
  if (type === 'FEATURED_DESTINATION') {
    return (
      <div
        className={`cursor-pointer relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow ${className}`}
        onClick={handleAdClick}
      >
        {ad.imageUrl ? (
          <div className="relative h-48">
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-linear-to-br from-green-400 to-blue-500" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{ad.title}</h3>
              {ad.description && (
                <p className="text-sm opacity-90 mt-1">{ad.description}</p>
              )}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-medium">FEATURED</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
