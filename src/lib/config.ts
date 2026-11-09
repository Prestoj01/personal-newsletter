export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Personal Press";

export const GITHUB_URL = "https://github.com/Prestoj01/personal-newsletter";

export const MAX_TOPICS = 12;

/** Absolute base URL used for links inside emails. */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
