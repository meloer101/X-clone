"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialFollowing,
  className,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/follows/${targetUserId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFollowing(data.following);
      toast(data.following ? "已关注" : "已取消关注");
    } catch {
      toast.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "px-4 py-1.5 rounded-full font-bold text-sm transition-all",
        following
          ? hovered
            ? "bg-transparent border border-red-500 text-red-500"
            : "bg-transparent border border-[#536471] text-white"
          : "bg-white text-black hover:bg-gray-200",
        loading && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {loading
        ? "..."
        : following
        ? hovered
          ? "取消关注"
          : "正在关注"
        : "关注"}
    </button>
  );
}
