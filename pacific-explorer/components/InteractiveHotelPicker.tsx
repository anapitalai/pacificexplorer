"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCopernicusSatelliteTileConfig } from '@/lib/copernicus-tiles';

type Hotel = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  osmId?: string | null;
  osmType?: string | null;
  distance?: number | null;
  starRating?: number | null;
  amenities?: string[];
};

type OSMHotel = {
  id: number | string;
  name: string;
  osmType: string;
  latitude: number;
  longitude: number;
  address?: string;
};

export default function InteractiveHotelPicker({
  onHotelSelect,
  defaultLat = -6.314993,
  defaultLng = 143.95555,
  defaultZoom = 8,
}: {
  onHotelSelect: (payload: { hotel: Hotel; source: 'database' | 'osm' }) => void;
  defaultLat?: number;
  defaultLng?: number;
  defaultZoom?: number;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  type LeafletLike = { marker?: (...args: unknown[]) => { addTo: (m: LeafletMap) => unknown }; divIcon?: (...args: unknown[]) => unknown };

  const [nearbyHotels, setNearbyHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchRadius, setSearchRadius] = useState(2000);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dphi = ((lat2 - lat1) * Math.PI) / 180;
    const dlambda = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dphi / 2) * Math.sin(dphi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, []);

  const searchNearbyHotels = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    setNearbyHotels([]);
    try {
      const dbRes = await fetch(`/api/hotels?lat=${lat}&lng=${lng}&radius=${searchRadius}`);
      const dbData = await dbRes.json();

      const osmRes = await fetch(`/api/osm/nearby?lat=${lat}&lng=${lng}&radius=${searchRadius}`);
      const osmData = await osmRes.json();

      const hotels: Hotel[] = [];

      if (dbData?.success && Array.isArray(dbData.hotels)) {
        dbData.hotels.forEach((h: Partial<Hotel>) => {
          hotels.push({
            id: h.id as number,
            name: (h.name as string) || 'Unknown',
            latitude: (h.latitude as number) || lat,
            longitude: (h.longitude as number) || lng,
            address: h.address ?? null,
            osmId: h.osmId ?? null,
            osmType: h.osmType ?? null,
            distance: calculateDistance(lat, lng, (h.latitude as number) || lat, (h.longitude as number) || lng),
          });
        });
      }

      if (osmData?.success && osmData.places?.hotels) {
        (osmData.places.hotels as OSMHotel[]).forEach((osmHotel) => {
          const exists = hotels.some((x) => x.osmId === String(osmHotel.id));
          if (!exists) {
            hotels.push({
              id: -Number(osmHotel.id),
              name: osmHotel.name,
              latitude: osmHotel.latitude,
              longitude: osmHotel.longitude,
              address: osmHotel.address ?? null,
              osmId: String(osmHotel.id),
              osmType: osmHotel.osmType,
              distance: calculateDistance(lat, lng, osmHotel.latitude, osmHotel.longitude),
            });
          }
        });
      }

      hotels.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setNearbyHotels(hotels);
    } catch (err) {
      console.error('searchNearbyHotels error', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchRadius, calculateDistance]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    (async () => {
      const leaflet = await import('leaflet');
      const L = leaflet.default;
      leafletRef.current = L;
      const container = mapContainerRef.current as HTMLElement;
      const map = L.map(container).setView([defaultLat, defaultLng], defaultZoom);
      mapRef.current = map;
      const tileConfig = getCopernicusSatelliteTileConfig();
      L.tileLayer(tileConfig.url, { attribution: tileConfig.attribution }).addTo(map);

      const markerIcon = L.divIcon({ className: 'custom-marker' });
      map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) map.removeLayer(markerRef.current);
        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        markerRef.current = marker as LeafletMarker;
        setShowInstructions(false);
        await searchNearbyHotels(lat, lng);
      });
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [defaultLat, defaultLng, defaultZoom, searchNearbyHotels]);

  const handleHotelSelect = useCallback((hotel: Hotel) => {
    const source = hotel.id > 0 ? 'database' : 'osm';
    onHotelSelect({ hotel, source });
    if (mapRef.current) {
      const Lobj = leafletRef.current as unknown as LeafletLike | null;
      mapRef.current.setView([hotel.latitude, hotel.longitude], 15);
      if (markerRef.current) mapRef.current.removeLayer(markerRef.current);
      const rawMarker = Lobj?.marker?.([hotel.latitude, hotel.longitude]) ?? null;
      const marker = rawMarker ? (rawMarker as { addTo: (m: LeafletMap) => unknown }).addTo(mapRef.current as LeafletMap) : null;
      markerRef.current = marker as LeafletMarker | null;
    }
  }, [onHotelSelect]);

  return (
    <div className="space-y-4">
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="p-4 flex items-center justify-between text-white">
            <h2>Select Hotel Location</h2>
            <button onClick={() => setIsFullscreen(false)}>Exit</button>
          </div>
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="absolute inset-0" />
          </div>
        </div>
      ) : (
        <>
          {showInstructions && <div className="bg-blue-600 text-white rounded-lg p-4">Click on the map to search nearby hotels.</div>}

          <div className="relative rounded-lg overflow-hidden shadow-xl border-4 border-blue-600">
            <div ref={mapContainerRef} className="h-96 w-full" />

            <div className="absolute top-4 left-4 bg-white p-2 rounded">
              <label className="text-xs">Radius</label>
              <select value={searchRadius} onChange={(e) => setSearchRadius(parseInt(e.target.value))}>
                <option value={500}>500m</option>
                <option value={1000}>1km</option>
                <option value={2000}>2km</option>
                <option value={5000}>5km</option>
              </select>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded">Searching for hotels...</div>
              </div>
            )}

            {nearbyHotels.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded max-h-64 overflow-y-auto p-2">
                <div className="font-bold p-2">Found {nearbyHotels.length} Hotels Nearby</div>
                <div className="divide-y">
                  {nearbyHotels.map((hotel) => (
                    <button key={hotel.id} onClick={() => handleHotelSelect(hotel)} className="w-full text-left p-2 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{hotel.name}</div>
                          <div className="text-xs text-gray-600">{hotel.distance ? `${hotel.distance}m away` : ''}</div>
                        </div>
                        <div className="ml-2">{hotel.id > 0 ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">DB</span> : <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">OSM</span>}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

