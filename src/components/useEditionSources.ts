"use client";

import { useEffect, useState } from "react";
import { loadSources, type EditionSources } from "@/lib/sources";

/** Loads headlines for exactly these topics (and nothing else). */
export function useEditionSources(topics: string[] | null) {
  const [sources, setSources] = useState<EditionSources | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = topics?.join("\u0000") ?? null;

  useEffect(() => {
    if (key === null || key === "") return;
    let cancelled = false;
    loadSources(key.split("\u0000")).then(
      (s) => !cancelled && (setSources(s), setError(null)),
      (e: Error) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { sources, error };
}
