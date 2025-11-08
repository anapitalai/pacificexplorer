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
    const hireCarId = parseInt(id);

    if (isNaN(hireCarId)) {
      return NextResponse.json(
        { error: 'Invalid hire car ID' },
        { status: 400 }
      );
    }

    const hireCar = await prisma.hireCar.findUnique({
      where: { id: hireCarId },
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

    if (!hireCar) {
      return NextResponse.json(
        { error: 'Hire car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hireCar,
    });
  } catch (error) {
    console.error('Error fetching hire car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hire car' },
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

    const params = await context.params;
    const { id } = params;
    const hireCarId = parseInt(id);

    if (isNaN(hireCarId)) {
      return NextResponse.json(
        { error: 'Invalid hire car ID' },
        { status: 400 }
      );
    }

    // Check ownership or admin
    const existingHireCar = await prisma.hireCar.findUnique({
      where: { id: hireCarId },
    });

    if (!existingHireCar) {
      return NextResponse.json(
        { error: 'Hire car not found' },
        { status: 404 }
      );
    }

    // Only owner or admin can update
    if (
      session.user.role !== 'ADMIN' &&
      existingHireCar.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own hire cars' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const hireCar = await prisma.hireCar.update({
      where: { id: hireCarId },
      data: {
        ...body,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        passengerCapacity: body.passengerCapacity ? parseInt(body.passengerCapacity) : undefined,
        pricePerDay: body.pricePerDay ? parseFloat(body.pricePerDay) : undefined,
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
      message: 'Hire car updated successfully',
      hireCar,
    });
  } catch (error) {
    console.error('Error updating hire car:', error);
    return NextResponse.json(
      { error: 'Failed to update hire car' },
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

    const params = await context.params;
    const { id } = params;
    const hireCarId = parseInt(id);

    if (isNaN(hireCarId)) {
      return NextResponse.json(
        { error: 'Invalid hire car ID' },
        { status: 400 }
      );
    }

    await prisma.hireCar.delete({
      where: { id: hireCarId },
    });

    return NextResponse.json({
      success: true,
      message: 'Hire car deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hire car:', error);
    return NextResponse.json(
      { error: 'Failed to delete hire car' },
      { status: 500 }
    );
  }
}
