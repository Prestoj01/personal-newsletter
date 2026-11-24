"use client";

import { isClipped, toggleClipping } from "@/lib/clippings";
import { flyClipping } from "@/lib/fly";
import type { Article } from "@/lib/news-data";
import { useClippings } from "./useClippings";

/**
 * Scissors on a story. Clipping marks the story with a dashed cut line (via the parent's
 * data-clipped attribute) and sends a scrap flying to the Clippings counter.
 */
export function ClipButton({ article, topic }: { article: Article; topic: string }) {
  const clipped = isClipped(useClippings(), article.url);
  return (
    <button
      type="button"
      onClick={(e) => {
        const story = e.currentTarget.closest<HTMLElement>("[data-story]");
        const nowClipped = toggleClipping(article, topic);
        if (nowClipped && story) flyClipping(story);
      }}
      aria-pressed={clipped}
      aria-label={clipped ? `Unclip "${article.title}"` : `Clip "${article.title}" to your scrapbook`}
      title={clipped ? "Remove from clippings" : "Clip this story"}
      className={`clip-button kicker inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold transition ${
        clipped ? "text-accent" : "text-muted hover:text-ink focus-visible:text-ink"
      }`}
    >
      <span aria-hidden className="text-sm leading-none">
        ✂
      </span>
      <span>{clipped ? "Clipped" : "Clip"}</span>
    </button>
  );
}

/** Marks a story element with its clipped state so CSS can draw the cut line. */
export function useIsClipped(url: string) {
  return isClipped(useClippings(), url);
}
