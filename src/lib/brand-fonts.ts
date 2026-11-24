import { readFile } from "node:fs/promises";
import path from "node:path";

/** Display fonts for build-time images (favicon, social card). Satori needs real TTF files. */
export async function brandFonts() {
  const dir = path.join(process.cwd(), "src", "assets", "fonts");
  const [nameplate, display] = await Promise.all([
    readFile(path.join(dir, "UnifrakturCook-Bold.ttf")),
    readFile(path.join(dir, "Anton-Regular.ttf")),
  ]);
  return [
    { name: "Nameplate", data: nameplate, weight: 700 as const, style: "normal" as const },
    { name: "Display", data: display, weight: 400 as const, style: "normal" as const },
  ];
}

export const BRAND = { paper: "#efe9dc", sheet: "#f8f4ea", ink: "#121212", red: "#c8102e", muted: "#5c564e" };
