import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";
import { computeStats } from "@/lib/stats";
import { normalizeSongs } from "@/lib/types";
import type { TierEntry } from "@/lib/types";
import { TIER_COLORS, TIERS } from "@/lib/constants";
import { getThemeById, type EraTheme } from "@/lib/themes";

export const runtime = "edge";

const FONT_FILES: Record<string, { file: string; name: string }> = {
  "font-sans": { file: "SpaceGrotesk.ttf", name: "Space Grotesk" },
  "font-serif": { file: "Lora.ttf", name: "Lora" },
  "font-rounded": { file: "Quicksand.ttf", name: "Quicksand" },
  "font-typewriter": { file: "SpecialElite.ttf", name: "Special Elite" },
  "font-display": { file: "PlayfairDisplay.ttf", name: "Playfair Display" },
  "font-condensed": { file: "Oswald.ttf", name: "Oswald" },
  "font-modern": { file: "DMSans.ttf", name: "DM Sans" },
};

const ALBUM_TO_THEME: Record<string, EraTheme> = {
  "Taylor Swift": "taylor-swift",
  Debut: "taylor-swift",
  Fearless: "fearless",
  "Fearless (Taylor's Version)": "fearless",
  "Fearless (TV)": "fearless",
  "Speak Now": "speak-now",
  "Speak Now (Taylor's Version)": "speak-now",
  "Speak Now (TV)": "speak-now",
  Red: "red",
  "Red (Taylor's Version)": "red",
  "Red (TV)": "red",
  "1989": "1989",
  "1989 (Taylor's Version)": "1989",
  "1989 (TV)": "1989",
  reputation: "reputation",
  Lover: "lover",
  folklore: "folklore",
  evermore: "evermore",
  Midnights: "midnights",
  "The Tortured Poets Department": "ttpd",
  TTPD: "ttpd",
  "The Life of a Showgirl": "showgirl",
  Showgirl: "showgirl",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: profile } = await supabase
      .from("users")
      .select("id, display_name, username, theme_era")
      .eq("username", username)
      .single();

    if (!profile) {
      return new Response("User not found", { status: 404 });
    }

    const [songsRes, entriesRes] = await Promise.all([
      supabase
        .from("songs")
        .select("*")
        .order("album_order")
        .order("track_number"),
      supabase.from("tier_entries").select("*").eq("user_id", profile.id),
    ]);

    const songs = normalizeSongs(songsRes.data ?? []);
    const entries = (entriesRes.data ?? []) as TierEntry[];
    const stats = computeStats(entries, songs);

    const { origin } = new URL(request.url);

    // Determine theme colors
    let themeEra = (profile.theme_era ?? "default") as EraTheme;
    if (themeEra === "default" && stats.favoriteEra) {
      const derived = ALBUM_TO_THEME[stats.favoriteEra];
      if (derived) themeEra = derived;
    }
    const theme = getThemeById(themeEra);
    const c = theme.colors;
    const albumImageUrl = theme.albumImage
      ? `${origin}${theme.albumImage}`
      : null;

    // Load the theme-appropriate font from public directory
    const fontInfo = FONT_FILES[theme.fontClass] ?? FONT_FILES["font-sans"];
    const fontData = await fetch(
      `${origin}/fonts/${fontInfo.file}`
    ).then((r) => r.arrayBuffer());

    const maxTierCount = Math.max(...Object.values(stats.tierCounts), 1);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            fontFamily: `'${fontInfo.name}', sans-serif`,
          }}
        >
          {/* Background color */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: c.background,
            }}
          />

          {/* Faded album image */}
          {albumImageUrl && (
            <img
              src={albumImageUrl}
              width={630}
              height={630}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "630px",
                height: "630px",
                objectFit: "cover",
                opacity: 0.12,
              }}
            />
          )}

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              width: "100%",
              height: "100%",
              color: c.foreground,
            }}
          >
            {/* Accent bar */}
            <div
              style={{
                display: "flex",
                height: "6px",
                width: "100%",
                background:
                  theme.headerGradient ??
                  `linear-gradient(90deg, ${c.accent}, ${c.accent})`,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "40px 56px 36px",
                flex: 1,
              }}
            >
              {/* Name + archetype */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "48px", fontWeight: 700 }}>
                    {profile.display_name}
                  </span>
                  <span
                    style={{ fontSize: "28px", color: c.mutedForeground }}
                  >
                    @{profile.username}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "26px",
                    color: c.accent,
                    marginTop: "4px",
                  }}
                >
                  {stats.archetype}
                </span>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  gap: "48px",
                  marginBottom: "28px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{ fontSize: "14px", color: c.mutedForeground }}
                  >
                    Favorite Era
                  </span>
                  <span style={{ fontSize: "24px", fontWeight: 700 }}>
                    {stats.favoriteEra ?? "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{ fontSize: "14px", color: c.mutedForeground }}
                  >
                    Songs Ranked
                  </span>
                  <span style={{ fontSize: "24px", fontWeight: 700 }}>
                    {stats.totalRanked}
                  </span>
                </div>
              </div>

              {/* Tier distribution bars */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flex: 1,
                }}
              >
                {TIERS.map((tier) => {
                  const count = stats.tierCounts[tier];
                  const widthPercent = (count / maxTierCount) * 100;
                  return (
                    <div
                      key={tier}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: 700,
                          width: "32px",
                          color: TIER_COLORS[tier],
                        }}
                      >
                        {tier}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          height: "28px",
                          borderRadius: "6px",
                          backgroundColor: TIER_COLORS[tier],
                          width: `${Math.max(widthPercent, 2)}%`,
                          maxWidth: "800px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "18px",
                          color: c.mutedForeground,
                          marginLeft: "4px",
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "16px",
                }}
              >
                <span
                  style={{ fontSize: "20px", color: c.mutedForeground }}
                >
                  All Tier Well
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: fontInfo.name, data: fontData, weight: 400 as const },
        ],
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("OG profile image error:", msg, e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
