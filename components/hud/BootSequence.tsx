"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BOOT_STORAGE_KEY } from "@/lib/boot";


/** One-time-per-session boot overlay. Skippable with any key/click; skipped for reduced motion. */
export function BootSequence({ name }: { name: string }) {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);

  const lines = [
    "BIOS v2.0 // INITIALIZING OPERATOR PROFILE",
    "MOUNTING CONTENT SOURCE ........ SANITY CMS [LIVE]",
    "LOADING MODULES: telemetry systems arsenal uplink",
    "HANDSHAKE ...................... OK",
    `WELCOME. OPERATOR: ${name.toUpperCase()}`,
  ];

  useEffect(() => {
    if (document.documentElement.dataset.boot === "skip") {
      setVisible(false);
      return;
    }
    try {
      sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — boot will replay next load, harmless */
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (step >= lines.length) {
      const t = setTimeout(() => setVisible(false), 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 180 : 210);
    return () => clearTimeout(t);
  }, [visible, step, lines.length]);

  useEffect(() => {
    if (!visible) return;
    const skip = () => setVisible(false);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="boot-overlay fixed inset-0 z-[100] flex items-center justify-center bg-obsidian px-6"
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35 }}
        >
          <div className="w-full max-w-xl font-mono text-xs leading-7 text-phosphor sm:text-sm">
            {lines.slice(0, step).map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="glow-text-green">
                <span className="text-phosphor/50">[{String(i).padStart(2, "0")}]</span> {l}
              </motion.div>
            ))}
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-phosphor" />
            <div className="mt-6 h-px w-full overflow-hidden bg-phosphor/15">
              <motion.div
                className="h-full bg-phosphor"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / lines.length) * 100}%` }}
              />
            </div>
            <div className="label mt-3 text-phosphor/40">press any key to skip</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
