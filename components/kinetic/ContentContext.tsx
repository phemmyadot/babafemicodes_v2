"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { KineticContent } from "./content";

const Ctx = createContext<KineticContent | null>(null);

export function ContentProvider({ value, children }: { value: KineticContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Kinetic's Sanity content; provided once by KineticPortfolio. */
export function useContent() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useContent must be used inside KineticPortfolio");
  return value;
}
