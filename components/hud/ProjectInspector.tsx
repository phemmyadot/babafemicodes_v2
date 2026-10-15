"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import type { Project } from "@/lib/types";
import { useHud } from "../hud-context";
import { GithubIcon } from "../ui/BrandIcons";
import { HudButton } from "../ui/HudButton";
import { Modal } from "../ui/Modal";
import { PortableBody } from "../ui/PortableBody";

export function ProjectInspector({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { data } = useHud();
  // Keep the last project mounted while the drawer animates out.
  const last = useRef<Project | null>(null);
  if (project) last.current = project;
  const p = project ?? last.current;
  const index = p ? data.projects.findIndex((x) => x.id === p.id) : -1;

  return (
    <Modal open={!!project} onClose={onClose} side="right" title={p?.title ?? "Project"} code={`SYS-${String(index + 1).padStart(2, "0")}`}>
      {p && (
        <article className="px-5 py-6 sm:px-8 sm:py-8">
          {p.thumbnailUrl && (
            <div className="relative mb-6 aspect-video overflow-hidden border border-line">
              <Image
                src={`${p.thumbnailUrl}?w=1200&h=675&fit=crop&auto=format`}
                alt=""
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-scanlines" />
            </div>
          )}

          <div className="label mb-3 flex flex-wrap gap-x-4 gap-y-1">
            {p.client && <span className="text-cyan-neon">{p.client}</span>}
            {p.role && <span>role: {p.role}</span>}
            {p.domain && <span>domain: {p.domain}</span>}
          </div>
          <h2 className="font-display text-3xl font-semibold uppercase leading-tight text-white sm:text-4xl">{p.title}</h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-fog-light">{p.summary}</p>

          {p.metrics.length > 0 && (
            <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
              {p.metrics.map((m, i) => (
                <div key={m} className="bg-obsidian-900 p-4">
                  <div className="label mb-2">kpi-{String(i + 1).padStart(2, "0")}</div>
                  <div className="font-mono text-sm text-phosphor glow-text-green">{m}</div>
                </div>
              ))}
            </div>
          )}

          {p.body.length > 0 && (
            <section className="mt-8">
              <h3 className="label mb-4 text-cyan-neon">// mission brief</h3>
              <PortableBody value={p.body} />
            </section>
          )}

          {p.techStack.length > 0 && (
            <section className="mt-8">
              <h3 className="label mb-3 text-cyan-neon">// stack</h3>
              <div className="flex flex-wrap gap-2">
                {p.techStack.map((t) => (
                  <span key={t} className="chamfer-sm border border-cyan-neon/30 bg-cyan-neon/5 px-3 py-1.5 font-mono text-xs text-cyan-neon">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(p.links.length > 0 || p.githubUrl) && (
            <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
              {p.links.map((l) => (
                <HudButton key={l.url} variant="primary" href={l.url} external icon={<ArrowUpRight size={14} />}>
                  {p.links.length > 1 || l.title.toLowerCase() !== "link" ? l.title : "Launch live"}
                </HudButton>
              ))}
              {p.githubUrl && (
                <HudButton href={p.githubUrl} external icon={<GithubIcon size={14} />}>
                  Source
                </HudButton>
              )}
            </div>
          )}
        </article>
      )}
    </Modal>
  );
}
