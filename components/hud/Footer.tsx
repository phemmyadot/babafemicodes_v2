"use client";

import { useHud } from "../hud-context";

export function Footer() {
  const { data } = useHud();
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.25em] text-fog sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          © {year} {data.settings.name}
        </span>
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span>next.js · sanity · framer motion</span>
          <span className="text-cyan-neon/60">press ` for terminal</span>
        </span>
      </div>
    </footer>
  );
}
