import fs from "fs";
import path from "path";
import LandingPage from "@/components/LandingPage";

function getFloatingImages(): string[] {
  const dir = path.join(process.cwd(), "public", "floating");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f))
      .map((f) => `/floating/${f}`);
  } catch {
    return [];
  }
}

export default function Home() {
  const floatingImages = getFloatingImages();
  return <LandingPage floatingImages={floatingImages} />;
}
