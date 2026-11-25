"use client";

import Link from "next/link";
import { useClippings } from "./useClippings";

/** "Clippings" nav link with a live count; flying scraps from clipped stories land here. */
export function ClippingsLink({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  const count = useClippings().length;
  return (
    <Link href="/clippings/" transitionTypes={["nav-forward"]} tabIndex={tabIndex} className={`inline-flex items-center gap-1.5 hover:text-accent ${className}`}>
      <span aria-hidden>✂</span>
      <span className="sr-only sm:not-sr-only">Clippings</span>
      <span
        data-clippings-target
        className={`inline-flex min-w-5 items-center justify-center px-1 text-[10px] tabular-nums ${count ? "bg-accent text-on-accent" : "bg-line text-muted"}`}
      >
        {count}
      </span>
    </Link>
  );
}
