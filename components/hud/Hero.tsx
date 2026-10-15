"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Crosshair, Download, SquareTerminal } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useHud } from "../hud-context";
import { DecodeText } from "../ui/DecodeText";
import { HudButton } from "../ui/HudButton";
import { Brackets } from "../ui/Panel";
import { StatusDot } from "../ui/StatusDot";

const LOG_LINES = [
  "[ok] offline queue flushed · 0 records lost",
  "[ok] ble pairing · secure connections (LE SC)",
  "[ok] rag index warm · source validation on",
  "[ok] component registry · 10+ consumers",
  "[ok] lambda cold start within budget",
  "[ok] crash-free sessions nominal",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 * i, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as const } }),
};

function Reticle({ avatarUrl, initials }: { avatarUrl?: string; initials: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-cyan-neon" aria-hidden>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity=".15" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeOpacity=".25" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="44" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeOpacity=".12" />
        <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeOpacity=".12" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 86 : 90;
          return (
            <line
              key={i}
              x1={(100 + Math.cos(a) * r1).toFixed(2)}
              y1={(100 + Math.sin(a) * r1).toFixed(2)}
              x2={(100 + Math.cos(a) * 96).toFixed(2)}
              y2={(100 + Math.sin(a) * 96).toFixed(2)}
              stroke="currentColor"
              strokeOpacity={i % 3 === 0 ? 0.6 : 0.25}
            />
          );
        })}
      </svg>
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-cyan-neon"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="sweep" x1="0" x2="1">
            <stop offset="0" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="1" stopColor="#00f0ff" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <path d="M100 100 L100 4 A96 96 0 0 1 183 52 Z" fill="url(#sweep)" />
        <path d="M100 30 A70 70 0 0 1 170 100" fill="none" stroke="currentColor" strokeWidth="2" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-phosphor"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <path d="M100 56 A44 44 0 0 1 144 100" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity=".8" />
        <circle cx="150" cy="62" r="2.5" fill="currentColor" />
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {avatarUrl ? (
          <div className="relative h-[40%] w-[40%] overflow-hidden rounded-full border border-cyan-neon/60 shadow-glow-cyan">
            <Image
              src={`${avatarUrl}?w=240&h=240&fit=crop&auto=format`}
              alt=""
              fill
              sizes="120px"
              className="object-cover grayscale contrast-125"
              priority
            />
            <div className="absolute inset-0 bg-cyan-neon/25 mix-blend-color" aria-hidden />
            <div className="absolute inset-0 bg-scanlines" aria-hidden />
          </div>
        ) : (
          <span className="font-display text-4xl font-bold text-white glow-text-cyan">{initials}</span>
        )}
        <span className="label mt-2 text-cyan-neon/70">lock acquired</span>
      </div>
    </div>
  );
}

function LogTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LOG_LINES.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-5 overflow-hidden font-mono text-[11px] text-phosphor" aria-hidden>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={i}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 truncate"
        >
          {LOG_LINES[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Hero() {
  const { data, openTerminal, goTo } = useHud();
  const { settings } = data;
  const [first, ...rest] = settings.name.split(" ");
  const last = rest.join(" ");
  const [titleMain, titleSub] = settings.title.split("|").map((s) => s.trim());

  const initials = settings.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const years = data.metrics.find((m) => /year|yrs/i.test(`${m.label} ${m.unit ?? ""}`));

  const readouts: Array<[string, string]> = [
    ["Class", titleMain ?? settings.title],
    ["Specialty", "React Native · React · TypeScript"],
    ["Domains", "Enterprise · Healthcare"],
    ...(years ? [["Uptime", `${years.value} ${years.unit ?? "YRS"}`] as [string, string]] : []),
    ...(settings.tagline ? [["Directive", settings.tagline] as [string, string]] : []),
  ];

  return (
    <section id="operator" className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 md:pt-40 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="label mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-cyan-neon">// operator profile</span>
            <span>ID: BA-0008</span>
            <span className="hidden sm:inline">clearance: senior</span>
          </motion.div>

          <h1 className="font-display font-bold uppercase leading-[0.92] tracking-tight text-white">
            <motion.span initial="hidden" animate="show" custom={1} variants={fadeUp} className="block text-[clamp(2.6rem,9vw,6rem)]">
              <DecodeText text={first} duration={600} />
            </motion.span>
            <motion.span
              initial="hidden"
              animate="show"
              custom={2}
              variants={fadeUp}
              className="block text-[clamp(2.1rem,8vw,5.25rem)] text-transparent [-webkit-text-stroke:1px_#00f0ff] [text-shadow:0_0_30px_rgba(0,240,255,.25)]"
            >
              <DecodeText text={last} duration={900} />
            </motion.span>
          </h1>

          <motion.p initial="hidden" animate="show" custom={3} variants={fadeUp} className="mt-6 font-mono text-sm text-cyan-neon sm:text-base">
            <span className="text-phosphor">&gt;</span> {titleMain}
            {titleSub && (
              <>
                <span className="mx-2 text-fog">|</span>
                <span className="text-fog-light">{titleSub}</span>
              </>
            )}
          </motion.p>

          <motion.p initial="hidden" animate="show" custom={4} variants={fadeUp} className="mt-5 max-w-2xl text-base leading-relaxed text-fog-light sm:text-lg">
            {settings.bio[0]}
          </motion.p>

          <motion.div initial="hidden" animate="show" custom={5} variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <HudButton variant="green" icon={<SquareTerminal size={14} />} onClick={openTerminal}>
              Initialize Terminal
            </HudButton>
            {settings.resumeUrl && (
              <HudButton variant="primary" icon={<Download size={14} />} href={settings.resumeUrl} download>
                Download Resume
              </HudButton>
            )}
            <HudButton icon={<Crosshair size={14} />} onClick={() => goTo("systems")}>
              Inspect Projects
            </HudButton>
          </motion.div>

          <motion.div initial="hidden" animate="show" custom={6} variants={fadeUp} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
            {settings.workStatus && (
              <span className="flex items-center gap-2">
                <StatusDot /> {settings.workStatus}
              </span>
            )}
            {settings.openToWork && (
              <span className="flex items-center gap-2">
                <StatusDot color="cyan" /> Open to work
              </span>
            )}
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative lg:col-span-5"
          aria-label="Operator summary"
        >
          <div className="panel p-5 sm:p-6">
            <div className="label mb-4 flex items-center justify-between">
              <span className="text-cyan-neon">target // ba-0008</span>
              <span className="flex items-center gap-2">
                <StatusDot /> live
              </span>
            </div>
            <Reticle avatarUrl={settings.avatarUrl} initials={initials} />
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {readouts.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="label shrink-0">{k}</dt>
                  <dd className="text-right font-mono text-xs text-white sm:text-[13px]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <LogTicker />
            </div>
          </div>
          <Brackets size={14} />
        </motion.aside>
      </div>
    </section>
  );
}
