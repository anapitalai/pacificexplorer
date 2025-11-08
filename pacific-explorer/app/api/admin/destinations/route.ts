import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get all destinations
export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

// Create new destination (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if destination already exists
    const existingDestination = await prisma.destination.findFirst({
      where: {
        name: body.name,
        province: body.province,
      },
    });

    if (existingDestination) {
      return NextResponse.json(
        { error: 'A destination with this name and province already exists' },
        { status: 409 }
      );
    }

    const destination = await prisma.destination.create({
      data: {
        name: body.name,
        province: body.province,
        category: body.category,
        description: body.description,
        longDescription: body.longDescription,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        image: body.image,
        featured: body.featured || false,
        satelliteImageUrl: body.satelliteImageUrl || null,
        activities: body.activities || [],
        bestTimeToVisit: body.bestTimeToVisit,
        accessibility: body.accessibility,
        highlights: body.highlights || [],
      },
    });

    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}
