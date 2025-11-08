"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  destinations: Array<{
    id: number;
    name: string;
    coordinates: { lat: number; lng: number };
    category: string;
    province: string;
  }>;
}

 // Hotel types handled inline; hotels-only flow uses DB-backed endpoint
export default function InteractiveMap({ destinations }: InteractiveMapProps) {
  // Use correct Leaflet map instance type
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<InteractiveMapProps['destinations'][0] | null>(null);
  const [nearbyHotels, setNearbyHotels] = useState<Array<{id:number,name:string,distanceMeters:number,latitude?:number,longitude?:number,province?:string,city?:string}> | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<null | {id:number,name:string,latitude:number,longitude:number}>(null);
  const [routeInfo, setRouteInfo] = useState<{distanceMeters:number,durationSec:number} | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [copernicusDetections, setCopernicusDetections] = useState<Array<{id:string,name:string,coordinates:{lat:number,lng:number},type:string,confidence:number,analysis:{ndvi:number,ndwi:number,cloudCover:number,visualQuality:number,environmentalHealth:number}}> | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  // Listen for marker selection events dispatched from markers
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<InteractiveMapProps['destinations'][0]>;
      if (!ce?.detail) return;
      const dest = ce.detail;
      setSelectedDestination(dest);

      // fetch nearby hotels and hirecars
      (async () => {
        try {
          setLoadingNearby(true);
          setNearbyError(null);
          const lat = dest.coordinates.lat;
          const lng = dest.coordinates.lng;

          const hRes = await fetch(`/api/hotels/nearby?lat=${lat}&lng=${lng}&radius=20000&includeCopernicus=true`);
          const hJson = await hRes.json();
          const hotelsFromApi = hJson?.hotels || [];
          type HotelApi = {
            id: number;
            name: string;
            distanceMeters?: number;
            latitude?: number | null;
            longitude?: number | null;
            lat?: number | null;
            lng?: number | null;
            coordinates?: { lat?: number; lng?: number } | null;
            province?: string | null;
            city?: string | null;
          };
          setNearbyHotels(hotelsFromApi.map((h: HotelApi) => ({
            id: h.id,
            name: h.name,
            distanceMeters: h.distanceMeters || 0,
            latitude: h.latitude ?? h.lat ?? h.coordinates?.lat ?? null,
            longitude: h.longitude ?? h.lng ?? h.coordinates?.lng ?? null,
            province: h.province ?? undefined,
            city: h.city ?? undefined,
          })));
          setCopernicusDetections(hJson?.copernicusDetections || []);
          // hotels only for now — hirecars deferred
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          setNearbyError(msg || 'Failed to fetch nearby services');
        } finally {
          setLoadingNearby(false);
        }
      })();
    };

    window.addEventListener('pacific:destinationSelected', handler as EventListener);
    return () => window.removeEventListener('pacific:destinationSelected', handler as EventListener);
  }, [destinations]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !mounted || typeof window === 'undefined') return;

    // Dynamically import Leaflet
    import('leaflet').then((leaflet) => {
      const L = leaflet.default;
      
      if (!containerRef.current) return;

      // Initialize map centered on PNG
      const map = L.map(containerRef.current, {
        center: [-6.5, 147.0],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });

  mapRef.current = map;

      // Add Copernicus Sentinel-2 satellite layer
      const satelliteLayer = L.tileLayer(
        "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg",
        {
          attribution: '&copy; <a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX</a> | Data: <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA',
          maxZoom: 18,
        }
      );

      // Add street layer
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }
      ).addTo(map);

      // Layer control
      const baseMaps = {
        "Street": streetLayer,
        "Satellite": satelliteLayer,
      };
      L.control.layers(baseMaps).addTo(map);

      // Define category colors
      const categoryColors: Record<string, string> = {
        "Coastal": "#0ea5e9",
        "Inland": "#10b981",
        "Geothermal": "#f97316",
        "Cultural": "#eab308",
      };

      // Add markers for each destination
      destinations.forEach((destination) => {
        const color = categoryColors[destination.category] || "#6b7280";
        
        const markerIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div class="relative">
              <div class="absolute -translate-x-1/2 -translate-y-full">
                <div class="relative group cursor-pointer">
                  <!-- Pin body -->
                  <svg width="40" height="52" viewBox="0 0 40 52" class="drop-shadow-lg transition-transform hover:scale-110">
                    <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 32 20 32s20-18 20-32C40 8.954 31.046 0 20 0z" 
                          fill="${color}" 
                          stroke="white" 
                          stroke-width="2"/>
                    <circle cx="20" cy="20" r="8" fill="white"/>
                  </svg>
                  <!-- Pulse animation -->
                  <div class="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
            </div>
          `,
          iconSize: [40, 52],
          iconAnchor: [20, 52],
        });

        const marker = L.marker([destination.coordinates.lat, destination.coordinates.lng], { 
          icon: markerIcon,
        });

        // Custom popup
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-lg mb-1 text-gray-900">${destination.name}</h3>
            <p class="text-sm text-gray-600 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              ${destination.province}
            </p>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3" style="background-color: ${color}">
              ${destination.category}
            </span>
                <div class="pt-2 border-t border-gray-200">
                  <button
                          data-dest-id="${destination.id}"
                          class="open-destination w-full px-4 py-2 bg-linear-to-r from-ocean-500 to-ocean-600 text-white rounded-lg font-medium hover:from-ocean-600 hover:to-ocean-700 transition-all flex items-center justify-center space-x-2"
                        >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span>Explore</span>
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        marker.addTo(map);

        // Attach a popupopen handler to wire up the pseudo-button without using window
        marker.on('popupopen', (e: unknown) => {
          try {
            const evt = e as { popup?: L.Popup };
            const popup = evt.popup;
            const popupEl = popup && popup.getElement ? popup.getElement() : null;
            if (!popupEl) return;
            const btn = popupEl.querySelector<HTMLButtonElement>('.open-destination');
            if (!btn) return;
            // Remove possible previous handler stored as a property
            const prev = (btn as unknown as { __destClickHandler?: () => void }).__destClickHandler;
            if (prev) btn.removeEventListener('click', prev);
            const handler = () => {
              // Instead of navigating immediately, open the nearby results panel
              // Communicate via a custom event on window because this component is isolated
              try {
                const ev = new CustomEvent('pacific:destinationSelected', { detail: destination });
                window.dispatchEvent(ev);
              } catch {
                // Fallback to navigation
                router.push(`/destinations/${destination.id}`);
              }
            };
            // store a reference so we can remove if needed
            (btn as unknown as { __destClickHandler?: () => void }).__destClickHandler = handler;
            btn.addEventListener('click', handler);
          } catch {
            // ignore popup wiring errors
            console.error('Failed to wire popup button');
          }
        });

        // Add click handler
        marker.on('click', () => {
          map.setView([destination.coordinates.lat, destination.coordinates.lng], 10, {
            animate: true,
            duration: 1,
          });
        });
      });

      // Add PNG boundary highlight (simplified)
      const pngBounds = L.polygon([
        [-1.0, 141.0],
        [-1.0, 156.0],
        [-12.0, 156.0],
        [-12.0, 141.0],
      ], {
        color: '#CE1126',
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.05,
        dashArray: '5, 10',
  }).addTo(map);
  // mark pngBounds used to avoid unused-var lint warning
  void pngBounds;

      // Add legend
      const legend = new L.Control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4');
        div.innerHTML = `
          <h4 class="font-bold text-gray-900 mb-3 text-sm">Destination Types</h4>
          <div class="space-y-2">
            ${Object.entries(categoryColors).map(([category, color]) => `
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div>
                <span class="text-xs text-gray-700">${category}</span>
              </div>
            `).join('')}
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-xs text-gray-500">Click markers to explore</p>
          </div>
        `;
        return div;
      };
      legend.addTo(map);

      setLoading(false);
    });

    return () => {
      if (mapRef.current) {
  mapRef.current?.remove();
        mapRef.current = null;
      }
    };
  }, [destinations, mounted, router]);

  // Render copernicus detection markers when state updates
  useEffect(() => {
    if (!copernicusDetections || !mapRef.current) return;
    const leaflet = (window as unknown as { L?: unknown }).L as typeof import('leaflet') | undefined;
    if (!leaflet) return;

    type MarkerLike = import('leaflet').CircleMarker;
    const mapAny = mapRef.current as import('leaflet').Map & { _copernicusMarkers?: MarkerLike[] };

    // remove previous
    mapAny._copernicusMarkers = mapAny._copernicusMarkers || [];
    mapAny._copernicusMarkers.forEach((m) => m.remove());
    mapAny._copernicusMarkers = [];

    copernicusDetections.forEach((d) => {
      const marker = leaflet.circleMarker([d.coordinates.lat, d.coordinates.lng], {
        radius: 8,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        weight: 1,
        fillOpacity: 0.9,
      }).addTo(mapAny) as MarkerLike;

      marker.bindPopup(`<div class="p-2"><strong>${d.name}</strong><div class="text-xs">${d.type} • confidence ${Math.round(d.confidence*100)}%</div><div class="mt-2 text-xs"><strong>Analysis:</strong><br/>NDVI: ${d.analysis.ndvi.toFixed(2)}<br/>Environmental Health: ${Math.round(d.analysis.environmentalHealth)}/100<br/>Cloud Cover: ${Math.round(d.analysis.cloudCover)}%</div></div>`);
  const markers = mapAny._copernicusMarkers = mapAny._copernicusMarkers || [];
  markers.push(marker);
    });
  }, [copernicusDetections]);

  // Render DB-backed nearby hotels as markers
  useEffect(() => {
    if (!nearbyHotels || !mapRef.current) return;
    const leaflet = (window as unknown as { L?: unknown }).L as typeof import('leaflet') | undefined;
    if (!leaflet) return;

    type MarkerLike = import('leaflet').CircleMarker;
    const mapAny = mapRef.current as import('leaflet').Map & { _nearbyHotelMarkers?: MarkerLike[] };

    // remove previous markers
  mapAny._nearbyHotelMarkers = mapAny._nearbyHotelMarkers || [];
  mapAny._nearbyHotelMarkers.forEach((m) => m.remove());
  mapAny._nearbyHotelMarkers = mapAny._nearbyHotelMarkers || [];

    nearbyHotels.forEach((h) => {
      const lat = h.latitude ?? null;
      const lng = h.longitude ?? null;
      if (lat === null || lng === null) return;

      const marker = leaflet.circleMarker([lat, lng], {
        radius: 7,
        color: '#f97316',
        fillColor: '#fb923c',
        weight: 1,
        fillOpacity: 0.95,
      }).addTo(mapRef.current!) as MarkerLike;

      marker.bindPopup(`<div class="p-2"><strong>${h.name}</strong><div class="text-xs">${((h.distanceMeters||0)/1000).toFixed(1)} km • ${h.city || h.province || ''}</div></div>`);
      // clicking marker selects the hotel
      marker.on('click', () => {
        try {
          if (h.latitude != null && h.longitude != null) {
            selectHotel({ id: h.id, name: h.name, latitude: h.latitude, longitude: h.longitude });
            mapRef.current?.setView([h.latitude, h.longitude], 13, { animate: true, duration: 0.5 });
          }
        } catch {}
      });

      // safe push - ensure array exists
      mapAny._nearbyHotelMarkers = mapAny._nearbyHotelMarkers || [];
      mapAny._nearbyHotelMarkers.push(marker);
    });
  }, [nearbyHotels]);

  // Draw route polyline between selected hotel and selected destination
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const leaflet = (window as unknown as { L?: unknown }).L as typeof import('leaflet') | undefined;
    if (!leaflet) return;

    // cleanup previous route
    const mapAny = map as import('leaflet').Map & { _routePolyline?: import('leaflet').Polyline };
    if (mapAny._routePolyline) {
      try { mapAny._routePolyline.remove(); } catch {}
      mapAny._routePolyline = undefined;
    }

    if (!selectedHotel || !selectedDestination) return;

    let activeLayer: import('leaflet').Layer | null = null;
    let startMarker: import('leaflet').CircleMarker | null = null;
    let endMarker: import('leaflet').CircleMarker | null = null;

    const drawFallback = (from: [number, number], to: [number, number], distanceMeters?: number) => {
      try {
        const poly = leaflet.polyline([from, to], { color: '#3b82f6', weight: 4, opacity: 0.9, dashArray: '6,4' }).addTo(map);
        startMarker = leaflet.circleMarker(from, { radius:6, fillColor:'#fb923c', color:'#fb923c', fillOpacity:1 }).addTo(map);
        endMarker = leaflet.circleMarker(to, { radius:6, fillColor:'#06b6d4', color:'#06b6d4', fillOpacity:1 }).addTo(map);
        activeLayer = poly;
        if (distanceMeters != null) setRouteInfo({ distanceMeters, durationSec: Math.round((distanceMeters / 1000) / 50 * 3600) });
      } catch {}
    };

    const fetchRoute = async () => {
      setLoadingRoute(true);
      setRouteError(null);
      setRouteInfo(null);
      const fromLon = selectedHotel.longitude;
      const fromLat = selectedHotel.latitude;
      const toLon = selectedDestination.coordinates.lng;
      const toLat = selectedDestination.coordinates.lat;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
      try {
        const res = await fetch(osrmUrl);
        if (!res.ok) throw new Error('Routing service error');
        const data = await res.json();
        const route = data.routes && data.routes[0];
        if (route && route.geometry) {
          const geo = route.geometry as import('geojson').GeoJSON;
          const layer = leaflet.geoJSON(geo, { style: { color: '#3b82f6', weight: 4, opacity: 0.9, dashArray: '6,4' } }).addTo(map) as import('leaflet').GeoJSON;
          activeLayer = layer as import('leaflet').Layer;
          startMarker = leaflet.circleMarker([fromLat, fromLon], { radius:6, fillColor:'#fb923c', color:'#fb923c', fillOpacity:1 }).addTo(map);
          endMarker = leaflet.circleMarker([toLat, toLon], { radius:6, fillColor:'#06b6d4', color:'#06b6d4', fillOpacity:1 }).addTo(map);
          setRouteInfo({ distanceMeters: Math.round(route.distance), durationSec: Math.round(route.duration) });
          try { map.fitBounds(layer.getBounds().pad(0.2), { animate: true, duration: 0.5 }); } catch {}
        } else {
          // fallback to straight line
          const dist = haversineMeters(fromLat, fromLon, toLat, toLon);
          drawFallback([fromLat, fromLon], [toLat, toLon], dist);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setRouteError(msg || 'Failed to fetch route');
        const dist = haversineMeters(fromLat, fromLon, toLat, toLon);
        drawFallback([fromLat, fromLon], [toLat, toLon], dist);
      } finally {
        setLoadingRoute(false);
        // store reference
    mapAny._routePolyline = activeLayer as import('leaflet').Polyline | undefined;
      }
    };

    fetchRoute();

    return () => {
      try { if (activeLayer) (activeLayer as import('leaflet').Layer).remove(); } catch {}
      try { if (startMarker) startMarker.remove(); } catch {}
      try { if (endMarker) endMarker.remove(); } catch {}
      if (mapAny._routePolyline) {
        try { mapAny._routePolyline.remove(); } catch {}
        mapAny._routePolyline = undefined;
      }
    };
  }, [selectedHotel, selectedDestination]);

  // persist selected hotel in localStorage and restore on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pe:selectedHotel');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && parsed.latitude && parsed.longitude) {
          setSelectedHotel(parsed);
        }
      }
    } catch {}
  }, []);

  const selectHotel = (h: {id:number,name:string,latitude:number,longitude:number} | null) => {
    setSelectedHotel(h);
    try {
      if (h) localStorage.setItem('pe:selectedHotel', JSON.stringify(h));
      else localStorage.removeItem('pe:selectedHotel');
    } catch {}
  };

  // helper haversine
  function haversineMeters(lat1:number, lon1:number, lat2:number, lon2:number) {
    const toRad = (v:number) => v * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading Overlay */}
      {(loading || !mounted) && (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-linear-to-br from-ocean-50 to-ocean-100 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ocean-700 font-medium">Loading interactive map...</p>
          </div>
        </div>
      )}

      {mounted && (
        <>
          {/* Map Container */}
          <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-2xl" />

          {/* Info Banner */}
          <div className="absolute top-4 left-4 z-1000 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl px-4 py-3 max-w-md">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Explore Papua New Guinea</h3>
                <p className="text-xs text-gray-600">Click on markers to view destinations</p>
              </div>
            </div>
          </div>
          {/* Nearby results sidebar listens for selection events */}
          <NearbyResultsSidebar
            selected={selectedDestination}
            hotels={nearbyHotels}
            loading={loadingNearby}
            error={nearbyError}
            routeInfo={routeInfo}
            loadingRoute={loadingRoute}
            routeError={routeError}
            selectedHotel={selectedHotel}
            onClose={() => {
              setSelectedDestination(null);
              setNearbyHotels(null);
              setNearbyError(null);
              setSelectedHotel(null);
            }}
            onSelectHotel={(h) => {
              if (!h) return;
              selectHotel({ id: h.id, name: h.name, latitude: h.latitude!, longitude: h.longitude! });
            }}
          />
        </>
      )}

      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
          z-index: 0;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          padding: 0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          font-size: 0.875rem;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-layers {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

function NearbyResultsSidebar({
  selected,
  hotels,
  loading,
  error,
  onClose,
  onSelectHotel,
  routeInfo,
  loadingRoute,
  routeError,
  selectedHotel,
}: {
  selected: InteractiveMapProps['destinations'][0] | null;
  hotels: Array<{id:number,name:string,distanceMeters:number,latitude?:number,longitude?:number,province?:string,city?:string}> | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSelectHotel?: (h: {id:number,name:string,latitude?:number,longitude?:number} | null) => void;
  routeInfo?: {distanceMeters:number,durationSec:number} | null;
  loadingRoute?: boolean;
  routeError?: string | null;
  selectedHotel?: {id:number,name:string,latitude:number,longitude:number} | null;
}) {
  if (!selected) return null;

  return (
    <aside className="absolute right-4 top-4 w-80 max-h-[70vh] overflow-auto z-50 bg-white rounded-2xl shadow-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-gray-900">Nearby results</h4>
          <p className="text-xs text-gray-500">{selected.name} • {selected.province}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="mt-3">
          {loading && <p className="text-sm text-gray-500">Loading nearby services…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
            <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-sm text-gray-900">Hotels & Lodgings</h5>
              {hotels && hotels.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {hotels.map((h) => {
                    const isSelected = selectedHotel ? selectedHotel.id === h.id : false;
                    return (
                    <li key={h.id} className={`text-sm text-gray-700 border p-2 rounded-md ${isSelected ? 'ring-2 ring-ocean-400' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="font-medium">{h.name}</div>
                          <div className="text-xs text-gray-500">{(h.distanceMeters/1000).toFixed(1)} km • {h.city || h.province}</div>
                        </div>
                        <div className="ml-2 shrink-0">
                          <button
                            onClick={() => onSelectHotel && onSelectHotel({ id: h.id, name: h.name, latitude: h.latitude, longitude: h.longitude })}
                            className="px-3 py-1 bg-ocean-600 text-white rounded-md text-xs"
                          >
                            Route
                          </button>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No hotels found nearby</p>
              )}
              {/* Route info */}
              {(routeInfo || loadingRoute || routeError) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                  {loadingRoute && <div>Calculating route…</div>}
                  {routeError && <div className="text-red-500">{routeError}</div>}
                  {routeInfo && (
                    <div>
                      <div><strong>Distance:</strong> {(routeInfo.distanceMeters/1000).toFixed(1)} km</div>
                      <div><strong>Approx time:</strong> {Math.round(routeInfo.durationSec/60)} min</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hirecars deferred */}
          </div>
        )}
      </div>
    </aside>
  );
}
