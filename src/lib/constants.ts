import type { Song, Tier } from "@/lib/types";

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
  { name: "Taylor Swift", order: 1, color: "#1DB954", image: "/albums/taylor-swift.png" },
  { name: "Fearless", order: 2, color: "#C9A96E", image: "/albums/fearless.png" },
  { name: "Fearless (Taylor's Version)", order: 2, color: "#C9A96E", image: "/albums/fearless-tv.png" },
  { name: "Speak Now", order: 3, color: "#8B45A6", image: "/albums/speak-now.png" },
  { name: "Speak Now (Taylor's Version)", order: 3, color: "#8B45A6", image: "/albums/speak-now-tv.png" },
  { name: "Red", order: 4, color: "#8B0000", image: "/albums/red.png" },
  { name: "Red (Taylor's Version)", order: 4, color: "#8B0000", image: "/albums/red-tv.png" },
  { name: "1989", order: 5, color: "#6CC4E8", image: "/albums/1989.png" },
  { name: "1989 (Taylor's Version)", order: 5, color: "#6CC4E8", image: "/albums/1989-tv.png" },
  { name: "reputation", order: 6, color: "#2D2D2D", image: "/albums/reputation.png" },
  { name: "Lover", order: 7, color: "#FFB6C1", image: "/albums/lover.png" },
  { name: "folklore", order: 8, color: "#808080", image: "/albums/folklore.png" },
  { name: "evermore", order: 9, color: "#C67B30", image: "/albums/evermore.png" },
  { name: "Midnights", order: 10, color: "#191970", image: "/albums/midnights.png" },
  { name: "The Tortured Poets Department", order: 11, color: "#F5F5DC", image: "/albums/ttpd.png" },
  { name: "The Life of a Showgirl", order: 12, color: "#E8333A", image: "/albums/tloas.png" },
  { name: "Non-Album", order: 999, color: "#9CA3AF", image: "/albums/non-album.png" },
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
  "Non-Album": "Non-Album",
};

/** Unique eras in chronological order, merging original + TV versions */
export const ERAS: { order: number; label: string; color: string }[] = (() => {
  const seen = new Map<number, { order: number; label: string; color: string }>();
  for (const album of ALBUMS) {
    if (!seen.has(album.order)) {
      seen.set(album.order, {
        order: album.order,
        label: ALBUM_SHORT_NAMES[album.name] ?? album.name,
        color: album.color,
      });
    }
  }
  return [...seen.values()].sort((a, b) => a.order - b.order);
})();

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

/** Round an average TIER_ORDER value (0-5) to the nearest Tier */
export function tierOrderToTier(avgTierOrder: number): Tier {
  const rounded = Math.round(Math.max(0, Math.min(5, avgTierOrder)));
  return TIERS[rounded];
}

/** Label for how extreme a hot take is */
export function getHotTakeLabel(distance: number): string {
  if (distance >= 4) return "Scorching Take";
  if (distance >= 3) return "Hot Take";
  return "Warm Take";
}

/** Tier → score out of 10 mapping */
export const TIER_SCORE: Record<Tier, number> = {
  S: 10,
  A: 8,
  B: 6,
  C: 4,
  D: 2,
  F: 0,
};

/** Convert an average TIER_ORDER value (0-5) to a score out of 10 */
export function tierOrderToScore(avgTierOrder: number): number {
  // TIER_ORDER: S=0, A=1, B=2, C=3, D=4, F=5
  // TIER_SCORE: S=10, A=8, B=6, C=4, D=2, F=0
  // Linear mapping: score = 10 - (avgTierOrder * 2)
  return Math.max(0, Math.min(10, 10 - avgTierOrder * 2));
}

/** Ensure a hex color is readable as text by darkening it if too light */
export function ensureReadableColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance (ITU-R BT.709)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance < 0.6) return hex;
  // Darken by 40%
  const d = (v: number) => Math.round(v * 0.6).toString(16).padStart(2, "0");
  return `#${d(r)}${d(g)}${d(b)}`;
}

/** Get the display image for a song: per-song image for non-album songs, album art otherwise */
export function getSongImage(song: Song): string | undefined {
  if (song.image_url) return song.image_url;
  return ALBUMS.find((a) => a.name === song.album)?.image;
}

/** Get the album color for a song */
export function getSongAlbumColor(song: Song): string {
  return ALBUMS.find((a) => a.name === song.album)?.color ?? "#888";
}
