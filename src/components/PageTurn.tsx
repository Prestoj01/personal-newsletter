import { ViewTransition } from "react";

/**
 * Wraps a page so route changes turn it like a newspaper page: forward navigations swing the
 * old page away from its left edge, back navigations swing the new one in. Links and pushes
 * tag themselves with "nav-forward" / "nav-back"; anything untagged doesn't animate.
 */
export function PageTurn({ children }: { children: React.ReactNode }) {
  const types = { "nav-forward": "turn-forward", "nav-back": "turn-back", default: "none" };
  return (
    <ViewTransition enter={types} exit={types} default="none">
      {/* Opaque newsprint backing so the turning sheet isn't see-through. */}
      <div className="min-h-[60vh] bg-paper">{children}</div>
    </ViewTransition>
  );
}
