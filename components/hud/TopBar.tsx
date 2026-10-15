"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, SquareTerminal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { SITE_NAME, SITE_TLD } from "@/lib/site";
import { hasSection, SECTIONS, useHud, type SectionId } from "../hud-context";
import { StatusDot } from "../ui/StatusDot";

function useUtcClock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useActiveSection() {
  const [active, setActive] = useState<SectionId>("operator");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id as SectionId);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

export function TopBar() {
  const { data, openTerminal, goTo } = useHud();
  const clock = useUtcClock();
  const active = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = SECTIONS.filter((s) => s.id !== "operator" && hasSection(data, s.id));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled || menuOpen ? "border-line bg-obsidian/85 backdrop-blur-md" : "border-transparent",
      )}
    >
      {/* Status strip */}
      <div className="hidden border-b border-line/60 md:block">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
          <span className="flex items-center gap-2">
            <StatusDot />
            <span className="text-phosphor">System status:</span> all systems operational
          </span>
          <span className="flex items-center gap-6">
            <span>SRC: SANITY/LIVE</span>
            <span>
              UTC <span className="text-cyan-neon tabular-nums">{clock}</span>
            </span>
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-3"
          aria-label="Back to top"
        >
          <span className="chamfer-sm flex h-8 w-8 items-center justify-center border border-cyan-neon/60 bg-cyan-neon/10 font-mono text-xs font-bold text-cyan-neon transition-shadow group-hover:shadow-glow-cyan">
            BA
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-white sm:block">
            {SITE_NAME}<span className="text-cyan-neon">{SITE_TLD}</span>
          </span>
        </button>

        <nav aria-label="Modules" className="hidden items-center lg:flex">
          {nav.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className={cn(
                "relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                active === s.id ? "text-cyan-neon" : "text-fog hover:text-white",
              )}
            >
              <span className="mr-1.5 text-cyan-neon/50">{s.index}</span>
              {s.label}
              {active === s.id && (
                <motion.span layoutId="nav-active" className="absolute inset-x-2 -bottom-[9px] h-px bg-cyan-neon shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openTerminal}
            className="chamfer-sm flex items-center gap-2 border border-phosphor/50 bg-phosphor/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-phosphor transition-all hover:bg-phosphor hover:text-obsidian"
          >
            <SquareTerminal size={14} />
            <span>CLI</span>
            <kbd className="hidden border border-current/40 px-1 text-[9px] opacity-70 sm:inline">`</kbd>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center border border-line text-fog-light lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Modules"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <div className="grid grid-cols-2 gap-px bg-line p-px">
              {nav.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    goTo(s.id);
                  }}
                  className={cn(
                    "bg-obsidian-900 px-4 py-4 text-left font-mono text-xs uppercase tracking-[0.18em]",
                    active === s.id ? "text-cyan-neon" : "text-fog-light",
                  )}
                >
                  <span className="mr-2 text-cyan-neon/50">{s.index}</span>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
              <span className="flex items-center gap-2">
                <StatusDot /> operational
              </span>
              <span className="tabular-nums text-cyan-neon">UTC {clock}</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
