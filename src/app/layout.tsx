import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  Lora,
  Quicksand,
  Special_Elite,
  Playfair_Display,
  Oswald,
  DM_Sans,
} from "next/font/google";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${quicksand.variable} ${specialElite.variable} ${playfairDisplay.variable} ${oswald.variable} ${dmSans.variable} antialiased`}
      >
        <ThemeProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
