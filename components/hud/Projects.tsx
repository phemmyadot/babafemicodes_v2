"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";
import { useHud } from "../hud-context";
import { Brackets } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

function ProjectCard({ project, index, wide }: { project: Project; index: number; wide: boolean }) {
  const { inspectProject } = useHud();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className={cn("group relative", wide && "lg:col-span-2")}
    >
      <button
        type="button"
        onClick={() => inspectProject(project.slug)}
        className="panel flex h-full w-full flex-col p-5 text-left transition-colors duration-300 hover:border-cyan-neon/50 hover:bg-obsidian-800 sm:p-6"
      >
        <div className="label mb-5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="text-cyan-neon">SYS-{String(index + 1).padStart(2, "0")}</span>
            {project.client && <span className="truncate">/ {project.client}</span>}
          </span>
          {project.domain && (
            <span className="border border-line px-2 py-0.5 text-cyan-neon/80">{project.domain}</span>
          )}
        </div>

        <h3 className={cn("font-display font-semibold uppercase leading-tight tracking-wide text-white transition-colors group-hover:text-cyan-neon", wide ? "text-2xl sm:text-3xl" : "text-xl")}>
          {project.title}
        </h3>
        <p className={cn("mt-3 leading-relaxed text-fog-light", wide ? "line-clamp-5 max-w-2xl text-base" : "line-clamp-4 text-sm")}>{project.summary}</p>

        {project.metrics.length > 0 && (
          <ul className="mt-5 space-y-1.5">
            {project.metrics.slice(0, wide ? 3 : 2).map((m) => (
              <li key={m} className="flex items-start gap-2 font-mono text-xs text-phosphor">
                <span className="mt-[3px] text-phosphor/60">▸</span>
                {m}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-6">
          {project.techStack.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {project.techStack.slice(0, wide ? 6 : 4).map((t) => (
                <span key={t} className="border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-fog-light">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="text-fog transition-colors group-hover:text-cyan-neon">Inspect module</span>
            <ChevronRight size={16} className="text-cyan-neon transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </button>
      <Brackets className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.li>
  );
}

export function Projects() {
  const { data, inspectProject } = useHud();
  const featured = data.projects.filter((p) => p.featured);
  const showcase = featured.length ? featured : data.projects;
  const archive = featured.length ? data.projects.filter((p) => !p.featured) : [];

  const domains = useMemo(
    () => ["All", ...Array.from(new Set(showcase.map((p) => p.domain).filter((d): d is string => Boolean(d))))],
    [showcase],
  );
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? showcase : showcase.filter((p) => p.domain === filter);
  if (!showcase.length) return null;

  return (
    <section id="systems" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeader index="02" code="featured systems" title="Deployed Systems" meta={`${showcase.length} modules online`} />

      {domains.length > 2 && (
        <div role="tablist" aria-label="Filter by domain" className="mb-6 flex gap-1 overflow-x-auto pb-1">
          {domains.map((d) => (
            <button
              key={d}
              role="tab"
              type="button"
              aria-selected={filter === d}
              onClick={() => setFilter(d)}
              className={cn(
                "relative shrink-0 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                filter === d ? "border-cyan-neon/60 text-obsidian" : "border-line text-fog hover:text-white",
              )}
            >
              {filter === d && <motion.span layoutId="filter-pill" className="absolute inset-0 bg-cyan-neon" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{d}</span>
            </button>
          ))}
        </div>
      )}

      <motion.ul layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={showcase.indexOf(p)} wide={i === 0} />
          ))}
        </AnimatePresence>
      </motion.ul>

      {archive.length > 0 && (
        <div className="mt-12">
          <div className="label mb-3">// archive</div>
          <ul className="divide-y divide-line border-y border-line">
            {archive.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => inspectProject(p.slug)}
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg uppercase text-white group-hover:text-cyan-neon">{p.title}</span>
                    <span className="block truncate font-mono text-xs text-fog">{p.client}</span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-fog group-hover:text-cyan-neon" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
