"use client";

import { useState } from "react";

export default function ComparisonShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
  };

  return (
    <button
      onClick={handleShare}
      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
    >
      {copied ? "Link copied!" : "Share this comparison"}
    </button>
  );
}
