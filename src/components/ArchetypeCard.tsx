"use client";

import { useState } from "react";

interface ArchetypeCardProps {
  archetype: string;
  description: string;
}

export default function ArchetypeCard({ archetype, description }: ArchetypeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-muted/50"
    >
      <p className="text-xs text-muted-foreground">
        Archetype
        <span className="ml-1 text-[10px]">{expanded ? "▲" : "▼"}</span>
      </p>
      <p className="mt-0.5 text-lg font-semibold">{archetype}</p>
      {expanded && description && (
        <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed">
          {description}
        </p>
      )}
    </button>
  );
}
