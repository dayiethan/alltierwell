"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "./AuthButton";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { themeDef } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: "var(--header-bg)",
      }}
    >
      {/* Gradient accent bar */}
      {themeDef.headerGradient && (
        <div
          className="h-0.5"
          style={{ background: themeDef.headerGradient }}
        />
      )}

      <div
        className="border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            All Tier Well
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/rank"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Tier List
            </Link>
            <Link
              href="/compare"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/stats"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Stats
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
            <AuthButton />
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="border-t px-4 pb-4 md:hidden"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <nav className="flex flex-col gap-3 pt-3">
            <Link
              href="/rank"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              My Tier List
            </Link>
            <Link
              href="/compare"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Compare
            </Link>
            <Link
              href="/stats"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Stats
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>
            <AuthButton />
          </nav>
        </div>
      )}
    </header>
  );
}
