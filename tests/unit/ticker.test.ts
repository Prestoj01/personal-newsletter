import { describe, expect, it } from "vitest";
import type { PackedArticle } from "@/lib/news-data";
import type { EditionSources } from "@/lib/sources";
import { beatsTicker, interleaveSections } from "@/lib/ticker";

const NOW = Date.parse("2026-11-25T12:00:00Z");
const a = (id: string, hoursAgo = 1): PackedArticle => [`Story ${id}`, `https://example.com/${id}`, "Src", Math.floor((NOW - hoursAgo * 3_600_000) / 1000)];

describe("interleaveSections", () => {
  it("round-robins sections, skips duplicates and respects the limit", () => {
    const out = interleaveSections(
      [
        { label: "Tech", items: [a("t1"), a("t2"), a("t3")] },
        { label: "Sports", items: [a("s1"), a("t1")] },
      ],
      4,
    );
    expect(out.headlines.map((h) => h[0])).toEqual(["Story t1", "Story s1", "Story t2", "Story t3"]);
    expect(out.labels).toEqual(["Tech", "Sports", "Tech", "Tech"]);
  });
});

describe("beatsTicker", () => {
  it("takes the freshest stories per beat from the last two days", () => {
    const generatedAt = new Date(NOW).toISOString();
    const sources: EditionSources = {
      generatedAt,
      topics: new Map([
        ["NFL", { generatedAt, lists: { 1: [a("n-old", 3), a("n-new", 1)], 30: [a("n-stale", 24 * 5)] } }],
        ["Coffee", { generatedAt, lists: { 7: [a("c1", 10)] } }],
      ]),
    };
    const out = beatsTicker(sources, ["NFL", "Coffee"]);
    expect(out.map((i) => `${i.label}: ${i.article.title}`)).toEqual(["NFL: Story n-new", "Coffee: Story c1", "NFL: Story n-old"]);
  });
});
