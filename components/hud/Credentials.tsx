"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Award, GraduationCap } from "lucide-react";
import { useHud } from "../hud-context";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

export function Credentials() {
  const { data } = useHud();

  return (
    <section id="credentials" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeader index="05" code="credentials" title="Clearances" meta="certifications · education" />

      <div className="grid gap-4 md:grid-cols-3">
        {data.credentials.map((c, i) => {
          const isCert = c.kind === "certification";
          const Icon = isCert ? Award : GraduationCap;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Panel className="h-full">
                <div className="flex h-full flex-col p-5 sm:p-6">
                  <div className="mb-6 flex items-start justify-between">
                    <span className={`chamfer-sm flex h-11 w-11 items-center justify-center border ${isCert ? "border-cyan-neon/50 bg-cyan-neon/10 text-cyan-neon" : "border-amber-hud/50 bg-amber-hud/10 text-amber-hud"}`}>
                      <Icon size={20} />
                    </span>
                    <span
                      className={`-rotate-6 border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${isCert ? "border-phosphor/70 text-phosphor" : "border-amber-hud/70 text-amber-hud"}`}
                    >
                      {isCert ? "certified" : "conferred"}
                    </span>
                  </div>
                  {(c.code || c.year) && (
                    <div className="font-mono text-2xl font-bold text-white">{c.code ?? c.year}</div>
                  )}
                  <h3 className="mt-2 font-display text-lg font-medium leading-snug text-white">{c.title}</h3>
                  <p className="label mt-auto pt-6">
                    {c.issuer}
                    {c.code && c.year ? ` · ${c.year}` : ""}
                  </p>
                  {c.verifyUrl && (
                    <a
                      href={c.verifyUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-neon hover:underline"
                    >
                      verify <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
