import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

// POST /api/likes/:postId  — toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      const count = await prisma.like.count({ where: { postId } });
      return NextResponse.json({ liked: false, likeCount: count });
    }

    await prisma.like.create({ data: { userId, postId } });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    // Create notification and push via SSE (skip self-like)
    if (post && post.authorId !== userId) {
      const notification = await prisma.notification.create({
        data: {
          type: "LIKE",
          userId: post.authorId,
          actorId: userId,
          postId,
        },
        include: {
          actor: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
          post: { select: { id: true, content: true } },
        },
      });
      sendNotification(post.authorId, { type: "notification", data: notification });
    }

    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: true, likeCount: count });
  } catch (error) {
    console.error("POST /api/likes/[postId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
