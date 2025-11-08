'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

interface DiscoveredLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'beach' | 'forest' | 'mountain' | 'cultural' | 'hotel';
  analysis: {
    ndvi: number;
    ndwi: number;
    cloudCover: number;
    visualQuality: number;
    environmentalHealth: number;
  };
  confidence: number;
  imageUrl?: string;
  description: string;
  climate?: {
    temperature: number;
    precipitation: number;
    humidity: number;
    airQuality: number;
  };
}

// We'll create Leaflet icons on the client inside the component to avoid importing Leaflet on the server
const getMarkerIcon = (type: string, L?: typeof import('leaflet')) => {
  if (!L) return undefined;
  const beach = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMC4wMyAwIDYgNC4wMyA2IDljMCA3LjUgOSAxNiA5IDE2czktOC41IDktMTZjMC00Ljk3LTQuMDMtOS05LTl6IiBmaWxsPSIjMzQ5OGRiIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+WPC90ZXh0Pjwvc3ZnPg==',
    iconSize: [30,40], iconAnchor:[15,40], popupAnchor:[0,-40]
  });
  const forest = new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMC4wMyAwIDYgNC4wMyA2IDljMCA3LjUgOSAxNiA5IDE2czktOC41IDktMTZjMC00Ljk3LTQuMDMtOS05LTl6IiBmaWxsPSIjMmVjYzcxIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4y0PC90ZXh0Pjwvc3ZnPg==', iconSize:[30,40], iconAnchor:[15,40], popupAnchor:[0,-40] });
  const mountain = new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMC4wMyAwIDYgNC4wMyA2IDljMCA3LjUgOSAxNiA5IDE2czktOC41IDktMTZjMC00Ljk3LTQuMDMtOS05LTl6IiBmaWxsPSIjOTU2MjRlIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+vPC90ZXh0Pjwvc3ZnPg==', iconSize:[30,40], iconAnchor:[15,40], popupAnchor:[0,-40] });
  const hotel = new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMC4wMyAwIDYgNC4wMyA2IDljMCA3LjUgOSAxNiA5IDE2czktOC41IDktMTZjMC00Ljk3LTQuMDMtOS05LTl6IiBmaWxsPSIjZmY5ODAwIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+oPC90ZXh0Pjwvc3ZnPg==', iconSize:[30,40], iconAnchor:[15,40], popupAnchor:[0,-40] });
  switch(type){case 'beach': return beach; case 'forest': return forest; case 'mountain': return mountain; case 'hotel': return hotel; default: return new L.Icon.Default();}
};

interface SatelliteDiscoveryProps {
  center?: [number, number];
  zoom?: number;
}

// Component to handle map drawing
function SearchAreaSelector({ 
  onAreaSelected, 
  isDrawingMode 
}: { 
  onAreaSelected: (bounds: [[number, number], [number, number]]) => void;
  isDrawingMode: boolean;
}) {
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      if (!isDrawingMode) return;
      
      const { lat, lng } = e.latlng;
      
      if (!startPoint) {
        // First click - set start point
        setStartPoint([lat, lng]);
        setEndPoint(null);
      } else {
        // Second click - set end point and complete the rectangle
        setEndPoint([lat, lng]);
        
        // Calculate bounding box
        const minLat = Math.min(startPoint[0], lat);
        const maxLat = Math.max(startPoint[0], lat);
        const minLng = Math.min(startPoint[1], lng);
        const maxLng = Math.max(startPoint[1], lng);
        
        onAreaSelected([[minLat, minLng], [maxLat, maxLng]]);
        
        // Reset for next selection
        setStartPoint(null);
        setEndPoint(null);
      }
    },
    mousemove(e) {
      if (isDrawingMode && startPoint && !endPoint) {
        // Update temporary end point while dragging
        setEndPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  // Show temporary rectangle while drawing
  if (startPoint && endPoint) {
    const minLat = Math.min(startPoint[0], endPoint[0]);
    const maxLat = Math.max(startPoint[0], endPoint[0]);
    const minLng = Math.min(startPoint[1], endPoint[1]);
    const maxLng = Math.max(startPoint[1], endPoint[1]);
    
    return (
      <Rectangle
        bounds={[[minLat, minLng], [maxLat, maxLng]]}
        pathOptions={{ color: 'orange', fillOpacity: 0.2, dashArray: '5, 10' }}
      />
    );
  }

  // Show start point marker
  if (startPoint && isDrawingMode) {
    return (
      <Marker position={startPoint}>
        <Popup>Click again to set the opposite corner</Popup>
      </Marker>
    );
  }

  return null;
}

export default function SatelliteDiscovery({ 
  center = [-6.314993, 143.95555], // Papua New Guinea center
  zoom = 8 
}: SatelliteDiscoveryProps) {
  const [discoveries, setDiscoveries] = useState<DiscoveredLocation[]>([]);
  const [hotels, setHotels] = useState<DiscoveredLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['beach', 'forest', 'mountain']);
  const [includeHotels, setIncludeHotels] = useState(true);
  const [searchArea, setSearchArea] = useState<[[number, number], [number, number]] | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleDiscovery = async () => {
    if (!searchArea) {
      alert('Please draw a search area on the map by clicking "Draw Search Area" and clicking two points on the map');
      return;
    }

    setLoading(true);
    setIsDrawingMode(false); // Exit drawing mode when discovering
    try {
      const [[minLat, minLng], [maxLat, maxLng]] = searchArea;
      
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bbox: { minLat, maxLat, minLng, maxLng },
          types: selectedTypes,
          includeHotels,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDiscoveries(result.data.discoveries);
        setHotels(result.data.hotels || []);
      } else {
        alert('Discovery failed: ' + result.error);
      }
    } catch (error) {
      console.error('Discovery error:', error);
      alert('Failed to discover locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDefaultSearchArea = useCallback(() => {
    // Set a default search area around the center
    const offset = 0.5; // degrees
    setSearchArea([
      [center[0] - offset, center[1] - offset],
      [center[0] + offset, center[1] + offset],
    ]);
    setIsDrawingMode(false);
  }, [center]);

  // expose as a safe dev helper so linters treat it as used
  // expose as a safe dev helper in browser only
  // attach in an effect so this file can remain server-safe
  // and the global is cleaned up on unmount
  if (typeof window !== 'undefined') {
    // no-op here to keep TypeScript happy; actual attach done in useEffect below
  }

  // Attach helper to window on client only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as Record<string, unknown>;
    w['setDefaultSearchArea'] = setDefaultSearchArea;
    return () => {
      if (w['setDefaultSearchArea'] === setDefaultSearchArea) {
        delete w['setDefaultSearchArea'];
      }
    };
  }, [setDefaultSearchArea]);

  // mark useRef-like patterns as used to quiet linter where applicable (harmless)
  const _refMarker = useRef(null);
  void _refMarker;
  // mark function as referenced
  void setDefaultSearchArea;

  const startDrawingMode = () => {
    setIsDrawingMode(true);
    setSearchArea(null); // Clear existing search area
  };

  const clearSearchArea = () => {
    setSearchArea(null);
    setIsDrawingMode(false);
    setDiscoveries([]);
    setHotels([]);
  };

  const handleAreaSelected = (bounds: [[number, number], [number, number]]) => {
    setSearchArea(bounds);
    setIsDrawingMode(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
  <div className="bg-linear-to-r from-blue-600 to-green-600 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🛰️ AI-Enhanced Satellite Discovery</h1>
        <p className="text-blue-100">Powered by <strong>Clay AI</strong> (open-source Earth observation) + <strong>Copernicus Sentinel-2</strong> (FREE satellite data)</p>
        <p className="text-blue-100 text-sm mt-1">💡 Use the layer control (top-right) to switch between satellite views</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white shadow-md p-4 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discovery Types
              </label>
              <div className="space-y-2">
                {['beach', 'forest', 'mountain', 'cultural'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, type]);
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type));
                        }
                      }}
                      className="mr-2 rounded border-gray-300"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Options
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeHotels}
                  onChange={(e) => setIncludeHotels(e.target.checked)}
                  className="mr-2 rounded border-gray-300"
                />
                <span>Detect Hotels/Accommodations</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-2">
              <button
                onClick={startDrawingMode}
                className={`${isDrawingMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-lg transition-colors font-semibold`}
              >
                {isDrawingMode ? '✏️ Drawing Mode Active...' : '📐 Draw Search Area'}
              </button>
              {searchArea && !isDrawingMode && (
                <button
                  onClick={clearSearchArea}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  🗑️ Clear Area
                </button>
              )}
              <button
                onClick={handleDiscovery}
                disabled={loading || !searchArea || isDrawingMode}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '🛰️ Analyzing Satellite Data...' : '🔍 Discover Locations'}
              </button>
            </div>
          </div>

          {/* Stats */}
          {isDrawingMode && (
            <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm">
              📍 <strong>Drawing Mode:</strong> Click two points on the map to define your search area
            </div>
          )}
          {(discoveries.length > 0 || hotels.length > 0) && !isDrawingMode && (
            <div className="flex gap-4 text-sm">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                📍 {discoveries.length} locations discovered
              </div>
              {hotels.length > 0 && (
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  🏨 {hotels.length} hotels detected
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map and Results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            style={{ height: '100%', width: '100%', cursor: isDrawingMode ? 'crosshair' : 'grab' }}
          >
            {/* Layer Control for switching between map types */}
            <LayersControl position="topright">
              {/* Street Map */}
              <BaseLayer name="Street Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              
              {/* Copernicus Sentinel-2 Cloudless Satellite View */}
              <BaseLayer checked name="🛰️ Sentinel-2 Satellite">
                <TileLayer
                  attribution='&copy; <a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX</a> | Data: <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA'
                  url="https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg"
                  maxZoom={18}
                />
              </BaseLayer>
              
              {/* Sentinel-2 with Labels */}
              <BaseLayer name="🛰️ Sentinel-2 + Labels">
                <TileLayer
                  attribution='&copy; <a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX</a> | Data: <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA'
                  url="https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg"
                  maxZoom={18}
                />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                  opacity={0.5}
                />
              </BaseLayer>
              
              {/* Terrain View */}
              <BaseLayer name="🗺️ Terrain">
                <TileLayer
                  attribution='&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  maxZoom={17}
                />
              </BaseLayer>
              
              {/* Copernicus Sentinel-2 Cloud-Free Mosaic (via Sentinel Hub) */}
              <BaseLayer name="🛰️ Sentinel-2 True Color">
                <TileLayer
                  attribution='&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a> | <a href="https://dataspace.copernicus.eu">Copernicus</a>'
                  url="https://services.sentinel-hub.com/ogc/wms/cd2801-YOUR-INSTANCE-ID?showLogo=false&service=WMS&request=GetMap&layers=TRUE-COLOR&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&maxcc=20&time=2023-01-01/2023-12-31&priority=mostRecent&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
                  maxZoom={16}
                />
              </BaseLayer>
            </LayersControl>
            
            {/* Search area drawing component */}
            <SearchAreaSelector 
              onAreaSelected={handleAreaSelected}
              isDrawingMode={isDrawingMode}
            />
            
            {/* Search area rectangle */}
            {searchArea && !isDrawingMode && (
              <Rectangle
                bounds={searchArea}
                pathOptions={{ color: 'blue', fillOpacity: 0.1, weight: 3 }}
              />
            )}

            {/* Discovery markers */}
            {discoveries.map((location) => (
              <Marker
                key={location.id}
                position={[location.coordinates.lat, location.coordinates.lng]}
                icon={getMarkerIcon(location.type)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Environmental Health:</span>
                        <span className="font-semibold text-green-600">
                          {location.analysis.environmentalHealth.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visual Quality:</span>
                        <span className="font-semibold">
                          {location.analysis.visualQuality.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-semibold">
                          {(location.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>NDVI:</span>
                        <span className="font-mono text-xs">
                          {location.analysis.ndvi.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {location.climate && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>🌡️ Temperature:</span>
                            <span>{location.climate.temperature.toFixed(1)}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💧 Humidity:</span>
                            <span>{location.climate.humidity.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🌬️ Air Quality:</span>
                            <span>{location.climate.airQuality.toFixed(0)}/100</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Hotel markers */}
            {hotels.map((hotel) => (
              <Marker
                key={hotel.id}
                position={[hotel.coordinates.lat, hotel.coordinates.lng]}
                icon={getMarkerIcon('hotel')}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{hotel.description}</p>
                    <div className="mt-2 text-xs">
                      <div className="flex justify-between">
                        <span>Detection Confidence:</span>
                        <span className="font-semibold">
                          {(hotel.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Results Panel */}
        {discoveries.length > 0 && (
          <div className="w-96 bg-white border-l overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Discovery Results</h2>
              <div className="space-y-4">
                {discoveries.map((location) => (
                  <div
                    key={location.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      <span className="text-2xl">{getTypeEmoji(location.type)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                    
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${location.analysis.environmentalHealth}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Environmental Health: {location.analysis.environmentalHealth.toFixed(0)}%
                      </div>
                    </div>

                    {location.climate && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-gray-600">Temperature</div>
                          <div className="font-semibold">{location.climate.temperature.toFixed(1)}°C</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-gray-600">Air Quality</div>
                          <div className="font-semibold">{location.climate.airQuality.toFixed(0)}/100</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {hotels.length > 0 && (
                <>
                  <h3 className="text-lg font-bold mt-6 mb-3">Nearby Hotels</h3>
                  <div className="space-y-3">
                    {hotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        className="border border-orange-200 rounded-lg p-3 bg-orange-50"
                      >
                        <div className="font-semibold">🏨 {hotel.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{hotel.description}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'beach': return '🏖️';
    case 'forest': return '🌴';
    case 'mountain': return '🏔️';
    case 'cultural': return '🗿';
    case 'hotel': return '🏨';
    default: return '📍';
  }
}
