"use client";

import { ArrowLeft, ArrowRight, Award, Download, ExternalLink, Mail, ShieldCheck, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ACHIEVEMENTS,
  ATTRIBUTES,
  CAREER,
  CERTIFICATIONS,
  CONTACT,
  DEMO,
  MISSIONS,
  PROFILE,
  SECTIONS,
  SKILL_BRANCHES,
  STATS,
  type Mission,
  type SectionId,
} from "./data";

export type Go = (section: SectionId, id?: string) => void;

const missionById = (id: string) => MISSIONS.find((m) => m.id === id);
const reduceMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function Head({ index, title, note }: { index: string; title: string; note?: string }) {
  return (
    <header className="x-head">
      <p className="x-kicker">
        <span>{index}</span> {SECTIONS.find((s) => s.index === index)?.label}
      </p>
      <h1 className="x-title" tabIndex={-1} data-screen-title>
        {title}
      </h1>
      {note && <p className="x-note">{note}</p>}
    </header>
  );
}

function Tags({ list }: { list: string[] }) {
  return (
    <ul className="x-tags" aria-label="Technologies">
      {list.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function MissionLink({ id, go }: { id: string; go: Go }) {
  const m = missionById(id);
  if (!m) return null;
  return (
    <button type="button" className="x-link" onClick={() => go("missions", id)}>
      Mission {m.code} — {m.title} <ArrowRight size={14} aria-hidden />
    </button>
  );
}

export function ResumeButton({ className = "x-btn x-btn-primary" }: { className?: string }) {
  return (
    <a className={className} href={CONTACT.resume} download>
      <Download size={16} aria-hidden /> Resume PDF
    </a>
  );
}

function useCountUp(target: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduceMotion()) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setN(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

export function Stat({ value, suffix, label }: (typeof STATS)[number]) {
  const n = useCountUp(value);
  return (
    <div className="x-stat">
      {/* Screen readers get the final value, not every animation frame. */}
      <span className="x-stat-value" aria-hidden>
        {n}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span className="x-stat-label">{label}</span>
    </div>
  );
}

function Avatar() {
  return (
    <svg className="x-avatar" viewBox="0 0 200 220" role="img" aria-label="Stylized engineer avatar">
      <defs>
        <linearGradient id="xv" x1="0" x2="1">
          <stop offset="0" stopColor="#43D5FF" />
          <stop offset="1" stopColor="#477BFF" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(67,213,255,.18)" strokeDasharray="4 8" className="x-avatar-ring" />
      <g className="x-avatar-body">
        <path d="M40 220c4-46 28-70 60-70s56 24 60 70z" fill="#18263B" stroke="rgba(67,213,255,.35)" />
        <path d="M86 150h28l-4 18H90z" fill="#101A2B" />
        <ellipse cx="100" cy="92" rx="44" ry="50" fill="#18263B" stroke="rgba(67,213,255,.45)" />
        <rect x="64" y="80" width="72" height="22" rx="11" fill="url(#xv)" opacity=".9" />
        <rect x="64" y="80" width="14" height="22" rx="7" fill="#E8F0FC" opacity=".55" className="x-avatar-scan" />
        <path d="M70 186h60" stroke="#A77BFF" strokeWidth="2" opacity=".7" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------- profile */

export function Profile() {
  const [open, setOpen] = useState(ATTRIBUTES[0].name);
  const attr = ATTRIBUTES.find((x) => x.name === open)!;
  const facts: Array<[string, ReactNode]> = [
    ["Class", PROFILE.role],
    ["Specialization", PROFILE.specialization],
    ["Experience", PROFILE.experience],
    ["Location", PROFILE.location],
    ["Core tech", PROFILE.core.join(", ")],
  ];
  return (
    <>
      <Head index="01" title={PROFILE.name} note={PROFILE.intro} />
      <div className="x-split">
        <section className="x-panel x-sheet" aria-label="Profile sheet">
          <div className="x-sheet-top">
            <Avatar />
            <dl className="x-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="x-actions">
            <ResumeButton />
            <a className="x-btn" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedinIcon size={16} /> LinkedIn
            </a>
            <a className="x-btn" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <GithubIcon size={16} /> GitHub
            </a>
          </div>
        </section>
        <section className="x-panel" aria-labelledby="x-attr">
          <h2 id="x-attr" className="x-h2">
            Attributes
          </h2>
          <div className="x-attr-grid">
            {ATTRIBUTES.map((a) => (
              <button key={a.name} type="button" className="x-attr" aria-pressed={open === a.name} onClick={() => setOpen(a.name)}>
                {a.name}
              </button>
            ))}
          </div>
          <div className="x-attr-body" aria-live="polite" key={attr.name}>
            <p className="x-label">Evidence</p>
            <p>{attr.evidence}</p>
          </div>
        </section>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- skills */

export function Skills() {
  const [branchId, setBranchId] = useState(SKILL_BRANCHES[0].id);
  const branch = SKILL_BRANCHES.find((b) => b.id === branchId)!;

  return (
    <>
      <Head index="02" title="Engineering skill tree" note="Select a specialization to see its technologies." />
      <div className="x-tree">
        <div className="x-branches" role="tablist" aria-label="Specializations">
          {SKILL_BRANCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === branchId}
              className="x-branch"
              onClick={() => setBranchId(b.id)}
            >
              <span className="x-node-dot" aria-hidden />
              <span>{b.title}</span>
              <span className="x-muted">{b.skills.length} technologies</span>
            </button>
          ))}
        </div>
        <div className="x-panel x-branch-panel" role="tabpanel" aria-label={branch.title}>
          <h2 className="x-h2">{branch.title}</h2>
          <ul className="x-nodes" key={branch.id}>
            {branch.skills.map((s, i) => (
              <li key={s} className="x-skill" style={{ "--i": i } as CSSProperties}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- missions */

export function Missions() {
  const [sel, setSel] = useState(MISSIONS[0].id);
  const m = missionById(sel)!;
  return (
    <>
      <Head index="03" title="Mission select" note="Pick a mission to see its briefing, architecture and implementation." />
      <div className="x-select">
        <ul className="x-select-list" aria-label="Missions">
          {MISSIONS.map((x) => (
            <li key={x.id}>
              <button type="button" className="x-select-item" aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>
                <span className="x-select-code">{x.code}</span>
                <span className="x-select-name">{x.title}</span>
                {x.featured && <span className="x-pill">Featured</span>}
              </button>
            </li>
          ))}
        </ul>
        <section className="x-panel x-select-preview" aria-live="polite" key={m.id}>
          <p className="x-kicker">
            <span>Mission {m.code}</span> {m.featured ? "Featured case study" : "Case study"}
          </p>
          <h2 className="x-h2">{m.title}</h2>
          <Tags list={m.tech} />
          <p>{m.briefing}</p>
          <p className="x-achieve">{m.achievement}</p>
          <Architecture stages={m.architecture} />
          {m.implementation && (
            <div>
              <p className="x-label">Technical implementation</p>
              <ul className="x-list">
                {m.implementation.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Architecture({ stages }: { stages: string[] }) {
  return (
    <ol className="x-arch" aria-label="Architecture, in order">
      {stages.map((s, i) => (
        <li key={s} style={{ "--i": i } as CSSProperties}>
          {s}
        </li>
      ))}
    </ol>
  );
}

function CitationDemo() {
  const [active, setActive] = useState<string | null>(null);
  const docRef = useRef<HTMLOListElement>(null);
  const cites = DEMO.answer.filter((a) => a.cite).map((a) => a.cite!);
  useEffect(() => {
    if (active) docRef.current?.querySelector(`[data-p="${active}"]`)?.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
  }, [active]);
  return (
    <div className="x-demo">
      <p className="x-label">Interactive demo · sanitized sample data</p>
      <div className="x-demo-grid">
        <div className="x-demo-chat">
          <p className="x-demo-q">{DEMO.question}</p>
          <p className="x-demo-a">
            {DEMO.answer.map((a, i) => (
              <span key={i}>
                {a.text}
                {a.cite && (
                  <button
                    type="button"
                    className="x-cite"
                    aria-pressed={active === a.cite}
                    aria-label={`Citation ${cites.indexOf(a.cite) + 1}: show source passage`}
                    onClick={() => setActive(active === a.cite ? null : a.cite!)}
                  >
                    {cites.indexOf(a.cite) + 1}
                  </button>
                )}
              </span>
            ))}
          </p>
        </div>
        <ol className="x-demo-doc" ref={docRef} aria-label="Source document">
          {DEMO.doc.map((p) => (
            <li key={p.id} data-p={p.id} className={active === p.id ? "is-hit" : undefined}>
              {active === p.id && <span className="sr-only">Cited passage: </span>}
              {p.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function MissionDetail({ mission: m, go, onClose }: { mission: Mission; go: Go; onClose: () => void }) {
  const list = (items: string[]) => (
    <ul className="x-list">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
  const block = (title: string, body: ReactNode) => (
    <section className="x-brief" aria-label={title}>
      <h3 className="x-h3">{title}</h3>
      {body}
    </section>
  );
  // Tabs keep every case study on one screen: no scrolling through a long page.
  const tabs: Array<{ id: string; label: string; body: ReactNode }> = [
    {
      id: "briefing",
      label: "Briefing",
      body: (
        <>
          {block("Mission briefing", <p>{m.briefing}</p>)}
          {m.problem && block("Problem statement", <p>{m.problem}</p>)}
          {block("Results", <p className="x-achieve">{m.achievement}</p>)}
        </>
      ),
    },
    {
      id: "systems",
      label: "Systems",
      body: (
        <>
          {block("Architecture", <Architecture stages={m.architecture} />)}
          {m.implementation && block("Technical implementation", list(m.implementation))}
          {m.challenges && block("Challenges", list(m.challenges))}
        </>
      ),
    },
    ...(m.demo === "citations" ? [{ id: "demo", label: "Live demo", body: <CitationDemo /> }] : []),
    {
      id: "debrief",
      label: "Debrief",
      body: (
        <>
          {m.lessons && block("Lessons learned", list(m.lessons))}
          {block(
            "Related missions",
            <div className="x-related">
              {m.related.map((id) => (
                <MissionLink key={id} id={id} go={go} />
              ))}
            </div>,
          )}
        </>
      ),
    },
  ];
  const [tab, setTab] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === tab) ?? tabs[0];
  const i = MISSIONS.indexOf(m);
  const prev = MISSIONS[(i - 1 + MISSIONS.length) % MISSIONS.length];
  const next = MISSIONS[(i + 1) % MISSIONS.length];

  return (
    <article className="x-detail">
      <header className="x-detail-head">
        <div>
          <p className="x-kicker">
            <span>Mission {m.code}</span> {i + 1} of {MISSIONS.length}
          </p>
          <h2 className="x-title">{m.title}</h2>
          <Tags list={m.tech} />
        </div>
        <button type="button" className="x-icon-btn" onClick={onClose} aria-label="Close mission">
          <X size={18} />
        </button>
      </header>
      <div className="x-tabs" role="tablist" aria-label="Mission sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`x-tab-${t.id}`}
            aria-selected={t.id === current.id}
            aria-controls="x-tabpanel"
            className="x-tab"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="x-tabpanel" role="tabpanel" id="x-tabpanel" aria-labelledby={`x-tab-${current.id}`} key={current.id}>
        {current.body}
      </div>
      <footer className="x-detail-foot">
        <button type="button" className="x-btn x-btn-sm" onClick={() => go("missions", prev.id)}>
          <ArrowLeft size={14} aria-hidden /> {prev.code} {prev.title}
        </button>
        <button type="button" className="x-btn x-btn-sm" onClick={() => go("missions", next.id)}>
          {next.code} {next.title} <ArrowRight size={14} aria-hidden />
        </button>
      </footer>
    </article>
  );
}

/* --------------------------------------------------------------- career */

export function Career({ go, selected }: { go: Go; selected?: string }) {
  const stage = CAREER.find((c) => c.id === selected) ?? CAREER[CAREER.length - 1];
  return (
    <>
      <Head index="04" title="Career log" note="A progression through engineering environments. Select a stage." />
      <ol className="x-timeline">
        {CAREER.map((c, i) => (
          <li key={c.id} style={{ "--i": i } as CSSProperties}>
            <button type="button" aria-current={c.id === stage.id ? "step" : undefined} onClick={() => go("career", c.id)}>
              <span className="x-card-index">Stage {c.stage}</span>
              <span className="x-card-title">{c.org}</span>
              <span className="x-muted">{c.role}</span>
            </button>
          </li>
        ))}
      </ol>
      <section className="x-panel x-stage" aria-live="polite" aria-label={`${stage.org} details`} key={stage.id}>
        <p className="x-kicker">
          <span>Stage {stage.stage}</span> {stage.period ?? "Dates on the resume"}
        </p>
        <h2 className="x-h2">{stage.org}</h2>
        <p className="x-hero-role">{stage.role}</p>
        {stage.summary ? <p>{stage.summary}</p> : <p className="x-muted">Details on the resume.</p>}
        {stage.tech.length > 0 && <Tags list={stage.tech} />}
      </section>
    </>
  );
}

/* --------------------------------------------------------- achievements */

function Burst() {
  return (
    <span className="x-burst" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <i key={i} style={{ "--a": `${i * 36}deg` } as CSSProperties} />
      ))}
    </span>
  );
}

export function Achievements() {
  const [fired, setFired] = useState<{ id: string; n: number } | null>(null);
  return (
    <>
      <Head index="05" title="Achievement room" note="Measurable impact and certifications held. Nothing here is decorative." />
      <ul className="x-achievements">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.id}>
            <div className={`x-panel x-badge ${fired?.id === a.id ? "is-fired" : ""}`}>
              <button
                type="button"
                className="x-badge-icon"
                aria-label={`Activate ${a.title} badge`}
                onClick={() => setFired({ id: a.id, n: (fired?.n ?? 0) + 1 })}
              >
                <Award size={22} aria-hidden />
                {fired?.id === a.id && <Burst key={fired.n} />}
              </button>
              <h2 className="x-h3">{a.title}</h2>
              <p className="x-muted">{a.evidence}</p>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="x-h2 x-gap">Certifications</h2>
      <ul className="x-certs">
        {CERTIFICATIONS.map((c) => (
          <li key={c.title} className="x-panel">
            <ShieldCheck size={20} aria-hidden className="x-ok" />
            <div>
              <p className="x-card-title">{c.title}</p>
              <p className="x-muted">{c.issuer}</p>
            </div>
            <a className="x-btn x-btn-sm" href={c.href} target="_blank" rel="noopener noreferrer">
              Verify <ExternalLink size={14} aria-hidden />
              <span className="sr-only">{c.title} (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------------------------------------------------------- comms */

export function Comms() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <Head index="06" title="Incoming transmission" />
      <div className="x-split">
        <section className="x-panel">
          <p className="x-lede">Looking for an engineer to build something meaningful? Let&rsquo;s talk.</p>
          <div className="x-actions x-actions-col">
            <a className="x-btn x-btn-primary" href={`mailto:${CONTACT.email}`}>
              <Mail size={16} aria-hidden /> {CONTACT.email}
            </a>
            <a className="x-btn" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedinIcon size={16} /> Connect on LinkedIn
            </a>
            <a className="x-btn" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <GithubIcon size={16} /> View GitHub
            </a>
            <ResumeButton className="x-btn" />
          </div>
        </section>
        {/* shortcut: no backend, so the form opens the visitor's mail client; add an API route if submissions should be stored. */}
        <form
          className="x-panel x-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`;
            window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(String(f.get("subject")))}&body=${encodeURIComponent(body)}`;
            setSent(true);
          }}
        >
          <h2 className="x-h2">Send message</h2>
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Subject
            <input name="subject" required />
          </label>
          <label>
            Message
            <textarea name="message" required rows={3} />
          </label>
          <button type="submit" className="x-btn x-btn-primary">
            Transmit
          </button>
          <p className="x-muted" role="status">
            {sent ? "Your mail app should open with the message ready to send." : ""}
          </p>
        </form>
      </div>
    </>
  );
}
