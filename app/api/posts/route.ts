import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const POST_SELECT = {
  id: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
  },
  likes: {
    select: { userId: true },
  },
  _count: {
    select: { likes: true },
  },
};

type PostFromSelect = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: { id: string; username: string; name: string; avatarUrl: string | null };
  likes: { userId: string }[];
  _count: { likes: number };
};

// GET /api/posts?cursor=xxx&type=home|user&username=xxx
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const type = searchParams.get("type") ?? "home";
    const username = searchParams.get("username");
    const PAGE_SIZE = 20;

    let where = {};

    if (type === "user" && username) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return NextResponse.json({ posts: [], nextCursor: null });
      }
      where = { authorId: user.id };
    } else {
      // Home feed: posts from users the current user follows + their own posts
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = following.map((f: { followingId: string }) => f.followingId);
      where = { authorId: { in: [userId, ...followingIds] } };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: POST_SELECT,
    });

    let nextCursor: string | null = null;
    if (posts.length > PAGE_SIZE) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id ?? null;
    }

    const enriched = posts.map((post: PostFromSelect) => ({
      ...post,
      likeCount: post._count.likes,
      likedByMe: post.likes.some((l: { userId: string }) => l.userId === userId),
      likes: undefined,
      _count: undefined,
    }));

    return NextResponse.json({ posts: enriched, nextCursor });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/posts
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, imageUrl } = await req.json();
    if (!content?.trim() && !imageUrl) {
      return NextResponse.json(
        { error: "Post must have content or an image" },
        { status: 400 }
      );
    }
    if (content && content.length > 280) {
      return NextResponse.json(
        { error: "Post content cannot exceed 280 characters" },
        { status: 400 }
      );
    }

    console.log('Creating post with authorId:', userId);
    const post = await prisma.post.create({
      data: {
        content: content?.trim() ?? "",
        imageUrl: imageUrl ?? null,
        authorId: userId,
      },
      select: POST_SELECT,
    });

    const result = {
      ...post,
      likeCount: post._count.likes,
      likedByMe: false,
      likes: undefined,
      _count: undefined,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
