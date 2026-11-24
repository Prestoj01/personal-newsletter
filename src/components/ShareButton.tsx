"use client";

import { useEffect, useState } from "react";
import { sharePaper, type SharedPaper, type ShareResult } from "@/lib/share";
import { Button } from "./ui";

const LABELS: Partial<Record<ShareResult, string>> = {
  copied: "✓ Link copied",
  shared: "✓ Shared",
  failed: "Couldn't copy the link",
};

/** Shares a paper as a link; confirms with a little stamp of feedback. */
export function ShareButton({
  paper,
  className = "",
  variant = "secondary",
}: {
  paper: SharedPaper;
  className?: string;
  variant?: "secondary" | "ghost";
}) {
  const [result, setResult] = useState<ShareResult | null>(null);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), 2200);
    return () => clearTimeout(t);
  }, [result]);

  const label = result && LABELS[result];
  return (
    <Button variant={variant} size="sm" onClick={async () => setResult(await sharePaper(paper))} className={className} aria-live="polite">
      {label ? <span className="motion-safe:animate-pop-in">{label}</span> : "Share this paper ↗"}
    </Button>
  );
}
