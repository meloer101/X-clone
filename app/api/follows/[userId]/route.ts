import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

// POST /api/follows/:userId  — toggle follow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId } = await params;
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      return NextResponse.json({ following: false });
    }

    await prisma.follow.create({
      data: { followerId: currentUserId, followingId: targetUserId },
    });

    const notification = await prisma.notification.create({
      data: {
        type: "FOLLOW",
        userId: targetUserId,
        actorId: currentUserId,
      },
      include: {
        actor: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
      },
    });
    sendNotification(targetUserId, { type: "notification", data: notification });

    return NextResponse.json({ following: true });
  } catch (error) {
    console.error("POST /api/follows/[userId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
