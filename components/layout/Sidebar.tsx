"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Home,
  Bell,
  User,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSSE } from "@/hooks/useSSE";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications", { method: "HEAD" })
      .then((res) => {
        const count = Number(res.headers.get("X-Unread-Count") ?? 0);
        setUnreadCount(count);
      })
      .catch(() => {});
  }, []);

  useSSE((data) => {
    if (
      data &&
      typeof data === "object" &&
      (data as { type?: string }).type === "notification"
    ) {
      setUnreadCount((prev) => prev + 1);
    }
  });

  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: "首页" },
    { href: "/notifications", icon: Bell, label: "通知" },
    ...(user?.username
      ? [{ href: `/${user.username}`, icon: User, label: "个人主页" }]
      : []),
  ];

  return (
    <aside className="flex flex-col h-screen sticky top-0 w-[88px] xl:w-64 px-2 xl:px-4 py-2">
      <Link
        href="/"
        className="p-3 rounded-full hover:bg-white/10 transition-colors w-fit mb-2"
      >
        <Twitter className="w-7 h-7 text-white" fill="white" />
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isNotification = label === "通知";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-full transition-colors w-fit xl:w-full",
                "hover:bg-white/10",
                isActive && "font-bold"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("w-6 h-6", isActive ? "text-white" : "text-white")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1d9bf0] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:block text-white text-lg">{label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="flex items-center gap-3 p-3 rounded-full hover:bg-white/10 transition-colors cursor-pointer xl:w-full w-fit">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
          <div className="hidden xl:block overflow-hidden">
            <p className="font-bold text-white text-sm truncate">{user.fullName}</p>
            <p className="text-[#71767b] text-sm truncate">@{user.username}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
