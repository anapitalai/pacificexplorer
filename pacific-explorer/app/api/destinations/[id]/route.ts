import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const destinationId = parseInt(id);

    if (isNaN(destinationId)) {
      return NextResponse.json(
        { error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      select: {
        id: true,
        name: true,
        province: true,
        category: true,
        description: true,
        longDescription: true,
        latitude: true,
        longitude: true,
        image: true,
        bestTimeToVisit: true,
        accessibility: true,
        highlights: true,
        activities: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(destination);
  } catch (error) {
    console.error("Error fetching destination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
