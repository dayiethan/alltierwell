"use client";

import { createClient } from "@/lib/supabase/client";
import { ALBUMS, TIERS, TIER_COLORS } from "@/lib/constants";
import { useEffect, useRef } from "react";

const UNIQUE_ALBUMS = ALBUMS.filter(
  (a, i, arr) => arr.findIndex((b) => b.order === a.order) === i
);

const SAMPLE_TIER_LIST: { tier: (typeof TIERS)[number]; songs: { title: string; album: string }[] }[] = [
  {
    tier: "S",
    songs: [
      { title: "All Too Well (10 Minute Version)", album: "Red (Taylor's Version)" },
      { title: "Cruel Summer", album: "Lover" },
      { title: "Style", album: "1989" },
    ],
  },
  {
    tier: "A",
    songs: [
      { title: "cardigan", album: "folklore" },
      { title: "Love Story", album: "Fearless" },
      { title: "Anti-Hero", album: "Midnights" },
      { title: "Blank Space", album: "1989" },
    ],
  },
  {
    tier: "B",
    songs: [
      { title: "Shake It Off", album: "1989" },
      { title: "Delicate", album: "reputation" },
      { title: "willow", album: "evermore" },
    ],
  },
  {
    tier: "C",
    songs: [
      { title: "ME!", album: "Lover" },
      { title: "Bad Blood", album: "1989" },
    ],
  },
];

interface LandingPageProps {
  floatingImages: string[];
}

export default function LandingPage({ floatingImages }: LandingPageProps) {
  const supabase = createClient();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const covers: HTMLImageElement[] = [];
    const positions: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      vr: number;
    }[] = [];

    const albumImages = UNIQUE_ALBUMS.map((a) => ({
      image: a.image,
      color: a.color,
    }));
    const extraImages = floatingImages.map((src) => ({
      image: src,
      color: "#888888",
    }));
    const allImages = [...albumImages, ...extraImages];
    // Duplicate for more coverage
    const floatingItems = [...allImages, ...allImages];

    floatingItems.forEach((album) => {
      const img = document.createElement("img");
      img.src = album.image;
      img.alt = "";
      img.style.position = "absolute";
      img.style.borderRadius = "12px";
      img.style.objectFit = "cover";
      img.style.opacity = "0.5";
      img.style.pointerEvents = "none";
      img.style.willChange = "transform";
      img.onerror = () => {
        img.style.backgroundColor = album.color + "25";
        img.removeAttribute("src");
      };

      const scale = Math.min(window.innerWidth / 1200, 1);
      const size = (100 + Math.random() * 100) * (0.3 + 0.7 * scale);
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;

      container.appendChild(img);
      covers.push(img);
      positions.push({
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size,
        rotation: Math.random() * 20 - 10,
        vr: (Math.random() - 0.5) * 0.1,
      });
    });

    let animationId: number;
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      positions.forEach((pos, i) => {
        pos.x += pos.vx;
        pos.y += pos.vy;
        pos.rotation += pos.vr;

        if (pos.x <= 0 || pos.x >= w - pos.size) pos.vx *= -1;
        if (pos.y <= 0 || pos.y >= h - pos.size) pos.vy *= -1;

        pos.x = Math.max(0, Math.min(w - pos.size, pos.x));
        pos.y = Math.max(0, Math.min(h - pos.size, pos.y));

        covers[i].style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg)`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      covers.forEach((img) => img.remove());
    };
  }, [floatingImages]);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      {/* Full-screen hero */}
      <section className="relative flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
        {/* Floating album covers */}
        <div ref={canvasRef} className="absolute inset-0 -z-10 overflow-hidden" />
        <div className="absolute inset-0 -z-10 bg-white/40" />

        <div className="relative text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            All Tier Well
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-gray-600 sm:text-xl">
            Rank every Taylor Swift song. Share your taste. See how you compare.
          </p>

          <button
            onClick={handleSignIn}
            className="mt-10 rounded-xl bg-foreground px-8 py-3.5 text-base font-semibold text-background shadow-lg hover:opacity-90 transition-opacity"
          >
            Sign in with Google
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center text-gray-300">
          <svg
            className="h-5 w-5 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 bg-gray-50/50 px-4 py-16">
        <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
          How it works
        </h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-8 sm:grid-cols-3">
          <Step
            number="1"
            title="Rank your songs"
            description="Place songs into S, A, B, C, D, or F tiers. Go at your own pace — partial lists are welcome."
          />
          <Step
            number="2"
            title="Share your profile"
            description="Get a public profile page with your tier list, stats, and favorite era."
          />
          <Step
            number="3"
            title="Compare with friends"
            description="See your compatibility score, shared favorites, and biggest disagreements."
          />
        </div>
      </section>

      {/* Mini tier list preview */}
      <section className="border-t border-gray-100 px-4 py-16">
        <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Preview
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Drag and drop songs into tiers — here&apos;s what it looks like
        </p>
        <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          {SAMPLE_TIER_LIST.map(({ tier, songs }) => (
            <MiniTierRow key={tier} tier={tier} songs={songs} />
          ))}
        </div>
      </section>

      {/* Scrolling album strip */}
      <section className="border-t border-gray-100 py-10 overflow-hidden">
        <div className="flex w-max gap-3" style={{ animation: "marquee 40s linear infinite" }}>
          {Array.from({ length: 6 }, (_, setIndex) =>
            UNIQUE_ALBUMS.map((album, i) => (
              <div key={`${setIndex}-${album.name}-${i}`} className="flex-shrink-0">
                <img
                  src={album.image}
                  alt={album.name}
                  className="h-16 w-16 rounded-lg object-cover shadow-sm sm:h-20 sm:w-20"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.backgroundColor = album.color + "30";
                    el.style.border = "1px solid " + album.color + "20";
                    el.removeAttribute("src");
                  }}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
        {number}
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function MiniTierRow({
  tier,
  songs,
}: {
  tier: (typeof TIERS)[number];
  songs: { title: string; album: string }[];
}) {
  const album = (name: string) =>
    ALBUMS.find((a) => a.name === name) as
      | { name: string; color: string; image: string }
      | undefined;

  return (
    <div className="flex border-b border-gray-100 last:border-b-0">
      <div
        className="flex w-12 flex-shrink-0 items-center justify-center text-lg font-bold sm:w-14"
        style={{ backgroundColor: TIER_COLORS[tier] + "40" }}
      >
        {tier}
      </div>
      <div className="flex flex-wrap gap-1.5 px-3 py-2">
        {songs.map((song) => {
          const a = album(song.album);
          return (
            <span
              key={song.title}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-0.5 text-xs"
              style={{ backgroundColor: TIER_COLORS[tier] + "15" }}
            >
              {a?.image ? (
                <img
                  src={a.image}
                  alt=""
                  className="h-3.5 w-3.5 rounded-sm object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
              ) : (
                <span
                  className="h-3.5 w-3.5 rounded-sm"
                  style={{ backgroundColor: (a?.color ?? "#888") + "40" }}
                />
              )}
              <span className="truncate">{song.title}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
