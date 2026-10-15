"use client";

import { motion } from "framer-motion";
import { Boxes, Cloud, Code2, FlaskConical, Gauge, Globe, Layers, Server, Smartphone, type LucideIcon } from "lucide-react";
import { useHud } from "../hud-context";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

const ACCENTS = ["#00f0ff", "#00ff66", "#ffb000", "#b98cff", "#ff6ad5", "#7dd3fc"];

/** Pick an icon from the category title; categories are free-form in Sanity. */
const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/mobile/i, Smartphone],
  [/front|web|ui/i, Globe],
  [/back|server|api/i, Server],
  [/cloud|devops|infra/i, Cloud],
  [/test|qa/i, FlaskConical],
  [/observ|monitor/i, Gauge],
  [/lang/i, Code2],
  [/data|db/i, Boxes],
];
const iconFor = (title: string) => ICON_RULES.find(([re]) => re.test(title))?.[1] ?? Layers;

export function Arsenal() {
  const { data } = useHud();
  const groups = data.skills;
  const total = groups.reduce((n, g) => n + g.skills.length, 0);
  const max = Math.max(...groups.map((g) => g.skills.length), 1);

  return (
    <section id="arsenal" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeader index="03" code="technical arsenal" title="Loaded Modules" meta={`${total} packages resolved`} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, gi) => {
          const Icon = iconFor(group.title);
          const accent = ACCENTS[gi % ACCENTS.length];
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (gi % 3) * 0.1, duration: 0.5 }}
            >
              <Panel className="h-full">
                <div className="p-5 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="chamfer-sm flex h-10 w-10 shrink-0 items-center justify-center border" style={{ borderColor: `${accent}66`, background: `${accent}12`, color: accent }}>
                        <Icon size={18} />
                      </span>
                      <div>
                        <div className="label" style={{ color: accent }}>
                          MOD-{String.fromCharCode(65 + gi)}
                        </div>
                        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">{group.title}</h3>
                      </div>
                    </div>
                    <span className="font-mono text-2xl font-bold tabular-nums" style={{ color: accent }}>
                      {String(group.skills.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mb-5 h-1 w-full bg-white/5">
                    <motion.div
                      className="h-full"
                      style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(group.skills.length / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + (gi % 3) * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
                    />
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {group.skills.map((name, i) => (
                      <motion.li
                        key={name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + i * 0.03 }}
                        className="chamfer-sm cursor-default border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-fog-light transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${accent}99`;
                          e.currentTarget.style.boxShadow = `0 0 14px -4px ${accent}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        {name}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
