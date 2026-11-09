import { MAX_TOPICS } from "./config";
import { isFrequency, type Frequency } from "./frequency";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

export function normalizeTopics(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const topic = item.replace(/\s+/g, " ").trim();
    if (topic.length < 2 || topic.length > 60) continue;
    const key = topic.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(topic);
  }
  return out.length > 0 && out.length <= MAX_TOPICS ? out : null;
}

export function normalizeFrequency(raw: unknown): Frequency | null {
  return isFrequency(raw) ? raw : null;
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
