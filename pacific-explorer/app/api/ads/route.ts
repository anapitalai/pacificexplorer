import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const advertiserId = searchParams.get('advertiserId');

    // If advertiserId is provided, get ads for that advertiser (admin view)
    // Otherwise, get ads for the current user
    const userId = advertiserId || session.user.id;

    const ads = await prisma.ad.findMany({
      where: {
        advertiserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      targetUrl,
      type,
      targetLocations,
      targetInterests,
      budget,
      startDate,
      endDate,
    } = body;

    // Validate required fields
    if (!title || !targetUrl || !type || !budget || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ad type
    const validTypes = ['BANNER', 'SPONSORED_LISTING', 'FEATURED_DESTINATION'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid ad type' }, { status: 400 });
    }

    // Validate budget
    if (budget <= 0) {
      return NextResponse.json({ error: 'Budget must be greater than 0' }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 });
    }

    if (end && end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        imageUrl,
        targetUrl,
        type,
        targetLocations: targetLocations || [],
        targetInterests: targetInterests || [],
        budget: parseFloat(budget),
        spent: 0,
        impressions: 0,
        clicks: 0,
        startDate: start,
        endDate: end,
        status: 'PENDING', // Ads need approval before going live
        advertiserId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      ad,
      message: 'Ad created successfully. It will be reviewed before going live.'
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
