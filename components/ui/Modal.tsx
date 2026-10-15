"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Brackets } from "./Panel";

/**
 * HUD modal shell: Esc to close, body scroll lock, focus returned to the opener.
 * `side="right"` renders as a slide-in inspector drawer instead of a centered dialog.
 */
export function Modal({
  open,
  onClose,
  title,
  code,
  side = "center",
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  code?: string;
  side?: "center" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  const isRight = side === "right";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn("fixed inset-0 z-[60] flex", isRight ? "justify-end" : "items-center justify-center p-3 sm:p-6")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={isRight ? { x: "100%" } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={isRight ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isRight ? { x: "100%" } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={cn(
              "relative flex max-h-full flex-col overflow-hidden border border-line-strong bg-obsidian-900 outline-none",
              isRight ? "h-full w-full max-w-2xl border-y-0 border-r-0" : "w-full max-w-4xl",
              className,
            )}
          >
            {!isRight && <Brackets size={14} />}
            <header className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 bg-cyan-neon shadow-[0_0_10px_#00f0ff]" />
                <span className="label text-cyan-neon">{code ?? "MODULE"}</span>
                <span className="label hidden text-fog sm:inline">// {title}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fog transition-colors hover:text-alert"
              >
                <span className="hidden sm:inline">ESC</span>
                <X size={16} />
                <span className="sr-only">Close</span>
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
