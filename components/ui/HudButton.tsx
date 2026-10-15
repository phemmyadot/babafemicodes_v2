"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "green";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-neon/10 text-cyan-neon border-cyan-neon/60 hover:bg-cyan-neon hover:text-obsidian hover:shadow-glow-cyan",
  green:
    "bg-phosphor/10 text-phosphor border-phosphor/60 hover:bg-phosphor hover:text-obsidian hover:shadow-glow-green",
  ghost: "bg-transparent text-fog-light border-white/15 hover:border-cyan-neon/60 hover:text-cyan-neon",
};

type Props = {
  variant?: Variant;
  icon?: React.ReactNode;
  href?: string;
  download?: boolean | string;
  external?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Chamfered HUD button; renders an <a> when `href` is provided. */
export const HudButton = forwardRef<HTMLButtonElement, Props>(function HudButton(
  { variant = "ghost", icon, href, download, external, className, children, ...rest },
  ref,
) {
  const classes = cn(
    "chamfer-sm group inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    className,
  );
  const content = (
    <>
      {icon && <span className="transition-transform duration-200 group-hover:-translate-y-px">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        download={download}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type="button" className={classes} {...rest}>
      {content}
    </button>
  );
});
