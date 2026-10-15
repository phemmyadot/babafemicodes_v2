"use client";

import { createContext, useContext } from "react";
import type { Portfolio } from "@/lib/types";

export const SECTIONS = [
  { id: "operator", index: "00", label: "Operator" },
  { id: "telemetry", index: "01", label: "Telemetry" },
  { id: "systems", index: "02", label: "Systems" },
  { id: "arsenal", index: "03", label: "Arsenal" },
  { id: "log", index: "04", label: "Service Log" },
  { id: "credentials", index: "05", label: "Credentials" },
  { id: "uplink", index: "06", label: "Uplink" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export interface HudActions {
  data: Portfolio;
  terminalOpen: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;
  openContact: () => void;
  inspectProject: (slug: string) => void;
  goTo: (id: SectionId) => void;
}

export const HudContext = createContext<HudActions | null>(null);

export function useHud() {
  const ctx = useContext(HudContext);
  if (!ctx) throw new Error("useHud must be used inside <PortfolioShell>");
  return ctx;
}

export function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
