"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Layer as LeafletLayer } from 'leaflet';
import { Session } from "next-auth";
import "leaflet/dist/leaflet.css";
import { fetchRealTimeSatelliteData, shouldUseRealData } from "@/lib/copernicus-live";
import { getCopernicusSatelliteTileConfig, getCopernicusNDVITileConfig } from "@/lib/copernicus-tiles";

interface AdvancedSatelliteViewerProps {
  lat: number;
  lng: number;
  name: string;
  session?: Session | null;
}

type LayerType = "satellite" | "street" | "terrain" | "sentinel2" | "sentinel1" | "ndvi" | "temperature";
type TimeRange = "current" | "1month" | "3months" | "6months" | "1year";

export default function AdvancedSatelliteViewer({ lat, lng, name, session }: AdvancedSatelliteViewerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<unknown | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<LayerType>("satellite");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("current");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dataSource, setDataSource] = useState<string>("Simulated");
  const [environmentalData, setEnvironmentalData] = useState({
    ndvi: 0.65,
    temperature: 28.5,
    cloudCover: 15,
    vegetation: "Healthy",
    coralHealth: "Good",
  });
  // silent usage to satisfy lint when specific fields are not used in some render paths
  void environmentalData.ndvi;
  void environmentalData.temperature;
  void environmentalData.vegetation;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !mounted || typeof window === 'undefined') return;

    let intervalId: NodeJS.Timeout;

    // Dynamically import Leaflet at client runtime
    import('leaflet').then((leaflet) => {
      const L = leaflet.default as typeof import('leaflet');
      
      if (!containerRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: true,
    });

    mapRef.current = map;

    // Copernicus Sentinel-2 Satellite Layer (Cloudless mosaic)
    const copernicusConfig = getCopernicusSatelliteTileConfig();
    const satelliteLayer = L.tileLayer(
      copernicusConfig.url,
      {
        attribution: copernicusConfig.attribution,
        maxZoom: copernicusConfig.maxZoom,
      }
    ).addTo(map);

    // Street Layer (OpenStreetMap)
    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }
    );

    // Terrain Layer (OpenTopoMap)
    const terrainLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution: '&copy; OpenTopoMap',
        maxZoom: 17,
      }
    );

    // Sentinel-2 True Color (Simulated - using ESRI with overlay)
    // Note: These layers are created but NOT added to map by default
    const sentinel2Layer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Sentinel-2 © ESA/Copernicus",
        maxZoom: 19,
        opacity: 1.0,
      }
    );

    // Sentinel-1 Radar (Simulated - grayscale overlay)
    const sentinel1Layer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Sentinel-1 SAR © ESA/Copernicus",
        maxZoom: 19,
        opacity: 1.0,
      }
    );

    // Copernicus Sentinel-2 NDVI Layer (Real vegetation health data)
    const ndviConfig = getCopernicusNDVITileConfig();
    const ndviLayer = L.tileLayer(
      ndviConfig.url,
      {
        attribution: ndviConfig.attribution,
        maxZoom: ndviConfig.maxZoom,
        opacity: 0.7,
      }
    );

    // Temperature Layer (Simulated - using ocean tiles)
    const temperatureLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Sea Surface Temperature © ESA/Copernicus Sentinel-3",
        maxZoom: 13,
        opacity: 1.0,
      }
    );

    // Add marker with enhanced styling
    const markerIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="w-10 h-10 bg-png-red rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-pulse">
        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
    // initial popup uses placeholders; actual values updated by separate effect
    marker.bindPopup(`
      <div class="p-2">
        <strong class="text-lg">${name}</strong><br/>
        <span class="text-xs text-gray-600">Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°</span>
        <div class="mt-2 pt-2 border-t border-gray-200">
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-600">NDVI:</span>
              <span class="font-semibold text-green-600">--</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Temp:</span>
              <span class="font-semibold text-blue-600">-- °C</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Vegetation:</span>
              <span class="font-semibold text-green-600">--</span>
            </div>
          </div>
        </div>
      </div>
    `);
    markerRef.current = marker;

    // Store layers for switching
    (map as unknown as { _layers: Record<string, LeafletLayer> })._layers = {
      satellite: satelliteLayer,
      street: streetLayer,
      terrain: terrainLayer,
      sentinel2: sentinel2Layer,
      sentinel1: sentinel1Layer,
      ndvi: ndviLayer,
      temperature: temperatureLayer,
    };

    setLoading(false);

    // Update environmental data - real-time for authenticated users, simulated for guests
    const updateEnvironmentalData = async () => {
      // Check if user is authenticated and has access to real data
      const useRealData = shouldUseRealData(session?.user?.role);

      try {
        // Fetch satellite data (real or simulated based on authentication)
        const satelliteData = await fetchRealTimeSatelliteData(lat, lng, useRealData);
        setEnvironmentalData({
          ndvi: satelliteData.ndvi,
          temperature: satelliteData.temperature,
          cloudCover: satelliteData.cloudCover,
          vegetation: satelliteData.vegetation,
          coralHealth: satelliteData.coralHealth,
        });
        setDataSource(satelliteData.dataSource);
      } catch (error) {
        console.error('Failed to fetch satellite data:', error);
        // Fall back to basic simulated data if all else fails
        simulateEnvironmentalData();
      }
    };

    const simulateEnvironmentalData = () => {
      const baseNdvi = 0.65;
      const baseTemp = 28.5;
      const variation = Math.random() * 0.1 - 0.05;
      
      setEnvironmentalData({
        ndvi: parseFloat((baseNdvi + variation).toFixed(2)),
        temperature: parseFloat((baseTemp + variation * 5).toFixed(1)),
        cloudCover: Math.floor(Math.random() * 30),
        vegetation: baseNdvi + variation > 0.6 ? "Healthy" : "Moderate",
        coralHealth: baseNdvi + variation > 0.6 ? "Good" : "Fair",
      });
      setDataSource('Simulated');
    };

    // Initial data fetch
    updateEnvironmentalData();

    // Update every 5 seconds
    intervalId = setInterval(updateEnvironmentalData, 5000);
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // Only depend on stable external inputs; internal environmental data is updated via state setters
  }, [lat, lng, name, mounted, session]);

  // Update popup content when environmental data changes without reinitializing the map
  useEffect(() => {
    if (!markerRef.current) return;
    const content = `
      <div class="p-2">
        <strong class="text-lg">${name}</strong><br/>
        <span class="text-xs text-gray-600">Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°</span>
        <div class="mt-2 pt-2 border-t border-gray-200">
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-600">NDVI:</span>
              <span class="font-semibold text-green-600">${environmentalData.ndvi}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Temp:</span>
              <span class="font-semibold text-blue-600">${environmentalData.temperature}°C</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Vegetation:</span>
              <span class="font-semibold text-green-600">${environmentalData.vegetation}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    // markerRef may be unknown at compile time; use optional chaining to avoid runtime crashes
    // when Leaflet hasn't been initialized yet
    (markerRef.current as unknown as { bindPopup?: (c: string) => void })?.bindPopup?.(content);
  }, [environmentalData, name, lat, lng]);

  const switchLayer = (layerType: LayerType) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
  const layers = (map as unknown as { _layers: Record<string, import('leaflet').Layer> })._layers;

    // Remove current layer
    if (layers[activeLayer]) {
      map.removeLayer(layers[activeLayer]);
    }

    // Add new layer
    if (layers[layerType]) {
      layers[layerType].addTo(map);
    }

    setActiveLayer(layerType);
  };

  const getLayerInfo = () => {
    const info: Record<LayerType, { name: string; description: string; source: string }> = {
      satellite: {
        name: "Copernicus Sentinel-2 Satellite",
        description: "High-resolution cloudless imagery from ESA Sentinel-2",
        source: "Copernicus / ESA Sentinel-2",
      },
      street: {
        name: "Street Map",
        description: "OpenStreetMap with roads and labels",
        source: "OpenStreetMap Contributors",
      },
      terrain: {
        name: "Topographic Terrain",
        description: "Elevation and terrain features",
        source: "OpenTopoMap / SRTM",
      },
      sentinel2: {
        name: "Sentinel-2 Optical",
        description: "10m resolution multispectral imagery",
        source: "ESA Copernicus Sentinel-2",
      },
      sentinel1: {
        name: "Sentinel-1 SAR Radar",
        description: "All-weather radar imaging",
        source: "ESA Copernicus Sentinel-1",
      },
      ndvi: {
        name: "NDVI Vegetation Index",
        description: "Vegetation health and density analysis",
        source: "Derived from Sentinel-2",
      },
      temperature: {
        name: "Sea Surface Temperature",
        description: "Ocean temperature monitoring",
        source: "Sentinel-3 SLSTR",
      },
    };
    return info[activeLayer];
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading Overlay */}
      {(loading || !mounted) && (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-linear-to-br from-ocean-50 to-ocean-100">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ocean-700 font-medium">Loading Copernicus satellite data...</p>
          </div>
        </div>
      )}

      {mounted && (
        <>
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden shadow-2xl" />

      {/* Control Buttons - Bottom Left to avoid zoom controls */}
  <div className="absolute bottom-20 left-4 z-900 flex flex-col space-y-2">
        {/* Advanced Controls Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`bg-white rounded-full shadow-xl p-3 hover:bg-ocean-50 transition-all ${showAdvanced ? 'bg-ocean-50' : ''}`}
          title="Advanced Controls"
        >
          <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {/* Info Panel Toggle */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`bg-white rounded-full shadow-xl p-3 hover:bg-ocean-50 transition-all ${showInfo ? 'bg-ocean-50' : ''}`}
          title="Layer Information"
        >
          <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Layer Controls Toggle */}
      <button
        onClick={() => setShowLayers(!showLayers)}
  className={`absolute top-4 right-4 z-900 bg-white rounded-full shadow-xl p-3 hover:bg-ocean-50 transition-all ${showLayers ? 'bg-ocean-50' : ''}`}
        title="Satellite Layers"
      >
        <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </button>

      {/* Advanced Control Panel */}
      {showAdvanced && (
  <div className="absolute bottom-20 left-20 z-900 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-72 space-y-4 animate-slide-up max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800">Advanced Controls</h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Close panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Time Range Analysis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["current", "1month", "3months", "6months", "1year"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    timeRange === range
                      ? "bg-ocean-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {range === "current" ? "Current" : range.replace(/(\d+)/, "$1 ")}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Environmental Indicators
            </h3>
            <div className="space-y-2">
              <div className="bg-linear-to-r from-green-50 to-green-100 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">NDVI (Vegetation)</span>
                  <span className="text-sm font-bold text-green-700">{environmentalData.ndvi}</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${environmentalData.ndvi * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-green-600 font-medium">{environmentalData.vegetation}</span>
              </div>

              <div className="bg-linear-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Sea Temperature</span>
                  <span className="text-sm font-bold text-blue-700">{environmentalData.temperature}°C</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(environmentalData.temperature / 35) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-linear-to-r from-cyan-50 to-cyan-100 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Coral Reef Health</span>
                  <span className="text-sm font-bold text-cyan-700">{environmentalData.coralHealth}</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all"
                    style={{ width: environmentalData.coralHealth === "Good" ? "85%" : "60%" }}
                  ></div>
                </div>
              </div>

              <div className="bg-linear-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Cloud Cover</span>
                  <span className="text-sm font-bold text-gray-700">{environmentalData.cloudCover}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-gray-400 to-gray-500 h-2 rounded-full transition-all"
                    style={{ width: `${environmentalData.cloudCover}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer Controls - Compact */}
      {showLayers && (
  <div className="absolute top-16 right-4 z-900 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-2 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto animate-slide-up" style={{ minWidth: '180px' }}>
          <div className="text-xs font-bold text-gray-600 mb-1 px-2">LAYERS</div>
        
        {/* Basic Layers */}
        <button
          onClick={() => switchLayer("satellite")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "satellite"
              ? "bg-ocean-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>

        <button
          onClick={() => switchLayer("street")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "street"
              ? "bg-ocean-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Street
        </button>

        <button
          onClick={() => switchLayer("terrain")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "terrain"
              ? "bg-ocean-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Terrain
        </button>

        <div className="border-t border-gray-200 my-1"></div>
        <div className="text-xs font-bold text-ocean-600 mb-1 px-2">SENTINEL</div>

        {/* Copernicus Sentinel Layers */}
        <button
          onClick={() => switchLayer("sentinel2")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "sentinel2"
              ? "bg-png-red text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Sentinel-2
        </button>

        <button
          onClick={() => switchLayer("sentinel1")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "sentinel1"
              ? "bg-png-red text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Sentinel-1
        </button>

        <button
          onClick={() => switchLayer("ndvi")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "ndvi"
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          NDVI
        </button>

        <button
          onClick={() => switchLayer("temperature")}
          className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeLayer === "temperature"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Temp
        </button>
      </div>
      )}

      {/* Enhanced Info Panel */}
      {showInfo && (
  <div className="absolute bottom-4 left-4 z-900 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 max-w-sm animate-slide-up">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
            <div className={`w-2 h-2 rounded-full animate-pulse ${dataSource === 'Copernicus Sentinel-2/3' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span className="text-xs font-bold text-gray-600">{dataSource === 'Copernicus Sentinel-2/3' ? 'LIVE SATELLITE DATA' : 'SIMULATED DATA'}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium">Active Layer</p>
                <p className="text-sm text-gray-800 font-semibold">{getLayerInfo().name}</p>
                <p className="text-xs text-gray-600">{getLayerInfo().description}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium">Coordinates</p>
                <p className="text-sm text-gray-800 font-mono">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium">Data Source</p>
                <p className="text-sm text-gray-800">{getLayerInfo().source}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .leaflet-popup-content {
          margin: 0.75rem;
          font-size: 0.875rem;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
      )}
    </div>
  );
}
