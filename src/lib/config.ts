export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Extra Extra";

export const GITHUB_URL = "https://github.com/Prestoj01/personal-newsletter";

export const MAX_TOPICS = 12;

/** Prefix for files in /public when the site is served from a sub-path (GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Public URL of the deployed site (set by the deploy workflow); used for absolute share/social links. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
