"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Today's date, rendered on the client (the static HTML was built hours earlier). */
export function Dateline() {
  const today = useSyncExternalStore(
    subscribe,
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    () => "",
  );
  return <span suppressHydrationWarning>{today}</span>;
}
