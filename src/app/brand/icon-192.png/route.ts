import { renderIcon } from "@/lib/brand-images";

// Rendered once at build time into out/brand/icon-192.png (static export).
export const dynamic = "force-static";

export function GET() {
  return renderIcon(192);
}
