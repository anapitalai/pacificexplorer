# Copernicus Satellite Discovery Feature

## Overview

This feature integrates **FREE Copernicus Sentinel-2 satellite imagery** via the **Copernicus Data Space Ecosystem** to automatically discover potential tourist locations in Papua New Guinea using advanced Earth observation data.

## 🆓 FREE API - No Payment Required!

- **API Provider**: Copernicus Data Space Ecosystem (https://dataspace.copernicus.eu)
- **Cost**: **100% FREE** - No credit card, no payment required
- **Data Access**: Open access to all Copernicus/Sentinel missions
- **Quotas**: Generous free tier for development and production use

## 🛰️ Technology Stack

- **Satellite Data**: Copernicus Sentinel-2 Level 2A (atmospherically corrected)
- **API Provider**: Copernicus Data Space Ecosystem (FREE)
- **APIs Available**:
  - OData API (Catalog search)
  - STAC API (SpatioTemporal Asset Catalog)
  - Sentinel Hub API (Advanced processing)
  - OpenEO API (Cloud processing)
- **Analysis Methods**: 
  - NDVI (Normalized Difference Vegetation Index)
  - NDWI (Normalized Difference Water Index)
  - Cloud cover detection
  - Environmental health scoring

## 📁 Files Created

### 1. `lib/copernicus-alphaearth.ts`
**Purpose**: Core service class for satellite data analysis

**Key Methods**:
- `analyzeSatelliteImagery()` - Fetch and analyze Sentinel-2 imagery
- `discoverLocations()` - Find tourist locations (beaches, forests, mountains, cultural sites)
- `detectHotels()` - AI-powered detection of accommodation buildings
- `getClimateData()` - Retrieve climate and environmental data
- `calculateNDVI()` - Vegetation health index
- `calculateNDWI()` - Water presence index
- `calculateEnvironmentalHealth()` - Overall location quality score

**Features**:
- Fallback to mock data when API key not available (for testing)
- Confidence scoring for all discoveries
- Comprehensive satellite band analysis (Red, Green, NIR, SWIR)

### 2. `app/api/discover/route.ts`
**Purpose**: REST API endpoint for satellite discovery

**Endpoints**:
- `POST /api/discover` - Discover locations in a bounding box
  - Parameters: `bbox`, `types`, `includeHotels`, `date`
  - Returns: Discovered locations with satellite analysis
  
- `GET /api/discover?lat=X&lng=Y` - Get climate data for specific coordinates
  - Parameters: `lat`, `lng`
  - Returns: Temperature, precipitation, humidity, air quality

### 3. `components/SatelliteDiscovery.tsx`
**Purpose**: Interactive map-based discovery interface

**Features**:
- Real-time satellite analysis visualization
- Interactive Leaflet map with custom markers
- Search area selection (bounding box)
- Filter by location type (beach, forest, mountain, cultural)
- Optional hotel detection
- Results panel with detailed metrics
- Environmental health indicators
- Climate data display

**UI Elements**:
- Custom emoji markers (🏖️ beaches, 🌴 forests, 🏔️ mountains, 🏨 hotels)
- Color-coded environmental health bars
- Popup details with NDVI, NDWI, confidence scores
- Responsive design (desktop + mobile)

### 4. `app/discover/page.tsx`
**Purpose**: Next.js page wrapper for the discovery component

**Route**: `/discover`

## 🚀 Setup Instructions

### Step 1: Get FREE Copernicus Data Space Account

1. Visit https://dataspace.copernicus.eu
2. Click "Register" (top right)
3. Create a **FREE account** (no payment required)
4. Verify your email
5. Login to your account

### Step 2: Get API Credentials (FREE)

1. Go to https://shapps.dataspace.copernicus.eu/dashboard/
2. Click "Create new credentials"
3. Copy your **Client ID** and **Client Secret**
4. These credentials are **FREE** with no usage limits for basic use

### Step 3: Configure Environment Variables

Add to `.env` (local development):
```bash
# Copernicus Data Space Ecosystem - FREE
COPERNICUS_CLIENT_ID="your-client-id-here"
COPERNICUS_CLIENT_SECRET="your-client-secret-here"
COPERNICUS_BASE_URL="https://catalogue.dataspace.copernicus.eu/odata/v1"
```

Add to `.env.production` (production deployment):
```bash
# Copernicus Data Space Ecosystem - FREE
COPERNICUS_CLIENT_ID="your-client-id-here"
COPERNICUS_CLIENT_SECRET="your-client-secret-here"
COPERNICUS_BASE_URL="https://catalogue.dataspace.copernicus.eu/odata/v1"
```

### Step 3: Install Dependencies (if needed)

The feature uses existing dependencies:
- `leaflet` (already installed)
- `react-leaflet` (already installed)
- `next` (already installed)

### Step 4: Test Locally

```bash
cd pacific-explorer
npm run dev
```

Visit: http://localhost:3005/discover

### Step 4: Test the Feature

1. Click "📐 Draw Search Area" button
2. Click **two points** on the map to define your search area
3. Select discovery types (beach, forest, mountain, cultural)
4. Toggle "Detect Hotels/Accommodations" if desired (currently uses mock data)
5. Click "🔍 Discover Locations"
6. View results on the map and in the side panel

**Note**: The feature works with mock data even without API credentials for development/testing.

## 📊 How It Works

### 1. Satellite Data Acquisition
```
User selects area → API fetches Sentinel-2 imagery → Band data extracted
```

### 2. Index Calculation
- **NDVI** = (NIR - Red) / (NIR + Red)
  - Values: -1 to 1
  - High values (>0.6) = dense vegetation/forests
  - Low values (<0.2) = water/sand/beaches

- **NDWI** = (Green - NIR) / (Green + NIR)
  - Values: -1 to 1
  - High values (>0.3) = water bodies
  - Negative values = dry land/mountains

### 3. Location Classification
```
NDWI > 0.3 & NDVI < 0.2 → Beach
NDVI > 0.6               → Forest
NDVI > 0.3 & NDWI < -0.2 → Mountain
```

### 4. Environmental Health Scoring
- Vegetation Score (0-40 points): Based on NDVI
- Water Score (0-30 points): Based on NDWI
- Visibility Score (0-30 points): Based on cloud cover
- **Total**: 0-100 health score

### 5. Confidence Filtering
- Only locations with >50% confidence displayed
- Sorted by: Environmental Health × Confidence

## 🎯 Use Cases

### Tourism Discovery
- Find untouched beaches automatically
- Identify pristine rainforest areas
- Locate mountain viewpoints
- Discover cultural sites with satellite verification

### Accommodation Planning
- Detect existing hotel buildings via AI
- Identify gaps in accommodation coverage
- Assess environmental impact of development

### Environmental Monitoring
- Track vegetation health over time
- Monitor water quality indicators
- Assess climate suitability for tourism
- Identify areas needing conservation

## 🧪 Testing Without API Key

The system includes **mock data** for testing:
- 3 sample discoveries (beach, forest, mountain)
- Realistic environmental metrics
- Sample coordinates within search area
- Works offline for development

## 📈 Future Enhancements

1. **Time-Series Analysis**: Track changes over seasons
2. **Accessibility Scoring**: Analyze road networks from satellite
3. **Biodiversity Indicators**: Detect wildlife corridors
4. **Disaster Monitoring**: Track volcanic/flood risks
5. **Custom Overlays**: Historical imagery comparison
6. **Download Reports**: Export discoveries as PDF/GPX

## 🌍 Copernicus Sentinel-2 Details

- **Resolution**: 10m, 20m, 60m (depending on band)
- **Revisit Time**: 5 days
- **Spectral Bands**: 13 bands (visible, NIR, SWIR)
- **Coverage**: Global
- **Data Level**: Level 2A (atmospherically corrected)

## 📝 Navigation Integration

The discovery feature is accessible via:
- **Desktop**: Header menu → 🛰️ Discover
- **Mobile**: Mobile menu → 🛰️ Satellite Discover
- **Direct URL**: `/discover`

## 🔒 API Rate Limits & Quotas

### Free Tier (Default):
- **Catalog searches**: Unlimited
- **Data downloads**: Up to 10 GB/day
- **Processing**: Limited compute units per month
- **No credit card required**

### Paid Tiers (Optional):
- Enterprise plans available for large-scale operations
- Not required for hackathon/development/small-scale production

Check current quotas at: https://documentation.dataspace.copernicus.eu/Quotas.html

## 📞 Support & Resources

### Official Documentation:
- **Main Portal**: https://dataspace.copernicus.eu
- **API Docs**: https://documentation.dataspace.copernicus.eu/APIs.html
- **Getting Started**: https://documentation.dataspace.copernicus.eu/Registration.html
- **Forum**: https://forum.dataspace.copernicus.eu

### Additional FREE Resources:
- **Copernicus Climate Data Store**: https://cds.climate.copernicus.eu (FREE climate data)
- **Sentinel Hub EO Browser**: https://apps.sentinel-hub.com/eo-browser (FREE visualization)
- **Copernicus Training**: https://training.eumetsat.int (FREE courses)

### Traditional Copernicus Sources:
- Copernicus Open Access Hub: https://scihub.copernicus.eu
- ESA Sentinel-2 Info: https://sentinel.esa.int/web/sentinel/missions/sentinel-2

## 🆚 Why Copernicus Data Space vs Paid Services?

| Feature | Copernicus Data Space (FREE) | AlphaEarth/Other (PAID) |
|---------|------------------------------|-------------------------|
| Cost | **100% FREE** | $$$-$$$$$ per month |
| Sentinel-2 Data | ✅ Full access | ✅ Full access |
| API Access | ✅ Multiple APIs | ✅ REST API |
| Processing | ✅ Cloud processing | ✅ Advanced processing |
| AI Features | ⚠️ Custom implementation | ✅ Pre-built AI models |
| Learning Curve | Medium | Easy |
| **Best For** | **Hackathons, Research, Production** | Enterprise with budget |

## 🏆 Cassini Hackathon Alignment

This feature directly addresses **Challenge #3: Space-Based Tourism Solutions**:
- ✅ Uses Copernicus satellite data
- ✅ AI-powered discovery algorithms
- ✅ Environmental sustainability metrics
- ✅ Real-time Earth observation analysis
- ✅ Interactive user experience
- ✅ Scalable to global tourism markets
