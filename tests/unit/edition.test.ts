import { describe, expect, it } from "vitest";
import { buildSections } from "@/lib/edition";
import type { PackedArticle, TopicFile } from "@/lib/news-data";
import type { EditionSources } from "@/lib/sources";

const NOW = Date.parse("2026-11-24T12:00:00Z");
const hoursAgo = (h: number) => Math.floor((NOW - h * 3_600_000) / 1000);
const story = (title: string, h = 2, url = `https://example.com/${encodeURIComponent(title)}`): PackedArticle => [title, url, "Example", hoursAgo(h)];

function sources(files: Record<string, TopicFile["lists"]>): EditionSources {
  const generatedAt = new Date(NOW).toISOString();
  return { generatedAt, topics: new Map(Object.entries(files).map(([t, lists]) => [t, { generatedAt, lists }])) };
}

describe("buildSections", () => {
  it("keeps sections in the reader's order with at most five stories each", () => {
    const many = Array.from({ length: 9 }, (_, i) => story(`NFL story ${i}`));
    const out = buildSections(sources({ NFL: { 1: many }, Coffee: { 1: [story("Espresso news")] } }), ["NFL", "Coffee"], "daily");
    expect(out.map((s) => s.topic)).toEqual(["NFL", "Coffee"]);
    expect(out[0].articles).toHaveLength(5);
    expect(out[0].emoji).toBe("🏈");
  });

  it("drops stories older than the frequency's look-back window", () => {
    const out = buildSections(sources({ NFL: { 1: [story("Fresh", 3), story("Stale", 24 * 4)] } }), ["NFL"], "daily");
    expect(out[0].articles.map((a) => a.title)).toEqual(["Fresh"]);
    const weekly = buildSections(sources({ NFL: { 7: [story("Fresh", 3), story("Stale", 24 * 4)] } }), ["NFL"], "weekly");
    expect(weekly[0].articles).toHaveLength(2);
  });

  it("prefers the feed window closest to the frequency", () => {
    const out = buildSections(sources({ NFL: { 1: [story("Day story")], 30: [story("Month story")] } }), ["NFL"], "monthly");
    expect(out[0].articles[0].title).toBe("Month story");
  });

  it("prints a story only once even when several topics match it", () => {
    const shared = story("Chiefs win in overtime");
    const out = buildSections(
      sources({ NFL: { 1: [shared, story("Other NFL")] }, "Kansas City Chiefs": { 1: [shared] } }),
      ["NFL", "Kansas City Chiefs"],
      "daily",
    );
    const titles = out.flatMap((s) => s.articles.map((a) => a.title));
    expect(titles.filter((t) => t === "Chiefs win in overtime")).toHaveLength(1);
  });

  it("lets free-text topics claim scarce matches before broad presets", () => {
    const only = story("Sourdough starter tips");
    const out = buildSections(sources({ Cooking: { 1: [only] }, sourdough: { 7: [only] } }), ["Cooking", "sourdough"], "daily");
    expect(out.find((s) => s.topic === "sourdough")!.articles).toHaveLength(1);
    expect(out.find((s) => s.topic === "Cooking")!.articles).toHaveLength(0);
  });

  it("expands packed Google News ids back into full links", () => {
    const out = buildSections(sources({ NFL: { 1: [["Headline", "~CBMiabc", "Src", hoursAgo(1)]] } }), ["NFL"], "daily");
    expect(out[0].articles[0].url).toBe("https://news.google.com/rss/articles/CBMiabc?oc=5");
  });
});
