"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { EraTheme } from "@/lib/themes";
import { getThemeById } from "@/lib/themes";
import type { ThemeDefinition } from "@/lib/themes";

interface ThemeContextValue {
  theme: EraTheme;
  themeDef: ThemeDefinition;
  setTheme: (theme: EraTheme) => void;
  setTemporaryTheme: (themeId: EraTheme) => void;
  clearTemporaryTheme: () => void;
}

const defaultDef = getThemeById("default");

const ThemeContext = createContext<ThemeContextValue>({
  theme: "default",
  themeDef: defaultDef,
  setTheme: () => {},
  setTemporaryTheme: () => {},
  clearTemporaryTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/** Hide/show the watermark. Call useWatermark(false) on pages where it shouldn't appear. */
export function useWatermark(visible: boolean) {
  useEffect(() => {
    const el = document.getElementById("era-watermark");
    if (el) el.style.display = visible ? "block" : "none";
    return () => {
      const el2 = document.getElementById("era-watermark");
      if (el2) el2.style.display = "block";
    };
  }, [visible]);
}

const FONT_MAP: Record<string, string> = {
  "font-sans": "var(--font-space-grotesk), Arial, Helvetica, sans-serif",
  "font-serif": "var(--font-lora), Georgia, serif",
  "font-rounded": "var(--font-quicksand), Arial, Helvetica, sans-serif",
  "font-typewriter": "var(--font-special-elite), 'Courier New', monospace",
  "font-display": "var(--font-playfair), Georgia, serif",
  "font-condensed": "var(--font-oswald), Arial, Helvetica, sans-serif",
  "font-modern": "var(--font-dm-sans), Arial, Helvetica, sans-serif",
};

function applyTheme(theme: EraTheme) {
  const def = getThemeById(theme);
  const { colors } = def;
  const root = document.documentElement;

  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--header-bg", colors.headerBg);

  root.setAttribute("data-theme", theme);

  // Texture
  document.body.setAttribute("data-texture", def.texture);

  // Font
  document.body.style.fontFamily =
    FONT_MAP[def.fontClass] ?? FONT_MAP["font-sans"];

  // Watermark
  let watermark = document.getElementById("era-watermark");
  if (def.albumImage && theme !== "default") {
    if (!watermark) {
      watermark = document.createElement("img");
      watermark.id = "era-watermark";
      watermark.setAttribute("aria-hidden", "true");
      watermark.style.cssText =
        "position:fixed;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.15;pointer-events:none;z-index:0;";
      document.body.appendChild(watermark);
    }
    (watermark as HTMLImageElement).src = def.albumImage;
    watermark.style.display = "block";
  } else if (watermark) {
    watermark.style.display = "none";
  }
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<EraTheme>("default");
  const [temporaryTheme, setTemporaryThemeState] = useState<EraTheme | null>(null);
  const ownThemeRef = useRef<EraTheme>("default");
  const supabase = createClient();

  // Load saved theme on mount + reset on sign-out
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("theme_era")
          .eq("id", user.id)
          .single();

        if (data?.theme_era) {
          const userTheme = data.theme_era as EraTheme;
          ownThemeRef.current = userTheme;
          setThemeState(userTheme);
        }
      }
    };
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        ownThemeRef.current = "default";
        setTemporaryThemeState(null);
        setThemeState("default");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Apply the owned theme or any temporary override
  useEffect(() => {
    applyTheme(temporaryTheme ?? theme);
  }, [theme, temporaryTheme]);

  const setTheme = useCallback(
    async (newTheme: EraTheme) => {
      ownThemeRef.current = newTheme;
      setThemeState(newTheme);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("users")
          .update({ theme_era: newTheme })
          .eq("id", user.id);
      }
    },
    [supabase]
  );

  const setTemporaryTheme = useCallback((themeId: EraTheme) => {
    setTemporaryThemeState(themeId);
  }, []);

  const clearTemporaryTheme = useCallback(() => {
    setTemporaryThemeState(null);
  }, []);

  const activeTheme = temporaryTheme ?? theme;
  const themeDef = getThemeById(activeTheme);

  return (
    <ThemeContext.Provider
      value={{ theme: activeTheme, themeDef, setTheme, setTemporaryTheme, clearTemporaryTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
