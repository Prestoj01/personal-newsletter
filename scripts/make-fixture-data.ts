/**
 * Writes deterministic sample headlines to public/data (same shape as fetch-news) so the
 * browser tests run offline and never depend on what Google News says today.
 *
 *   npm run fixtures
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { SECTIONS_SLUG, type PackedArticle, type SearchFile, type TickerFile, type TopicFile } from "../src/lib/news-data";
import { ALL_TOPICS, topicSlug } from "../src/lib/topics";

const OUT = path.join(process.cwd(), "public", "data");
const now = Date.now();
const ago = (h: number) => Math.floor((now - h * 3_600_000) / 1000);

function stories(label: string, slug: string, count: number, startHours: number): PackedArticle[] {
  return Array.from({ length: count }, (_, i) => [
    `${label} report ${i + 1}: what happened this week`,
    `https://example.com/${slug}/${startHours}-${i + 1}`,
    `${label} Daily`,
    ago(startHours + i * 3),
  ]);
}

async function main() {
  const generatedAt = new Date(now).toISOString();
  const files = new Map<string, TopicFile>();
  for (const t of ALL_TOPICS) {
    const slug = topicSlug(t.label);
    const lists: TopicFile["lists"] = { 1: stories(t.label, slug, 6, 1), 7: stories(t.label, slug, 6, 30), 30: stories(t.label, slug, 6, 200) };
    // A named player for free-text matching ("Travis Kelce" lives in the Chiefs feed).
    if (slug === "kansas-city-chiefs") lists[1]!.unshift(["Travis Kelce catches two touchdowns in Chiefs win", "https://example.com/kelce", "Fixture Sports", ago(2)]);
    files.set(slug, { generatedAt, lists });
  }
  const top = stories("Front page", "front", 12, 1);
  files.set(SECTIONS_SLUG, { generatedAt, lists: { 1: top } });

  const slugs = [...files.keys()];
  const entries: SearchFile["entries"] = [];
  slugs.forEach((slug, i) => {
    const f = files.get(slug)!;
    for (const a of [...(f.lists[1] ?? []), ...(f.lists[7] ?? [])]) entries.push([a[0], i, a[3]]);
  });

  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "topics"), { recursive: true });
  for (const [slug, file] of files) await writeFile(path.join(OUT, "topics", `${slug}.json`), JSON.stringify(file));
  await writeFile(path.join(OUT, "search.json"), JSON.stringify({ generatedAt, files: slugs, entries } satisfies SearchFile));
  await writeFile(path.join(OUT, "ticker.json"), JSON.stringify({ generatedAt, headlines: top } satisfies TickerFile));
  console.log(`Wrote fixture data for ${files.size} topics to ${path.relative(process.cwd(), OUT)}`);
}

main();
