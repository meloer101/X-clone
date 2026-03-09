import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Heart, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationData {
  id: string;
  type: "LIKE" | "FOLLOW";
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string | null;
  };
  post?: {
    id: string;
    content: string;
  } | null;
}

interface NotificationItemProps {
  notification: NotificationData;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { type, actor, post, createdAt, read } = notification;

  const icon =
    type === "LIKE" ? (
      <div className="p-2 bg-pink-500/20 rounded-full">
        <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
      </div>
    ) : (
      <div className="p-2 bg-[#1d9bf0]/20 rounded-full">
        <UserPlus className="w-4 h-4 text-[#1d9bf0]" />
      </div>
    );

  const message =
    type === "LIKE"
      ? `赞了你的帖子`
      : `开始关注你`;

  const href = type === "LIKE" && post ? `/post/${post.id}` : `/${actor.username}`;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-[#2f3336]",
        !read && "bg-[#1d9bf0]/5"
      )}
    >
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <UserAvatar user={actor} size="sm" linkable={false} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">
          <span className="font-bold">{actor.name}</span>
          {" "}
          <span className="text-[#71767b]">@{actor.username}</span>
          {" "}
          {message}
        </p>
        {post && type === "LIKE" && (
          <p className="text-[#71767b] text-sm mt-0.5 truncate">{post.content}</p>
        )}
        <p className="text-[#71767b] text-xs mt-1">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: zhCN,
          })}
        </p>
      </div>
      {!read && (
        <div className="w-2 h-2 rounded-full bg-[#1d9bf0] flex-shrink-0 mt-2" />
      )}
    </Link>
  );
}
