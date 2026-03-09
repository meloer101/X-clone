import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — fetch all notifications and mark as read
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
        post: { select: { id: true, content: true } },
      },
    });

    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/notifications/unread-count
export async function HEAD() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse(null, { status: 401 });

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    return new NextResponse(null, {
      status: 200,
      headers: { "X-Unread-Count": String(count) },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
