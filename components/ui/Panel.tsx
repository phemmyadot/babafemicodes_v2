import { cn } from "@/lib/cn";

/** Corner-bracket reticle drawn over a container. Parent must be `relative`. */
export function Brackets({ className, size = 10 }: { className?: string; size?: number }) {
  const s = { width: size, height: size };
  const base = "pointer-events-none absolute border-cyan-neon/70 transition-colors duration-300";
  return (
    <span aria-hidden className={cn("contents", className)}>
      <span style={s} className={cn(base, "left-0 top-0 border-l border-t")} />
      <span style={s} className={cn(base, "right-0 top-0 border-r border-t")} />
      <span style={s} className={cn(base, "bottom-0 left-0 border-b border-l")} />
      <span style={s} className={cn(base, "bottom-0 right-0 border-b border-r")} />
    </span>
  );
}

export function Panel({
  children,
  className,
  brackets = true,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  brackets?: boolean;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag className={cn("relative", className)}>
      <div className="panel h-full">{children}</div>
      {brackets && <Brackets />}
    </Tag>
  );
}
