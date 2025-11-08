import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const interests = searchParams.get('interests')?.split(',').filter(i => i.trim()) || [];

    if (!type) {
      return NextResponse.json({ error: 'Ad type is required' }, { status: 400 });
    }

    // Validate ad type
    const validTypes = ['BANNER', 'SPONSORED_LISTING', 'FEATURED_DESTINATION'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid ad type' }, { status: 400 });
    }

    // Build where clause for targeting
    const where: Record<string, unknown> = {
      type,
      status: 'ACTIVE',
      startDate: {
        lte: new Date(),
      },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ],
    };

    // Location targeting
    if (location) {
      where.targetLocations = {
        has: location,
      };
    }

    // Interest targeting
    if (interests.length > 0) {
      where.targetInterests = {
        hasSome: interests,
      };
    }

    // Get active ads matching criteria
    const ads = await prisma.ad.findMany({
      where,
      orderBy: {
        // Prioritize ads with lower impressions relative to budget
        impressions: 'asc',
      },
      take: 5, // Get a few options to rotate
    });

    if (ads.length === 0) {
      return NextResponse.json({ ad: null });
    }

    // Simple rotation logic - pick the ad with lowest impressions
    const selectedAd = ads.reduce((prev, current) =>
      prev.impressions < current.impressions ? prev : current
    );

    return NextResponse.json({ ad: selectedAd });
  } catch (error) {
    console.error('Error serving ad:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
