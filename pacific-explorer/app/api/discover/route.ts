import { NextRequest, NextResponse } from 'next/server';
import { copernicusService, DiscoveredLocation } from '@/lib/copernicus-alphaearth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const { bbox, types, includeHotels } = body;

    // Validate bounding box
    if (!bbox || !bbox.minLat || !bbox.maxLat || !bbox.minLng || !bbox.maxLng) {
      return NextResponse.json(
        { error: 'Invalid bounding box. Required: minLat, maxLat, minLng, maxLng' },
        { status: 400 }
      );
    }

    // Default types if not provided
    const locationTypes = types || ['beach', 'forest', 'mountain', 'cultural'];

    // Discover locations using satellite imagery
    const discoveries = await copernicusService.discoverLocations(bbox, locationTypes);

    // Optionally detect hotels
  let hotels: DiscoveredLocation[] = [];
    if (includeHotels) {
      hotels = await copernicusService.detectHotels(bbox);
    }

    // Enhance discoveries with climate data (for top 3 locations)
    const enhancedDiscoveries = await Promise.all(
      discoveries.slice(0, 3).map(async (location) => {
        try {
          const climate = await copernicusService.getClimateData();
          return {
            ...location,
            climate,
          };
  } catch {
          return location;
        }
      })
    );

    // Combine remaining discoveries without climate data
    const allDiscoveries = [
      ...enhancedDiscoveries,
      ...discoveries.slice(3),
    ];

    return NextResponse.json({
      success: true,
      count: allDiscoveries.length,
      data: {
        discoveries: allDiscoveries,
        hotels,
        metadata: {
          bbox,
          types: locationTypes,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to discover locations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
  const climate = await copernicusService.getClimateData();
    
    return NextResponse.json({
      success: true,
      data: {
        coordinates: { lat, lng },
        climate,
      },
    });
  } catch (error) {
    console.error('Climate data API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch climate data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
