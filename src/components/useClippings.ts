"use client";

import { useSyncExternalStore } from "react";
import { getClippings, getServerClippings, subscribeClippings } from "@/lib/clippings";

export function useClippings() {
  return useSyncExternalStore(subscribeClippings, getClippings, getServerClippings);
}
