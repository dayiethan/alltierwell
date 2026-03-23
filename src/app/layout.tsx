import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import {
  Lora,
  Quicksand,
  Special_Elite,
  Playfair_Display,
  Oswald,
  DM_Sans,
  Space_Grotesk,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  weight: "400",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "All Tier Well",
  description:
    "Create your Taylor Swift song tier list and compare your music taste with others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} ${lora.variable} ${quicksand.variable} ${specialElite.variable} ${playfairDisplay.variable} ${oswald.variable} ${dmSans.variable} antialiased`}
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        <ThemeProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4">{children}</main>
          <footer className="mt-16 border-t py-6" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs text-muted-foreground">
              <span>All Tier Well</span>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a
                href="https://github.com/dayiethan/alltierwell"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
