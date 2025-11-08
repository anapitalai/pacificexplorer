# Quick Start: Real-Time Satellite Data

## What Was Implemented?

Your Advanced Satellite Viewer now has **intelligent data switching**:
- **Anonymous users** see simulated location-based data
- **Logged-in users** (TOURIST, HOTEL_OWNER, ADMIN) get real Copernicus satellite data

## How It Works

### For Users
1. **Without Login**: Visit any destination page → see simulated environmental data (blue indicator)
2. **With Login**: Sign in → visit destination page → see real satellite data (green indicator)

### Visual Indicators
- **Blue Dot** + "SIMULATED DATA" = Guest user
- **Green Dot** + "LIVE SATELLITE DATA" = Authenticated user with real data

---

## Setup Instructions

### Step 1: Get Copernicus Credentials (Optional but Recommended)
Real satellite data requires free Copernicus API access:

1. Register at: https://dataspace.copernicus.eu/
2. Get credentials: https://identity.dataspace.copernicus.eu/auth/realms/CDSE/account/#/
3. Create OAuth2 client with `client_credentials` grant type
4. Copy your Client ID and Secret

### Step 2: Configure Environment
Add to your `.env` file:
```bash
COPERNICUS_CLIENT_ID="your-client-id-here"
COPERNICUS_CLIENT_SECRET="your-client-secret-here"
```

**Note**: Without credentials, the system automatically uses simulated data for all users (no errors).

### Step 3: Test the Feature
```bash
# Start development server
npm run dev

# Test as anonymous user
Open: http://localhost:3005/destinations/1
Expected: Blue dot, "SIMULATED DATA"

# Test as authenticated user
1. Go to: http://localhost:3005/auth/signin
2. Login: anapitalai / admin123
3. Go to: http://localhost:3005/destinations/1
Expected: Green dot, "LIVE SATELLITE DATA" (if credentials configured)
```

---

## Files Changed

### New Files
- `/lib/copernicus-live.ts` - Satellite data integration library
- `REALTIME_SATELLITE_DATA.md` - Comprehensive documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

### Modified Files
- `/components/AdvancedSatelliteViewer.tsx` - Added session awareness
- `/app/destinations/[id]/page.tsx` - Passes session to viewer
- `.env.example` - Added Copernicus credential placeholders

---

## What's New?

### Environmental Data Shown
- **NDVI**: Vegetation health index (0-1 scale)
- **Temperature**: Sea surface temperature (°C)
- **Cloud Cover**: Percentage (0-100%)
- **Vegetation Health**: Healthy/Moderate/Sparse
- **Coral Health**: Good/Fair/Stressed

### Data Sources
- **Real**: Copernicus Sentinel-2 MSI (10m resolution)
- **Simulated**: Location-aware calculations based on PNG geography

### Update Frequency
- Refreshes every 5 seconds
- Real satellite imagery updated every 5-10 days (ESA revisit time)

---

## Troubleshooting

### Issue: Always shows "SIMULATED DATA" even when logged in
**Solution**: 
1. Check `.env` has valid `COPERNICUS_CLIENT_ID` and `COPERNICUS_CLIENT_SECRET`
2. Restart development server: `npm run dev`
3. Clear browser cache and re-login

### Issue: Console errors about Copernicus API
**Solution**: This is expected if credentials aren't configured. System automatically falls back to simulated data.

### Issue: Green dot but weird data values
**Solution**: 
1. Check console for API errors
2. Verify credentials are correct
3. Check Copernicus API status: https://status.dataspace.copernicus.eu/

---

## Testing Checklist

- [ ] Anonymous user sees blue dot + simulated data
- [ ] Logged-in admin sees green dot (if credentials configured)
- [ ] Data updates every 5 seconds
- [ ] Info panel shows correct data source
- [ ] No console errors (warnings about unused vars are OK)
- [ ] Map loads correctly with collapsible panels
- [ ] Environmental indicators display numeric values

---

## Next Steps

### Immediate (Optional)
1. Register for Copernicus API credentials
2. Add credentials to `.env`
3. Test real satellite data with admin account

### Future Enhancements
1. Historical data comparison charts
2. Email alerts for environmental changes
3. Downloadable satellite imagery
4. Community-contributed observations

---

## Support

For issues or questions:
- Check `REALTIME_SATELLITE_DATA.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for technical details
- Check console logs for error messages

---

**Status**: ✅ Feature Complete and Ready to Test  
**Last Updated**: January 2025
