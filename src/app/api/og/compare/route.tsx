import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";
import { computeComparison } from "@/lib/comparison";
import { normalizeSongs } from "@/lib/types";
import type { TierEntry, UserProfile } from "@/lib/types";
import { getFlavorText, getDisagreementLabel } from "@/lib/constants";
import { computeArchetype } from "@/lib/stats";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const u1 = searchParams.get("u1");
    const u2 = searchParams.get("u2");

    if (!u1 || !u2) {
      return new Response("Missing u1 or u2 params", { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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

    const { origin } = new URL(request.url);

    const [songsRes, entries1Res, entries2Res, fontData] = await Promise.all([
      supabase
        .from("songs")
        .select("*")
        .order("album_order")
        .order("track_number"),
      supabase.from("tier_entries").select("*").eq("user_id", user1.id),
      supabase.from("tier_entries").select("*").eq("user_id", user2.id),
      fetch(`${origin}/fonts/SpaceGrotesk.ttf`).then((r) => r.arrayBuffer()),
    ]);

    const songs = normalizeSongs(songsRes.data ?? []);
    const entries1 = (entries1Res.data ?? []) as TierEntry[];
    const entries2 = (entries2Res.data ?? []) as TierEntry[];

    const result = computeComparison(entries1, entries2, songs);
    const flavorText = getFlavorText(result.compatibilityScore);
    const user1Archetype = computeArchetype(entries1, songs);
    const user2Archetype = computeArchetype(entries2, songs);

    const user1FavEra = result.user1TopEras[0]?.shortName ?? "\u2014";
    const user2FavEra = result.user2TopEras[0]?.shortName ?? "\u2014";
    const user1Color = result.user1TopEras[0]?.albumColor ?? "#c084fc";
    const user2Color = result.user2TopEras[0]?.albumColor ?? "#f472b6";
    const user1Image = result.user1TopEras[0]?.albumImage
      ? `${origin}${result.user1TopEras[0].albumImage}`
      : null;
    const user2Image = result.user2TopEras[0]?.albumImage
      ? `${origin}${result.user2TopEras[0].albumImage}`
      : null;

    const topDisagreement = result.biggestDisagreements[0] ?? null;
    const mostAligned = result.albumAlignment[0] ?? null;

    // Smooth red → yellow → green based on score (HSL hue 0-120)
    const scoreHue = Math.round((result.compatibilityScore / 100) * 120);
    const scoreColor = `hsl(${scoreHue}, 75%, 55%)`;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {/* Color gradient background */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${user1Color} 0%, ${user2Color} 100%)`,
            }}
          />

          {/* Album images */}
          {user1Image && (
            <img
              src={user1Image}
              width={600}
              height={630}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "600px",
                height: "630px",
                objectFit: "cover",
                opacity: 0.15,
              }}
            />
          )}
          {user2Image && (
            <img
              src={user2Image}
              width={600}
              height={630}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "600px",
                height: "630px",
                objectFit: "cover",
                opacity: 0.15,
              }}
            />
          )}

          {/* Dark overlay for text readability */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.35)",
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              width: "100%",
              height: "100%",
              color: "#ffffff",
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "34px", fontWeight: 700 }}>
                  {user1.display_name}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  {user1Archetype}
                </span>
              </div>
              <span
                style={{
                  fontSize: "26px",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              >
                vs
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "34px", fontWeight: 700 }}>
                  {user2.display_name}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
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
                  color: scoreColor,
                }}
              >
                {result.compatibilityScore}%
              </span>
              <span
                style={{
                  fontSize: "18px",
                  color: "rgba(255, 255, 255, 0.6)",
                  marginTop: "4px",
                }}
              >
                compatibility
              </span>
            </div>

            {/* Flavor text */}
            <div
              style={{
                display: "flex",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                {"\u201C"}
                {flavorText}
                {"\u201D"}
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
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  minWidth: "220px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.5)",
                    marginBottom: "8px",
                  }}
                >
                  Favorite Eras
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>
                    {user1FavEra}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.35)",
                    }}
                  >
                    vs
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>
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
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    borderRadius: "12px",
                    padding: "16px 24px",
                    minWidth: "220px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "8px",
                    }}
                  >
                    Most Aligned
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>
                    {mostAligned.album}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
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
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    borderRadius: "12px",
                    padding: "16px 24px",
                    minWidth: "220px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "8px",
                    }}
                  >
                    {getDisagreementLabel(topDisagreement.distance)}
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {topDisagreement.song.title}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    {topDisagreement.user1Tier} vs{" "}
                    {topDisagreement.user2Tier}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontSize: "18px",
                  color: "rgba(255, 255, 255, 0.35)",
                }}
              >
                All Tier Well
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Space Grotesk", data: fontData, weight: 400 as const },
        ],
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("OG compare image error:", msg, e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
