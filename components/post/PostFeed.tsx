"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { PostCard, type PostData } from "./PostCard";

interface PostFeedProps {
  type?: "home" | "user";
  username?: string;
  prependedPosts?: PostData[];
  headerContent?: React.ReactNode;
}

export function PostFeed({
  type = "home",
  username,
  prependedPosts = [],
  headerContent,
}: PostFeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams({ type });
      if (username) params.set("username", username);
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json() as Promise<{ posts: PostData[]; nextCursor: string | null }>;
    },
    [type, username]
  );

  useEffect(() => {
    setLoading(true);
    fetchPosts()
      .then(({ posts, nextCursor }) => {
        setPosts(posts);
        setNextCursor(nextCursor);
        setHasMore(nextCursor !== null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  });

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { posts: newPosts, nextCursor: newCursor } = await fetchPosts(nextCursor);
      setPosts((prev) => [...prev, ...newPosts]);
      setNextCursor(newCursor);
      setHasMore(newCursor !== null);
    } catch {
      console.error("Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const prependedIds = new Set(prependedPosts.map((p) => p.id));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {headerContent}
      {prependedPosts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
      {posts.length === 0 && prependedPosts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-[#71767b]">
          <p className="text-xl font-bold text-white">暂无帖子</p>
          <p className="text-sm mt-2">
            {type === "home" ? "关注一些用户来填充你的首页" : "该用户还没有发过帖子"}
          </p>
        </div>
      ) : (
        posts
          .filter((p) => !prependedIds.has(p.id))
          .map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))
      )}

      <div ref={bottomRef} className="h-4" />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-[#1d9bf0] animate-spin" />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-[#71767b] text-sm py-6">没有更多帖子了</p>
      )}
    </div>
  );
}

PostFeed.displayName = "PostFeed";
export type { PostFeedProps };
