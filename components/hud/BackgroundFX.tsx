"use client";

import { useEffect, useRef } from "react";

/** Fixed atmospheric layers: grid, glow, scanlines, sweep beam, and a cursor-coordinate readout. */
export function BackgroundFX() {
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Write straight to the DOM — no re-render per mousemove.
    const onMove = (e: MouseEvent) => {
      if (!coordRef.current) return;
      const x = String(e.clientX).padStart(4, "0");
      const y = String(e.clientY + Math.round(window.scrollY)).padStart(5, "0");
      coordRef.current.textContent = `X:${x}  Y:${y}`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-hud-grid [mask-image:radial-gradient(ellipse_at_50%_20%,#000_20%,transparent_75%)]" />
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-neon/[0.07] blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-phosphor/[0.04] blur-[120px]" />
      <div className="absolute inset-0 bg-scanlines opacity-60" />
      <div className="absolute inset-x-0 top-0 h-32 animate-scan bg-gradient-to-b from-transparent via-cyan-neon/[0.035] to-transparent" />

      {/* Side rulers */}
      <div className="absolute bottom-0 left-3 top-20 hidden w-3 flex-col justify-between py-6 xl:flex">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={i % 4 === 0 ? "h-px w-3 bg-cyan-neon/40" : "h-px w-1.5 bg-cyan-neon/20"} />
        ))}
      </div>
      <div className="absolute bottom-6 left-8 hidden font-mono text-[10px] tracking-[0.3em] text-cyan-neon/40 xl:block">
        <span ref={coordRef}>X:0000  Y:00000</span>
      </div>
      <div className="absolute bottom-6 right-8 hidden font-mono text-[10px] tracking-[0.3em] text-cyan-neon/30 xl:block [writing-mode:vertical-rl]">
        GRID-REF 00.00 // SECTOR HUD
      </div>
    </div>
  );
}
