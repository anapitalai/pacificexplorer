# Copernicus Satellite Imagery Integration

## Overview
All satellite imagery tiles in Pacific Explorer now use **Copernicus Sentinel-2** data instead of third-party providers like ESRI. This provides authentic ESA satellite imagery directly from the Copernicus program.

## What Changed

### Before
- **Satellite Tiles**: ESRI World Imagery (third-party)
- **Attribution**: Mixed commercial sources
- **Data Source**: Non-Copernicus imagery

### After
- **Satellite Tiles**: Copernicus Sentinel-2 cloudless mosaic
- **Attribution**: ESA Copernicus / Sentinel-2
- **Data Source**: Real ESA satellite imagery via EOX tiles

## Implementation Details

### New Utility Library: `lib/copernicus-tiles.ts`

Created a centralized configuration for Copernicus tile layers:

```typescript
// Get Sentinel-2 cloudless mosaic (Best for Pacific region)
getSentinelCloudlessTileUrl()
// Returns: High-quality cloudless composite from EOX

// Get Sentinel-2 NDVI visualization
getSentinelNDVITileUrl()
// Returns: Vegetation health in false color

// Get tile layer configuration
getCopernicusSatelliteTileConfig()
// Returns complete Leaflet config
```

**Key Features:**
- Public access (no authentication required for tiles)
- High resolution (up to 18 zoom levels)
- Cloudless composites for clear viewing
- Optimized for Pacific region
- Multiple data products (RGB, NDVI)

### Tile Provider: EOX Sentinel-2 Cloudless

**Service**: EOX IT Services
**URL**: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/`
**Data**: Copernicus Sentinel-2 L2A imagery
**Coverage**: Global, including Pacific Islands
**Update**: Annual cloudless mosaics

**Why EOX?**
- Official Copernicus data distributor
- Pre-processed cloudless mosaics
- Optimized for web mapping
- Free public access
- High performance CDN

## Updated Components

### 1. AdvancedSatelliteViewer.tsx
**Changes:**
- ✅ Satellite layer now uses Copernicus Sentinel-2 cloudless
- ✅ NDVI layer uses real Copernicus vegetation data
- ✅ Updated layer descriptions and attributions
- ✅ Maintains all interactive features

**Before:**
```typescript
const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/.../World_Imagery/...",
  { attribution: "Tiles © Esri", maxZoom: 19 }
);
```

**After:**
```typescript
const copernicusConfig = getCopernicusSatelliteTileConfig();
const satelliteLayer = L.tileLayer(
  copernicusConfig.url, // Sentinel-2 cloudless
  { 
    attribution: copernicusConfig.attribution,
    maxZoom: copernicusConfig.maxZoom 
  }
);
```

### 2. InteractiveMap.tsx
**Changes:**
- ✅ Base satellite layer switched to Copernicus Sentinel-2
- ✅ Updated attribution text
- ✅ All destination markers still work

### 3. SatelliteDiscovery.tsx
**Changes:**
- ✅ "🛰️ Satellite View" now uses Sentinel-2
- ✅ "🛰️ Satellite + Labels" combines Sentinel-2 with OSM labels
- ✅ All layer switching functionality preserved
- ✅ Search and analysis features unchanged

### 4. SatelliteViewer.tsx
**Changes:**
- ✅ Default satellite layer is Copernicus Sentinel-2
- ✅ Info panel updated to show "Copernicus Sentinel-2"
- ✅ Layer switching still works

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Pacific Explorer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Map Components (Leaflet)                                    │
│    ├─ AdvancedSatelliteViewer                               │
│    ├─ InteractiveMap                                        │
│    ├─ SatelliteDiscovery                                    │
│    └─ SatelliteViewer                                       │
│                           │                                   │
│                           ▼                                   │
│  Copernicus Tiles Config (lib/copernicus-tiles.ts)         │
│    ├─ Sentinel-2 RGB cloudless                             │
│    └─ Sentinel-2 NDVI                                       │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              EOX Tile Service (Public Access)                │
│  https://tiles.maps.eox.at/wmts/s2cloudless-2022_3857/     │
│                                                               │
│  Data Source: Copernicus Sentinel-2 L2A                     │
│  Processing: Cloudless annual mosaics                       │
│  Resolution: 10m per pixel                                   │
│  Coverage: Global (including Pacific)                       │
└─────────────────────────────────────────────────────────────┘
```

## Two Types of Copernicus Data

### 1. Satellite Imagery Tiles (NEW - This Update)
- **Purpose**: Background map imagery
- **Source**: EOX Sentinel-2 cloudless mosaics
- **Access**: Public tile service (no auth)
- **Usage**: Visual reference for all users
- **Components**: All map components

### 2. Environmental Data & Analysis (Already Implemented)
- **Purpose**: Real-time environmental metrics
- **Source**: Copernicus Data Space Ecosystem API
- **Access**: OAuth2 authenticated
- **Usage**: NDVI, temperature, coral health calculations
- **Components**: AdvancedSatelliteViewer, SatelliteLocationAnalyzer
- **Credentials**: 
  - Client ID: `sh-16c591f2-6b8e-45bd-bc7e-2a2f61e0c8eb`
  - Client Secret: `JgkxsQlJ63R27GEZN3mkdrQt141JeMkH`

## Benefits of This Integration

### For Users
1. **Authentic ESA Data**: Viewing real Copernicus satellite imagery
2. **High Quality**: Professional-grade cloudless mosaics
3. **Consistent Source**: All imagery from same satellite program
4. **Better Pacific Coverage**: Optimized composites for the region
5. **No Watermarks**: Clean, unbranded imagery

### For Developers
1. **Centralized Config**: All tile URLs in one utility file
2. **Easy Updates**: Change tile source in one place
3. **Public Access**: No API keys needed for tiles
4. **Performance**: Fast CDN delivery
5. **Compliance**: Official Copernicus data usage

### For the Project
1. **ESA Integration**: True Copernicus satellite imagery showcase
2. **Hackathon Alignment**: Using actual Cassini/ESA data
3. **Professional**: Industry-standard satellite imagery
4. **Scalable**: Public tile service handles all traffic
5. **Attribution**: Proper credit to ESA/Copernicus

## Technical Specifications

### Sentinel-2 Cloudless Tiles
- **Sensor**: Sentinel-2 MSI (MultiSpectral Instrument)
- **Bands**: True Color (B04-Red, B03-Green, B02-Blue)
- **Resolution**: 10m per pixel
- **Projection**: Web Mercator (EPSG:3857)
- **Tile Size**: 256x256 pixels
- **Format**: JPEG (optimized for bandwidth)
- **Max Zoom**: 18 (street-level detail)

### NDVI Tiles (Vegetation Analysis)
- **Sensor**: Sentinel-2 MSI
- **Calculation**: (NIR - Red) / (NIR + Red)
- **Bands Used**: B08 (NIR), B04 (Red)
- **Visualization**: False color (red = healthy vegetation)
- **Max Zoom**: 16
- **Format**: PNG (preserves visualization)

## Attribution Requirements

All map displays must include proper attribution:

```html
© Sentinel-2 cloudless by EOX | Data: Copernicus / ESA
```

This is automatically included in all tile layer configurations.

## Future Enhancements

### Potential Additions
1. **Sentinel-1 SAR**: All-weather radar imagery
2. **Sentinel-3 OLCI**: Ocean color for coral reefs
3. **Custom Processing**: Direct Sentinel Hub integration
4. **Time Series**: Historical imagery comparison
5. **Download**: Export high-res Copernicus imagery

### For Custom Processing
To access raw Sentinel data instead of pre-processed tiles:

1. Get Sentinel Hub account: https://www.sentinel-hub.com/
2. Add instance ID to `.env`:
   ```bash
   NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=your-instance-id
   ```
3. Update `copernicus-tiles.ts` to use Sentinel Hub endpoints

## Testing

### Visual Verification
1. Open any destination page
2. Check map displays Sentinel-2 imagery
3. Verify "Copernicus / ESA" in attribution
4. Switch between map layers
5. Zoom in to verify high-resolution imagery

### Component Testing
```bash
# Start development server
npm run dev

# Visit test URLs:
# - /discover (SatelliteDiscovery)
# - /destinations/[id] (InteractiveMap)
# - Dashboard satellite viewer (AdvancedSatelliteViewer)
# - /explore (SatelliteViewer)
```

### Verify Attribution
Check browser console for tile requests:
- Should see `tiles.maps.eox.at` URLs
- No more `arcgisonline.com` requests
- Proper attribution in map corner

## Troubleshooting

### Issue: Tiles Not Loading
**Cause**: Network/CORS issues
**Solution**: EOX tiles are public, check internet connection

### Issue: Low Resolution
**Cause**: Zoom level too high
**Solution**: Sentinel-2 max zoom is 18, ESRI went to 19

### Issue: Missing Attribution
**Cause**: Custom tile layer without config
**Solution**: Always use `getCopernicusSatelliteTileConfig()`

### Issue: Outdated Imagery
**Cause**: Annual mosaics (2022 in current config)
**Solution**: Update URL to latest year or use Sentinel Hub

## Resources

- **Copernicus Data Space**: https://dataspace.copernicus.eu
- **EOX Sentinel-2 Maps**: https://s2maps.eu
- **Sentinel-2 Mission**: https://sentinel.esa.int/web/sentinel/missions/sentinel-2
- **Tile Service Docs**: https://tiles.maps.eox.at/
- **Sentinel Hub**: https://www.sentinel-hub.com/

## Summary

✅ **All satellite imagery tiles now use Copernicus Sentinel-2 data**
✅ **Centralized configuration in `lib/copernicus-tiles.ts`**
✅ **Four map components updated**
✅ **Public access (no authentication for tiles)**
✅ **Proper ESA/Copernicus attribution**
✅ **High-quality cloudless mosaics**
✅ **Optimized for Pacific region**

The Pacific Explorer platform now showcases authentic ESA Copernicus satellite imagery throughout the application, providing users with real space-based Earth observation data for tourism planning.
