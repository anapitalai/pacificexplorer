import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // "all", "sent", "received", "unread"
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const userId = session.user.id;

    const whereClause: {
      senderId?: string;
      receiverId?: string;
      isRead?: boolean;
      OR?: Array<{ senderId: string } | { receiverId: string }>;
    } = {};

    if (type === "sent") {
      whereClause.senderId = userId;
    } else if (type === "received") {
      whereClause.receiverId = userId;
    } else if (type === "unread") {
      whereClause.receiverId = userId;
      whereClause.isRead = false;
    } else {
      // all messages (both sent and received)
      whereClause.OR = [
        { senderId: userId },
        { receiverId: userId }
      ];
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            username: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            username: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: whereClause,
    });

    // Get unread count for the user
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      messages,
      totalCount,
      unreadCount,
      hasMore: offset + limit < totalCount,
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, role: true }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Don't allow messaging yourself
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            username: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            username: true,
          }
        }
      },
    });

    return NextResponse.json(message, { status: 201 });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
