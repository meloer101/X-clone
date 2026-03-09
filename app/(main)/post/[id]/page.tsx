import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/post/PostCard";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { userId } = await auth();
  if (!userId) return null;

  const { id } = await params;

  const rawPost = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
      author: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
      likes: { select: { userId: true } },
      _count: { select: { likes: true } },
    },
  });

  if (!rawPost) notFound();

  const post = {
    ...rawPost,
    createdAt: rawPost.createdAt.toISOString(),
    likeCount: rawPost._count.likes,
    likedByMe: rawPost.likes.some((l) => l.userId === userId),
    likes: undefined,
    _count: undefined,
  };

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 py-3 flex items-center gap-6">
        <Link
          href="/"
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="font-bold text-xl text-white">帖子</h1>
      </header>

      <PostCard post={post} />

      <div className="px-4 py-8 border-t border-[#2f3336] text-center text-[#71767b]">
        <p className="text-sm">回复功能即将推出</p>
      </div>
    </div>
  );
}
