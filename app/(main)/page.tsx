"use client";

import { PostComposer } from "@/components/post/PostComposer";
import { PostFeed } from "@/components/post/PostFeed";
import { useState } from "react";
import type { PostData } from "@/components/post/PostCard";

export default function HomePage() {
  const [newPosts, setNewPosts] = useState<PostData[]>([]);

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 py-3">
        <h1 className="font-bold text-xl text-white">首页</h1>
      </header>

      <PostComposer onPost={(post) => setNewPosts((prev) => [post, ...prev])} />

      <PostFeed type="home" prependedPosts={newPosts} />
    </div>
  );
}
