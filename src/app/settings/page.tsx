"use client";

import { useTheme } from "@/components/ThemeProvider";
import { ERA_THEMES } from "@/lib/themes";
import type { EraTheme } from "@/lib/themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Era Theme
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose an era to change the look and feel of the entire site.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {ERA_THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as EraTheme)}
                className="group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all"
                style={{
                  borderColor: isActive ? t.colors.accent : t.colors.border,
                  backgroundColor: t.colors.card,
                }}
              >
                {/* Color preview strip */}
                <div className="flex gap-1 mb-3">
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.background }}
                  />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.muted }}
                  />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.foreground }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {t.albumImage && (
                    <img
                      src={t.albumImage}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: t.colors.foreground }}
                    >
                      {t.label}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <div
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: t.colors.accent,
                      color: t.colors.accentForeground,
                    }}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
