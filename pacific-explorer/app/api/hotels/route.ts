import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/hotels - Get all hotels
 * Query params: ?featured=true&active=true&province=Western&lat=-6.314&lng=143.955&radius=2000
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get('featured') === 'true';
    const active = searchParams.get('active');
    const province = searchParams.get('province');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

  const where: Prisma.HotelWhereInput = {};
    
    if (featured) where.featured = true;
    if (active !== null) where.active = active === 'true';
    if (province) where.province = province;

    let hotels = await prisma.hotel.findMany({
      where,
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If location parameters provided, filter by distance
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const radiusMeters = parseInt(radius);

      hotels = hotels.filter(hotel => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          hotel.latitude,
          hotel.longitude
        );
        return distance <= radiusMeters;
      });

      // Sort by distance
      hotels.sort((a, b) => {
        const distA = calculateDistance(centerLat, centerLng, a.latitude, a.longitude);
        const distB = calculateDistance(centerLat, centerLng, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return NextResponse.json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * POST /api/hotels - Create a new hotel
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin or hotel owner
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HOTEL_OWNER') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Hotel Owner access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      province,
      city,
      latitude,
      longitude,
      address,
      description,
      website,
      phone,
      email,
      starRating,
      roomCount,
      priceRange,
      amenities,
      images,
      featuredImage,
      destinationId,
      osmId,
      osmType,
      wikidata,
      wikipedia,
      verified,
      featured,
      active,
    } = body;

    // Validate required fields
    if (!name || !province || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, province, latitude, longitude' },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        province,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        description,
        website,
        phone,
        email,
        starRating: starRating ? parseInt(starRating) : null,
        roomCount: roomCount ? parseInt(roomCount) : null,
        priceRange,
        amenities: amenities || [],
        images: images || [],
        featuredImage,
        destinationId: destinationId ? parseInt(destinationId) : null,
        osmId,
        osmType,
        wikidata,
        wikipedia,
        verified: verified || false,
        featured: featured || false,
        active: active !== false, // Default to true
        ownerId: session.user.role === 'HOTEL_OWNER' ? session.user.id : null,
      },
      include: {
        destination: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Hotel created successfully',
      hotel,
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}
