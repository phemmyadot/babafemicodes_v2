import type { ReactNode } from "react";
import { formatPhone } from "@/lib/format";
import type { Portfolio } from "@/lib/types";
import { SECTIONS, type HudActions, type SectionId } from "../hud-context";
import { formatPeriod } from "../hud/ServiceLog";

export interface CommandContext {
  data: Portfolio;
  hud: HudActions;
  clear: () => void;
  history: string[];
}

interface Command {
  description: string;
  usage?: string;
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => ReactNode | void;
}

const C = ({ children }: { children: ReactNode }) => <span className="text-cyan-neon">{children}</span>;
const G = ({ children }: { children: ReactNode }) => <span className="text-phosphor">{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span className="text-fog">{children}</span>;
const Head = ({ children }: { children: ReactNode }) => (
  <div className="mb-1 mt-1 text-cyan-neon">
    ── {children} {"─".repeat(Math.max(4, 40 - String(children).length))}
  </div>
);

function blockText(blocks: Portfolio["projects"][number]["body"]) {
  return blocks
    .map((b) => (Array.isArray(b.children) ? b.children.map((c) => ("text" in c ? String(c.text) : "")).join("") : ""))
    .filter(Boolean);
}

function findProject(data: Portfolio, key: string | undefined) {
  if (!key) return undefined;
  const n = Number(key);
  if (Number.isInteger(n) && n >= 1) return data.projects[n - 1];
  return data.projects.find((p) => p.slug === key || p.slug.startsWith(key));
}

const SECTION_ALIASES: Record<string, SectionId> = {
  home: "operator",
  top: "operator",
  metrics: "telemetry",
  projects: "systems",
  skills: "arsenal",
  stack: "arsenal",
  experience: "log",
  certs: "credentials",
  contact: "uplink",
};

export const COMMANDS: Record<string, Command> = {
  help: {
    description: "List available commands",
    run: () => (
      <div>
        <Head>available commands</Head>
        <div className="grid gap-x-6 sm:grid-cols-[max-content_1fr]">
          {Object.entries(COMMANDS)
            .filter(([, c]) => !c.hidden)
            .map(([name, c]) => (
              <div key={name} className="contents">
                <G>{c.usage ?? name}</G>
                <Dim>{c.description}</Dim>
              </div>
            ))}
        </div>
        <div className="mt-2">
          <Dim>tip: ↑/↓ history · tab autocomplete · esc exits</Dim>
        </div>
      </div>
    ),
  },

  whoami: {
    description: "Operator profile",
    run: (_, { data: { settings } }) => (
      <div>
        <div className="font-bold text-white">{settings.name}</div>
        <C>{settings.title}</C>
        {settings.tagline && <div className="text-fog">“{settings.tagline}”</div>}
        {settings.bio.map((para) => (
          <p key={para} className="mt-1 max-w-2xl text-fog-light">
            {para}
          </p>
        ))}
        {settings.workStatus && (
          <div className="mt-1">
            status: <G>{settings.workStatus}</G>
          </div>
        )}
      </div>
    ),
  },

  status: {
    description: "System status & core telemetry",
    run: (_, { data }) => (
      <div>
        <div>
          SYSTEM STATUS: <G>ALL SYSTEMS OPERATIONAL</G>
        </div>
        <div>
          content source: <C>sanity cms (live)</C>
        </div>
        <Head>telemetry</Head>
        {data.metrics.map((m) => (
          <div key={m.id}>
            <G>{`${m.value} ${m.unit ?? ""}`.padEnd(10, " ")}</G> {m.label}
            {m.detail && <Dim> · {m.detail}</Dim>}
          </div>
        ))}
      </div>
    ),
  },

  skills: {
    description: "Technical arsenal by category",
    usage: "skills [category]",
    run: (args, { data }) => {
      const q = args.join(" ").toLowerCase();
      const groups = data.skills.filter((g) => !q || g.title.toLowerCase().includes(q));
      if (!groups.length) {
        return (
          <span className="text-alert">
            unknown category: {q} <Dim>— try {data.skills.map((g) => g.title.toLowerCase()).join(", ")}</Dim>
          </span>
        );
      }
      return (
        <div>
          {groups.map((g) => (
            <div key={g.id} className="mb-1">
              <Head>{g.title}</Head>
              <div className="flex flex-wrap gap-x-3">
                {g.skills.map((name) => (
                  <span key={name}>
                    <G>▪</G> {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },

  projects: {
    description: "List deployed systems",
    run: (_, { data }) => (
      <div>
        <Head>deployed systems</Head>
        {data.projects.map((p, i) => (
          <div key={p.id} className="flex gap-3">
            <G>[{String(i + 1).padStart(2, "0")}]</G>
            <span>
              <span className="text-white">{p.title}</span>
              {p.client && <Dim> · {p.client}</Dim>}
            </span>
          </div>
        ))}
        <div className="mt-2">
          <Dim>
            run <C>project &lt;n&gt;</C> for details or <C>inspect &lt;n&gt;</C> to open the visual inspector
          </Dim>
        </div>
      </div>
    ),
  },

  project: {
    description: "Show a system's details",
    usage: "project <n|slug>",
    run: (args, { data }) => {
      const p = findProject(data, args[0]);
      if (!p) return <span className="text-alert">no such project: {args[0] ?? "(none)"} — try `projects`</span>;
      return (
        <div>
          <div className="font-bold text-white">{p.title}</div>
          <Dim>
            {[p.client, p.role, p.domain].filter(Boolean).join(" · ")}
          </Dim>
          {(p.body.length ? blockText(p.body) : p.summary.split(/\n+/)).map((t, i) => (
            <p key={i} className="mt-1 max-w-3xl text-fog-light">
              {t}
            </p>
          ))}
          {p.metrics.length > 0 && (
            <div className="mt-1">
              {p.metrics.map((m) => (
                <div key={m}>
                  <G>▸</G> {m}
                </div>
              ))}
            </div>
          )}
          {p.techStack.length > 0 && (
            <div className="mt-1">
              stack: <C>{p.techStack.join(", ")}</C>
            </div>
          )}
          {p.links.map((l) => (
            <div key={l.url}>
              {l.title.toLowerCase()}:{" "}
              <a className="text-cyan-neon underline" href={l.url} target="_blank" rel="noreferrer noopener">
                {l.url}
              </a>
            </div>
          ))}
          {p.githubUrl && <div>source: <a className="text-cyan-neon underline" href={p.githubUrl} target="_blank" rel="noreferrer noopener">{p.githubUrl}</a></div>}
        </div>
      );
    },
  },

  inspect: {
    description: "Open a system in the visual inspector",
    usage: "inspect <n|slug>",
    run: (args, { data, hud }) => {
      const p = findProject(data, args[0]);
      if (!p) return <span className="text-alert">no such project: {args[0] ?? "(none)"}</span>;
      hud.inspectProject(p.slug);
      return <Dim>opening inspector: {p.title}…</Dim>;
    },
  },

  experience: {
    description: "Service log / work history",
    run: (_, { data }) => (
      <div>
        <Head>service log</Head>
        {data.experience.map((e) => {
          const period = formatPeriod(e);
          return (
            <div key={e.id} className="mb-2">
              <div>
                <span className="font-bold text-white">{e.company}</span> <Dim>—</Dim> <C>{e.role}</C>
                {period && <Dim> [{period}]</Dim>}
              </div>
              {e.highlights.map((h, i) => (
                <div key={i} className="pl-3 text-fog-light">
                  › {h}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    ),
  },

  certs: {
    description: "Certifications & education",
    run: (_, { data }) => (
      <div>
        {data.credentials.map((c) => (
          <div key={c.id}>
            <G>{c.kind === "certification" ? "[CERT]" : "[EDU] "}</G> <span className="text-white">{c.title}</span>
            {c.code && <C> ({c.code})</C>}
            <Dim>{[c.issuer, c.year].filter(Boolean).map((x) => ` · ${x}`).join("")}</Dim>
          </div>
        ))}
      </div>
    ),
  },

  contact: {
    description: "Contact channels",
    run: (_, { data: { settings } }) => (
      <div>
        <div>
          email: <a className="text-cyan-neon underline" href={`mailto:${settings.email}`}>{settings.email}</a>
        </div>
        {settings.phone && (
          <div>
            voice: <a className="text-cyan-neon underline" href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{formatPhone(settings.phone)}</a>
          </div>
        )}
        {(
          [
            ["github", settings.githubUrl],
            ["linkedin", settings.linkedinUrl],
            ["blog", settings.blogUrl],
          ] as const
        ).map(
          ([label, url]) =>
            url && (
              <div key={label}>
                {label}:{" "}
                <a className="text-cyan-neon underline" href={url} target="_blank" rel="noreferrer noopener">
                  {url}
                </a>
              </div>
            ),
        )}
        {settings.workStatus && (
          <div>
            status: <G>{settings.workStatus}</G>
          </div>
        )}
        <div className="mt-1">
          <Dim>
            run <C>transmit</C> to open the secure message form
          </Dim>
        </div>
      </div>
    ),
  },

  transmit: {
    description: "Open the secure transmission form",
    run: (_, { hud }) => {
      hud.openContact();
      return <Dim>opening uplink…</Dim>;
    },
  },

  resume: {
    description: "Download resume",
    run: (_, { data }) => {
      const url = data.settings.resumeUrl;
      if (!url) return <span className="text-alert">resume not available</span>;
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      a.click();
      return <G>download initiated → {url}</G>;
    },
  },

  open: {
    description: "Jump to a GUI section",
    usage: "open <section>",
    run: (args, { hud }) => {
      const key = (args[0] ?? "").toLowerCase();
      const id = (SECTIONS.find((s) => s.id === key)?.id ?? SECTION_ALIASES[key]) as SectionId | undefined;
      if (!id) {
        return (
          <div>
            <span className="text-alert">unknown section: {args[0] ?? "(none)"}</span>
            <div>
              <Dim>sections: {SECTIONS.map((s) => s.id).join(", ")}</Dim>
            </div>
          </div>
        );
      }
      hud.goTo(id);
      return <Dim>navigating to {id}…</Dim>;
    },
  },

  ls: {
    description: "List modules",
    run: () => (
      <div className="flex flex-wrap gap-x-5">
        {SECTIONS.map((s) => (
          <C key={s.id}>{s.id}/</C>
        ))}
      </div>
    ),
  },

  history: {
    description: "Command history",
    run: (_, { history }) => (
      <div>
        {history.map((h, i) => (
          <div key={i}>
            <Dim>{String(i + 1).padStart(3, " ")}</Dim> {h}
          </div>
        ))}
      </div>
    ),
  },

  clear: { description: "Clear the screen", run: (_, { clear }) => clear() },

  gui: {
    description: "Return to the graphical HUD",
    run: (_, { hud }) => {
      hud.closeTerminal();
    },
  },

  exit: { description: "Alias for gui", hidden: true, run: (_, { hud }) => hud.closeTerminal() },
  about: { description: "Alias for whoami", hidden: true, run: (a, ctx) => COMMANDS.whoami.run(a, ctx) },
  email: { description: "Alias for contact", hidden: true, run: (a, ctx) => COMMANDS.contact.run(a, ctx) },
  date: { description: "Current time", hidden: true, run: () => new Date().toString() },
  echo: { description: "Echo", hidden: true, run: (args) => args.join(" ") },
  sudo: {
    description: "",
    hidden: true,
    run: () => <span className="text-alert">permission denied: operator privileges required. this incident will be reported.</span>,
  },
  "rm": { description: "", hidden: true, run: () => <span className="text-alert">nice try.</span> },
};

export const COMMAND_NAMES = Object.keys(COMMANDS);
