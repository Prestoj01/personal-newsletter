"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Frequency } from "@/lib/frequency";

/** Fetches a rendered newsletter preview, debounced as the selection changes. */
export function usePreview(topics: string[], frequency: Frequency) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (topics.length === 0) {
      setHtml(null);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, frequency }),
      });
      const data = await res.json();
      if (id !== requestId.current) return;
      if (!res.ok) throw new Error(data.error ?? "Preview failed");
      setHtml(data.html);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : "Preview failed");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [topics, frequency]);

  useEffect(() => {
    const t = setTimeout(refresh, 700);
    return () => clearTimeout(t);
  }, [refresh]);

  return { html, loading, error, refresh };
}
