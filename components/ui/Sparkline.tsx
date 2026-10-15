"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { Signal } from "@/lib/types";

const POINTS = 40;

function sample(signal: Signal, t: number, prev: number): number {
  const noise = (Math.random() - 0.5) * 0.12;
  switch (signal) {
    case "rising":
      return Math.min(0.95, Math.max(0.15, 0.35 + ((t % 80) / 80) * 0.5 + noise));
    case "spiky":
      return Math.random() > 0.86 ? 0.75 + Math.random() * 0.2 : 0.18 + Math.random() * 0.14;
    case "wave":
      return 0.5 + Math.sin(t / 4) * 0.28 + noise * 0.6;
    case "steady":
    default:
      return Math.min(0.85, Math.max(0.45, prev + noise * 0.8));
  }
}

function seedSeries(signal: Signal) {
  const out: number[] = [];
  let prev = 0.6;
  for (let i = 0; i < POINTS; i++) out.push((prev = sample(signal, i, prev)));
  return out;
}

/** Simulated real-time telemetry graph, Grafana-panel style. */
export function Sparkline({
  signal,
  color = "#00f0ff",
  height = 56,
  interval = 900,
}: {
  signal: Signal;
  color?: string;
  height?: number;
  interval?: number;
}) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  // Deterministic flat line for SSR; real series fills in on mount to avoid hydration mismatch.
  const [series, setSeries] = useState<number[]>(() => Array(POINTS).fill(0.5));
  const [live, setLive] = useState(false);

  useEffect(() => {
    setSeries(seedSeries(signal));
    setLive(!reduce);
    if (reduce) return;
    let t = POINTS;
    const timer = setInterval(() => {
      setSeries((s) => [...s.slice(1), sample(signal, t++, s[s.length - 1])]);
    }, interval);
    return () => clearInterval(timer);
  }, [signal, interval, reduce]);

  const w = 200;
  const step = w / (POINTS - 1);
  const pts = series.map((v, i) => `${(i * step).toFixed(1)},${((1 - v) * height).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const area = `${line} L${w},${height} L0,${height} Z`;
  const last = series[series.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" x2={w} y1={y * height} y2={y * height} stroke={color} strokeOpacity="0.08" strokeDasharray="2 4" />
      ))}
      <path d={area} fill={`url(#g-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <circle cx={w} cy={(1 - last) * height} r="2.5" fill={color}>
        {live && <animate attributeName="r" values="2;4;2" dur="1.4s" repeatCount="indefinite" />}
      </circle>
    </svg>
  );
}
