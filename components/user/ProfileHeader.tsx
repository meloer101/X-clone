"use client";

import { useUser } from "@clerk/nextjs";
import { UserAvatar } from "./UserAvatar";
import { FollowButton } from "./FollowButton";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface ProfileUser {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

interface ProfileHeaderProps {
  profileUser: ProfileUser;
}

export function ProfileHeader({ profileUser }: ProfileHeaderProps) {
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="px-4 pb-4">
      <div className="flex justify-between items-start mb-3">
        <UserAvatar user={profileUser} size="lg" linkable={false} />
        {!isOwnProfile && (
          <FollowButton
            targetUserId={profileUser.id}
            initialFollowing={profileUser.isFollowing}
          />
        )}
      </div>

      <div className="mt-2">
        <p className="font-bold text-xl text-white leading-tight">{profileUser.name}</p>
        <p className="text-[#71767b] text-sm">@{profileUser.username}</p>
      </div>

      {profileUser.bio && (
        <p className="mt-3 text-white text-sm leading-relaxed">{profileUser.bio}</p>
      )}

      <div className="mt-3 flex items-center gap-1 text-[#71767b] text-sm">
        <CalendarDays className="w-4 h-4" />
        <span>
          加入于 {format(new Date(profileUser.createdAt), "yyyy年M月")}
        </span>
      </div>

      <div className="mt-3 flex gap-5 text-sm">
        <span>
          <strong className="text-white">{profileUser.followingCount}</strong>
          <span className="text-[#71767b] ml-1">正在关注</span>
        </span>
        <span>
          <strong className="text-white">{profileUser.followersCount}</strong>
          <span className="text-[#71767b] ml-1">关注者</span>
        </span>
      </div>
    </div>
  );
}
