import { APP_NAME, BASE_PATH, MAX_TOPICS } from "./config";
import { frequencyInfo, isFrequency, type Frequency } from "./frequency";
import { ALL_TOPICS, topicSlug } from "./topics";

/**
 * Shareable papers live entirely in the URL, e.g. /read/?beats=nfl,coffee,kansas-city-chiefs&run=weekly
 * Known topics use their readable slug; anything else is its own text, slugified.
 */
export interface SharedPaper {
  topics: string[];
  frequency: Frequency;
}

const BY_SLUG = new Map(ALL_TOPICS.map((t) => [topicSlug(t.label), t.label]));

export function encodeShare({ topics, frequency }: SharedPaper): string {
  const beats = topics.map((t) => topicSlug(t)).filter(Boolean);
  return `beats=${beats.map(encodeURIComponent).join(",")}&run=${frequency}`;
}

export function parseShare(params: URLSearchParams): SharedPaper | null {
  const raw = params.get("beats");
  if (!raw) return null;
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const part of raw.split(",")) {
    const slug = part.trim().toLowerCase();
    if (slug.length < 2 || slug.length > 60) continue;
    const topic = BY_SLUG.get(slug) ?? slug.replace(/-+/g, " ");
    if (seen.has(topic.toLowerCase())) continue;
    seen.add(topic.toLowerCase());
    topics.push(topic);
    if (topics.length === MAX_TOPICS) break;
  }
  if (topics.length === 0) return null;
  const run = params.get("run");
  return { topics, frequency: isFrequency(run) ? run : "weekly" };
}

/** Path (with base path) that opens this paper. */
export function sharePath(paper: SharedPaper): string {
  return `${BASE_PATH}/read/?${encodeShare(paper)}`;
}

export type ShareResult = "shared" | "copied" | "failed" | "cancelled";

/** Native share sheet where available (phones), otherwise copy the link. */
export async function sharePaper(paper: SharedPaper): Promise<ShareResult> {
  const url = `${window.location.origin}${sharePath(paper)}`;
  const text = `My ${frequencyInfo(paper.frequency).label.toLowerCase()} paper on ${paper.topics.slice(0, 3).join(", ")}${paper.topics.length > 3 ? " and more" : ""}`;
  if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title: APP_NAME, text, url });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
