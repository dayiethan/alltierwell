"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileActionsProps {
  username: string;
  isOwner: boolean;
  currentUserId?: string;
  targetUserId: string;
}

export default function ProfileActions({
  username,
  isOwner,
  currentUserId,
  targetUserId,
}: ProfileActionsProps) {
  const [copied, setCopied] = useState<"profile" | "compare" | null>(null);
  const router = useRouter();

  const logEvent = (eventType: string) => {
    const supabase = createClient();
    supabase.from("user_events").insert({
      event_type: eventType,
      actor_id: currentUserId ?? null,
      target_user_id: targetUserId,
    });
  };

  const handleCopy = async (type: "profile" | "compare") => {
    const url =
      type === "profile"
        ? `${window.location.origin}/user/${username}`
        : `${window.location.origin}/compare/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      logEvent(type === "profile" ? "share_profile_click" : "compare_with_me_click");
    } catch {
      // Fallback for browsers without clipboard API
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCopy("profile")}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
      >
        {copied === "profile" ? "Copied!" : "Share Profile"}
      </button>

      <button
        onClick={() => handleCopy("compare")}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
      >
        {copied === "compare" ? "Copied!" : "Compare With Me"}
      </button>

      {isOwner && (
        <Link
          href="/rank"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          Edit
        </Link>
      )}

      {isOwner && (
        <button
          onClick={handleSignOut}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200"
        >
          Sign Out
        </button>
      )}

      {!isOwner && currentUserId && (
        <Link
          href={`/compare/${username}`}
          onClick={() => logEvent("compare_button_click")}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
        >
          Compare
        </Link>
      )}
    </div>
  );
}
