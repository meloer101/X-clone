"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { PostData } from "./PostCard";

interface PostComposerProps {
  onPost?: (post: PostData) => void;
}

const MAX_CHARS = 280;

export function PostComposer({ onPost }: PostComposerProps) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!user) return null;

  const charsLeft = MAX_CHARS - content.length;
  const canPost = (content.trim().length > 0 || imageUrl) && charsLeft >= 0 && !loading && !uploading;

  const handleSubmit = async () => {
    if (!canPost) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const post = await res.json();
      setContent("");
      setImageUrl(null);
      onPost?.(post);
      toast("帖子已发布！");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发布失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const profileUser = {
    username: user.username ?? user.id,
    name: user.fullName ?? "User",
    avatarUrl: user.imageUrl,
  };

  return (
    <div className="border-b border-[#2f3336] p-4">
      <div className="flex gap-3">
        <UserAvatar user={profileUser} size="md" />

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="有什么新鲜事？"
            rows={2}
            className="w-full bg-transparent text-white text-xl placeholder-[#71767b] resize-none outline-none leading-relaxed"
          />

          {imageUrl && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-[#2f3336] inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Upload preview"
                className="max-h-72 max-w-full object-cover rounded-2xl"
              />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black/90 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2f3336]">
            <div className="flex items-center gap-2">
              {!imageUrl && (
                <UploadButton
                  endpoint="postImage"
                  onUploadBegin={() => setUploading(true)}
                  onClientUploadComplete={(res) => {
                    setImageUrl(res[0]?.ufsUrl ?? null);
                    setUploading(false);
                  }}
                  onUploadError={() => {
                    toast.error("图片上传失败");
                    setUploading(false);
                  }}
                  appearance={{
                    button:
                      "ut-ready:bg-transparent ut-ready:text-[#1d9bf0] ut-ready:hover:bg-[#1d9bf0]/10 ut-ready:p-2 ut-ready:rounded-full ut-ready:transition-colors ut-uploading:opacity-50",
                    allowedContent: "hidden",
                    container: "flex items-center",
                  }}
                  content={{
                    button({ ready, isUploading }) {
                      if (isUploading)
                        return <Loader2 className="w-5 h-5 animate-spin" />;
                      if (ready) return <ImageIcon className="w-5 h-5" />;
                      return <ImageIcon className="w-5 h-5 opacity-50" />;
                    },
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span
                  className={cn(
                    "text-sm",
                    charsLeft < 20
                      ? charsLeft < 0
                        ? "text-red-500 font-bold"
                        : "text-yellow-500"
                      : "text-[#71767b]"
                  )}
                >
                  {charsLeft}
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canPost}
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full px-4 py-1.5 text-sm transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "发帖"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
