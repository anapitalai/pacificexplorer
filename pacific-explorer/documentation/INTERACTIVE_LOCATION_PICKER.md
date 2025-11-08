# Interactive Location Picker with Satellite Analysis

## Overview
The destination form now features an **interactive Copernicus satellite map** that allows admins to click anywhere to select a location. Upon selection, the system automatically analyzes the area using real-time satellite data to recommend suitable sites for hotels, tourist attractions, and activities.

## New Feature: Click-to-Select Location

### What Changed

**Before:**
- Manual coordinate entry (latitude/longitude fields)
- Separate satellite analysis component
- Required knowing exact coordinates

**After:**
- Interactive Copernicus Sentinel-2 satellite map
- Click anywhere to select location
- Automatic satellite analysis on selection
- AI-powered recommendations for hotels, tourist sites, and activities
- Visual feedback with animated markers
- Manual coordinate override still available (advanced option)

## Component: InteractiveLocationPicker

### Location
`/components/InteractiveLocationPicker.tsx`

### Features

#### 1. Interactive Copernicus Satellite Map
- **Base Layer**: Sentinel-2 cloudless mosaic (2022)
- **Provider**: EOX IT Services
- **Coverage**: Global, high-resolution imagery
- **Zoom Levels**: Up to 18 (street-level detail)
- **Interaction**: Click anywhere to select location

#### 2. Automatic Satellite Analysis
When a location is clicked, the system:
1. Places an animated marker
2. Fetches real-time Copernicus satellite data
3. Calculates suitability scores
4. Generates AI-powered recommendations

#### 3. Suitability Scoring System

**Overall Score** (0-100%):
- **Vegetation Health** (25%): Based on NDVI
- **Temperature Suitability** (25%): Optimal around 27°C
- **Coral Health** (30%): Marine ecosystem quality
- **Accessibility** (20%): Clear skies, low cloud cover

**Rating Levels:**
- 🟢 **Excellent** (80-100%): Perfect for tourism development
- 🔵 **Good** (65-79%): Suitable with minor considerations
- 🟡 **Fair** (50-64%): Possible with planning
- 🔴 **Poor** (<50%): Not recommended

#### 4. AI-Powered Recommendations

##### 🏨 Hotel Sites
Based on vegetation and temperature scores:
- **High vegetation + temp**: Eco-resorts, rainforest lodges
- **High coral health**: Beachfront resorts, overwater bungalows
- **Moderate scores**: Eco-lodges, village homestays

##### 📍 Tourist Sites
Based on environmental factors:
- **High vegetation**: Nature reserves, bird watching, hiking trails
- **High coral health**: Snorkeling sites, marine protected areas
- **Dense vegetation**: Botanical gardens, cultural villages

##### ⚡ Activities
Contextual activity suggestions:
- **High vegetation**: Jungle trekking, wildlife spotting, canopy tours
- **High coral health**: Scuba diving, snorkeling, glass-bottom boats
- **High temperature**: Beach activities, water sports, sunset cruises
- **Moderate vegetation**: Cultural experiences, photography tours

## Integration with Destination Form

### Updated Workflow

1. **Admin opens "Add New Destination" form**
2. **Interactive map displays** with Copernicus satellite imagery
3. **Admin clicks on desired location** (e.g., potential hotel site)
4. **System automatically:**
   - Sets latitude/longitude coordinates
   - Analyzes satellite data
   - Generates recommendations
5. **Admin reviews recommendations** for hotels, tourist sites, activities
6. **Admin fills in other destination details** (name, description, etc.)
7. **Form submission** includes validated coordinates

### User Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Admin: "I want to add a new coastal destination"           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Opens: /admin/destinations/new                              │
│  Sees: Interactive Copernicus satellite map of PNG          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Clicks: Coastal area near coral reefs                      │
│  System: Places animated marker                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Analyzing... (Shows loading overlay)                        │
│  • Fetching Copernicus satellite data                       │
│  • Calculating NDVI, temperature, coral health              │
│  • Generating AI recommendations                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Results Display:                                            │
│  ✓ Overall Suitability: 87% (Excellent Location)           │
│  ✓ Hotel Recommendations:                                    │
│    • Beachfront resort with diving center                   │
│    • Overwater bungalows                                    │
│  ✓ Tourist Sites:                                           │
│    • Coral reef snorkeling site                             │
│    • Marine protected area                                  │
│  ✓ Activities: Scuba diving, Snorkeling, Beach activities  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Admin fills in remaining details:                          │
│  • Name: "Paradise Reef Resort Area"                        │
│  • Description: Based on recommendations                     │
│  • Activities: Pre-filled from analysis                     │
│  • Submits form                                              │
└─────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Data Flow

```typescript
// 1. User clicks map
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  
  // 2. Update coordinates
  onLocationSelect({ latitude: lat, longitude: lng });
  
  // 3. Run analysis
  runAnalysis(lat, lng);
});

// 4. Fetch satellite data
const response = await fetch('/api/satellite/realtime', {
  method: 'POST',
  body: JSON.stringify({ latitude, longitude })
});

// 5. Calculate scores
const vegetationScore = ndvi * 100;
const tempScore = 100 - Math.abs(temperature - 27) * 5;
const coralScore = coralHealthIndex;
const accessScore = 100 - cloudCover;

const overallScore = (
  vegetationScore * 0.25 +
  tempScore * 0.25 +
  coralScore * 0.30 +
  accessScore * 0.20
);

// 6. Generate recommendations
const recommendations = generateRecommendations(
  vegetationScore,
  tempScore,
  coralScore,
  rawData
);

// 7. Display results
setAnalysisResult({ suitability, recommendations, rawData });
```

### API Endpoint

**Endpoint**: `/api/satellite/realtime`
**Method**: POST
**Payload**:
```json
{
  "latitude": -6.314993,
  "longitude": 143.95555
}
```

**Response**:
```json
{
  "ndvi": 0.75,
  "temperature": 26.8,
  "cloudCover": 15,
  "vegetation": "Dense",
  "coralHealth": "Excellent",
  "lastUpdated": "2025-10-24T...",
  "dataSource": "Copernicus Sentinel-2/3"
}
```

## Visual Design

### Map Interface
- **Size**: 400px height, full width
- **Border**: 4px ocean-blue accent
- **Badges**:
  - Top-left: "🛰️ Copernicus Sentinel-2"
  - Top-right: Selected coordinates display
- **Marker**: Animated ping effect with location icon

### Analysis Results
- **Color-coded cards**:
  - Green: Excellent (80-100%)
  - Blue: Good (65-79%)
  - Yellow: Fair (50-64%)
  - Red: Poor (<50%)
- **Score breakdown**: 4 metrics in grid layout
- **Recommendations**: 3 columns (Hotels, Sites, Activities)

### Loading States
- **Instruction banner**: Gradient ocean colors
- **Loading overlay**: Semi-transparent with spinner
- **Analysis results**: Fade-in animation

## Benefits for Tourism Planning

### For Administrators
1. **Visual Selection**: See actual satellite imagery while choosing locations
2. **Data-Driven Decisions**: Scientific analysis guides planning
3. **Time Saving**: Automatic analysis instead of manual research
4. **Comprehensive Insights**: Hotel sites + tourist attractions + activities
5. **Validation**: Confirm location suitability before investment

### For Tourism Development
1. **Optimal Site Selection**: Find best locations for hotels
2. **Activity Planning**: Know what activities suit the area
3. **Environmental Awareness**: Understand coral health, vegetation
4. **Risk Mitigation**: Avoid unsuitable locations
5. **Marketing Intel**: Get activity recommendations for promotion

### For Investors
1. **Site Validation**: Scientific data supports investment decisions
2. **Competitive Analysis**: Compare multiple locations easily
3. **Due Diligence**: Environmental factors assessed upfront
4. **ROI Indicators**: Suitability score predicts tourism potential

## Example Use Cases

### Use Case 1: Coastal Resort Planning
**Scenario**: Admin wants to add a new dive resort destination

**Process**:
1. Opens form, clicks on coral-rich coastal area
2. System shows: 92% suitability (Excellent)
3. Recommendations:
   - Hotels: Beachfront resort with diving center
   - Sites: Coral reef snorkeling, marine protected area
   - Activities: Scuba diving, snorkeling, water sports
4. Admin creates destination with confidence

### Use Case 2: Eco-Lodge Location
**Scenario**: Finding rainforest lodge site

**Process**:
1. Clicks on dense forest area inland
2. System shows: 85% suitability (Excellent)
3. Recommendations:
   - Hotels: Eco-resort with garden views, rainforest lodge
   - Sites: Nature reserve, bird watching sanctuary, hiking trails
   - Activities: Jungle trekking, wildlife spotting, canopy tours
4. Perfect for eco-tourism development

### Use Case 3: Cultural Village Tour
**Scenario**: Adding traditional village experience

**Process**:
1. Clicks on moderate vegetation area near settlement
2. System shows: 72% suitability (Good)
3. Recommendations:
   - Hotels: Traditional village homestays
   - Sites: Cultural village tour, botanical garden
   - Activities: Cultural experiences, photography tours
4. Ideal for cultural tourism

## Advanced Features

### Manual Coordinate Override
Collapsible "Advanced" section allows:
- Direct latitude/longitude entry
- Fine-tuning after map selection
- Precise coordinate specification

### Raw Satellite Data View
Expandable section shows:
- NDVI value (0.0-1.0)
- Temperature (°C)
- Cloud cover (%)
- Vegetation classification
- Coral health status

### Real-time Updates
- Analysis runs automatically on click
- No manual "analyze" button needed
- Instant feedback for rapid planning

## Configuration

### Environment Variables
No additional configuration needed. Uses existing:
```bash
COPERNICUS_CLIENT_ID=sh-16c591f2-6b8e-45bd-bc7e-2a2f61e0c8eb
COPERNICUS_CLIENT_SECRET=JgkxsQlJ63R27GEZN3mkdrQt141JeMkH
```

### Default Location
Centered on Papua New Guinea:
```typescript
initialLatitude: -6.314993  // Port Moresby area
initialLongitude: 143.95555
```

## Testing

### Test Scenarios

1. **Click Coastal Area**
   - Should show high coral health scores
   - Recommend diving/snorkeling activities
   - Suggest beach resorts

2. **Click Forest Area**
   - Should show high vegetation (NDVI) scores
   - Recommend hiking/wildlife activities
   - Suggest eco-lodges

3. **Click Urban Area**
   - Should show lower vegetation scores
   - Recommend cultural activities
   - Suggest city hotels

4. **Multiple Clicks**
   - Each click should update analysis
   - Marker should move to new location
   - Previous results should be replaced

### Manual Testing

```bash
# Start development server
npm run dev

# Navigate to:
http://localhost:3000/admin/destinations/new

# Test:
1. Click various locations on map
2. Verify analysis results update
3. Check recommendations make sense
4. Confirm coordinates are populated
5. Submit form with selected location
```

## Troubleshooting

### Issue: Map Not Loading
**Cause**: Leaflet SSR issue
**Solution**: Component uses client-side only rendering

### Issue: Analysis Not Running
**Cause**: API endpoint not responding
**Solution**: Check `/api/satellite/realtime` is working

### Issue: No Recommendations
**Cause**: Low satellite data quality
**Solution**: Try different location or check Copernicus API

### Issue: Coordinates Not Updating
**Cause**: onLocationSelect callback issue
**Solution**: Check parent component state management

## Future Enhancements

### Potential Additions
1. **Multi-point Selection**: Compare multiple sites side-by-side
2. **Historical Analysis**: Show seasonal variations
3. **Drawing Tools**: Select areas instead of points
4. **Export Reports**: PDF/Excel export of analysis
5. **Nearby POIs**: Show existing hotels, attractions
6. **Weather Integration**: Add weather forecast data
7. **Accessibility Routes**: Show transport connections
8. **Cost Estimates**: Project development costs

## Summary

✅ **Interactive map replaces manual coordinate entry**
✅ **Copernicus Sentinel-2 satellite imagery**
✅ **Click-to-select location with animated marker**
✅ **Automatic satellite analysis on selection**
✅ **AI-powered recommendations for:**
   - 🏨 Hotel sites and accommodation types
   - 📍 Tourist attractions and points of interest
   - ⚡ Activities and experiences
✅ **Real-time suitability scoring (0-100%)**
✅ **Color-coded visual feedback**
✅ **Manual coordinate override available**
✅ **Raw satellite data viewer**

The new interactive location picker transforms destination planning from a manual process into an intelligent, data-driven workflow powered by ESA Copernicus satellite technology.
