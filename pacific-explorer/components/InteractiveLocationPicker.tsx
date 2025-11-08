"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Session } from "next-auth";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

// We'll dynamically import Leaflet inside effects to avoid server-side bundling

interface LocationData {
  latitude: number;
  longitude: number;
  placeName?: string;
  osmData?: OSMPlace | null;
}

interface OSMPlace {
  id: number;
  name: string;
  category: string;
  osmType: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  operator: string;
  distance: number;
}

interface SatelliteAnalysisResult {
  suitability: {
    overall: number;
    vegetation: number;
    temperature: number;
    coralHealth: number;
    accessibility: number;
  };
  recommendations: {
    hotels: string[];
    touristSites: string[];
    activities: string[];
  };
  rawData: {
    ndvi: number;
    temperature: number;
    cloudCover: number;
    vegetation: string;
    coralHealth: string;
  };
}

interface InteractiveLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  session: Session | null;
}

export default function InteractiveLocationPicker({
  onLocationSelect,
  initialLatitude = -6.314993,
  initialLongitude = 143.95555,
  session
}: InteractiveLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SatelliteAnalysisResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [osmPlaceInfo, setOsmPlaceInfo] = useState<OSMPlace | null>(null);

  // Define exitFullscreen with useCallback to prevent recreating on every render
  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
  }, []);

  // Define runAnalysis with useCallback
  const runAnalysis = useCallback(async (lat: number, lng: number) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Fetch satellite data
      const response = await fetch('/api/satellite/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch satellite data');
      }

      const data = await response.json();

      // Calculate suitability scores
      const vegetationScore = Math.min(100, Math.max(0, data.ndvi * 100));
      const tempScore = Math.max(0, 100 - Math.abs(data.temperature - 27) * 5);
      const coralScore = data.coralHealth === 'Excellent' ? 95 : 
                        data.coralHealth === 'Good' ? 75 : 
                        data.coralHealth === 'Fair' ? 50 : 30;
      const accessScore = Math.max(0, 100 - data.cloudCover);
      
      const overallScore = (
        vegetationScore * 0.25 +
        tempScore * 0.25 +
        coralScore * 0.30 +
        accessScore * 0.20
      );

      // Generate recommendations
      const recommendations = generateRecommendations(
        vegetationScore,
        tempScore,
        coralScore,
        data
      );

      setAnalysisResult({
        suitability: {
          overall: Math.round(overallScore),
          vegetation: Math.round(vegetationScore),
          temperature: Math.round(tempScore),
          coralHealth: Math.round(coralScore),
          accessibility: Math.round(accessScore),
        },
        recommendations,
        rawData: data,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Failed to analyze location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
  // Only attach in a browser environment after mount
  if (typeof window === 'undefined' || !mounted) return;
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen, mounted]);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return;

    let cancelled = false;
    (async () => {
      const leafletMod = await import('leaflet');
      // runtime leaflet value (may be default export in some bundles)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = ((leafletMod as any)?.default ?? leafletMod) as any;
      if (cancelled) return;

      // Initialize map centered on PNG
      const map = L.map(mapContainerRef.current, {
        center: [initialLatitude, initialLongitude],
        zoom: 8,
        zoomControl: true,
      });

      mapRef.current = map;

      // Add Copernicus Sentinel-2 satellite layer
      L.tileLayer(
        "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg",
        {
          attribution: '&copy; <a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX</a> | Data: <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA',
          maxZoom: 18,
        }
      ).addTo(map);

      // Add click handler
      map.on('click', async (e: unknown) => {
        // Narrow the event type at runtime to avoid using `any`.
        const evt = e as { latlng?: { lat: number; lng: number } } | undefined;
        const lat = evt?.latlng?.lat;
        const lng = evt?.latlng?.lng;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
      
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Create custom marker icon
        const markerIcon = L.divIcon({
          className: "custom-marker",
          html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-16 h-16 bg-png-red/20 rounded-full animate-ping"></div>
            <div class="w-10 h-10 bg-png-red rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        // Add new marker
  const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        markerRef.current = marker;

      // Hide instructions after first click
      setShowInstructions(false);

      // Fetch nearby OSM places
      let osmPlace: OSMPlace | null = null;
      try {
        const osmResponse = await fetch(`/api/osm/nearby?lat=${lat}&lng=${lng}&radius=500`);
        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          if (osmData.success && osmData.places.all.length > 0) {
            // Get the closest place
            osmPlace = osmData.places.all[0];
            setOsmPlaceInfo(osmPlace); // Show OSM info card
          } else {
            setOsmPlaceInfo(null);
          }
        }
      } catch (error) {
        console.log('OSM lookup failed, continuing without it:', error);
        setOsmPlaceInfo(null);
      }

      // Update location with OSM data
      const locationData: LocationData = {
        latitude: lat,
        longitude: lng,
        placeName: osmPlace?.name,
        osmData: osmPlace,
      };
      setSelectedLocation(locationData);
      onLocationSelect(locationData);

        // Run analysis automatically
        await runAnalysis(lat, lng);
      });

    })();

    return () => { cancelled = true; };
  }, [mounted, initialLatitude, initialLongitude, onLocationSelect, runAnalysis]);

  const generateRecommendations = (
    vegetation: number,
    temp: number,
    coral: number,
  data: Record<string, unknown>
  ) => {
    const hotels: string[] = [];
    const touristSites: string[] = [];
    const activities: string[] = [];

    // Hotel recommendations based on suitability
    if (vegetation > 70 && temp > 70) {
      hotels.push('🏨 Eco-resort with garden views');
      hotels.push('🏡 Boutique rainforest lodge');
    }
    if (coral > 70) {
      hotels.push('🏖️ Beachfront resort with diving center');
      hotels.push('🌊 Overwater bungalows');
    }
    if (temp > 60 && vegetation > 50) {
      hotels.push('⛺ Sustainable eco-lodges');
      hotels.push('🏠 Traditional village homestays');
    }

    // Tourist site recommendations
    if (vegetation > 80) {
      touristSites.push('🌳 Nature reserve or national park');
      touristSites.push('🦜 Bird watching sanctuary');
      touristSites.push('🥾 Hiking trail network');
    }
    if (coral > 70) {
      touristSites.push('🤿 Coral reef snorkeling site');
      touristSites.push('🏝️ Marine protected area');
      touristSites.push('🐠 Underwater photography spot');
    }
    if (data.vegetation === 'Dense' || data.vegetation === 'Moderate') {
      touristSites.push('🌺 Botanical garden');
      touristSites.push('🎋 Cultural village tour');
    }

    // Activity recommendations
    if (vegetation > 70) {
      activities.push('Jungle trekking');
      activities.push('Wildlife spotting');
      activities.push('Canopy tours');
    }
    if (coral > 70) {
      activities.push('Scuba diving');
      activities.push('Snorkeling');
      activities.push('Glass-bottom boat tours');
    }
    if (temp > 70) {
      activities.push('Beach activities');
      activities.push('Water sports');
      activities.push('Sunset cruises');
    }
    if (data.vegetation === 'Moderate' || data.vegetation === 'Dense') {
      activities.push('Cultural experiences');
      activities.push('Photography tours');
      activities.push('Bird watching');
    }

    return { hotels, touristSites, activities };
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 65) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Mark session as intentionally unused in some flows to satisfy linters
  void session;
  // Mark getSuitabilityColor as used (harmless reference)
  void getSuitabilityColor;

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Location';
    if (score >= 65) return 'Good Location';
    if (score >= 50) return 'Fair Location';
    return 'Poor Location';
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Invalidate map size after transition
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
  };

  if (!mounted) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fullscreen Overlay */}
      {isFullscreen && (
  <div className="fixed inset-0 z-9999 bg-black/95 flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-linear-to-r from-ocean-500 to-ocean-600 text-white p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <h2 className="font-bold text-lg">Location Selection - Fullscreen</h2>
                <p className="text-sm text-ocean-100">Click anywhere to select location</p>
              </div>
            </div>
            <button
              onClick={exitFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Exit Fullscreen (ESC)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Fullscreen Map */}
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="absolute inset-0" />
            
            {/* Badges overlay in fullscreen */}
            <div className="absolute top-4 left-4 z-900 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🛰️</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">Copernicus Sentinel-2</p>
                  <p className="text-xs text-gray-500">Real satellite imagery</p>
                </div>
              </div>
            </div>

            {selectedLocation && (
              <div className="absolute top-4 right-4 z-900 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
                <p className="text-xs font-medium text-gray-500">Selected Location</p>
                <p className="text-sm font-mono font-bold text-gray-900">
                  {selectedLocation.latitude.toFixed(6)}°, {selectedLocation.longitude.toFixed(6)}°
                </p>
              </div>
            )}

            {/* Analysis in fullscreen bottom panel */}
            {analysisResult && (
              <div className="absolute bottom-0 left-0 right-0 z-900 bg-white/95 backdrop-blur-sm border-t-4 border-ocean-500 max-h-64 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {getSuitabilityLabel(analysisResult.suitability.overall)} - {analysisResult.suitability.overall}%
                    </h3>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">🌱 {analysisResult.suitability.vegetation}%</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">🌡️ {analysisResult.suitability.temperature}%</span>
                      <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded">🐠 {analysisResult.suitability.coralHealth}%</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">☀️ {analysisResult.suitability.accessibility}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="font-semibold mb-1">🏨 Hotels</p>
                      <div className="space-y-1">
                        {analysisResult.recommendations.hotels.slice(0, 2).map((h, i) => (
                          <p key={i} className="text-gray-600">{h}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">📍 Sites</p>
                      <div className="space-y-1">
                        {analysisResult.recommendations.touristSites.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-gray-600">{s}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">⚡ Activities</p>
                      <div className="space-y-1">
                        {analysisResult.recommendations.activities.slice(0, 2).map((a, i) => (
                          <p key={i} className="text-gray-600">{a}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-950 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 shadow-2xl text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-3"></div>
                  <p className="font-bold text-gray-900">Analyzing Location...</p>
                  <p className="text-sm text-gray-600 mt-1">Processing satellite data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Normal View */}
      {!isFullscreen && (
        <>
          {/* Instructions */}
          {showInstructions && (
            <div className="bg-linear-to-r from-ocean-500 to-ocean-600 text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">📍 Select Location on Map</h3>
                  <p className="text-sm text-ocean-50">
                    Click anywhere on the Copernicus satellite map to select a location. 
                    The system will automatically analyze the area for hotel sites, tourist attractions, and activities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="relative rounded-lg overflow-hidden shadow-xl border-4 border-ocean-500">
            <div ref={mapContainerRef} className="h-96 w-full" />
            
            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute bottom-4 right-4 z-900 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg p-3 shadow-xl transition-all hover:scale-110"
              title="Enter Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
        
        {/* Map Type Badge */}
  <div className="absolute top-4 left-4 z-900 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🛰️</span>
            <div>
              <p className="text-xs font-bold text-gray-700">Copernicus Sentinel-2</p>
              <p className="text-xs text-gray-500">Real satellite imagery</p>
            </div>
          </div>
        </div>

        {/* Selected Coordinates Display */}
        {selectedLocation && (
          <div className="absolute top-4 right-4 z-900 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
            <p className="text-xs font-medium text-gray-500">Selected Location</p>
            <p className="text-sm font-mono font-bold text-gray-900">
              {selectedLocation.latitude.toFixed(6)}°, {selectedLocation.longitude.toFixed(6)}°
            </p>
          </div>
        )}

        {/* Analysis Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-950 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 shadow-2xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-3"></div>
              <p className="font-bold text-gray-900">Analyzing Location...</p>
              <p className="text-sm text-gray-600 mt-1">Processing satellite data</p>
            </div>
          </div>
        )}
      </div>

      {/* OSM Place Info Card */}
      {osmPlaceInfo && (
  <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-4 shadow-lg animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📍</span>
              <div>
                <h3 className="font-bold text-green-900 text-lg">{osmPlaceInfo.name}</h3>
                <p className="text-sm text-green-700">
                  {osmPlaceInfo.category} • {osmPlaceInfo.osmType}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOsmPlaceInfo(null)}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            {osmPlaceInfo.distance && (
              <div className="flex items-center text-green-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{osmPlaceInfo.distance}m from selected point</span>
              </div>
            )}
            
            {osmPlaceInfo.description && (
              <p className="text-green-800">{osmPlaceInfo.description}</p>
            )}
            
            {osmPlaceInfo.address && (
              <div className="flex items-start text-green-700">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{osmPlaceInfo.address}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-xs">
              {osmPlaceInfo.website && (
                <a 
                  href={osmPlaceInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Website
                </a>
              )}
              {osmPlaceInfo.phone && (
                <span className="text-green-700">📞 {osmPlaceInfo.phone}</span>
              )}
              {osmPlaceInfo.operator && (
                <span className="text-green-700">Operated by {osmPlaceInfo.operator}</span>
              )}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto-populated from OpenStreetMap database
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Overall Suitability */}
          <div className={`rounded-xl p-6 shadow-lg border-2 ${
            analysisResult.suitability.overall >= 80 ? 'border-green-500 bg-green-50' :
            analysisResult.suitability.overall >= 65 ? 'border-blue-500 bg-blue-50' :
            analysisResult.suitability.overall >= 50 ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {getSuitabilityLabel(analysisResult.suitability.overall)}
              </h3>
              <div className="text-3xl font-bold">
                {analysisResult.suitability.overall}%
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌱</div>
                <p className="text-xs text-gray-600 mb-1">Vegetation</p>
                <p className="text-lg font-bold text-green-600">{analysisResult.suitability.vegetation}%</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌡️</div>
                <p className="text-xs text-gray-600 mb-1">Temperature</p>
                <p className="text-lg font-bold text-blue-600">{analysisResult.suitability.temperature}%</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🐠</div>
                <p className="text-xs text-gray-600 mb-1">Coral Health</p>
                <p className="text-lg font-bold text-cyan-600">{analysisResult.suitability.coralHealth}%</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">☀️</div>
                <p className="text-xs text-gray-600 mb-1">Accessibility</p>
                <p className="text-lg font-bold text-yellow-600">{analysisResult.suitability.accessibility}%</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Hotels */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">🏨</span>
                <h4 className="font-bold text-gray-900">Hotel Sites</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.recommendations.hotels.map((hotel, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{hotel}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tourist Sites */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">📍</span>
                <h4 className="font-bold text-gray-900">Tourist Sites</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.recommendations.touristSites.map((site, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>{site}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">⚡</span>
                <h4 className="font-bold text-gray-900">Activities</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.recommendations.activities.map((activity, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Raw Data */}
          <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              📊 View Raw Satellite Data
            </summary>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <p className="text-xs text-gray-500">NDVI</p>
                <p className="font-mono font-bold">{analysisResult.rawData.ndvi.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="font-mono font-bold">{analysisResult.rawData.temperature.toFixed(1)}°C</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cloud Cover</p>
                <p className="font-mono font-bold">{analysisResult.rawData.cloudCover.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vegetation</p>
                <p className="font-mono font-bold">{analysisResult.rawData.vegetation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Coral Health</p>
                <p className="font-mono font-bold">{analysisResult.rawData.coralHealth}</p>
              </div>
            </div>
          </details>
        </div>
      )}
        </>
      )}
    </div>
  );
}
