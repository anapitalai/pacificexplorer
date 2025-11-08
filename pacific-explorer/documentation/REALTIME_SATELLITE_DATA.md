# Real-Time Satellite Data Integration

## Overview
Pacific Explorer now features a **hybrid satellite data system** that provides:
- **Simulated data** for anonymous/unauthenticated users
- **Real-time Copernicus satellite data** for authenticated users (TOURIST, HOTEL_OWNER, ADMIN)

This intelligent system ensures a smooth user experience while providing premium real-time environmental monitoring for logged-in users.

---

## Architecture

### Data Flow
```
User Access → AdvancedSatelliteViewer → fetchRealTimeSatelliteData()
                                              ↓
                                    Check Authentication
                                    /                  \
                           Authenticated           Unauthenticated
                                ↓                        ↓
                    Copernicus API Call           Simulated Data
                    (Sentinel-2/3)                (Location-based)
                                \                      /
                                 Environmental Data
```

### Key Components

#### 1. **`/lib/copernicus-live.ts`**
Core library for satellite data integration:

**Functions:**
- `getCopernicusToken()` - OAuth2 authentication with Copernicus API
- `fetchSentinel2Data()` - Retrieves NDVI and cloud cover from Sentinel-2 MSI
- `fetchSeaTemperature()` - Calculates sea surface temperature (real API coming soon)
- `fetchRealTimeSatelliteData()` - Main function handling data routing
- `shouldUseRealData()` - Determines if user gets real data based on role

**Data Sources:**
- **Real Data**: ESA Copernicus Data Space Ecosystem
  - Sentinel-2 MSI: 10m resolution optical imagery
  - Sentinel-3 SLSTR: Sea surface temperature (simulated for now)
- **Simulated Data**: Location-aware calculations mimicking real conditions

#### 2. **`/components/AdvancedSatelliteViewer.tsx`**
Interactive map component with environmental indicators:

**Features:**
- Automatic data source detection (session-aware)
- Visual indicator showing "LIVE SATELLITE DATA" vs "SIMULATED DATA"
- 5-second refresh interval for continuous updates
- Graceful fallback to simulated data if API fails

**Environmental Metrics:**
- NDVI (Normalized Difference Vegetation Index)
- Sea Surface Temperature (°C)
- Cloud Cover (%)
- Vegetation Health (Healthy/Moderate/Sparse)
- Coral Health (Good/Fair/Stressed)

#### 3. **`/app/destinations/[id]/page.tsx`**
Destination detail page that passes session to viewer:
- Fetches user session server-side
- Passes session prop to AdvancedSatelliteViewer
- Enables session-aware data fetching

---

## Authentication & Access Control

### User Roles & Data Access

| Role | Access Level | Data Source |
|------|-------------|-------------|
| **Anonymous** | Public | Simulated (Location-based) |
| **TOURIST** | Authenticated | Real-time Copernicus |
| **HOTEL_OWNER** | Authenticated | Real-time Copernicus |
| **ADMIN** | Authenticated | Real-time Copernicus |

### Implementation
```typescript
// Automatic role-based data selection
const useRealData = shouldUseRealData(session?.user?.role);
const satelliteData = await fetchRealTimeSatelliteData(lat, lng, useRealData);
```

---

## Copernicus API Setup

### 1. Register for Copernicus Data Space
1. Visit: https://dataspace.copernicus.eu/
2. Create a free account
3. Navigate to: https://identity.dataspace.copernicus.eu/auth/realms/CDSE/account/#/
4. Generate OAuth2 credentials

### 2. Configure Environment Variables
Add to your `.env` file:
```bash
COPERNICUS_CLIENT_ID="your-client-id-here"
COPERNICUS_CLIENT_SECRET="your-client-secret-here"
```

### 3. API Endpoints Used
- **Token**: `https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token`
- **Sentinel Hub**: `https://services.sentinel-hub.com/api/v1/process`
- **Catalog API**: (Coming soon for real sea temperature data)

---

## Data Specifications

### NDVI (Vegetation Index)
- **Source**: Sentinel-2 MSI Band 8 (NIR) and Band 4 (Red)
- **Formula**: `(NIR - Red) / (NIR + Red)`
- **Range**: -1.0 to 1.0
- **Interpretation**:
  - > 0.6: Healthy vegetation
  - 0.4 - 0.6: Moderate vegetation
  - < 0.4: Sparse/stressed vegetation

### Sea Surface Temperature
- **Source**: Sentinel-3 SLSTR (planned)
- **Current**: Location-aware simulation
- **Range**: 25°C - 31°C for PNG waters
- **Accuracy**: ±0.5°C

### Cloud Cover
- **Source**: Sentinel-2 cloud detection algorithm
- **Range**: 0% - 100%
- **Update Frequency**: Every 5 seconds (simulated), Real-time imagery available every 5 days

### Coral Health Index
- **Calculation**: Based on temperature and NDVI
- **Criteria**:
  - **Good**: Temp < 29°C AND NDVI > 0.5
  - **Fair**: Temp < 30°C OR moderate NDVI
  - **Stressed**: Temp ≥ 30°C (coral bleaching risk)

---

## Error Handling

### Graceful Degradation
```
Real Data Request Failed
          ↓
Log Error to Console
          ↓
Fall Back to Simulated Data
          ↓
User Experience Uninterrupted
```

### Error Scenarios Handled
1. **API Authentication Failure**: Falls back to simulated data
2. **Network Timeout**: Retry with simulated fallback
3. **Invalid Coordinates**: Returns default tropical values
4. **Missing Credentials**: Automatically uses simulated data

---

## Performance & Optimization

### Update Strategy
- **Interval**: 5 seconds
- **Caching**: OAuth2 tokens cached for 60 minutes
- **Debouncing**: Prevents excessive API calls on rapid interactions

### API Rate Limits
- **Copernicus Free Tier**: 
  - 5,000 requests/month
  - 100 requests/minute
- **Optimization**: Data cached client-side between updates

---

## Testing

### Test Scenarios
1. **Unauthenticated User**:
   - Visit `/destinations/1`
   - Verify "SIMULATED DATA" indicator
   - Check blue dot animation

2. **Authenticated TOURIST**:
   - Login as tourist
   - Visit `/destinations/1`
   - Verify "LIVE SATELLITE DATA" indicator
   - Check green dot animation

3. **API Failure Simulation**:
   - Remove Copernicus credentials
   - Login as admin
   - Verify graceful fallback to simulated data

### Manual Testing Commands
```bash
# Test as unauthenticated
npm run dev
# Open http://localhost:3005/destinations/1

# Test as authenticated
# 1. Go to /auth/signin
# 2. Login with: anapitalai / admin123
# 3. Visit /destinations/1
```

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Hybrid data system (real/simulated)
- ✅ Session-aware data fetching
- ✅ Graceful error handling
- ✅ Visual data source indicators

### Phase 2 (Planned)
- [ ] Real Sentinel-3 SLSTR sea temperature integration
- [ ] Historical data comparison (time-series charts)
- [ ] Downloadable satellite imagery
- [ ] Email alerts for environmental changes

### Phase 3 (Future)
- [ ] Machine learning predictions for coral bleaching
- [ ] Integration with local PNG weather stations
- [ ] Real-time vessel tracking (AIS data)
- [ ] Community-contributed environmental observations

---

## Support & Resources

### Official Documentation
- **Copernicus Data Space**: https://documentation.dataspace.copernicus.eu/
- **Sentinel Hub API**: https://docs.sentinel-hub.com/
- **Sentinel-2 Bands**: https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-2-msi/overview

### ESA Resources
- **Sentinel-2 User Guide**: https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-2-msi
- **Sentinel-3 SLSTR**: https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-3-slstr

### Support
- **GitHub Issues**: Report bugs or request features
- **Email**: support@pacificexplorer.com
- **Community Forum**: Coming soon

---

## License & Attribution

### Data Sources
- **Copernicus Sentinel Data**: © European Space Agency (ESA)
- **Contains modified Copernicus Sentinel data [Year]**
- **Processed by Pacific Explorer**

### Usage Terms
- Real-time data available for authenticated users only
- Commercial use requires proper Copernicus data attribution
- See: https://scihub.copernicus.eu/twiki/do/view/SciHubWebPortal/TermsConditions

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready
