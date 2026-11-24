import { renderSocialCard } from "@/lib/brand-images";

// Rendered once at build time into out/brand/social-card.png (static export).
export const dynamic = "force-static";

export function GET() {
  return renderSocialCard();
}
