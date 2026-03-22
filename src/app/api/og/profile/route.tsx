import { ImageResponse } from "@vercel/og";
import { createClient } from "@/lib/supabase/server";
import { computeStats } from "@/lib/stats";
import { normalizeSongs } from "@/lib/types";
import type { TierEntry } from "@/lib/types";
import { TIER_COLORS, TIERS } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return new Response("Missing username", { status: 400 });
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, username")
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
    supabase
      .from("tier_entries")
      .select("*")
      .eq(
        "user_id",
        (
          await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .single()
        ).data!.id
      ),
  ]);

  const songs = normalizeSongs(songsRes.data ?? []);
  const entries = (entriesRes.data ?? []) as TierEntry[];
  const stats = computeStats(entries, songs);

  const maxTierCount = Math.max(...Object.values(stats.tierCounts), 1);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          padding: "48px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: Name + archetype */}
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
            <span style={{ fontSize: "28px", color: "#888888" }}>
              @{profile.username}
            </span>
          </div>
          <span
            style={{
              fontSize: "26px",
              color: "#c084fc",
              marginTop: "4px",
            }}
          >
            {stats.archetype}
          </span>
        </div>

        {/* Middle: Stats row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>
              Favorite Era
            </span>
            <span style={{ fontSize: "24px", fontWeight: 600 }}>
              {stats.favoriteEra ?? "N/A"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>
              Songs Ranked
            </span>
            <span style={{ fontSize: "24px", fontWeight: 600 }}>
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
                    color: "#aaaaaa",
                    marginLeft: "4px",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#555555" }}>
            All Tier Well
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
