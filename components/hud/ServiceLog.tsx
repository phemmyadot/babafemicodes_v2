"use client";

import { motion } from "framer-motion";
import type { Experience } from "@/lib/types";
import { useHud } from "../hud-context";
import { SectionHeader } from "../ui/SectionHeader";

export function formatPeriod(e: Pick<Experience, "startDate" | "endDate" | "current">) {
  if (!e.startDate) return null;
  const fmt = (d: string) => d.slice(0, 7).replace("-", ".");
  return `${fmt(e.startDate)} — ${e.current || !e.endDate ? "PRESENT" : fmt(e.endDate)}`;
}

export function ServiceLog() {
  const { data } = useHud();

  return (
    <section id="log" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeader index="04" code="service log" title="Deployment History" meta={`${data.experience.length} entries`} />

      <ol className="relative ml-2 border-l border-line sm:ml-4">
        {data.experience.map((e, i) => {
          const period = formatPeriod(e);
          const active = e.current || i === 0;
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative pb-10 pl-6 last:pb-0 sm:pl-10"
            >
              <span
                aria-hidden
                className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rotate-45 border ${active ? "border-phosphor bg-phosphor shadow-[0_0_10px_#00ff66]" : "border-cyan-neon bg-obsidian"}`}
              />
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="label mb-1 flex items-center gap-2 text-cyan-neon">
                    LOG-{String(data.experience.length - i).padStart(3, "0")}
                    {e.current && <span className="border border-phosphor/60 px-1.5 text-phosphor">active</span>}
                  </div>
                  <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">{e.company}</h3>
                  <p className="mt-1 font-mono text-sm text-fog-light">{e.role}</p>
                  {(period || e.location) && (
                    <p className="label mt-2">
                      {period}
                      {period && e.location && " · "}
                      {e.location}
                    </p>
                  )}
                </div>
                <div className="lg:col-span-8">
                  <div className="panel p-5">
                    <ul className="space-y-2.5 text-sm leading-relaxed text-fog-light sm:text-[15px]">
                      {e.highlights.map((h) => (
                        <li key={h} className="flex gap-3">
                          <span className="mt-[1px] shrink-0 text-cyan-neon">›</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    {e.techStack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-wider text-fog">
                        {e.techStack.map((t) => (
                          <span key={t}>#{t.replace(/\s+/g, "")}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
