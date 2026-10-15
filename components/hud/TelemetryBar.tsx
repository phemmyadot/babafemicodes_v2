"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useHud } from "../hud-context";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { Sparkline } from "../ui/Sparkline";
import { StatusDot } from "../ui/StatusDot";

const COLORS = ["#00f0ff", "#00ff66", "#00f0ff", "#ffb000"];

export function TelemetryBar() {
  const { data } = useHud();
  const ticker = data.skills.flatMap((g) => g.skills);

  return (
    <section id="telemetry" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeader
        index="01"
        code="core telemetry"
        title="Live Metrics"
        meta={
          <span className="inline-flex items-center gap-2">
            <StatusDot /> stream: {data.source === "sanity" ? "sanity cms" : "local cache"} · {data.metrics.length} channels
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Panel className="group h-full">
              <div className="flex h-full flex-col p-5">
                <div className="label mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity size={12} style={{ color: COLORS[i % COLORS.length] }} />
                    CH-{String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{m.signal}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display text-5xl font-bold tabular-nums"
                    style={{ color: COLORS[i % COLORS.length], textShadow: `0 0 24px ${COLORS[i % COLORS.length]}55` }}
                  >
                    {m.value}
                  </span>
                  {m.unit && <span className="font-mono text-sm text-fog">{m.unit}</span>}
                </div>
                <p className="mt-2 font-display text-base font-medium uppercase tracking-wide text-white">{m.label}</p>
                {m.detail && <p className="mt-1 font-mono text-[11px] text-fog">{m.detail}</p>}
                <div className="mt-auto h-14 pt-5">
                  <Sparkline signal={m.signal} color={COLORS[i % COLORS.length]} interval={800 + i * 170} />
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      {ticker.length > 0 && (
        <div className="mask-fade-x mt-8 overflow-hidden border-y border-line py-3" aria-hidden>
          <div className="flex w-max animate-marquee gap-8 font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center gap-8">
                {t}
                <span className="text-cyan-neon/50">◆</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
