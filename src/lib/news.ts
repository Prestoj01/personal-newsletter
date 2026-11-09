import { XMLParser } from "fast-xml-parser";
import { emojiFor, queryFor } from "./topics";
import { lookbackDays, type Frequency } from "./frequency";

export interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
}

export interface TopicSection {
  topic: string;
  emoji: string;
  articles: Article[];
}

const ARTICLES_PER_TOPIC = 5;
const CACHE_TTL_MS = 20 * 60 * 1000;
const cache = new Map<string, { at: number; articles: Article[] }>();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  htmlEntities: true,
});

function googleNewsUrl(query: string, days: number): string {
  const q = `${query} when:${days}d`;
  const params = new URLSearchParams({ q, hl: "en-US", gl: "US", ceid: "US:en" });
  return `https://news.google.com/rss/search?${params}`;
}

interface RawItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) return text((value as { "#text": unknown })["#text"]);
  return "";
}

function parseFeed(xml: string, days: number): Article[] {
  const doc = parser.parse(xml);
  const raw = doc?.rss?.channel?.item;
  const items: RawItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const cutoff = Date.now() - (days + 1) * 24 * 60 * 60 * 1000;

  const articles: Article[] = [];
  for (const item of items) {
    const source = text(item.source).trim();
    let title = text(item.title).trim();
    // Google News appends " - Source Name" to every headline.
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3)).trim();
    const url = text(item.link).trim();
    const published = new Date(text(item.pubDate));
    if (!title || !url || Number.isNaN(published.getTime())) continue;
    if (published.getTime() < cutoff) continue;
    articles.push({ title, url, source: source || "News", publishedAt: published.toISOString() });
  }
  return articles;
}

export async function fetchTopicArticles(topic: string, days: number): Promise<Article[]> {
  const key = `${topic.toLowerCase()}|${days}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.articles;

  try {
    const res = await fetch(googleNewsUrl(queryFor(topic), days), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PersonalPress/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const articles = parseFeed(await res.text(), days);
    cache.set(key, { at: Date.now(), articles });
    return articles;
  } catch (err) {
    console.error(`[news] failed to fetch "${topic}":`, err);
    return hit?.articles ?? [];
  }
}

const normalizeTitle = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Build every section of a newsletter, de-duplicating stories that match several topics. */
export async function buildSections(topics: string[], frequency: Frequency): Promise<TopicSection[]> {
  const days = lookbackDays(frequency);
  const results = await Promise.all(topics.map((t) => fetchTopicArticles(t, days)));

  const seen = new Set<string>();
  return topics.map((topic, i) => {
    const articles: Article[] = [];
    for (const a of results[i]) {
      const key = normalizeTitle(a.title);
      if (seen.has(key)) continue;
      seen.add(key);
      articles.push(a);
      if (articles.length === ARTICLES_PER_TOPIC) break;
    }
    return { topic, emoji: emojiFor(topic), articles };
  });
}
