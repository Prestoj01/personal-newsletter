"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { parseShare } from "@/lib/share";
import { Reader } from "./Reader";
import { SharedPaperView } from "./SharedPaperView";

/** /read/ shows a shared paper when the URL carries one (?beats=…), otherwise your own. */
export function ReadPage() {
  const params = useSearchParams();
  const shared = useMemo(() => parseShare(new URLSearchParams(params.toString())), [params]);
  return shared ? <SharedPaperView key={params.toString()} paper={shared} /> : <Reader />;
}
