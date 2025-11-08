import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRealTimeSatelliteData, shouldUseRealData } from '@/lib/copernicus-live';

/**
 * POST /api/satellite/realtime
 * Fetches real-time satellite data for a given location
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { latitude, longitude } = body;

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude and longitude must be numbers.' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90.' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180.' },
        { status: 400 }
      );
    }

    // Determine if we should use real data based on user role
    const userRole = session?.user?.role;
    const useRealData = shouldUseRealData(userRole);

    // Fetch satellite data
    const satelliteData = await fetchRealTimeSatelliteData(
      latitude,
      longitude,
      useRealData
    );

    // Return the data
    return NextResponse.json(satelliteData, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching satellite data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch satellite data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/satellite/realtime?lat=<latitude>&lng=<longitude>
 * Alternative GET endpoint for satellite data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lng' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude and longitude must be valid numbers.' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90.' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180.' },
        { status: 400 }
      );
    }

    // Determine if we should use real data based on user role
    const userRole = session?.user?.role;
    const useRealData = shouldUseRealData(userRole);

    // Fetch satellite data
    const satelliteData = await fetchRealTimeSatelliteData(
      latitude,
      longitude,
      useRealData
    );

    // Return the data
    return NextResponse.json(satelliteData, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching satellite data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch satellite data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
