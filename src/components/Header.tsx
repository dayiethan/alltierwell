"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "./AuthButton";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          All Tier Well
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/rank"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            My Tier List
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Compare
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <Link
              href="/rank"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              My Tier List
            </Link>
            <Link
              href="/compare"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Compare
            </Link>
            <AuthButton />
          </nav>
        </div>
      )}
    </header>
  );
}
