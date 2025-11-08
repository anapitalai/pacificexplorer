/**
 * Copernicus Sentinel Hub Tile Layer Configuration
 * Provides real Copernicus satellite imagery tiles for maps
 */

/**
 * Get Sentinel Hub tile URL for True Color (RGB) imagery
 * Uses Sentinel-2 L2A data with natural colors
 */
export function getSentinelTrueColorTileUrl(): string {
  const instanceId = process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID || 'default';
  
  // Sentinel Hub WMTS service for True Color
  return `https://services.sentinel-hub.com/ogc/wmts/${instanceId}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=TRUE-COLOR&STYLE=default&TILEMATRIXSET=PopularWebMercator512&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`;
}

/**
 * Get public Sentinel-2 tile URL (no auth required)
 * Uses AWS public dataset
 */
export function getSentinel2PublicTileUrl(): string {
  // Using Sentinel-2 on AWS (public access)
  // True Color composite (B04, B03, B02)
  return 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg';
}

/**
 * Get Copernicus Global Land Cover tile URL
 */
export function getCopernicusLandCoverTileUrl(): string {
  return 'https://s2maps-tiles.eu/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CLOUDLESS-2022&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';
}

/**
 * Get alternative Sentinel-2 cloudless mosaic (Best for Pacific region)
 * This is a high-quality cloudless composite from EOX
 */
export function getSentinelCloudlessTileUrl(): string {
  return 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg';
}

/**
 * Get Sentinel-2 NDVI visualization tile URL
 * Shows vegetation health in false color
 */
export function getSentinelNDVITileUrl(): string {
  return 'https://tiles.maps.eox.at/wmts/1.0.0/sentinel2-ndvi_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.png';
}

/**
 * Get tile layer configuration for Leaflet
 */
export interface TileLayerConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom?: number;
}

/**
 * Get Copernicus Sentinel-2 tile layer configuration
 * Returns the best configuration for Pacific region
 */
export function getCopernicusSatelliteTileConfig(): TileLayerConfig {
  return {
    url: getSentinelCloudlessTileUrl(),
    attribution: '&copy; <a href="https://s2maps.eu">Sentinel-2 cloudless</a> by <a href="https://eox.at">EOX</a> | Data: <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA',
    maxZoom: 18,
    minZoom: 0,
  };
}

/**
 * Get Copernicus NDVI tile layer configuration
 */
export function getCopernicusNDVITileConfig(): TileLayerConfig {
  return {
    url: getSentinelNDVITileUrl(),
    attribution: '&copy; <a href="https://eox.at">EOX</a> | NDVI from <a href="https://dataspace.copernicus.eu">Copernicus Sentinel-2</a>',
    maxZoom: 16,
    minZoom: 0,
  };
}

/**
 * Check if Sentinel Hub instance ID is configured
 */
export function isSentinelHubConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID;
}

/**
 * Get the best available Copernicus tile URL
 * Falls back to public sources if Sentinel Hub not configured
 */
export function getBestCopernicusTileUrl(): string {
  if (isSentinelHubConfigured()) {
    return getSentinelTrueColorTileUrl();
  }
  // Use public Sentinel-2 cloudless mosaic (best quality, no auth required)
  return getSentinelCloudlessTileUrl();
}

/**
 * Get attribution text for Copernicus imagery
 */
export function getCopernicusAttribution(): string {
  return '&copy; <a href="https://dataspace.copernicus.eu">Copernicus</a> / ESA | Sentinel-2 imagery';
}
