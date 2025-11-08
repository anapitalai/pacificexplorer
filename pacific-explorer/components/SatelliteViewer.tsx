"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface SatelliteViewerProps {
  lat: number;
  lng: number;
  name: string;
}

export default function SatelliteViewer({ lat, lng, name }: SatelliteViewerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<"satellite" | "street" | "terrain">("satellite");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;
    (async () => {
      const leafletMod = await import('leaflet');
      // Leaflet default export is available as .default in some bundlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L: any = (leafletMod && (leafletMod as any).default) ? (leafletMod as any).default : leafletMod;
      if (cancelled) return;

      // Initialize map
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
      });

      mapRef.current = map;

      // Copernicus Sentinel-2 Satellite Layer (Cloudless mosaic)
      const satelliteLayer = L.tileLayer(
        "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg",
        {
          attribution: '&copy; <a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX</a> | Data: <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA',
          maxZoom: 18,
        }
      ).addTo(map);

      // Street Layer (OpenStreetMap)
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      );

      // Terrain Layer (OpenTopoMap)
      const terrainLayer = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17,
        }
      );

      // Add marker
      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 bg-png-red rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`<strong>${name}</strong><br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`);

      // Store layers for switching
  (map as unknown as { _layers: Record<string, unknown> })._layers = {
        satellite: satelliteLayer,
        street: streetLayer,
        terrain: terrainLayer,
      };

      setTimeout(() => setLoading(false), 0);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, name]);

  const switchLayer = (layerType: "satellite" | "street" | "terrain") => {
    if (!mapRef.current) return;

    const map = mapRef.current;
  const layers = (map as unknown as { _layers: Record<string, L.Layer> })._layers;

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

  return (
    <div className="relative w-full h-full">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading satellite imagery...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Layer Controls */}
  <div className="absolute top-4 right-4 z-1000 bg-white rounded-lg shadow-xl p-2 space-y-2">
        <button
          onClick={() => switchLayer("satellite")}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeLayer === "satellite"
              ? "bg-ocean-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Satellite</span>
          </div>
        </button>

        <button
          onClick={() => switchLayer("street")}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeLayer === "street"
              ? "bg-ocean-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Street</span>
          </div>
        </button>

        <button
          onClick={() => switchLayer("terrain")}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeLayer === "terrain"
              ? "bg-ocean-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span>Terrain</span>
          </div>
        </button>
      </div>

      {/* Info Panel */}
  <div className="absolute bottom-4 left-4 z-1000 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 max-w-xs">
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500 font-medium">Data Source</p>
              <p className="text-sm text-gray-800">Copernicus Sentinel-2</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500 font-medium">Coordinates</p>
              <p className="text-sm text-gray-800 font-mono">{lat.toFixed(4)}°, {lng.toFixed(4)}°</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <div>
              <p className="text-xs text-gray-500 font-medium">View Type</p>
              <p className="text-sm text-gray-800 capitalize">{activeLayer}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0.5rem;
        }
        .leaflet-popup-content {
          margin: 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
