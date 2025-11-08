import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch destination owners and business owners that tourists can message
    const recipients = await (prisma.user.findMany as any)({
      where: {
        role: {
          in: ['DESTINATION_OWNER', 'HOTEL_OWNER', 'HIRE_CAR_OWNER']
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
        { username: 'asc' }
      ],
    });

    return NextResponse.json({ recipients });

  } catch (error) {
    console.error("Error fetching recipients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
