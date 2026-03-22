import { ImageResponse } from "@vercel/og";
import { createClient } from "@/lib/supabase/server";
import { computeComparison } from "@/lib/comparison";
import { normalizeSongs } from "@/lib/types";
import type { TierEntry, UserProfile } from "@/lib/types";
import { getFlavorText, getDisagreementLabel } from "@/lib/constants";
import { computeArchetype } from "@/lib/stats";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u1 = searchParams.get("u1");
  const u2 = searchParams.get("u2");

  if (!u1 || !u2) {
    return new Response("Missing u1 or u2 params", { status: 400 });
  }

  const supabase = await createClient();

  const [profile1Res, profile2Res] = await Promise.all([
    supabase
      .from("users")
      .select("id, display_name, username")
      .eq("username", u1)
      .single(),
    supabase
      .from("users")
      .select("id, display_name, username")
      .eq("username", u2)
      .single(),
  ]);

  if (!profile1Res.data || !profile2Res.data) {
    return new Response("User not found", { status: 404 });
  }

  const user1 = profile1Res.data as Pick<
    UserProfile,
    "id" | "display_name" | "username"
  >;
  const user2 = profile2Res.data as Pick<
    UserProfile,
    "id" | "display_name" | "username"
  >;

  const [songsRes, entries1Res, entries2Res] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .order("album_order")
      .order("track_number"),
    supabase.from("tier_entries").select("*").eq("user_id", user1.id),
    supabase.from("tier_entries").select("*").eq("user_id", user2.id),
  ]);

  const songs = normalizeSongs(songsRes.data ?? []);
  const entries1 = (entries1Res.data ?? []) as TierEntry[];
  const entries2 = (entries2Res.data ?? []) as TierEntry[];

  const result = computeComparison(entries1, entries2, songs);
  const flavorText = getFlavorText(result.compatibilityScore);
  const user1Archetype = computeArchetype(entries1, songs);
  const user2Archetype = computeArchetype(entries2, songs);

  // Extract insights for the card
  const user1FavEra = result.user1TopEras[0]?.shortName ?? "—";
  const user2FavEra = result.user2TopEras[0]?.shortName ?? "—";

  const topDisagreement = result.biggestDisagreements[0] ?? null;
  const mostAligned = result.albumAlignment[0] ?? null;

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
          fontFamily: "sans-serif",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 56px",
        }}
      >
        {/* User names + archetypes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "34px", fontWeight: 600 }}>
              {user1.display_name}
            </span>
            <span style={{ fontSize: "16px", color: "#c084fc" }}>
              {user1Archetype}
            </span>
          </div>
          <span style={{ fontSize: "26px", color: "#888888" }}>vs</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "34px", fontWeight: 600 }}>
              {user2.display_name}
            </span>
            <span style={{ fontSize: "16px", color: "#f472b6" }}>
              {user2Archetype}
            </span>
          </div>
        </div>

        {/* Big compatibility score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "100px",
              fontWeight: 700,
              lineHeight: 1,
              background:
                result.compatibilityScore >= 70
                  ? "linear-gradient(135deg, #c084fc, #f472b6)"
                  : result.compatibilityScore >= 40
                    ? "linear-gradient(135deg, #fbbf24, #f97316)"
                    : "linear-gradient(135deg, #ef4444, #dc2626)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {result.compatibilityScore}%
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "#888888",
              marginTop: "4px",
            }}
          >
            compatibility
          </span>
        </div>

        {/* Flavor text lyric */}
        <div
          style={{
            display: "flex",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              color: "#c084fc",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            &ldquo;{flavorText}&rdquo;
          </span>
        </div>

        {/* Insights row */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "28px",
          }}
        >
          {/* Favorite Eras */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "16px 24px",
              minWidth: "220px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
              Favorite Eras
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {user1FavEra}
              </span>
              <span style={{ fontSize: "14px", color: "#555555" }}>vs</span>
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {user2FavEra}
              </span>
            </div>
          </div>

          {/* Most Aligned Album */}
          {mostAligned && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                borderRadius: "12px",
                padding: "16px 24px",
                minWidth: "220px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
                Most Aligned
              </span>
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {mostAligned.album}
              </span>
              <span style={{ fontSize: "14px", color: "#888888", marginTop: "2px" }}>
                {mostAligned.score}% match
              </span>
            </div>
          )}

          {/* Biggest Disagreement */}
          {topDisagreement && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                borderRadius: "12px",
                padding: "16px 24px",
                minWidth: "220px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
                {getDisagreementLabel(topDisagreement.distance)}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  textAlign: "center",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {topDisagreement.song.title}
              </span>
              <span style={{ fontSize: "14px", color: "#888888", marginTop: "2px" }}>
                {topDisagreement.user1Tier} vs {topDisagreement.user2Tier}
              </span>
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div style={{ display: "flex" }}>
          <span style={{ fontSize: "18px", color: "#555555" }}>
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
