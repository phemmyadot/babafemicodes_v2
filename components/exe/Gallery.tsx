"use client";

import { Award, ExternalLink, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { sfx } from "./audio";
import { Head, useArcade } from "./ExeScreens";
import { Player } from "./GameWorld";

// Trophy Hall: a dim museum gallery, side view. Certifications sit in glass cases on pedestals behind
// velvet ropes; achievements hang on the wall as holographic plaques. Pick one and the engineer walks
// up, a spotlight comes down on it, and a floating plaque opens with the details.
const FLOOR = 640;
const ROOM_H = FLOOR + 80;
const DOOR = { x: 40, w: 96, h: 215 };
const DOOR_X = DOOR.x + DOOR.w / 2;
const ENTRY_X = 230;
const FIRST = 330;
const PER = 230; // room per item along the hall
const PED_H = 80;
const CASE_H = 160;
const PLAQUE = { w: 190, h: 124, top: FLOOR - 460 }; // each achievement hangs as a framed picture
const SPEED = 780;
const GOLD = "#ffd23f";
const GEMS = ["#ffd23f", "#43d5ff", "#ff85e6", "#7cff6b", "#a77bff", "#ff9a57"];
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Pick = { kind: "cert" | "ach"; i: number };
type Walker = { x: number; facing: 1 | -1; walking: boolean; dur: number; visible: boolean };

/** Trophy art, one of four shapes by index. */
function TrophyArt({ kind, color }: { kind: number; color: string }) {
  const k = kind % 4;
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      {k === 0 && (
        <>
          <path d="M26 16 H74 V40 Q74 64 50 68 Q26 64 26 40 Z" fill={GOLD} />
          <path d="M26 24 Q8 24 12 40 Q16 52 30 52 M74 24 Q92 24 88 40 Q84 52 70 52" fill="none" stroke={GOLD} strokeWidth="5" />
          <rect x="45" y="68" width="10" height="14" fill="#c9a227" />
          <rect x="32" y="82" width="36" height="9" rx="2" fill="#c9a227" />
          <path d="M34 24 Q36 44 44 56" stroke="#fff7c8" strokeWidth="3" fill="none" opacity="0.7" />
        </>
      )}
      {k === 1 && (
        <>
          <polygon points="50,6 80,38 50,94 20,38" fill={color} opacity="0.85" />
          <polygon points="50,6 80,38 50,38" fill="#fff" opacity="0.35" />
          <polygon points="50,38 80,38 50,94" fill="#000" opacity="0.18" />
          <polygon points="20,38 50,38 50,6" fill="#fff" opacity="0.15" />
        </>
      )}
      {k === 2 && (
        <>
          <polygon points="34,6 50,40 66,6 76,6 56,48 44,48 24,6" fill={color} />
          <circle cx="50" cy="64" r="26" fill={GOLD} stroke="#c9a227" strokeWidth="4" />
          <circle cx="50" cy="64" r="17" fill="none" stroke="#fff7c8" strokeWidth="2" opacity="0.8" />
          <polygon points="50,50 54,60 65,60 56,67 59,78 50,71 41,78 44,67 35,60 46,60" fill="#fff7c8" />
        </>
      )}
      {k === 3 && (
        <>
          <polygon points="50,6 61,36 94,38 68,58 77,90 50,72 23,90 32,58 6,38 39,36" fill={color} />
          <polygon points="50,6 61,36 50,44 39,36" fill="#fff" opacity="0.35" />
        </>
      )}
    </svg>
  );
}

export function Gallery() {
  const { achievements, certifications } = useArcade();
  const nC = certifications.length;
  const nA = achievements.length;
  const [vp, setVp] = useState({ w: 0, h: 0 });
  // On a phone the whole hall fits the screen: items stand closer together and the camera never pans.
  const compact = vp.w > 0 && vp.w < 640;
  const first = compact ? 300 : FIRST;
  const W = Math.max(nC, nA, 4) * (compact ? 165 : PER);
  const ROOM_W = first + W + (compact ? 80 : 140);
  const plaque = compact ? { ...PLAQUE, w: 150 } : PLAQUE;
  const certX = (i: number) => first + ((i + 0.5) * W) / Math.max(1, nC);
  const achX = (i: number) => first + ((i + 0.5) * W) / Math.max(1, nA);
  const xOf = (p: Pick) => (p.kind === "cert" ? certX(p.i) : achX(p.i));

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
  const [sel, setSel] = useState<Pick | null>(null);
  const [panel, setPanel] = useState<Pick | null>(null);
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
  const seq = (steps: (io: { wait: (ms: number) => Promise<void>; walkTo: (x: number) => Promise<void> }) => Promise<void>) => {
    cancel();
    const run = runId.current;
    const wait = (ms: number) => new Promise<void>((res, rej) => later(() => (runId.current === run ? res() : rej(new Error("cancelled"))), ms));
    const walkTo = async (x: number) => {
      const w = walkerRef.current;
      if (!w) return;
      const dur = reduceMotion() ? 0 : Math.max(200, (Math.abs(x - w.x) / SPEED) * 1000);
      place({ ...w, x, facing: x < w.x - 2 ? -1 : x > w.x + 2 ? 1 : w.facing, walking: dur > 0, dur });
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
      setStatus("Trophy Hall · pick a trophy or plaque");
      return;
    }
    seq(async ({ wait, walkTo }) => {
      await wait(700);
      setStatus("Engineer entering the hall");
      setDoor(true);
      await wait(380);
      place({ x: DOOR_X, facing: 1, walking: false, dur: 0, visible: false });
      await wait(40);
      place({ ...walkerRef.current!, visible: true });
      await wait(260);
      await walkTo(ENTRY_X);
      setDoor(false);
      setStatus("Trophy Hall · pick a trophy or plaque");
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleOf = (p: Pick) => (p.kind === "cert" ? certifications[p.i].title : achievements[p.i].title);

  const pick = (p: Pick) => {
    if (!walkerRef.current?.visible) {
      place({ x: ENTRY_X, facing: 1, walking: false, dur: 0, visible: true });
      setDoor(false);
    }
    setPanel(null);
    setSel(p);
    seq(async ({ walkTo }) => {
      setStatus(`Walking to ${titleOf(p)}`);
      await walkTo(xOf(p) - (p.kind === "cert" ? 96 : 24));
      place({ ...walkerRef.current!, facing: 1 });
      sfx.spotlight(); // whoosh and shimmer as the light comes down
      if (p.kind === "cert") sfx.glass();
      setPanel(p);
      setStatus(`${titleOf(p)} · spotlight on`);
    });
  };

  const closePanel = () => {
    cancel();
    setPanel(null);
    setSel(null);
    setStatus("Trophy Hall · pick a trophy or plaque");
  };

  const exiting = useRef(false);
  const leave = (el?: Element | null) => {
    if (exiting.current) return;
    exiting.current = true;
    const w = walkerRef.current;
    setPanel(null);
    setSel(null);
    seq(async ({ wait, walkTo }) => {
      if (w?.visible && !reduceMotion()) {
        setStatus("Leaving the hall");
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

  // Items in walking order, for the arrow keys.
  const order: Pick[] = [
    ...certifications.map((_, i) => ({ kind: "cert" as const, i })),
    ...achievements.map((_, i) => ({ kind: "ach" as const, i })),
  ].sort((a, b) => xOf(a) - xOf(b) || (a.kind === "cert" ? -1 : 1));

  const live = useRef({ leave, closePanel, pick, order, sel });
  live.current = { leave, closePanel, pick, order, sel };
  useEffect(() => {
    const onExit = (e: Event) => {
      e.preventDefault();
      live.current.leave();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || document.querySelector("dialog[open]")) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;
      const { order: o, sel: s } = live.current;
      if (e.key === "Escape" && s) {
        e.preventDefault();
        live.current.closePanel();
      } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && o.length) {
        e.preventDefault();
        const at = s ? o.findIndex((p) => p.kind === s.kind && p.i === s.i) : -1;
        const next = e.key === "ArrowRight" ? (at + 1) % o.length : (at - 1 + o.length) % o.length;
        live.current.pick(o[next < 0 ? 0 : next]);
      }
    };
    window.addEventListener("exe-scene-exit", onExit);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("exe-scene-exit", onExit);
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  // Shrink the plaque's text until it all fits (no scrolling), down to a readable floor.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || !panel) return;
    let fs = 13;
    el.style.fontSize = `${fs}px`;
    while (el.scrollHeight > el.clientHeight + 1 && fs > 10.5) {
      fs -= 0.5;
      el.style.fontSize = `${fs}px`;
    }
  }, [panel, vp.w, vp.h]);
  useEffect(() => {
    if (panel) panelRef.current?.focus({ preventScroll: true });
  }, [panel]);

  // Camera: the whole hall when it fits; on a narrow screen it keeps a readable size and follows the engineer.
  const fit = vp.w ? Math.min(vp.w / ROOM_W, vp.h / ROOM_H) * (compact ? 0.97 : 0.92) : 0.5;
  const k = vp.w ? (compact ? fit : Math.max(fit, Math.min(0.55, (vp.h / ROOM_H) * 0.92))) : 0.5;
  const wx = walker?.x ?? ENTRY_X;
  const tx = ROOM_W * k <= vp.w ? (vp.w - ROOM_W * k) / 2 : Math.min(0, Math.max(vp.w - ROOM_W * k, vp.w / 2 - wx * k));
  const ty = (vp.h - ROOM_H * k) / 2;
  const roomMove = ROOM_W * k > vp.w && walker?.walking ? walker.dur : 450;

  const cert = panel?.kind === "cert" ? certifications[panel.i] : null;
  const ach = panel?.kind === "ach" ? achievements[panel.i] : null;
  const side = panel && vp.w ? (tx + xOf(panel) * k < vp.w / 2 ? "is-right" : "is-left") : "is-right";

  if (!nC && !nA) return <Head index="05" title="Trophy hall" note="Nothing published yet." />;

  return (
    <>
      <Head index="05" title="Trophy hall" note={`${nC} certifications in glass cases, ${nA} achievements on the wall. Walk up to one to inspect it.`} />
      <div className={`lab-viewport gl-viewport${sel ? " has-sel" : ""}`} ref={viewportRef}>
        <div
          className={`lab-room gl-room${compact ? " is-compact" : ""}`}
          style={{ width: ROOM_W, height: ROOM_H, transform: `translate(${tx}px, ${ty}px) scale(${k})`, transition: `transform ${roomMove}ms linear` } as CSSProperties}
        >
          <span className="room-wall gl-wall" style={{ top: 0 }} aria-hidden />
          <span className="gl-cornice" aria-hidden />
          <span className="room-floor gl-floor" style={{ top: FLOOR }} aria-hidden />

          <button
            type="button"
            className={`room-door${door ? " is-open" : ""}`}
            style={{ left: DOOR.x, top: FLOOR - DOOR.h, width: DOOR.w, height: DOOR.h }}
            onClick={(e) => leave(e.currentTarget)}
            aria-label="Leave the trophy hall through the door"
          >
            <span className="room-door-gap" />
            <span className="room-door-panel">
              <i />
            </span>
            <span className="room-door-sign">Exit</span>
          </button>

          {/* the spotlight on whatever is selected */}
          {sel && (
            <span
              className="gl-spot"
              style={{ left: xOf(sel) - 150, top: 0, width: 300, height: FLOOR, "--x": "50%" } as CSSProperties}
              aria-hidden
            />
          )}

          {/* wall plaques: achievements */}
          {achievements.map((a, i) => {
            const x = achX(i);
            const on = sel?.kind === "ach" && sel.i === i;
            return (
              <button
                key={a.id}
                type="button"
                className={`gl-plaque${on ? " is-sel" : ""}`}
                style={{ left: x - plaque.w / 2, top: plaque.top, width: plaque.w, height: plaque.h } as CSSProperties}
                onClick={() => pick({ kind: "ach", i })}
                aria-label={`Achievement: ${a.title}. Walk up and read the plaque`}
                aria-pressed={on}
              >
                <i className="gl-light" aria-hidden />
                <Award size={18} aria-hidden />
                <span>{a.title}</span>
              </button>
            );
          })}

          {/* velvet ropes between the pedestals */}
          {certifications.slice(1).map((c, j) => {
            const x0 = certX(j) + 74;
            const x1 = certX(j + 1) - 74;
            return (
              <Fragment key={`rope-${c.id}`}>
                <span className="gl-post" style={{ left: x0 - 4, top: FLOOR - 72 }} aria-hidden />
                <span className="gl-post" style={{ left: x1 - 4, top: FLOOR - 72 }} aria-hidden />
                <svg className="gl-rope" style={{ left: x0, top: FLOOR - 70, width: x1 - x0, height: 40 }} viewBox={`0 0 ${x1 - x0} 40`} preserveAspectRatio="none" aria-hidden>
                  <path d={`M0 4 Q${(x1 - x0) / 2} 36 ${x1 - x0} 4`} fill="none" stroke="#b3123a" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </Fragment>
            );
          })}

          {/* pedestals with glass cases: certifications */}
          {certifications.map((c, i) => {
            const x = certX(i);
            const on = sel?.kind === "cert" && sel.i === i;
            const color = GEMS[i % GEMS.length];
            return (
              <Fragment key={c.id}>
                <span className="gl-ped" style={{ left: x - 60, top: FLOOR - PED_H, width: 120, height: PED_H }} aria-hidden>
                  <i />
                </span>
                <button
                  type="button"
                  className={`gl-trophy${on ? " is-sel" : ""}`}
                  style={{ left: x - 60, top: FLOOR - PED_H - CASE_H, width: 120, height: CASE_H, "--gc": color } as CSSProperties}
                  onClick={() => pick({ kind: "cert", i })}
                  aria-label={`Certification: ${c.title}. Walk up and inspect it`}
                  aria-pressed={on}
                >
                  <span className="gl-case" />
                  <span className="gl-art">
                    <TrophyArt kind={i} color={color} />
                  </span>
                </button>
              </Fragment>
            );
          })}

          {walker && (
            <span
              className={`lab-walker${walker.walking ? " is-walking" : ""}${walker.visible ? "" : " is-hidden"}`}
              style={{ transform: `translate(${walker.x}px, ${FLOOR}px)`, transitionDuration: `${walker.dur}ms` }}
              aria-hidden
            >
              <span className="lab-walker-body" style={{ transform: `scaleX(${walker.facing})` }}>
                <Player gradId="plv-gallery" />
              </span>
            </span>
          )}
        </div>

        {panel && (cert || ach) && (
          <section
            key={`${panel.kind}-${panel.i}`}
            ref={panelRef}
            tabIndex={-1}
            className={`hg-holo gl-panel ${side}`}
            style={{ "--bc": cert ? GEMS[panel.i % GEMS.length] : GOLD } as CSSProperties}
            aria-label={`${cert ? "Certification" : "Achievement"}: ${(cert ?? ach)!.title}`}
          >
            <header className="hg-holo-head">
              <div>
                <p className="x-kicker">
                  <span>{cert ? "Certification" : "Achievement"}</span> {cert?.issuer}
                </p>
                <h2 className="hg-holo-title">{(cert ?? ach)!.title}</h2>
              </div>
              <button type="button" className="x-icon-btn" onClick={closePanel} aria-label="Close plaque (Esc)">
                <X size={16} aria-hidden />
              </button>
            </header>
            <div className="hg-holo-body">
              {cert?.code && (
                <p>
                  <span className="x-label">Credential ID</span>
                  <br />
                  <code className="gl-code">{cert.code}</code>
                </p>
              )}
              {ach?.evidence && <p>{ach.evidence}</p>}
            </div>
            {cert?.url && (
              <div className="hg-holo-actions">
                <a className="x-btn x-btn-primary x-btn-sm" href={cert.url} target="_blank" rel="noopener noreferrer">
                  Verify credential <ExternalLink size={14} aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            )}
          </section>
        )}

        <div className="room-hud">
          <span className="room-status" aria-live="polite">
            <b>{nC + nA}</b> {status || "Preparing the hall"}
          </span>
        </div>
      </div>
    </>
  );
}
