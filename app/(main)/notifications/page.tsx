"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useSSE } from "@/hooks/useSSE";

interface Notification {
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useSSE((data) => {
    const event = data as { type?: string; data?: Notification };
    if (event?.type === "notification" && event.data) {
      setNotifications((prev) => [event.data!, ...prev]);
    }
  });

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 py-3">
        <h1 className="font-bold text-xl text-white">通知</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-xl font-bold text-white">暂无通知</p>
          <p className="text-[#71767b] text-sm mt-2">
            当有人关注你或点赞你的帖子时，会显示在这里
          </p>
        </div>
      ) : (
        notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))
      )}
    </div>
  );
}
