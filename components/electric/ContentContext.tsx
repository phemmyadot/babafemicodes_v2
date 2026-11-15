"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ElectricContent } from "./content";

const Ctx = createContext<ElectricContent | null>(null);

export function ContentProvider({ value, children }: { value: ElectricContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Electric's Sanity content; provided once by ElectricPortfolio. */
export function useContent() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useContent must be used inside ElectricPortfolio");
  return value;
}
