"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useHud } from "../hud-context";
import { SITE_DOMAIN } from "@/lib/site";
import { COMMAND_NAMES, COMMANDS } from "./commands";

interface Entry {
  id: number;
  input?: string;
  output?: ReactNode;
}

const PROMPT_USER = "guest";
const PROMPT_HOST = SITE_DOMAIN;
const QUICK = ["help", "whoami", "skills", "projects", "experience", "contact", "gui"];

function Prompt() {
  return (
    <span className="shrink-0 select-none">
      <span className="text-phosphor">{PROMPT_USER}@{PROMPT_HOST}</span>
      <span className="text-fog">:</span>
      <span className="text-cyan-neon">~</span>
      <span className="text-fog">$ </span>
    </span>
  );
}

function Banner({ name }: { name: string }) {
  return (
    <div className="mb-3">
      <div className="inline-block border border-cyan-neon/40 px-4 py-2">
        <div className="font-bold uppercase tracking-[0.3em] text-cyan-neon glow-text-cyan">{name}</div>
        <div className="text-[11px] text-fog">{PROMPT_HOST} · interactive shell v2.0</div>
      </div>
      <div className="mt-2 text-fog-light">
        Type <span className="text-phosphor">help</span> to list commands.
      </div>
    </div>
  );
}

export function Terminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const hud = useHud();
  const { data } = hud;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const run = useCallback(
    (raw: string) => {
      const line = raw.trim();
      const id = nextId.current++;
      if (!line) {
        setEntries((e) => [...e, { id, input: "" }]);
        return;
      }
      const nextHistory = [...history, line];
      setHistory(nextHistory);
      setCursor(null);

      const [name, ...args] = line.split(/\s+/);
      const cmd = COMMANDS[name.toLowerCase()];
      let cleared = false;
      const output: ReactNode = cmd ? (
        (cmd.run(args, {
          data,
          hud,
          history: nextHistory,
          clear: () => {
            cleared = true;
          },
        }) ?? null)
      ) : (
        <span>
          <span className="text-alert">command not found: {name}</span>
          <span className="text-fog"> — type </span>
          <span className="text-phosphor">help</span>
        </span>
      );
      setEntries((e) => (cleared ? [] : [...e, { id, input: line, output }]));
    },
    [data, hud, history],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(/\s+/);
      if (parts.length === 1) {
        const matches = COMMAND_NAMES.filter((c) => !COMMANDS[c].hidden && c.startsWith(parts[0].toLowerCase()));
        if (matches.length === 1) setInput(`${matches[0]} `);
        else if (matches.length > 1)
          setEntries((en) => [...en, { id: nextId.current++, input, output: <span className="text-fog">{matches.join("  ")}</span> }]);
      } else if (["project", "inspect"].includes(parts[0])) {
        const matches = data.projects.map((p) => p.slug).filter((s) => s.startsWith(parts[1] ?? ""));
        if (matches.length === 1) setInput(`${parts[0]} ${matches[0]}`);
        else if (matches.length > 1)
          setEntries((en) => [...en, { id: nextId.current++, input, output: <span className="text-fog">{matches.join("  ")}</span> }]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-stretch justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-obsidian/85 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Interactive terminal"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative flex w-full max-w-4xl flex-col overflow-hidden border border-phosphor/40 bg-[#050806] shadow-[0_0_60px_-10px_rgba(0,255,102,.35)] sm:h-[78vh]"
          >
            <div className="flex items-center justify-between border-b border-phosphor/25 bg-phosphor/[0.04] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 bg-alert/80" />
                  <span className="h-2.5 w-2.5 bg-amber-hud/80" />
                  <span className="h-2.5 w-2.5 bg-phosphor/80" />
                </span>
                <span className="font-mono text-[11px] text-phosphor/80">
                  {PROMPT_USER}@{PROMPT_HOST}: ~ — tty1
                </span>
              </div>
              <button type="button" onClick={onClose} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fog hover:text-alert">
                <span className="hidden sm:inline">esc · gui mode</span>
                <X size={16} />
                <span className="sr-only">Close terminal</span>
              </button>
            </div>

            <div
              ref={scrollRef}
              onClick={() => window.getSelection()?.toString() || inputRef.current?.focus()}
              className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-fog-light sm:px-6"
              aria-live="polite"
            >
              <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-70" aria-hidden />
              <Banner name={data.settings.name} />
              {entries.map((e) => (
                <div key={e.id} className="mb-2">
                  {e.input !== undefined && (
                    <div className="flex flex-wrap">
                      <Prompt />
                      <span className="break-all text-white">{e.input}</span>
                    </div>
                  )}
                  {e.output !== undefined && e.output !== null && <div className="mt-0.5">{e.output}</div>}
                </div>
              ))}
              <div className="flex items-center">
                <Prompt />
                <label className="sr-only" htmlFor="term-input">
                  Terminal command
                </label>
                <input
                  id="term-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  className="min-w-0 flex-1 bg-transparent text-white caret-phosphor outline-none"
                />
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-t border-phosphor/20 px-3 py-2.5">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    run(q);
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 border border-phosphor/30 px-2.5 py-1 font-mono text-[11px] text-phosphor transition-colors hover:bg-phosphor hover:text-obsidian"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
