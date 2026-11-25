import { APP_NAME, BASE_PATH } from "@/lib/config";

// Web app manifest, written at build time with the GitHub Pages base path baked in.
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: APP_NAME,
    short_name: APP_NAME,
    description: "A free personal newspaper about your teams, hobbies and interests.",
    id: `${BASE_PATH}/`,
    start_url: `${BASE_PATH}/read/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#efe9dc",
    theme_color: "#121212",
    icons: [
      { src: `${BASE_PATH}/brand/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/brand/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE_PATH}/brand/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { "Content-Type": "application/manifest+json" } });
}
