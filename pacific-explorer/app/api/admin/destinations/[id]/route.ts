import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Category, Accessibility } from '@prisma/client';

// Get single destination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const destination = await prisma.destination.findUnique({
      where: { id: parseInt(id) },
    });

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destination' },
      { status: 500 }
    );
  }
}

// Update destination (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = await params;
    const destinationId = parseInt(id);

  const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.province !== undefined) updateData.province = body.province;
  if (body.category !== undefined) updateData.category = Category[body.category as keyof typeof Category] ?? body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.longDescription !== undefined) updateData.longDescription = body.longDescription;
    if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.satelliteImageUrl !== undefined) updateData.satelliteImageUrl = body.satelliteImageUrl;
    if (body.activities !== undefined) updateData.activities = body.activities;
    if (body.bestTimeToVisit !== undefined) updateData.bestTimeToVisit = body.bestTimeToVisit;
  if (body.accessibility !== undefined) updateData.accessibility = Accessibility[body.accessibility as keyof typeof Accessibility] ?? body.accessibility;
    if (body.highlights !== undefined) updateData.highlights = body.highlights;

    const destination = await prisma.destination.update({
      where: { id: destinationId },
      data: updateData,
    });

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Error updating destination:', error);
    return NextResponse.json(
      { error: 'Failed to update destination' },
      { status: 500 }
    );
  }
}

// Delete destination (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const destinationId = parseInt(id);

    await prisma.destination.delete({
      where: { id: destinationId },
    });

    return NextResponse.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return NextResponse.json(
      { error: 'Failed to delete destination' },
      { status: 500 }
    );
  }
}
