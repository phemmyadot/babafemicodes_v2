"use client";

import { BookOpen, Mail, Phone, Radio, SquareTerminal } from "lucide-react";
import { formatPhone } from "@/lib/format";
import { useHud } from "../hud-context";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { HudButton } from "../ui/HudButton";
import { Brackets } from "../ui/Panel";
import { StatusDot } from "../ui/StatusDot";

export function Uplink() {
  const { data, openContact, openTerminal } = useHud();
  const { settings } = data;
  const external = [
    { label: "github", url: settings.githubUrl, icon: <GithubIcon size={16} className="text-cyan-neon" /> },
    { label: "linkedin", url: settings.linkedinUrl, icon: <LinkedinIcon size={16} className="text-cyan-neon" /> },
    { label: "blog", url: settings.blogUrl, icon: <BookOpen size={16} className="text-cyan-neon" /> },
  ].filter((l): l is typeof l & { url: string } => Boolean(l.url));

  return (
    <section id="uplink" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="relative">
        <div className="panel overflow-hidden">
          <div className="absolute inset-0 bg-hud-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" aria-hidden />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-12 lg:p-14">
            <div className="lg:col-span-7">
              <div className="label mb-4 flex items-center gap-2 text-cyan-neon">
                <span>06</span>
                <span className="h-px w-8 bg-cyan-neon/50" />
                <span>uplink</span>
              </div>
              <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                Open a secure
                <br />
                <span className="text-cyan-neon glow-text-cyan">channel.</span>
              </h2>
              <p className="mt-5 max-w-xl text-fog-light">
                Transmit a message and it lands directly in my inbox.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <HudButton variant="primary" icon={<Radio size={14} />} onClick={openContact}>
                  Initiate transmission
                </HudButton>
                <HudButton variant="green" icon={<SquareTerminal size={14} />} onClick={openTerminal}>
                  Use the CLI
                </HudButton>
              </div>
            </div>

            <ul className="space-y-px self-end border border-line bg-line lg:col-span-5">
              {settings.email && (
              <li className="bg-obsidian-900">
                <a href={`mailto:${settings.email}`} className="group flex items-center gap-4 p-4 hover:bg-obsidian-800">
                  <Mail size={16} className="text-cyan-neon" />
                  <span className="min-w-0">
                    <span className="label block">email</span>
                    <span className="block truncate font-mono text-sm text-white group-hover:text-cyan-neon">{settings.email}</span>
                  </span>
                </a>
              </li>
              )}
              {settings.phone && (
                <li className="bg-obsidian-900">
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="group flex items-center gap-4 p-4 hover:bg-obsidian-800">
                    <Phone size={16} className="text-cyan-neon" />
                    <span>
                      <span className="label block">voice</span>
                      <span className="block font-mono text-sm text-white group-hover:text-cyan-neon">{formatPhone(settings.phone)}</span>
                    </span>
                  </a>
                </li>
              )}
              {external.map((l) => (
                <li key={l.label} className="bg-obsidian-900">
                  <a href={l.url} target="_blank" rel="noreferrer noopener" className="group flex items-center gap-4 p-4 hover:bg-obsidian-800">
                    {l.icon}
                    <span className="min-w-0">
                      <span className="label block">{l.label}</span>
                      <span className="block truncate font-mono text-sm text-white group-hover:text-cyan-neon">
                        {l.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
              {settings.workStatus && (
                <li className="flex items-center gap-4 bg-obsidian-900 p-4">
                  <StatusDot />
                  <span>
                    <span className="label block">work authorization</span>
                    <span className="block font-mono text-sm text-phosphor">{settings.workStatus}</span>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <Brackets size={16} />
      </div>
    </section>
  );
}
