"use client";

import Link from "next/link";
import { useState } from "react";

interface ProfileActionsProps {
  username: string;
  isOwner: boolean;
  currentUserId?: string;
}

export default function ProfileActions({
  username,
  isOwner,
  currentUserId,
}: ProfileActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/user/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        {copied ? "Copied!" : "Share Profile"}
      </button>

      {isOwner && (
        <Link
          href="/rank"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Edit
        </Link>
      )}

      {!isOwner && currentUserId && (
        <Link
          href={`/compare/${username}`}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
        >
          Compare
        </Link>
      )}
    </div>
  );
}
