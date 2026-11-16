"use client";

import { ExternalLink, Rocket, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { GithubIcon } from "../ui/BrandIcons";
import { hush, sfx } from "./audio";
import type { Mission } from "./data";
import { Head, useArcade } from "./ExeScreens";
import { Player, Stars } from "./GameWorld";

// Side-view hangar, in design units; the room scales to fit the screen (and follows the engineer on
// phones). One rocket per mission stands on its own pad. The engineer walks to a rocket, a blueprint
// hologram opens, and "Launch demo" sends it through a roof hatch before the project opens.
const FLOOR = 640;
const ROOM_H = FLOOR + 80;
const ROOF = 44;
const DOOR = { x: 40, w: 96, h: 215 };
const DOOR_X = DOOR.x + DOOR.w / 2;
const ENTRY_X = 230; // where he waits by the door
const FIRST = 360;
const GAP = 240;
const PAD_H = 14;
const SPEED = 780;
const LIFT_EASE = "cubic-bezier(0.45, 0, 0.9, 0.6)"; // matches the rocket's own climb in exe.css
const COLORS = ["#43d5ff", "#a77bff", "#48d9a0", "#ffd23f", "#ff85e6", "#ff9a57", "#93c5fd", "#f472b6"];

const rocketH = (i: number) => 300 + (i % 3) * 34;
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const isSource = (l: { title: string; url: string }) => /github\.com/i.test(l.url) || /source/i.test(l.title);
/** The link a launch opens: the live project if there is one, otherwise the source code. */
const launchLink = (m: Mission) => m.links.find((l) => !isSource(l)) ?? m.links[0];

function RocketArt({ h, kind }: { h: number; kind: number }) {
  const nose = kind % 2 ? 78 : 96; // two nose-cone shapes
  const finH = 70 + (kind % 3) * 14;
  return (
    <svg viewBox={`-20 0 104 ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`hg-body-${kind}`} x1="0" x2="1">
          <stop offset="0" stopColor="#9fb0d4" />
          <stop offset="0.45" stopColor="#f4f7ff" />
          <stop offset="1" stopColor="#7d8db3" />
        </linearGradient>
      </defs>
      {/* fins */}
      <path d={`M12 ${h - 60 - finH} L-16 ${h - 34} L-16 ${h - 16} L12 ${h - 60} Z`} fill="var(--bc)" />
      <path d={`M52 ${h - 60 - finH} L80 ${h - 34} L80 ${h - 16} L52 ${h - 60} Z`} fill="var(--bc)" />
      {/* nozzle */}
      <path d={`M20 ${h - 26} L44 ${h - 26} L52 ${h - 4} L12 ${h - 4} Z`} fill="#2a3350" />
      {/* body */}
      <path d={`M32 2 C50 ${nose * 0.3}, 52 ${nose * 0.7}, 52 ${nose} L52 ${h - 26} L12 ${h - 26} L12 ${nose} C12 ${nose * 0.7}, 14 ${nose * 0.3}, 32 2 Z`} fill={`url(#hg-body-${kind})`} stroke="#5a6a92" strokeWidth="1.5" />
      <rect x="12" y={nose + 20} width="40" height="16" fill="var(--bc)" opacity="0.9" />
      <rect x="12" y={h - 70} width="40" height="6" fill="var(--bc)" opacity="0.7" />
      <circle cx="32" cy={nose - 22} r="10" fill="#0b1a3a" stroke="var(--bc)" strokeWidth="3" />
      <circle cx="29" cy={nose - 25} r="3" fill="#7fd8ff" opacity="0.7" />
    </svg>
  );
}

type Walker = { x: number; facing: 1 | -1; walking: boolean; dur: number; visible: boolean };
type Launch = { i: number; stage: "prep" | "ignite" | "lift" | "gone" | "back" } | null;

export function Hangar() {
  const missions = useArcade().missions;
  const n = missions.length;
  const [vp, setVp] = useState({ w: 0, h: 0 });
  // On a phone the whole hangar fits the screen: rockets stand closer together and the camera never pans.
  const compact = vp.w > 0 && vp.w < 640;
  const first = compact ? 330 : FIRST;
  const gap = compact ? 140 : GAP;
  const rocketX = (i: number) => first + i * gap;
  const ROOM_W = compact ? first + Math.max(0, n - 1) * gap + 110 : Math.max(1200, FIRST + Math.max(0, n - 1) * GAP + 220);
  const ro = useRef<ResizeObserver | null>(null);
  const viewportRef = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.current.observe(el);
  }, []);

  const [door, setDoor] = useState(false);
  const [status, setStatus] = useState("");
  const [walker, setWalker] = useState<Walker | null>(null);
  const walkerRef = useRef(walker);
  walkerRef.current = walker;
  const [sel, setSel] = useState<number | null>(null); // rocket the engineer is at / heading to
  const [panel, setPanel] = useState<number | null>(null); // rocket whose blueprint is open
  const [launch, setLaunch] = useState<Launch>(null);
  const [hatch, setHatch] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [blocked, setBlocked] = useState<{ title: string; url: string } | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const runId = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const cancel = () => {
    runId.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const place = (w: Walker | null) => {
    walkerRef.current = w;
    setWalker(w);
  };

  /** A cancellable sequence: `wait` and `walkTo` reject once something newer has started. */
  const seq = (steps: (io: { wait: (ms: number) => Promise<void>; walkTo: (x: number) => Promise<void> }) => Promise<void>) => {
    cancel();
    const run = runId.current;
    const wait = (ms: number) => new Promise<void>((res, rej) => later(() => (runId.current === run ? res() : rej(new Error("cancelled"))), ms));
    const walkTo = async (x: number) => {
      const from = walkerRef.current;
      if (!from) return;
      const dur = reduceMotion() ? 0 : Math.max(200, (Math.abs(x - from.x) / SPEED) * 1000);
      const facing = x < from.x - 2 ? -1 : x > from.x + 2 ? 1 : from.facing;
      place({ ...from, x, facing, walking: dur > 0, dur });
      sfx.walk(dur);
      await wait(dur);
      place({ ...walkerRef.current!, walking: false });
      await wait(30);
    };
    steps({ wait, walkTo }).catch(() => {});
  };

  // Entrance: the door opens, the engineer steps in and waits by it.
  useEffect(() => {
    if (reduceMotion()) {
      place({ x: ENTRY_X, facing: 1, walking: false, dur: 0, visible: true });
      setStatus("Launch pad · pick a rocket");
      return;
    }
    seq(async ({ wait, walkTo }) => {
      await wait(700);
      setStatus("Engineer entering the launch pad");
      setDoor(true);
      await wait(380);
      place({ x: DOOR_X, facing: 1, walking: false, dur: 0, visible: false });
      await wait(40);
      place({ ...walkerRef.current!, visible: true });
      await wait(260);
      await walkTo(ENTRY_X);
      setDoor(false);
      setStatus("Launch pad · pick a rocket");
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = launch !== null;

  const pick = (i: number) => {
    if (busy) return;
    if (!walkerRef.current?.visible) {
      place({ x: ENTRY_X, facing: 1, walking: false, dur: 0, visible: true });
      setDoor(false);
    }
    setPanel(null);
    setSel(i);
    const m = missions[i];
    seq(async ({ walkTo }) => {
      setStatus(`Walking to ${m.title}`);
      await walkTo(rocketX(i) - 84);
      place({ ...walkerRef.current!, facing: 1 });
      sfx.lock(); // heavy mechanical lock as the blueprint opens
      setPanel(i);
      setStatus(`Mission ${m.code} · blueprint on screen`);
    });
  };

  const closePanel = () => {
    if (busy) return;
    cancel();
    setPanel(null);
    setSel(null);
    setStatus("Launch pad · pick a rocket");
  };

  useEffect(() => {
    if (panel !== null) panelRef.current?.focus({ preventScroll: true });
  }, [panel]);

  // Shrink the blueprint's text step by step until all of it fits the box (no scrolling), down to a readable floor.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || panel === null) return;
    let fs = 13;
    el.style.fontSize = `${fs}px`;
    while (el.scrollHeight > el.clientHeight + 1 && fs > 10.5) {
      fs -= 0.5;
      el.style.fontSize = `${fs}px`;
    }
  }, [panel, vp.w, vp.h]);

  const openLink = (l: { title: string; url: string }) => {
    const w = window.open(l.url, "_blank");
    if (w) w.opener = null;
    else setBlocked(l); // pop-up blocked: offer a real link instead
  };

  const doLaunch = (i: number) => {
    if (busy) return;
    const m = missions[i];
    const link = launchLink(m);
    if (!link) return;
    setPanel(null);
    setBlocked(null);
    if (reduceMotion()) {
      openLink(link);
      return;
    }
    seq(async ({ wait, walkTo }) => {
      setStatus("Clearing the pad");
      setLaunch({ i, stage: "prep" }); // marks the pad busy
      await walkTo(Math.max(ENTRY_X, rocketX(i) - 300));
      place({ ...walkerRef.current!, facing: 1 });
      sfx.klaxon();
      for (const t of [3, 2, 1]) {
        setCount(t);
        setStatus(`T-minus ${t}`);
        if (t === 2) setHatch(i);
        await wait(750);
      }
      setCount(0);
      setStatus("Ignition");
      sfx.roar(3.3); // swells to its peak right at the whiteout
      setLaunch({ i, stage: "ignite" });
      await wait(1000);
      setStatus("Liftoff");
      setLaunch({ i, stage: "lift" });
      await wait(2300);
      setFlash(true); // thruster flash: whiteout
      await wait(300);
      hush(3200); // cut to silence so the demo has the floor
      setStatus(`${m.title} launched`);
      openLink(link);
      setLaunch({ i, stage: "gone" });
      later(() => setFlash(false), 250);
      await wait(900);
      setHatch(null);
      await wait(500);
      setLaunch({ i, stage: "back" });
      await wait(1000);
      setLaunch(null);
      setSel(null);
      setStatus("Launch pad · pick a rocket");
    });
  };

  /** Leave: walk to the door and out, then the scene fades away. */
  const exiting = useRef(false);
  const leave = (el?: Element | null) => {
    if (exiting.current) return;
    exiting.current = true;
    const w = walkerRef.current;
    setPanel(null);
    seq(async ({ wait, walkTo }) => {
      if (w?.visible && !reduceMotion()) {
        setStatus("Leaving the launch pad");
        setDoor(true);
        await walkTo(DOOR_X);
        place({ ...walkerRef.current!, visible: false });
        await wait(420);
      }
      const d = el ?? document.querySelector(".room-door");
      const scene = d?.closest<HTMLElement>(".scene");
      const r = d?.getBoundingClientRect();
      if (r) {
        scene?.style.setProperty("--iris-x", `${r.left + r.width / 2}px`);
        scene?.style.setProperty("--iris-y", `${r.top + r.height / 2}px`);
      }
      window.location.hash = "/home";
    });
  };
  const leaveRef = useRef(leave);
  leaveRef.current = leave;
  const closeRef = useRef(closePanel);
  closeRef.current = closePanel;
  const panelOpen = useRef(false);
  panelOpen.current = panel !== null;
  useEffect(() => {
    const onExit = (e: Event) => {
      e.preventDefault();
      leaveRef.current();
    };
    // Escape closes an open blueprint first; a second Escape leaves.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelOpen.current) {
        e.preventDefault();
        closeRef.current();
      }
    };
    window.addEventListener("exe-scene-exit", onExit);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("exe-scene-exit", onExit);
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  // Camera: the whole hangar when it fits; on a narrow screen it keeps a readable size and follows the engineer.
  const fit = vp.w ? Math.min(vp.w / ROOM_W, vp.h / ROOM_H) * (compact ? 0.97 : 0.92) : 0.5;
  const k = vp.w ? (compact ? fit : Math.max(fit, Math.min(0.55, (vp.h / ROOM_H) * 0.92))) : 0.5;
  const wx = walker?.x ?? ENTRY_X;
  const tx = ROOM_W * k <= vp.w ? (vp.w - ROOM_W * k) / 2 : Math.min(0, Math.max(vp.w - ROOM_W * k, vp.w / 2 - wx * k));
  const ty = (vp.h - ROOM_H * k) / 2;
  // how far a rocket must climb to clear the top of the screen (design units), so its ascent is always on screen
  // The camera tilts down to follow it up (CAM of the climb), so the ascent stays on screen for longer.
  const CAM = 0.45;
  const rise = (ty / k + FLOOR - PAD_H + 60) / (1 - CAM);
  const lifting = launch?.stage === "lift";
  const tyCam = ty + (lifting ? rise * k * CAM : 0);
  const roomMove = ROOM_W * k > vp.w && walker?.walking ? walker.dur : 450;

  const open = panel !== null ? missions[panel] : null;
  const openLinks = open?.links ?? [];
  const primary = open ? launchLink(open) : undefined;
  const side = panel !== null && vp.w ? (tx + rocketX(panel) * k < vp.w / 2 ? "is-right" : "is-left") : "is-right";

  if (!n) return <Head index="03" title="Launch pad" note="No missions published yet." />;

  return (
    <>
      <Head index="03" title="Launch pad" note={`${n} rockets on the pad, one per mission. Walk up to one to open its blueprint.`} />
      <div className={`lab-viewport hg-viewport${launch ? ` is-${launch.stage}` : ""}`} ref={viewportRef}>
        <Stars />
        <div
          className={`lab-room hg-room${compact ? " is-compact" : ""}`}
          style={{ width: ROOM_W, height: ROOM_H, transform: `translate(${tx}px, ${tyCam}px) scale(${k})`, transition: lifting ? `transform 2600ms ${LIFT_EASE}` : `transform ${roomMove}ms linear` } as CSSProperties}
        >
          <span className="room-wall hg-wall" style={{ top: ROOF }} aria-hidden />
          <span className="hg-roof" style={{ height: ROOF }} aria-hidden />
          {missions.map((m, i) => (
            <span key={m.id} className={`hg-hatch${hatch === i ? " is-open" : ""}`} style={{ left: rocketX(i) - 70, height: ROOF }} aria-hidden>
              <i className="hg-hole" />
              <i className="hg-plate hg-plate-l" />
              <i className="hg-plate hg-plate-r" />
            </span>
          ))}
          <span className="room-floor hg-floor" style={{ top: FLOOR }} aria-hidden />

          <button
            type="button"
            className={`room-door${door ? " is-open" : ""}`}
            style={{ left: DOOR.x, top: FLOOR - DOOR.h, width: DOOR.w, height: DOOR.h }}
            onClick={(e) => leave(e.currentTarget)}
            aria-label="Leave the launch pad through the door"
          >
            <span className="room-door-gap" />
            <span className="room-door-panel">
              <i />
            </span>
            <span className="room-door-sign">Exit</span>
          </button>

          {missions.map((m, i) => {
            const x = rocketX(i);
            const h = rocketH(i);
            const stage = launch?.i === i ? launch.stage : null;
            const cls = stage && stage !== "prep" ? ` is-${stage}` : "";
            return (
              <span key={m.id}>
                <span className="hg-pad" style={{ left: x - 84, top: FLOOR - PAD_H, width: 168, height: PAD_H, "--bc": COLORS[i % COLORS.length] } as CSSProperties} aria-hidden />
                <button
                  type="button"
                  className={`hg-rocket${sel === i ? " is-sel" : ""}${cls}`}
                  style={{ left: x - 46, top: FLOOR - PAD_H - h, width: 92, height: h, "--bc": COLORS[i % COLORS.length], "--rise": `${-rise}px` } as CSSProperties}
                  onClick={() => pick(i)}
                  aria-label={`Mission ${m.code}: ${m.title}. Walk to this rocket`}
                  aria-pressed={sel === i}
                >
                  <RocketArt h={h} kind={i} />
                  <span className="hg-flame" aria-hidden />
                </button>
                <span className="hg-tag" style={{ left: x - (compact ? gap - 8 : 220) / 2, top: FLOOR + 22, width: compact ? gap - 8 : 220, "--bc": COLORS[i % COLORS.length] } as CSSProperties} aria-hidden>
                  <b>{m.code}</b> {m.title}
                </span>
              </span>
            );
          })}

          {walker && (
            <span
              className={`lab-walker${walker.walking ? " is-walking" : ""}${walker.visible ? "" : " is-hidden"}`}
              style={{ transform: `translate(${walker.x}px, ${FLOOR}px)`, transitionDuration: `${walker.dur}ms` }}
              aria-hidden
            >
              <span className="lab-walker-body" style={{ transform: `scaleX(${walker.facing})` }}>
                <Player gradId="plv-hangar" />
              </span>
            </span>
          )}
        </div>

        {open && panel !== null && (
          <section
            key={open.id}
            ref={panelRef}
            tabIndex={-1}
            className={`hg-holo ${side}`}
            style={{ "--bc": COLORS[panel % COLORS.length] } as CSSProperties}
            aria-label={`Mission ${open.code} blueprint: ${open.title}`}
          >
            <header className="hg-holo-head">
              <div>
                <p className="x-kicker">
                  <span>Mission {open.code}</span> {[open.domain, open.featured ? "Featured" : null].filter(Boolean).join(" · ") || "Project"}
                </p>
                <h2 className="hg-holo-title">{open.title}</h2>
              </div>
              <button type="button" className="x-icon-btn" onClick={closePanel} aria-label="Close blueprint (Esc)">
                <X size={16} aria-hidden />
              </button>
            </header>
            {open.tech.length > 0 && (
              <ul className="hg-tags" aria-label="Tech stack">
                {open.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <div className="hg-holo-body">
              {open.briefing.split(/\n\s*\n/).map((t, j) => (
                <p key={j}>{t}</p>
              ))}
              {open.achievement && <p className="x-achieve">{open.achievement}</p>}
              {open.implementation.length > 0 && (
                <div>
                  <p className="x-label">Architecture</p>
                  <ul className="x-list">
                    {open.implementation.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="hg-holo-actions">
              {primary && (
                <button type="button" className="x-btn x-btn-primary x-btn-sm" onClick={() => doLaunch(panel)}>
                  <Rocket size={14} aria-hidden /> {isSource(primary) ? "Launch source" : "Launch demo"}
                </button>
              )}
              {openLinks.map((l) => (
                <a key={l.url} className="x-btn x-btn-sm" href={l.url} target="_blank" rel="noopener noreferrer">
                  {isSource(l) ? <GithubIcon size={14} /> : <ExternalLink size={14} aria-hidden />} {l.title}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="hg-smoke" aria-hidden />
        <div className={`hg-flash${flash ? " is-on" : ""}`} aria-hidden />

        {count > 0 && (
          <div className="hg-count" aria-hidden>
            {count}
          </div>
        )}

        <div className="room-hud">
          <span className="room-status" aria-live="polite">
            <b>{n}</b> {status || "Preparing the launch pad"}
          </span>
          {blocked && (
            <a className="x-btn x-btn-primary x-btn-sm" href={blocked.url} target="_blank" rel="noopener noreferrer">
              Pop-up blocked. Open {blocked.title} <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
