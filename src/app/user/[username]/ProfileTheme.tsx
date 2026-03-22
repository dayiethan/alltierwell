"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import type { EraTheme } from "@/lib/themes";

interface ProfileThemeProps {
  themeEra: string | null;
}

export default function ProfileTheme({ themeEra }: ProfileThemeProps) {
  const { setTemporaryTheme, clearTemporaryTheme } = useTheme();
  const pathname = usePathname();
  const appliedRef = useRef(false);

  // Apply the profile owner's theme
  useEffect(() => {
    setTemporaryTheme((themeEra ?? "default") as EraTheme);
    appliedRef.current = true;

    return () => {
      clearTemporaryTheme();
      appliedRef.current = false;
    };
  }, [themeEra, setTemporaryTheme, clearTemporaryTheme]);

  // Also clear when pathname changes (App Router client navigation
  // may not unmount the component immediately)
  useEffect(() => {
    if (appliedRef.current && !pathname.startsWith("/user/")) {
      clearTemporaryTheme();
      appliedRef.current = false;
    }
  }, [pathname, clearTemporaryTheme]);

  return null;
}
