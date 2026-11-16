"use client";

import { Command, DoorOpen, Home as HomeIcon, Layers, Mail, Rocket, SquareTerminal, Workflow } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { type ArcadeData, type Mission, DISTRICTS, EXE_SESSION_KEY, EXE_SKIP_KEY, EXE_VISITED_KEY, PROFILE, SECTIONS, type SectionId } from "./data";
import { Achievements, Career, Comms, MissionDetail, Missions, ArcadeContext, ResumeButton, useArcade, type Go } from "./ExeScreens";
import { Skills } from "./SkillTree";
import { Profile } from "./Lab";
import { GameWorld, Player } from "./GameWorld";
import { otherEditions } from "@/lib/editions";


/* -------------------------------------------------------------- routing */
// The URL hash is the single source of truth for navigation: #/missions/clinical-ai.
// Back/forward and shared links work without a router or state library.

interface Route {
  section: SectionId;
  id?: string;
}

function parseHash(): Route {
  const [s, id] = window.location.hash.replace(/^#\/?/, "").split("/");
  const section = SECTIONS.some((x) => x.id === s) ? (s as SectionId) : "home";
  return { section, id: id || undefined };
}

const go: Go = (section, id) => {
  window.location.hash = id ? `/${section}/${id}` : `/${section}`;
};

function useRoute() {
  const [route, setRoute] = useState<Route>({ section: "home" });
  useEffect(() => {
    const read = () => setRoute(parseHash());
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return route;
}

function downloadResume(url?: string) {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.click();
}

/* --------------------------------------------------------------- dialog */
// Native <dialog>: focus trap, Escape, inert background and focus restore come from the platform.

function Dialog({
  open,
  onClose,
  label,
  className,
  color,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className: string;
  /** Neon accent for this overlay; the CSS derives borders, glows and buttons from it. */
  color: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // showModal focuses the first focusable (the close button); text inputs should win.
      d.querySelector("input")?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={className}
      style={{ "--c": color } as CSSProperties}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && children}
    </dialog>
  );
}

/** Rooms that open as full-page game scenes instead of overlays. */
const SCENES: SectionId[] = ["profile", "skills"];
const SCENE_EXIT_MS = 480;

const MISSION_COLOR = DISTRICTS.find((d) => d.id === "missions")!.color;

/* ----------------------------------------------------------------- boot */

const BOOT_LINES = [
  "INITIALIZING BABAFEMI.EXE...",
  "[OK] Loading engineering profile",
  "[OK] Loading project archives",
  "[OK] Loading technical systems",
  "[OK] Establishing connection",
  "SYSTEM READY.",
  "WELCOME, EXPLORER.",
];

function Boot({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const remember = useRef(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(EXE_SESSION_KEY, "1");
      if (remember.current) localStorage.setItem(EXE_SKIP_KEY, "1");
    } catch {}
    document.documentElement.dataset.exeBoot = "done";
    onDone();
  }, [onDone]);

  useEffect(() => {
    // The pre-paint script already decided; a hidden overlay must not hold the page.
    if (document.documentElement.dataset.exeBoot !== "run") {
      finish();
      return;
    }
    const timers = BOOT_LINES.map((_, i) => window.setTimeout(() => setShown(i + 1), 150 + i * 260));
    timers.push(window.setTimeout(finish, 150 + BOOT_LINES.length * 260 + 600));
    const onKey = (e: KeyboardEvent) => (e.key === "Enter" || e.key === "Escape") && finish();
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  const pct = Math.round((shown / BOOT_LINES.length) * 100);
  return (
    <div className="exe-boot" role="dialog" aria-modal="true" aria-label="Title screen">
      <div className="gw-sky" aria-hidden />
      <div className="gw-sun boot-sun" aria-hidden />
      <div className="boot-floor" aria-hidden />
      <div className="exe-boot-inner">
        <p className="boot-kicker">Personal engineering universe</p>
        <h2 className="exe-boot-logo">
          BABAFEMI<span>.exe</span>
        </h2>
        <p className="boot-tagline">{PROFILE.tagline}</p>

        <div className="boot-load">
          <div
            className="boot-bar"
            role="progressbar"
            aria-label="Loading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="boot-status" aria-live="polite">
            {BOOT_LINES[Math.max(0, shown - 1)]}
          </p>
        </div>

        <button type="button" className="x-btn x-btn-primary boot-start" onClick={finish} autoFocus>
          {shown >= BOOT_LINES.length ? "Press start" : "Skip intro"} <kbd>Enter</kbd>
        </button>
        <label className="x-check boot-check">
          <input type="checkbox" onChange={(e) => (remember.current = e.target.checked)} /> Skip intro on future visits
        </label>
      </div>
      <div className="boot-hero is-walking" aria-hidden>
        <Player gradId="plv-boot" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- command palette */

interface Action {
  label: string;
  hint: string;
  run: () => void;
}

function useActions(openTerminal: () => void, { missions, contact }: ArcadeData): Action[] {
  return [
    ...SECTIONS.map((s) => ({ label: `Open ${s.label}`, hint: s.blurb, run: () => go(s.id) })),
    ...missions.map((m) => ({ label: `Mission ${m.code}: ${m.title}`, hint: m.tech.join(" · "), run: () => go("missions", m.id) })),
    ...(contact.resume ? [{ label: "Download Resume", hint: "PDF", run: () => downloadResume(contact.resume) }] : []),
    { label: "Contact Babafemi", hint: contact.email, run: () => go("comms") },
    ...(contact.linkedin ? [{ label: "Open LinkedIn", hint: "New tab", run: () => window.open(contact.linkedin, "_blank", "noopener") }] : []),
    ...(contact.github ? [{ label: "Open GitHub", hint: "New tab", run: () => window.open(contact.github, "_blank", "noopener") }] : []),
    { label: "Open Terminal", hint: "~", run: openTerminal },
  ];
}

function Palette({ actions, close }: { actions: Action[]; close: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const list = actions.filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(q.toLowerCase()));
  const pick = (a?: Action) => {
    if (!a) return;
    close();
    a.run();
  };
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") setI((n) => Math.min(n + 1, list.length - 1));
    else if (e.key === "ArrowUp") setI((n) => Math.max(n - 1, 0));
    else if (e.key === "Enter") pick(list[i]);
    else return;
    e.preventDefault();
  };
  return (
    <div className="x-palette">
      <input
        autoFocus
        className="x-palette-input"
        placeholder="Type a command…"
        role="combobox"
        aria-expanded="true"
        aria-controls="x-palette-list"
        aria-activedescendant={list[i] ? `x-pal-${i}` : undefined}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setI(0);
        }}
        onKeyDown={onKey}
      />
      <ul id="x-palette-list" role="listbox" className="x-palette-list">
        {list.map((a, n) => (
          <li
            key={a.label}
            id={`x-pal-${n}`}
            role="option"
            aria-selected={n === i}
            onMouseEnter={() => setI(n)}
            onClick={() => pick(a)}
          >
            <span>&gt; {a.label}</span>
            <span className="x-muted">{a.hint}</span>
          </li>
        ))}
        {!list.length && <li className="x-muted">No matching command.</li>}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- terminal */

const TERMINAL_ROUTES: Record<string, SectionId> = {
  home: "home",
  whoami: "profile",
  projects: "missions",
  missions: "missions",
  skills: "skills",
  experience: "career",
  career: "career",
  achievements: "achievements",
  contact: "comms",
};

const help = (missions: Mission[]) => `Available commands:
  help            Show available commands
  whoami          Open profile
  projects        Open mission archive
  mission <id>    Open a mission (${missions.map((m) => m.code).join(", ")} or slug)
  skills          Open skill tree
  experience      Open career history
  achievements    Open achievement room
  resume          Download resume
  contact         Open communication hub
  home            Return to Mission Control
  clear           Clear terminal
  exit            Close terminal`;

export function runTerminal(line: string, close: () => void, { missions, contact }: ArcadeData): string | null {
  const [cmd = "", arg] = line.trim().toLowerCase().split(/\s+/);
  if (!cmd) return "";
  if (cmd === "clear") return null;
  if (cmd === "help") return help(missions);
  if (cmd === "exit") {
    close();
    return "";
  }
  if (cmd === "resume") {
    if (!contact.resume) return "resume: no resume is published yet.";
    downloadResume(contact.resume);
    return "Downloading resume…";
  }
  if (cmd === "mission") {
    const m = missions.find((x) => x.code === arg || x.code === arg?.padStart(3, "0") || x.id === arg);
    if (!m) return `mission: unknown id "${arg ?? ""}". Try: ${missions.map((x) => x.id).join(", ")}`;
    go("missions", m.id);
    close();
    return `Opening mission ${m.code}: ${m.title}`;
  }
  const section = TERMINAL_ROUTES[cmd];
  if (section) {
    go(section);
    if (cmd !== "whoami") close();
    return cmd === "whoami" ? `${PROFILE.name} — ${PROFILE.role}, ${PROFILE.location}` : `Opening ${SECTIONS.find((s) => s.id === section)!.label}…`;
  }
  return `command not found: ${cmd}. Type "help".`;
}

function Terminal({ close }: { close: () => void }) {
  const data = useArcade();
  const [lines, setLines] = useState<string[]>(['BABAFEMI.exe shell — type "help" to list commands.']);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [value, setValue] = useState("");
  const outRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, [lines]);
  return (
    <div className="x-term">
      <div className="x-term-bar">
        <span>guest@babafemi.exe</span>
        <button type="button" className="x-icon-btn" onClick={close} aria-label="Close terminal">
          ×
        </button>
      </div>
      <div className="x-term-out" ref={outRef} role="log" aria-live="polite">
        {lines.map((l, n) => (
          <pre key={n}>{l}</pre>
        ))}
      </div>
      <form
        className="x-term-in"
        onSubmit={(e) => {
          e.preventDefault();
          const out = runTerminal(value, close, data);
          setLines((ls) => (out === null ? [] : [...ls, `$ ${value}`, ...(out ? [out] : [])]));
          if (value.trim()) setHistory((h) => [value, ...h]);
          setCursor(-1);
          setValue("");
        }}
      >
        <label htmlFor="x-term-input">$</label>
        <input
          id="x-term-input"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            e.preventDefault();
            const next = Math.max(-1, Math.min(history.length - 1, cursor + (e.key === "ArrowUp" ? 1 : -1)));
            setCursor(next);
            setValue(next < 0 ? "" : history[next]);
          }}
        />
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- shell */

const BOTTOM_NAV: Array<{ id: SectionId; icon: ReactNode }> = [
  { id: "home", icon: <HomeIcon size={18} aria-hidden /> },
  { id: "skills", icon: <Workflow size={18} aria-hidden /> },
  { id: "missions", icon: <Rocket size={18} aria-hidden /> },
  { id: "career", icon: <Layers size={18} aria-hidden /> },
  { id: "comms", icon: <Mail size={18} aria-hidden /> },
];

export function ExePortfolio({ data }: { data: ArcadeData }) {
  const { missions } = data;
  const route = useRoute();
  const [booting, setBooting] = useState(true);
  const [palette, setPalette] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const openTerminal = useCallback(() => setTerminal(true), []);
  const actions = useActions(openTerminal, data);
  // Only navigate on close if the hash still names a mission; Back may already have moved on.
  const closeMission = () => parseHash().id && go("missions");
  const mission = route.section === "missions" && route.id ? missions.find((m) => m.id === route.id) : undefined;
  const district = DISTRICTS.find((d) => d.id === route.section);
  // Same guard as missions: only head home if the hash still points inside a building.
  const closeInterior = () => parseHash().section !== "home" && go("home");

  // Full-page scenes (not overlays): kept mounted while their exit animation plays.
  const [scene, setScene] = useState<{ id: SectionId; leaving: boolean } | null>(null);
  useEffect(() => {
    if (SCENES.includes(route.section)) setScene({ id: route.section, leaving: false });
    else setScene((s) => (s && !s.leaving ? { ...s, leaving: true } : s));
  }, [route.section]);
  useEffect(() => {
    if (!scene?.leaving) return;
    const t = window.setTimeout(() => setScene(null), SCENE_EXIT_MS);
    return () => clearTimeout(t);
  }, [scene]);
  useEffect(() => {
    if (!scene || scene.leaving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || document.querySelector("dialog[open]")) return;
      if (e.target instanceof Element && e.target.closest("input, textarea")) return;
      closeInterior();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene]);
  const covered = !!scene && !scene.leaving;
  const sceneDistrict = scene ? DISTRICTS.find((d) => d.id === scene.id) : undefined;
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      setVisited(new Set(JSON.parse(localStorage.getItem(EXE_VISITED_KEY) ?? "[]")));
    } catch {}
  }, []);

  useEffect(() => {
    if (route.section === "home") return;
    setVisited((prev) => {
      if (prev.has(route.section)) return prev;
      const next = new Set(prev).add(route.section);
      try {
        localStorage.setItem(EXE_VISITED_KEY, JSON.stringify([...next]));
      } catch {}
      if (next.size === DISTRICTS.length) setToast("Achievement unlocked: World Explorer. Every district visited!");
      return next;
    });
  }, [route.section]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.documentElement.classList.add("exe-html");
    return () => document.documentElement.classList.remove("exe-html");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTerminal(false);
        setPalette((p) => !p);
        return;
      }
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setPalette(false);
        setTerminal((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // New screen: move focus to its title for keyboard and screen-reader users.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const root: ParentNode | null = covered ? document.querySelector(".scene:not(.is-leaving)") : mainRef.current;
    root?.querySelector<HTMLElement>("[data-screen-title]")?.focus({ preventScroll: true });
  }, [route.section, covered]);

  const screen: Record<SectionId, ReactNode> = {
    home: null,
    profile: <Profile />,
    skills: <Skills />,
    missions: <Missions />,
    career: <Career go={go} selected={route.id} />,
    achievements: <Achievements />,
    comms: <Comms />,
  };

  return (
    <ArcadeContext.Provider value={data}>
    <div className="exe">
      <a className="x-skip" href="#x-main">
        Skip to content
      </a>
      {booting && <Boot onDone={() => setBooting(false)} />}

      <header className="x-bar" inert={covered}>
        <a className="x-logo" href="#/home" aria-label="babafemicodes.dev — back to the city">
          babafemicodes<span>.dev</span>
        </a>
        <span className="x-online">
          <span className="x-dot" aria-hidden /> Online
        </span>
        <nav className="x-nav" aria-label="Primary">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#/${s.id}`} aria-current={route.section === s.id ? "page" : undefined}>
              {s.short}
            </a>
          ))}
        </nav>
        <div className="x-bar-actions">
          <button type="button" className="x-icon-btn" onClick={() => setPalette(true)} aria-label="Open command palette (Ctrl or Cmd + K)">
            <Command size={16} aria-hidden />
            <kbd className="x-hide-sm">K</kbd>
          </button>
          <button type="button" className="x-icon-btn" onClick={openTerminal} aria-label="Open terminal (~)">
            <SquareTerminal size={16} aria-hidden />
          </button>
          <ResumeButton className="x-btn x-btn-primary x-btn-sm" />
        </div>
      </header>

      <main id="x-main" ref={mainRef} inert={covered}>
        <GameWorld go={go} visited={visited} active={!booting && route.section === "home"} />
        <Dialog
          open={!!district && !SCENES.includes(district.id)}
          onClose={closeInterior}
          label={district ? `${district.name}: ${SECTIONS.find((s) => s.id === district.id)!.label}` : "Building"}
          className="x-dialog x-interior"
          color={district?.color ?? "#43D5FF"}
        >
          {district && !SCENES.includes(district.id) && (
            <div>
              <div className="x-interior-bar">
                <button type="button" className="x-icon-btn x-door-btn" onClick={closeInterior} aria-label="Back to the city" title="Back to the city">
                <DoorOpen size={20} aria-hidden />
              </button>
                <span className="x-interior-name">{district.name}</span>
              </div>
              <div className="x-main x-screen" key={route.section}>
                {screen[route.section]}
              </div>
            </div>
          )}
        </Dialog>
      </main>
      <p className="x-toast" role="status">
        {toast}
      </p>

      {scene && sceneDistrict && (
        <section
          className={`x-dialog x-interior scene scene-${scene.id}${scene.leaving ? " is-leaving" : ""}`}
          style={{ "--c": sceneDistrict.color } as CSSProperties}
          aria-label={sceneDistrict.name}
          inert={scene.leaving}
        >
          <div>
            <div className="x-interior-bar">
              <button type="button" className="x-icon-btn x-door-btn" onClick={closeInterior} aria-label="Back to the city" title="Back to the city">
                <DoorOpen size={20} aria-hidden />
              </button>
              <span className="x-interior-name">{sceneDistrict.name}</span>
            </div>
            <div className="x-main x-screen" key={scene.id}>
              {screen[scene.id]}
            </div>
          </div>
          <p className="scene-banner" aria-hidden>
            <span>Entering</span> {sceneDistrict.name}
          </p>
        </section>
      )}

      <footer className="x-foot" inert={covered}>
        <span>© 2026 Babafemi Adojutelegan · Arcade Edition</span>
        <span>
          {otherEditions("/").map((e, i) => (
            <span key={e.href}>
              {i > 0 && " · "}
              <a href={e.href}>{e.name} edition</a>
            </span>
          ))}
        </span>
      </footer>

      <nav className="x-bottom" aria-label="Primary (mobile)" inert={covered}>
        {BOTTOM_NAV.map(({ id, icon }) => (
          <a key={id} href={`#/${id}`} aria-current={route.section === id ? "page" : undefined}>
            {icon}
            <span>{SECTIONS.find((s) => s.id === id)!.short}</span>
          </a>
        ))}
      </nav>

      <Dialog open={!!mission} onClose={closeMission} label={mission ? `Mission ${mission.code}: ${mission.title}` : "Mission"} className="x-dialog x-dialog-wide" color={MISSION_COLOR}>
        {mission && <MissionDetail key={mission.id} mission={mission} go={go} onClose={closeMission} />}
      </Dialog>
      <Dialog open={palette} onClose={() => setPalette(false)} label="Command palette" className="x-dialog" color="#FF85E6">
        <Palette actions={actions} close={() => setPalette(false)} />
      </Dialog>
      <Dialog open={terminal} onClose={() => setTerminal(false)} label="Terminal" className="x-dialog x-dialog-term" color="#7CFF6B">
        <Terminal close={() => setTerminal(false)} />
      </Dialog>
    </div>
    </ArcadeContext.Provider>
  );
}
