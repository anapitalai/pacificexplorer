import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, type } = body;

    if (!adId || !type) {
      return NextResponse.json({ error: 'Ad ID and type are required' }, { status: 400 });
    }

    if (!['impression', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 });
    }

    // Update ad metrics
    const updateData = type === 'impression'
      ? { impressions: { increment: 1 } }
      : { clicks: { increment: 1 } };

    await prisma.ad.update({
      where: { id: parseInt(adId) },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking ad interaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
