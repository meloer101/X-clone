import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/user/ProfileHeader";
import { PostFeed } from "@/components/post/PostFeed";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await auth();
  if (!userId) return null;

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: { followers: true, following: true, posts: true },
      },
      followers: {
        where: { followerId: userId },
        select: { followerId: true },
      },
    },
  });

  if (!user) notFound();

  const profileUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    followersCount: user._count.followers,
    followingCount: user._count.following,
    postsCount: user._count.posts,
    isFollowing: user.followers.length > 0,
  };

  if (!profileUser) notFound();

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 py-3 flex items-center gap-6">
        <Link
          href="/"
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-xl text-white leading-tight">
            {profileUser.name}
          </h1>
          <p className="text-[#71767b] text-sm">{profileUser.postsCount} 条帖子</p>
        </div>
      </header>

      <div className="border-b border-[#2f3336] pb-4">
        <div className="h-32 bg-gradient-to-br from-[#1d9bf0]/30 to-[#1d9bf0]/10" />
        <div className="px-4 -mt-8">
          <ProfileHeader profileUser={profileUser} />
        </div>
      </div>

      <PostFeed type="user" username={username} />
    </div>
  );
}
