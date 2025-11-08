# 🏨 Hotel Selection Feature

## Overview
Interactive map-based hotel selection component that allows users to click on the map to discover and select hotels from both the database and OpenStreetMap data.

## Component: InteractiveHotelPicker

### Location
`/components/InteractiveHotelPicker.tsx`

### Features

#### 1. Interactive Map Selection
- **Copernicus Sentinel-2 Satellite Imagery**: High-quality base map
- **Click-to-Search**: Click anywhere to search for nearby hotels
- **Dual Source**: Searches both Pacific Explorer database and OpenStreetMap
- **Configurable Radius**: 500m, 1km, 2km, 5km, 10km search options

#### 2. Hotel Discovery
- **Database Hotels**: Hotels already in the system (marked with green "In Database" badge)
- **OSM Hotels**: Hotels from OpenStreetMap (marked with blue "OSM Data" badge)
- **Distance Calculation**: Shows distance from clicked location
- **Smart Deduplication**: OSM hotels already in database are filtered out

#### 3. Visual Feedback
- **Animated Markers**: Pulsing blue marker for search location, green for selected hotel
- **Hotel Cards**: Displays name, type, distance, ratings, price range, amenities
- **Loading States**: Clear feedback during search operations
- **Instructions**: Helpful guide for first-time users

#### 4. Fullscreen Mode
- **Expandable View**: Full-screen map for easier selection
- **ESC Key Support**: Press ESC to exit fullscreen
- **Persistent Controls**: Radius selector and results list available in fullscreen

#### 5. Hotel Information Display
- **Star Ratings**: Visual star display (★★★★★)
- **Price Range**: Budget, Moderate, Upscale, Luxury categories
- **Amenities**: WiFi, Pool, Restaurant, Spa, Gym, etc.
- **Contact Details**: Phone, email, website
- **Location Data**: Province, city, address, coordinates

## API Enhancements

### Updated Endpoint: GET /api/hotels

Added location-based filtering with query parameters:

```typescript
GET /api/hotels?lat=-6.314&lng=143.955&radius=2000
```

**Query Parameters:**
- `lat`: Latitude of search center
- `lng`: Longitude of search center
- `radius`: Search radius in meters (500, 1000, 2000, 5000, 10000)
- `featured`: Filter featured hotels (true/false)
- `active`: Filter active hotels (true/false)
- `province`: Filter by province name

**Response:**
```json
{
  "success": true,
  "count": 5,
  "hotels": [
    {
      "id": 1,
      "name": "Paradise Hotel",
      "latitude": -6.314993,
      "longitude": 143.95555,
      "starRating": 4,
      "priceRange": "Upscale",
      "amenities": ["WiFi", "Pool", "Restaurant"],
      "distance": 350
    }
  ]
}
```

**Distance Calculation:**
- Uses Haversine formula for accurate distance calculation
- Returns hotels sorted by distance from search point
- Filters hotels beyond specified radius

## Usage Example

### In a Form Component

```tsx
import InteractiveHotelPicker from '@/components/InteractiveHotelPicker';

function MyForm() {
  const handleHotelSelect = (data) => {
    const { hotel, source } = data;
    
    console.log('Selected hotel:', hotel.name);
    console.log('Source:', source); // 'database' or 'osm'
    
    // Auto-populate form fields
    setFormData({
      name: hotel.name,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      address: hotel.address,
      province: hotel.province,
      starRating: hotel.starRating,
      amenities: hotel.amenities,
    });
  };

  return (
    <InteractiveHotelPicker
      onHotelSelect={handleHotelSelect}
      defaultLat={-6.314993}
      defaultLng={143.95555}
      defaultZoom={8}
    />
  );
}
```

### Props

```typescript
interface InteractiveHotelPickerProps {
  onHotelSelect: (data: HotelSelectionData) => void;
  defaultLat?: number;      // Default: -6.314993 (PNG)
  defaultLng?: number;      // Default: 143.95555 (PNG)
  defaultZoom?: number;     // Default: 8
}

interface HotelSelectionData {
  hotel: Hotel;
  source: 'database' | 'osm';
}

interface Hotel {
  id: number;
  name: string;
  osmId: string | null;
  osmType: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  province: string;
  city: string | null;
  starRating: number | null;
  priceRange: string | null;
  amenities: string[];
  distance?: number;
}
```

## Integration Points

### 1. Destination Form
Add hotel selection to the destination creation form:
```tsx
// In DestinationForm.tsx
<InteractiveHotelPicker
  onHotelSelect={(data) => {
    // Link hotel to destination
    setSelectedHotelId(data.hotel.id);
  }}
/>
```

### 2. Hotels Management
Use in hotel edit form for location verification:
```tsx
// In HotelsManagement.tsx
<InteractiveHotelPicker
  onHotelSelect={(data) => {
    // Update hotel location
    setFormData({
      ...formData,
      latitude: data.hotel.latitude,
      longitude: data.hotel.longitude,
    });
  }}
/>
```

### 3. Booking System
Select hotel before making a reservation:
```tsx
// In BookingForm.tsx
<InteractiveHotelPicker
  onHotelSelect={(data) => {
    setSelectedHotel(data.hotel);
    // Proceed to booking
  }}
/>
```

## Data Flow

```
User clicks map
    ↓
Search nearby location (lat, lng, radius)
    ↓
Query database (/api/hotels)
    ↓
Query OpenStreetMap (/api/osm/nearby)
    ↓
Merge & deduplicate results
    ↓
Calculate distances & sort
    ↓
Display hotel list
    ↓
User selects hotel
    ↓
Callback with hotel data + source
```

## Database Schema

Hotels are stored with the following structure:

```prisma
model Hotel {
  id             Int          @id @default(autoincrement())
  name           String
  province       String
  city           String?
  latitude       Float
  longitude      Float
  address        String?
  description    String?      @db.Text
  website        String?
  phone          String?
  email          String?
  starRating     Int?         // 1-5
  roomCount      Int?
  priceRange     PriceRange?
  amenities      String[]
  images         String[]
  featuredImage  String?
  osmId          String?      @unique
  osmType        String?
  wikidata       String?
  wikipedia      String?
  verified       Boolean      @default(false)
  featured       Boolean      @default(false)
  active         Boolean      @default(true)
  destinationId  Int?
  destination    Destination? @relation(fields: [destinationId], references: [id])
  ownerId        String?
  owner          User?        @relation(fields: [ownerId], references: [id])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

## OpenStreetMap Integration

The component searches OSM for:
- `tourism=hotel`
- `tourism=resort`
- `tourism=guest_house`
- `tourism=hostel`
- `tourism=motel`
- `tourism=apartment`
- `tourism=chalet`

OSM data includes:
- Name
- Type (hotel, resort, etc.)
- Coordinates
- Address
- Contact information (if available)
- Wikidata/Wikipedia links (if available)

## UI Components

### Map View
- Satellite imagery from Copernicus Sentinel-2
- Interactive markers with animations
- Zoom controls
- Fullscreen toggle button

### Hotels List
- Scrollable list of nearby hotels
- Distance indicators
- Source badges (Database vs OSM)
- Quick selection buttons
- Star ratings and price ranges

### Selected Hotel Card
- Green gradient background
- Hotel icon
- Complete hotel information
- Source indicator
- Dismissible notification

### Instructions Panel
- Blue gradient background
- Info icon
- Step-by-step guidance
- Auto-hides after first click

## Styling

Uses Tailwind CSS with custom classes:
- Gradient backgrounds: `bg-gradient-to-r`
- Animated markers: `animate-ping`
- Backdrop blur: `backdrop-blur-sm`
- Custom z-index: `z-[900]`, `z-[950]`, `z-[9999]`
- Responsive layout: Flexbox with proper spacing

## Error Handling

- **Network Errors**: Graceful fallback if API fails
- **Empty Results**: Helpful message when no hotels found
- **Invalid Coordinates**: Validates lat/lng before searching
- **Loading States**: Shows spinner during searches
- **Console Logging**: Debug information for development

## Performance Considerations

1. **Debounced Searches**: Prevents excessive API calls
2. **Smart Deduplication**: Filters OSM hotels already in database
3. **Distance Calculation**: Efficient Haversine formula
4. **Sorted Results**: Hotels ordered by distance
5. **Lazy Loading**: Map tiles loaded on demand

## Future Enhancements

- [ ] Hotel photos preview
- [ ] Availability calendar
- [ ] Price comparison
- [ ] Reviews and ratings
- [ ] Advanced filters (amenities, price range)
- [ ] Booking integration
- [ ] Save favorite hotels
- [ ] Share hotel location
- [ ] Offline mode with cached data
- [ ] Multi-language support

## Testing

### Test Scenarios

1. **Basic Selection**
   - Click map → See nearby hotels → Select hotel
   
2. **Empty Results**
   - Click remote area → No hotels message
   
3. **Database Hotels**
   - Search Port Moresby → See hotels with "In Database" badge
   
4. **OSM Hotels**
   - Search new area → See hotels from OpenStreetMap
   
5. **Fullscreen Mode**
   - Click fullscreen → Expanded view → ESC to exit
   
6. **Radius Changes**
   - Adjust radius → Search updates → Different results

### Test Data

Port Moresby (known hotels):
```
lat: -9.4438
lng: 147.1803
radius: 5000
```

Expected: Hilton, Lamana Hotel, Grand Papua, etc.

## Related Files

- `/components/InteractiveHotelPicker.tsx` - Main component
- `/app/api/hotels/route.ts` - Hotels API with location filtering
- `/app/api/osm/nearby/route.ts` - OpenStreetMap query endpoint
- `/lib/copernicus-tiles.ts` - Satellite imagery configuration
- `/prisma/schema.prisma` - Hotel database schema

## Dependencies

- `leaflet`: Interactive maps
- `leaflet/dist/leaflet.css`: Map styling
- `@prisma/client`: Database access
- `next-auth`: Session management
- Tailwind CSS: Component styling

## Deployment Notes

1. Ensure OpenStreetMap database is accessible
2. Configure Copernicus tile server
3. Set environment variables for database connection
4. Test geospatial queries performance
5. Monitor API response times
6. Consider CDN for map tiles
7. Implement rate limiting for searches

## Support

For issues or questions:
1. Check console logs for errors
2. Verify API endpoints are responding
3. Confirm OSM database connection
4. Test with known hotel locations
5. Review network tab for failed requests

---

**Created**: October 24, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
