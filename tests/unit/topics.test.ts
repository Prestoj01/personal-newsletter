import { describe, expect, it } from "vitest";
import { ALL_TOPICS, presetFor, queryFor, topicSlug } from "@/lib/topics";

describe("topics", () => {
  it("resolves aliases and accents to the canonical topic", () => {
    expect(presetFor("chiefs")?.label).toBe("Kansas City Chiefs");
    expect(presetFor("LAKERS")?.label).toBe("Los Angeles Lakers");
    expect(presetFor("beyonce")?.label).toBe("Beyoncé");
    expect(presetFor("sourdough")).toBeUndefined();
  });

  it("searches with the topic's tuned query, or the text itself", () => {
    expect(queryFor("Golf")).toBe("PGA golf");
    expect(queryFor("sourdough")).toBe("sourdough");
  });

  it("gives every known topic a unique file slug", () => {
    const slugs = ALL_TOPICS.map((t) => topicSlug(t.label));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => /^[a-z0-9-]+$/.test(s))).toBe(true);
  });
});
