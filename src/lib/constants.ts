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
  { name: "Taylor Swift", order: 1, color: "#1DB954", image: "/albums/taylor-swift.jpg" },
  { name: "Fearless", order: 2, color: "#C9A96E", image: "/albums/fearless.jpg" },
  { name: "Fearless (Taylor's Version)", order: 2, color: "#C9A96E", image: "/albums/fearless.jpg" },
  { name: "Speak Now", order: 3, color: "#8B45A6", image: "/albums/speak-now.jpg" },
  { name: "Speak Now (Taylor's Version)", order: 3, color: "#8B45A6", image: "/albums/speak-now.jpg" },
  { name: "Red", order: 4, color: "#8B0000", image: "/albums/red.jpg" },
  { name: "Red (Taylor's Version)", order: 4, color: "#8B0000", image: "/albums/red.jpg" },
  { name: "1989", order: 5, color: "#6CC4E8", image: "/albums/1989.jpg" },
  { name: "1989 (Taylor's Version)", order: 5, color: "#6CC4E8", image: "/albums/1989.jpg" },
  { name: "reputation", order: 6, color: "#2D2D2D", image: "/albums/reputation.jpg" },
  { name: "Lover", order: 7, color: "#FFB6C1", image: "/albums/lover.jpg" },
  { name: "folklore", order: 8, color: "#808080", image: "/albums/folklore.jpg" },
  { name: "evermore", order: 9, color: "#C67B30", image: "/albums/evermore.jpg" },
  { name: "Midnights", order: 10, color: "#191970", image: "/albums/midnights.jpg" },
  { name: "The Tortured Poets Department", order: 11, color: "#F5F5DC", image: "/albums/ttpd.jpg" },
  { name: "The Life of a Showgirl", order: 12, color: "#E8333A", image: "/albums/showgirl.jpg" },
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

export const COMPATIBILITY_FLAVOR: { min: number; text: string }[] = [
  { min: 95, text: "You Belong With Me" },
  { min: 85, text: "It's a Love Story" },
  { min: 75, text: "We're dancing in a snow globe 'round and 'round" },
  { min: 65, text: "Long story short, I survived" },
  { min: 55, text: "Nice to meet you, where you been?" },
  { min: 45, text: "We are never getting back together... like, ever" },
  { min: 35, text: "Band-aids don't fix bullet holes" },
  { min: 25, text: "We've got bad blood" },
  { min: 15, text: "Look what you made me do" },
  { min: 0, text: "I knew you were trouble when you walked in" },
];

export function getFlavorText(score: number): string {
  return (
    COMPATIBILITY_FLAVOR.find((f) => score >= f.min)?.text ??
    COMPATIBILITY_FLAVOR[COMPATIBILITY_FLAVOR.length - 1].text
  );
}

export function getGradingStyle(avgTier: number): string {
  if (avgTier < 1.5) return "Generous";
  if (avgTier < 2.5) return "Balanced";
  if (avgTier < 3.5) return "Selective";
  return "Harsh Critic";
}

export function getDisagreementLabel(distance: number): string {
  if (distance >= 5) return "Full-On Feud";
  if (distance >= 4) return "Heated Debate";
  if (distance >= 3) return "Strong Opinions";
  return "Minor Disagreement";
}
