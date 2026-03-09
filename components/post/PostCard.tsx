"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Heart, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { UserAvatar } from "@/components/user/UserAvatar";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export interface PostData {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface PostCardProps {
  post: PostData;
  onDelete?: (id: string) => void;
  onLikeToggle?: (id: string, liked: boolean, count: number) => void;
}

export function PostCard({ post, onDelete, onLikeToggle }: PostCardProps) {
  const { user } = useUser();
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isOwner = user?.id === post.author.id;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likeLoading) return;
    setLikeLoading(true);

    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/likes/${post.id}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      onLikeToggle?.(post.id, data.liked, data.likeCount);
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
      toast.error("操作失败");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定要删除这条帖子吗？")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("帖子已删除");
      onDelete?.(post.id);
    } catch {
      toast.error("删除失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        <UserAvatar user={post.author} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link
              href={`/${post.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-white hover:underline truncate"
            >
              {post.author.name}
            </Link>
            <Link
              href={`/${post.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#71767b] text-sm truncate"
            >
              @{post.author.username}
            </Link>
            <span className="text-[#71767b] text-sm">·</span>
            <span className="text-[#71767b] text-sm flex-shrink-0">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>

          {post.content && (
            <p className="mt-1 text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {post.imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336]">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={560}
                height={315}
                className="w-full object-cover max-h-[400px]"
              />
            </div>
          )}

          <div className="mt-3 flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={cn(
                "group flex items-center gap-2 text-sm transition-colors",
                liked
                  ? "text-pink-500"
                  : "text-[#71767b] hover:text-pink-500"
              )}
            >
              <span
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  liked
                    ? "bg-pink-500/10"
                    : "group-hover:bg-pink-500/10"
                )}
              >
                <Heart
                  className="w-4 h-4"
                  fill={liked ? "currentColor" : "none"}
                />
              </span>
              <span>{likeCount > 0 ? likeCount : ""}</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="group flex items-center gap-2 text-sm text-[#71767b] hover:text-red-500 transition-colors"
              >
                <span className="p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
