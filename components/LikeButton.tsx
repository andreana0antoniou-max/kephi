"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LikeButton({
  entertainerId,
  initiallyLiked,
  isLoggedIn,
  className,
}: {
  entertainerId: string;
  initiallyLiked: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [liked, setLiked] = useState(initiallyLiked);
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(
        `/signup/parent?redirect=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.pathname : "/"
        )}`
      );
      return;
    }

    if (busy) return;
    setBusy(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("parent_id", user.id)
        .eq("entertainer_id", entertainerId);
      setLiked(false);
    } else {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entertainerId }),
      });
      setLiked(true);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={liked ? "Unlike" : "Like"}
      className={
        className ??
        "w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-105 transition-transform"
      }
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? "#F26B3A" : "none"}
        stroke={liked ? "#F26B3A" : "#262130"}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
