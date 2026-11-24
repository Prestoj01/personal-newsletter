"use client";

import { useIsClipped } from "./ClipButton";

/** Wrapper for one story in an edition: exposes its clipped state so CSS can draw the cut line. */
export function Story({
  url,
  as: Tag = "li",
  className = "",
  style,
  children,
}: {
  url: string;
  as?: "li" | "section";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const clipped = useIsClipped(url);
  return (
    <Tag data-story data-clipped={clipped || undefined} className={`story relative ${className}`} style={style}>
      {children}
    </Tag>
  );
}
