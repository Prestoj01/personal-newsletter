// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClippings, isClipped, removeClipping, subscribeClippings, toggleClipping } from "@/lib/clippings";

const article = (n: number) => ({ title: `Story ${n}`, url: `https://example.com/${n}`, source: "Example", publishedAt: "2026-11-24T10:00:00Z" });

describe("clippings store", () => {
  beforeEach(() => localStorage.clear());

  it("clips and unclips a story", () => {
    expect(toggleClipping(article(1), "NFL")).toBe(true);
    expect(isClipped(getClippings(), article(1).url)).toBe(true);
    expect(getClippings()[0]).toMatchObject({ topic: "NFL", title: "Story 1" });
    expect(toggleClipping(article(1), "NFL")).toBe(false);
    expect(getClippings()).toHaveLength(0);
  });

  it("keeps the newest clipping first", () => {
    toggleClipping(article(1), "NFL");
    toggleClipping(article(2), "Coffee");
    expect(getClippings().map((c) => c.title)).toEqual(["Story 2", "Story 1"]);
    removeClipping(article(2).url);
    expect(getClippings().map((c) => c.title)).toEqual(["Story 1"]);
  });

  it("returns a stable snapshot until something changes", () => {
    toggleClipping(article(1), "NFL");
    expect(getClippings()).toBe(getClippings());
  });

  it("notifies subscribers on change", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeClippings(onChange);
    toggleClipping(article(3), "NBA");
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
    toggleClipping(article(4), "NBA");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("treats a corrupt stored value as empty", () => {
    localStorage.setItem("extra-extra:clippings", "{not json");
    expect(getClippings()).toEqual([]);
  });
});
