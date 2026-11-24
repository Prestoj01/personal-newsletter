import { describe, expect, it } from "vitest";
import { encodeShare, parseShare } from "@/lib/share";

const parse = (query: string) => parseShare(new URLSearchParams(query));

describe("share links", () => {
  it("round-trips known topics through readable slugs", () => {
    const paper = { topics: ["NFL", "Kansas City Chiefs", "Woodworking & DIY"], frequency: "weekly" as const };
    const query = encodeShare(paper);
    expect(query).toBe("beats=nfl,kansas-city-chiefs,woodworking-diy&run=weekly");
    expect(parse(query)).toEqual(paper);
  });

  it("keeps free-text topics as words", () => {
    expect(parse("beats=sourdough-bread,nfl&run=daily")).toEqual({ topics: ["sourdough bread", "NFL"], frequency: "daily" });
  });

  it("falls back to weekly for a missing or unknown run", () => {
    expect(parse("beats=nba")?.frequency).toBe("weekly");
    expect(parse("beats=nba&run=hourly")?.frequency).toBe("weekly");
  });

  it("ignores junk, duplicates and anything past the 12-topic limit", () => {
    const many = Array.from({ length: 20 }, (_, i) => `topic-${i}`).join(",");
    expect(parse(`beats=${many}`)?.topics).toHaveLength(12);
    expect(parse("beats=nba,NBA,,x")?.topics).toEqual(["NBA"]);
  });

  it("returns null when there is no paper in the URL", () => {
    expect(parse("")).toBeNull();
    expect(parse("beats=,,")).toBeNull();
  });
});
