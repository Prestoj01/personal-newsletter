/**
 * Fetches the latest headlines for every known topic (chip presets + the searchable catalog)
 * from Google News RSS, plus broad section feeds, and writes them to public/data/.
 *
 * Runs in the GitHub Actions deploy workflow every few hours. Browsers can't fetch Google News
 * directly (no CORS), so this is what keeps a static site fresh.
 *
 *   npm run fetch-news
 *   PREVIOUS_DATA_URL=https://<site>/data npm run fetch-news   # reuse old data for any feed that fails
 */
import { XMLParser } from "fast-xml-parser";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALL_TOPICS, queryFor, topicSlug } from "../src/lib/topics";
import { SECTIONS_SLUG, WINDOWS, packUrl, type PackedArticle, type SearchFile, type TopicFile, type Window } from "../src/lib/news-data";

const PER_LIST = 15;
const CONCURRENCY = 5;
const OUT_DIR = path.join(process.cwd(), "public", "data");

const SECTION_FEEDS = [
  "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
  ...["WORLD", "NATION", "BUSINESS", "TECHNOLOGY", "ENTERTAINMENT", "SPORTS", "SCIENCE", "HEALTH"].map(
    (s) => `https://news.google.com/rss/headlines/section/topic/${s}?hl=en-US&gl=US&ceid=US:en`,
  ),
];

const parser = new XMLParser({ ignoreAttributes: false, htmlEntities: true });

function text(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v && typeof v === "object" && "#text" in v) return text((v as Record<string, unknown>)["#text"]);
  return "";
}

const searchUrl = (query: string, days: number) =>
  `https://news.google.com/rss/search?${new URLSearchParams({ q: `${query} when:${days}d`, hl: "en-US", gl: "US", ceid: "US:en" })}`;

async function fetchFeed(url: string, limit: number, attempt = 1): Promise<PackedArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PersonalPress/1.0; +https://github.com/Prestoj01/personal-newsletter)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = parser.parse(await res.text())?.rss?.channel?.item;
    const items: Record<string, unknown>[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const out: PackedArticle[] = [];
    for (const item of items) {
      const source = text(item.source).trim() || "News";
      let title = text(item.title).trim();
      if (title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3)).trim();
      const link = packUrl(text(item.link).trim());
      const ts = Math.floor(new Date(text(item.pubDate)).getTime() / 1000);
      if (title && link && Number.isFinite(ts)) out.push([title, link, source, ts]);
      if (out.length === limit) break;
    }
    return out;
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return fetchFeed(url, limit, attempt + 1);
    }
    throw err;
  }
}

async function loadPrevious(slug: string): Promise<TopicFile | null> {
  const base = process.env.PREVIOUS_DATA_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/topics/${slug}.json`, { signal: AbortSignal.timeout(10000) });
    return res.ok ? ((await res.json()) as TopicFile) : null;
  } catch {
    return null;
  }
}

async function pool<T>(items: T[], fn: (item: T) => Promise<void>) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < items.length) await fn(items[cursor++]);
    }),
  );
}

async function main() {
  const generatedAt = new Date().toISOString();
  const files = new Map<string, TopicFile>();
  const jobs = ALL_TOPICS.flatMap((t) => WINDOWS.map((w) => ({ label: t.label, slug: topicSlug(t.label), window: w as Window })));
  let failed = 0;
  let reused = 0;

  await pool(jobs, async (job) => {
    const file = files.get(job.slug) ?? { generatedAt, lists: {} };
    files.set(job.slug, file);
    try {
      file.lists[job.window] = await fetchFeed(searchUrl(queryFor(job.label), job.window), PER_LIST);
    } catch (err) {
      failed++;
      const old = (await loadPrevious(job.slug))?.lists[job.window];
      if (old) {
        reused++;
        file.lists[job.window] = old;
      } else {
        console.warn(`  ✗ ${job.label} (${job.window}d): ${(err as Error).message}`);
      }
    }
  });

  const sections: PackedArticle[] = [];
  await pool(SECTION_FEEDS, async (url) => {
    sections.push(...(await fetchFeed(url, 100).catch(() => [])));
  });

  console.log(`Fetched ${jobs.length - failed}/${jobs.length} topic feeds (${reused} reused from previous data).`);
  if (failed > jobs.length / 3) {
    console.error("Too many feeds failed — refusing to publish incomplete data.");
    process.exit(1);
  }

  // Section feeds are stored like a topic so free-text matches can point at them.
  const sectionList = [...new Map(sections.map((a) => [a[1], a])).values()];
  files.set(SECTIONS_SLUG, { generatedAt, lists: { 1: sectionList } });

  // Title-only search index (recent headlines), each entry pointing at the file that holds it.
  const slugs = [...files.keys()];
  const seen = new Set<string>();
  const entries: SearchFile["entries"] = [];
  slugs.forEach((slug, fileIdx) => {
    const f = files.get(slug)!;
    for (const a of [...(f.lists[1] ?? []), ...(f.lists[7] ?? [])]) {
      if (seen.has(a[1])) continue;
      seen.add(a[1]);
      entries.push([a[0], fileIdx, a[3]]);
    }
  });
  const search: SearchFile = { generatedAt, files: slugs, entries };

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(path.join(OUT_DIR, "topics"), { recursive: true });
  let bytes = 0;
  for (const [slug, file] of files) {
    const json = JSON.stringify(file);
    bytes += json.length;
    await writeFile(path.join(OUT_DIR, "topics", `${slug}.json`), json);
  }
  const searchJson = JSON.stringify(search);
  await writeFile(path.join(OUT_DIR, "search.json"), searchJson);
  console.log(
    `Wrote ${files.size} topic files (avg ${(bytes / files.size / 1024).toFixed(1)} KB) and search.json (${entries.length} headlines, ${(searchJson.length / 1024).toFixed(0)} KB).`,
  );
}

main();
