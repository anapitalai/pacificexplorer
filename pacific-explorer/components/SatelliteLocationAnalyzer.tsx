'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { fetchRealTimeSatelliteData } from '@/lib/copernicus-live';
import type { SatelliteData } from '@/lib/copernicus-live';

interface LocationScore {
  overall: number;
  vegetation: number;
  accessibility: number;
  coralHealth: number;
  temperature: number;
  suitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendation: string;
}

interface SatelliteLocationAnalyzerProps {
  latitude: number;
  longitude: number;
  session: Session | null;
  onAnalysisComplete?: (score: LocationScore) => void;
}

export default function SatelliteLocationAnalyzer({
  latitude,
  longitude,
  session,
  onAnalysisComplete
}: SatelliteLocationAnalyzerProps) {
  // mark session as intentionally unused in some flows
  void session;
  const [analyzing, setAnalyzing] = useState(false);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [locationScore, setLocationScore] = useState<LocationScore | null>(null);
  const [error, setError] = useState<string>('');

  const analyzeLocation = async () => {
    if (!latitude || !longitude) {
      setError('Please enter valid coordinates first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Fetch real-time satellite data
      const data = await fetchRealTimeSatelliteData(latitude, longitude, true);
      setSatelliteData(data);

      // Calculate location suitability scores
      const score = calculateLocationScore(data);
      setLocationScore(score);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(score);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze location. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const calculateLocationScore = (data: SatelliteData): LocationScore => {
    // Vegetation score (0-100) - Higher NDVI is better for eco-tourism
    const vegetationScore = Math.min(100, Math.max(0, (data.ndvi + 1) * 50));

    // Temperature score (0-100) - Optimal 26-30°C for tourism
    const tempScore = data.temperature >= 26 && data.temperature <= 30 
      ? 100 
      : data.temperature < 26 
        ? Math.max(0, 100 - (26 - data.temperature) * 10)
        : Math.max(0, 100 - (data.temperature - 30) * 15);

    // Coral health score (0-100) - Good coral = good diving/snorkeling
    const coralScore = data.coralHealth === 'Good' ? 100 
      : data.coralHealth === 'Fair' ? 60 
      : 30;

    // Accessibility score based on cloud cover (less cloud = better access)
    const accessScore = Math.max(0, 100 - data.cloudCover);

    // Overall score (weighted average)
    const overall = Math.round(
      (vegetationScore * 0.25) +
      (tempScore * 0.25) +
      (coralScore * 0.3) +
      (accessScore * 0.2)
    );

    // Determine suitability
    let suitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    let recommendation: string;

    if (overall >= 80) {
      suitability = 'Excellent';
      recommendation = 'Highly recommended for eco-tourism and resort development. Excellent environmental conditions.';
    } else if (overall >= 65) {
      suitability = 'Good';
      recommendation = 'Good location for tourism. Consider focusing on specific activities based on strengths.';
    } else if (overall >= 50) {
      suitability = 'Fair';
      recommendation = 'Moderate potential. May require additional infrastructure or seasonal planning.';
    } else {
      suitability = 'Poor';
      recommendation = 'Limited tourism potential. Consider alternative locations or specialized niche tourism.';
    }

    return {
      overall,
      vegetation: Math.round(vegetationScore),
      accessibility: Math.round(accessScore),
      coralHealth: Math.round(coralScore),
      temperature: Math.round(tempScore),
      suitability,
      recommendation,
    };
  };

  return (
    <div className="bg-linear-to-br from-ocean-50 to-paradise-sky/10 rounded-xl p-6 border-2 border-ocean-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-png-black">Satellite Location Analysis</h3>
            <p className="text-sm text-gray-600">Copernicus Sentinel-2/3 Data</p>
          </div>
        </div>
        {satelliteData && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-green-700">{satelliteData.dataSource}</span>
          </div>
        )}
      </div>

      <button
        onClick={analyzeLocation}
        disabled={analyzing || !latitude || !longitude}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          analyzing || !latitude || !longitude
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {analyzing ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing Location...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Analyze Location for Tourism Potential</span>
          </span>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {satelliteData && locationScore && (
        <div className="mt-6 space-y-4">
          {/* Overall Score */}
          <div className={`p-4 rounded-lg border-2 ${
            locationScore.suitability === 'Excellent' ? 'bg-green-50 border-green-300' :
            locationScore.suitability === 'Good' ? 'bg-blue-50 border-blue-300' :
            locationScore.suitability === 'Fair' ? 'bg-yellow-50 border-yellow-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-700">Overall Suitability</span>
              <span className={`text-2xl font-bold ${
                locationScore.suitability === 'Excellent' ? 'text-green-600' :
                locationScore.suitability === 'Good' ? 'text-blue-600' :
                locationScore.suitability === 'Fair' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {locationScore.overall}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  locationScore.suitability === 'Excellent' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  locationScore.suitability === 'Good' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  locationScore.suitability === 'Fair' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${locationScore.overall}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm font-semibold">
              Rating: <span className={
                locationScore.suitability === 'Excellent' ? 'text-green-600' :
                locationScore.suitability === 'Good' ? 'text-blue-600' :
                locationScore.suitability === 'Fair' ? 'text-yellow-600' :
                'text-red-600'
              }>{locationScore.suitability}</span>
            </p>
            <p className="mt-2 text-sm text-gray-700">{locationScore.recommendation}</p>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Vegetation Health */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Vegetation</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-green-600">{locationScore.vegetation}%</span>
                <span className="text-xs text-gray-500">NDVI: {satelliteData.ndvi.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{satelliteData.vegetation}</p>
            </div>

            {/* Temperature */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Temperature</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-blue-600">{locationScore.temperature}%</span>
                <span className="text-xs text-gray-500">{satelliteData.temperature}°C</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {satelliteData.temperature >= 26 && satelliteData.temperature <= 30 ? 'Optimal' : 'Moderate'}
              </p>
            </div>

            {/* Coral Health */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Coral Health</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-cyan-600">{locationScore.coralHealth}%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{satelliteData.coralHealth}</p>
            </div>

            {/* Accessibility */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Clear Sky</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-purple-600">{locationScore.accessibility}%</span>
                <span className="text-xs text-gray-500">{satelliteData.cloudCover}% cloud</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {satelliteData.cloudCover < 30 ? 'Excellent visibility' : 'Moderate visibility'}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Recommended Tourism Activities</span>
            </h4>
            <ul className="space-y-2 text-sm">
              {locationScore.vegetation >= 70 && (
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Eco-tourism, hiking, bird watching, nature photography</span>
                </li>
              )}
              {locationScore.coralHealth >= 70 && (
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-600">✓</span>
                  <span>Diving, snorkeling, marine conservation activities</span>
                </li>
              )}
              {locationScore.temperature >= 70 && (
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Beach resort, water sports, year-round tourism</span>
                </li>
              )}
              {locationScore.overall >= 75 && (
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">✓</span>
                  <span>Luxury resort development, high-end eco-lodges</span>
                </li>
              )}
            </ul>
          </div>

          {/* Raw Data */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-gray-700">View Raw Satellite Data</summary>
              <pre className="mt-2 text-gray-600 overflow-auto">{JSON.stringify(satelliteData, null, 2)}</pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
