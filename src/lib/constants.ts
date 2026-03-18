import type { Tier } from "@/lib/types";

export const TIERS: Tier[] = ["S", "A", "B", "C", "D", "F"];

export const TIER_COLORS: Record<Tier, string> = {
  S: "#FF7F7F",
  A: "#FFB347",
  B: "#FFFF66",
  C: "#77DD77",
  D: "#89CFF0",
  F: "#C3B1E1",
};

export const TIER_ORDER: Record<Tier, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  F: 5,
};

export const ALBUMS = [
  { name: "Taylor Swift", order: 1, color: "#1DB954" },
  { name: "Fearless", order: 2, color: "#C9A96E" },
  { name: "Fearless (Taylor's Version)", order: 2, color: "#C9A96E" },
  { name: "Speak Now", order: 3, color: "#8B45A6" },
  { name: "Speak Now (Taylor's Version)", order: 3, color: "#8B45A6" },
  { name: "Red", order: 4, color: "#8B0000" },
  { name: "Red (Taylor's Version)", order: 4, color: "#8B0000" },
  { name: "1989", order: 5, color: "#6CC4E8" },
  { name: "1989 (Taylor's Version)", order: 5, color: "#6CC4E8" },
  { name: "reputation", order: 6, color: "#2D2D2D" },
  { name: "Lover", order: 7, color: "#FFB6C1" },
  { name: "folklore", order: 8, color: "#808080" },
  { name: "evermore", order: 9, color: "#C67B30" },
  { name: "Midnights", order: 10, color: "#191970" },
  { name: "The Tortured Poets Department", order: 11, color: "#F5F5DC" },
  { name: "The Life of a Showgirl", order: 12, color: "#E8333A" },
] as const;

export const ALBUM_SHORT_NAMES: Record<string, string> = {
  "Taylor Swift": "Debut",
  Fearless: "Fearless",
  "Fearless (Taylor's Version)": "Fearless (TV)",
  "Speak Now": "Speak Now",
  "Speak Now (Taylor's Version)": "Speak Now (TV)",
  Red: "Red",
  "Red (Taylor's Version)": "Red (TV)",
  "1989": "1989",
  "1989 (Taylor's Version)": "1989 (TV)",
  reputation: "reputation",
  Lover: "Lover",
  folklore: "folklore",
  evermore: "evermore",
  Midnights: "Midnights",
  "The Tortured Poets Department": "TTPD",
  "The Life of a Showgirl": "Showgirl",
};
