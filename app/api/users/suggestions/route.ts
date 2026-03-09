import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/suggestions — users that the current user is not following
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...followingIds] },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
    });

    const result = users.map((u) => ({ ...u, isFollowing: false }));
    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("GET /api/users/suggestions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
