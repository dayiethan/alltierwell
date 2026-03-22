"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CardPreviewModal from "@/components/ui/CardPreviewModal";

export default function ComparisonShareButton() {
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Extract usernames from URL path: /compare/user1/user2
  const getUsers = () => {
    const parts = window.location.pathname.split("/");
    return { u1: parts[2] ?? "", u2: parts[3] ?? "" };
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Log event (fire-and-forget)
      const supabase = createClient();
      supabase.from("user_events").insert({
        event_type: "share_comparison_click",
        metadata: { url: window.location.pathname },
      });
    } catch {
      // Fallback for browsers without clipboard API
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          {copied ? "Link copied!" : "Share this comparison"}
        </button>
        <button
          onClick={() => setShowCard(true)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Share Card
        </button>
      </div>

      {showCard && (() => {
        const { u1, u2 } = getUsers();
        return (
          <CardPreviewModal
            imageUrl={`/api/og/compare?u1=${u1}&u2=${u2}`}
            downloadName={`${u1}-vs-${u2}-alltierwell.png`}
            onClose={() => setShowCard(false)}
          />
        );
      })()}
    </>
  );
}
