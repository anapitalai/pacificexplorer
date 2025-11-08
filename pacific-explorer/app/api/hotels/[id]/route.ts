/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';



export async function GET(
  request: NextRequest,
  context: any
): Promise<Response> {
  try {
    const params = await context.params;
    const { id } = params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
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

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hotel,
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

  const { id } = context.params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    // Check ownership or admin
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!existingHotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Only owner or admin can update
    if (
      session.user.role !== 'ADMIN' &&
      existingHotel.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own hotels' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...body,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        starRating: body.starRating ? parseInt(body.starRating) : undefined,
        roomCount: body.roomCount ? parseInt(body.roomCount) : undefined,
        destinationId: body.destinationId ? parseInt(body.destinationId) : undefined,
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
      message: 'Hotel updated successfully',
      hotel,
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

  const { id } = context.params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    await prisma.hotel.delete({
      where: { id: hotelId },
    });

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}
