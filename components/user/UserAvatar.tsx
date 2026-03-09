import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    username: string;
    name: string;
    avatarUrl?: string | null;
  };
  size?: "sm" | "md" | "lg";
  linkable?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { px: 32, cls: "w-8 h-8" },
  md: { px: 40, cls: "w-10 h-10" },
  lg: { px: 56, cls: "w-14 h-14" },
};

export function UserAvatar({
  user,
  size = "md",
  linkable = true,
  className,
}: UserAvatarProps) {
  const { px, cls } = sizeMap[size];
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const Avatar = (
    <div
      className={cn(
        cls,
        "rounded-full overflow-hidden flex-shrink-0 bg-[#333] flex items-center justify-center text-white font-bold",
        className
      )}
    >
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className={size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-sm"}>
          {initials}
        </span>
      )}
    </div>
  );

  if (!linkable) return Avatar;

  return (
    <Link
      href={`/${user.username}`}
      onClick={(e) => e.stopPropagation()}
      className="flex-shrink-0"
    >
      {Avatar}
    </Link>
  );
}
