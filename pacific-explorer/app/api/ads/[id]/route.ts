import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const adId = parseInt(resolvedParams.id);
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Invalid ad ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['ACTIVE', 'PAUSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if ad exists and belongs to user
    const ad = await prisma.ad.findFirst({
      where: {
        id: adId,
        advertiserId: session.user.id,
      },
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Only allow status changes for approved ads
    if (ad.status !== 'ACTIVE' && ad.status !== 'PAUSED') {
      return NextResponse.json({ error: 'Ad must be approved before it can be paused/resumed' }, { status: 400 });
    }

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: { status },
    });

    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
