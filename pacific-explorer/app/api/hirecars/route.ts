import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/hirecars?active=true&featured=true&province=<province>
 * Get all hire cars with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const province = searchParams.get('province');

    const where: {
      active?: boolean;
      featured?: boolean;
      province?: string;
    } = {};

    if (active !== undefined) {
      where.active = active;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (province) {
      where.province = province;
    }

    const hireCars = await prisma.hireCar.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { verified: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      hireCars,
    });
  } catch (error) {
    console.error('Error fetching hire cars:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hire cars',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hirecars - Create a new hire car (for owners)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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
      vehicleType,
      passengerCapacity,
      pricePerDay,
      priceRange,
      features,
      images,
      featuredImage,
      verified,
      featured,
      active,
    } = body;

    // Validate required fields
    if (!name || !province || !latitude || !longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, province, latitude, longitude',
        },
        { status: 400 }
      );
    }

    const hireCar = await prisma.hireCar.create({
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
        vehicleType,
        passengerCapacity: passengerCapacity ? parseInt(passengerCapacity) : null,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : null,
        priceRange,
        features: features || [],
        images: images || [],
        featuredImage,
        verified: verified || false,
        featured: featured || false,
        active: active !== undefined ? active : true,
        ownerId: session.user.id,
      },
      include: {
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
      hireCar,
    });
  } catch (error) {
    console.error('Error creating hire car:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create hire car',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
