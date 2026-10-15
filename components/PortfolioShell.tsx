"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Portfolio } from "@/lib/types";
import { HudContext, scrollToSection, type HudActions, type SectionId } from "./hud-context";
import { BackgroundFX } from "./hud/BackgroundFX";
import { BootSequence } from "./hud/BootSequence";
import { TopBar } from "./hud/TopBar";
import { Hero } from "./hud/Hero";
import { TelemetryBar } from "./hud/TelemetryBar";
import { Projects } from "./hud/Projects";
import { ProjectInspector } from "./hud/ProjectInspector";
import { Arsenal } from "./hud/Arsenal";
import { ServiceLog } from "./hud/ServiceLog";
import { Credentials } from "./hud/Credentials";
import { Uplink } from "./hud/Uplink";
import { ContactModal } from "./hud/ContactModal";
import { Footer } from "./hud/Footer";
import { Terminal } from "./terminal/Terminal";

export function PortfolioShell({ data }: { data: Portfolio }) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);

  const closeTerminal = useCallback(() => setTerminalOpen(false), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const closeInspector = useCallback(() => setInspecting(null), []);

  const actions = useMemo<HudActions>(
    () => ({
      data,
      terminalOpen,
      openTerminal: () => setTerminalOpen(true),
      closeTerminal,
      openContact: () => {
        setTerminalOpen(false);
        setContactOpen(true);
      },
      inspectProject: (slug) => {
        setTerminalOpen(false);
        setInspecting(slug);
      },
      goTo: (id: SectionId) => {
        setTerminalOpen(false);
        // Let the terminal exit animation release scroll lock before scrolling.
        setTimeout(() => scrollToSection(id), 60);
      },
    }),
    [data, terminalOpen, closeTerminal],
  );

  // Global shortcut: ` or Ctrl/⌘+K toggles the terminal (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, [contenteditable=true]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "`" && !typing)) {
        e.preventDefault();
        setTerminalOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const project = data.projects.find((p) => p.slug === inspecting) ?? null;

  return (
    <HudContext.Provider value={actions}>
      <BootSequence name={data.settings.name} source={data.source} />
      <BackgroundFX />
      <TopBar />
      <main className="relative z-10">
        <Hero />
        <TelemetryBar />
        <Projects />
        <Arsenal />
        <ServiceLog />
        <Credentials />
        <Uplink />
      </main>
      <Footer />
      <Terminal open={terminalOpen} onClose={closeTerminal} />
      <ContactModal open={contactOpen} onClose={closeContact} />
      <ProjectInspector project={project} onClose={closeInspector} />
    </HudContext.Provider>
  );
}
