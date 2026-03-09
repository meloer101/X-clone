"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { FollowButton } from "@/components/user/FollowButton";
import { Search } from "lucide-react";

interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  isFollowing: boolean;
}

export function RightPanel() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);

  useEffect(() => {
    fetch("/api/users/suggestions")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => {});
  }, []);

  return (
    <aside className="w-[350px] px-4 py-2 hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-[#202327] rounded-full px-4 py-2.5">
          <Search className="w-5 h-5 text-[#71767b] flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索"
            className="bg-transparent text-white placeholder-[#71767b] outline-none text-sm w-full"
            readOnly
          />
        </div>

        {users.length > 0 && (
          <div className="bg-[#16181c] rounded-2xl overflow-hidden">
            <h2 className="font-bold text-white text-xl px-4 pt-3 pb-2">推荐关注</h2>
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <UserAvatar user={user} size="sm" />
                <Link href={`/${user.username}`} className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate hover:underline">
                    {user.name}
                  </p>
                  <p className="text-[#71767b] text-sm truncate">@{user.username}</p>
                </Link>
                <FollowButton
                  targetUserId={user.id}
                  initialFollowing={user.isFollowing}
                  className="text-xs px-3 py-1"
                />
              </div>
            ))}
          </div>
        )}

        <p className="text-[#71767b] text-xs px-1">
          © 2026 X Clone. Built with Next.js & Prisma.
        </p>
      </div>
    </aside>
  );
}
