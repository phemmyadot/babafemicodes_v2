import { cn } from "@/lib/cn";

export function StatusDot({ color = "green", className }: { color?: "green" | "cyan" | "amber"; className?: string }) {
  const c = { green: "bg-phosphor shadow-[0_0_8px_#00ff66]", cyan: "bg-cyan-neon shadow-[0_0_8px_#00f0ff]", amber: "bg-amber-hud shadow-[0_0_8px_#ffb000]" }[color];
  return <span aria-hidden className={cn("inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full", c, className)} />;
}
