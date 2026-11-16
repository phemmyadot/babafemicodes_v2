"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { sfx } from "./audio";
import { Head, useArcade } from "./ExeScreens";
import { Player, Stars } from "./GameWorld";

// Career Tower: a cross-section of a skyscraper, oldest job at the bottom. A glass elevator rides the
// shaft; each floor is one company, drawn as a small office in the style of its era. The camera rides
// with the car, so the building scrolls past while the floor counter ticks. Pick a floor with the
// buttons, step off, and the desk terminal shows what was done there.
const FLOOR_H = 360;
const SLAB = 8; // thickness of each floor slab
const SHAFT_X = 90;
const CAR = { x: 170, w: 124, h: 250 }; // x = centre
const OFFICE_X = 250;
const OFFICE_W = 850;
const ROOM_W = OFFICE_X + OFFICE_W + 60;
const DOOR = { x: 1000, w: 96, h: 215 };
const DOOR_X = DOOR.x + DOOR.w / 2;
const SPEED = 780;
const DESK = { x: 240, w: 340 }; // local to the office
const STAND_X = OFFICE_X + DESK.x - 64;
const COLORS = ["#43d5ff", "#a77bff", "#48d9a0", "#ffd23f", "#ff85e6", "#ff9a57", "#93c5fd", "#f472b6"];
const EASE = "cubic-bezier(0.37, 0, 0.63, 1)"; // ease-in-out sine; the counter uses the same curve
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;


// Three skin-tone groups; each floor's team of three takes one from each, so every room has Black, brown and white colleagues.
const TONES = [
  ["#3a2416", "#2a170d"], // Black
  ["#b87a4b", "#a8693a"], // brown
  ["#f1c27d", "#f6d5b4"], // white
];
const HAIRS: string[][] = [["#14100b", "#1b1209"], ["#1b1209", "#3b2a1a"], ["#6b3f1d", "#c9a24a", "#9a4a2a"]];
const SHIRTS = ["#43d5ff", "#a77bff", "#48d9a0", "#ffd23f", "#ff85e6", "#ff9a57"];
const PANTS = ["#2b3358", "#3a3f55", "#1f2b44"];

function look(f: number, i: number) {
  const g = (i + f) % 3;
  return {
    skin: TONES[g][f % 2],
    hair: HAIRS[g][f % HAIRS[g].length],
    shirt: SHIRTS[(f + i * 2) % SHIRTS.length],
    pants: PANTS[(f * 2 + i) % PANTS.length],
    bun: (f + i) % 3 === 0,
  };
}

/** A teammate seated across the table: torso and head above it, facing the viewer. The table hides the rest. */
function MateFront({ f, i }: { f: number; i: number }) {
  const { skin, hair, shirt, bun } = look(f, i);
  return (
    <svg viewBox="0 0 64 80" aria-hidden>
      <rect x="8" y="24" width="48" height="56" rx="8" fill="#2a3150" />
      {/* neck, then one body shape with sloped shoulders and the arms flush with its sides */}
      <rect x="27" y="28" width="10" height="10" rx="3" fill={skin} />
      <path d="M6 80 L6 52 C6 42 12 37 22 35 L42 35 C52 37 58 42 58 52 L58 80 Z" fill={shirt} />
      <circle cx="32" cy="20" r="13" fill={skin} />
      <path d="M18 21 A14 14 0 0 1 46 21 Q43 12 32 12 Q21 12 18 21 Z" fill={hair} />
      {bun && <circle cx="32" cy="3" r="5" fill={hair} />}
      <circle cx="27" cy="21" r="1.6" fill="#1b1209" />
      <circle cx="37" cy="21" r="1.6" fill="#1b1209" />
      <path d="M27 27 Q32 30 37 27" stroke="#1b1209" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A teammate seated at the table's end on a chair, facing left towards it, one hand on the table. */
function MateSide({ f, i }: { f: number; i: number }) {
  const { skin, hair, shirt, pants, bun } = look(f, i);
  return (
    <svg viewBox="0 0 90 100" aria-hidden>
      <rect x="58" y="22" width="8" height="46" rx="3" fill="#2a3150" />
      <rect x="30" y="64" width="36" height="6" rx="2" fill="#2a3150" />
      <rect x="46" y="70" width="5" height="26" fill="#2a3150" />
      <rect x="36" y="95" width="24" height="3" rx="1.5" fill="#2a3150" />
      <rect x="10" y="58" width="36" height="11" rx="5" fill={pants} />
      <rect x="6" y="64" width="11" height="30" rx="4" fill={pants} />
      <ellipse cx="9" cy="95" rx="10" ry="4.5" fill="#e8ecf8" />
      <rect x="34" y="28" width="28" height="40" rx="10" fill={shirt} />
      <path d="M46 36 L42 52 L16 38" stroke={shirt} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="37" r="4.5" fill={skin} />
      <circle cx="44" cy="16" r="13" fill={skin} />
      <path d="M30 17 A14 14 0 0 1 58 17 Q55 9 44 9 Q33 9 30 17 Z" fill={hair} />
      {bun && <circle cx="54" cy="4" r="5" fill={hair} />}
      <circle cx="37" cy="18" r="1.6" fill="#1b1209" />
      <path d="M32 24 Q37 27 41 24" stroke="#1b1209" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

type Walker = { x: number; y: number; facing: 1 | -1; walking: boolean; dur: number; riding: boolean; visible: boolean };

export function Tower({ selected }: { selected?: string }) {
  const career = useArcade().career; // oldest first, so floor 1 is the first job
  const n = career.length;
  const floorLine = (f: number) => (n - f + 1) * FLOOR_H - SLAB; // y of the surface you stand on; floor 0 is the lobby
  const TOTAL = (n + 1) * FLOOR_H;
  const start = Math.max(1, career.findIndex((c) => c.id === selected) + 1);

  const [vp, setVp] = useState({ w: 0, h: 0 });
  const ro = useRef<ResizeObserver | null>(null);
  const viewportRef = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.current.observe(el);
  }, []);

  const [status, setStatus] = useState("");
  const [exitDoor, setExitDoor] = useState(false);
  const [doors, setDoorsRaw] = useState(false); // elevator doors
  const setDoors = (open: boolean) => {
    setDoorsRaw(open);
    sfx.slide();
  };
  const [carF, setCarF] = useState(0); // floor the car is at / heading to
  const [shown, setShown] = useState(0); // the number on the counter
  const [ride, setRide] = useState(0); // ms of the current ride
  const [riding, setRiding] = useState(false);
  const [panel, setPanel] = useState<number | null>(null);
  const [walker, setWalker] = useState<Walker | null>(null);
  const walkerRef = useRef(walker);
  walkerRef.current = walker;
  const curRef = useRef(0);
  const panelRef = useRef<HTMLElement | null>(null);

  const runId = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const ticker = useRef<number | null>(null);
  const cancel = () => {
    runId.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (ticker.current) clearInterval(ticker.current);
  };
  const place = (w: Walker | null) => {
    walkerRef.current = w;
    setWalker(w);
  };

  type IO = { wait: (ms: number) => Promise<void>; walkTo: (x: number) => Promise<void>; rideTo: (f: number) => Promise<void> };
  const seq = (steps: (io: IO) => Promise<void>) => {
    cancel();
    const run = runId.current;
    const wait = (ms: number) => new Promise<void>((res, rej) => later(() => (runId.current === run ? res() : rej(new Error("cancelled"))), ms));
    const walkTo = async (x: number) => {
      const w = walkerRef.current;
      if (!w) return;
      const dur = reduceMotion() ? 0 : Math.max(200, (Math.abs(x - w.x) / SPEED) * 1000);
      place({ ...w, x, facing: x < w.x - 2 ? -1 : x > w.x + 2 ? 1 : w.facing, walking: dur > 0, dur, riding: false });
      sfx.walk(dur);
      await wait(dur);
      place({ ...walkerRef.current!, walking: false });
      await wait(30);
    };
    const rideTo = async (f: number) => {
      const from = curRef.current;
      curRef.current = f;
      if (f === from) return;
      const dur = reduceMotion() ? 0 : Math.min(3600, Math.max(900, Math.abs(f - from) * 800));
      setRide(dur);
      setCarF(f);
      setRiding(dur > 0);
      sfx.hum(dur / 1000);
      place({ ...walkerRef.current!, y: floorLine(f), dur, riding: true, walking: false });
      // the counter follows the same ease-in-out curve as the car
      const t0 = performance.now();
      if (ticker.current) clearInterval(ticker.current);
      ticker.current = window.setInterval(() => {
        const t = Math.min(1, (performance.now() - t0) / Math.max(1, dur));
        setShown(Math.round(from + (f - from) * (0.5 - 0.5 * Math.cos(Math.PI * t))));
      }, 60);
      await wait(dur);
      if (ticker.current) clearInterval(ticker.current);
      setRiding(false);
      setShown(f);
      sfx.ding(); // brass ding on arrival
      await wait(60);
    };
    steps({ wait, walkTo, rideTo }).catch(() => {});
  };

  const inCar = () => Math.abs((walkerRef.current?.x ?? CAR.x) - CAR.x) < 6;
  const label = (f: number) => (f === 0 ? "Lobby" : `Floor ${String(f).padStart(2, "0")} · ${career[f - 1].org}`);

  /** Go to a floor: back to the car, ride, step out at the desk (floors) or stay in the car (lobby). */
  const goFloor = (f: number) => {
    seq(async ({ wait, walkTo, rideTo }) => {
      setPanel(null);
      if (!inCar()) await walkTo(CAR.x);
      if (f !== curRef.current) {
        setDoors(false);
        await wait(reduceMotion() ? 0 : 450);
        setStatus(`${f > curRef.current ? "Going up" : "Going down"} to ${label(f)}`);
        await rideTo(f);
      }
      setDoors(true);
      await wait(reduceMotion() ? 0 : 450);
      if (f === 0) {
        setStatus("Lobby · pick a floor");
        return;
      }
      setStatus(`${label(f)} · walking to the desk`);
      await walkTo(STAND_X);
      place({ ...walkerRef.current!, facing: 1 });
      setPanel(f);
      sfx.keys();
      setStatus(`${label(f)} · terminal open`);
    });
  };

  // Entrance: through the lobby door, into the car, then up to the first job.
  useEffect(() => {
    if (reduceMotion()) {
      curRef.current = start;
      setCarF(start);
      setShown(start);
      setDoors(true);
      place({ x: STAND_X, y: floorLine(start), facing: 1, walking: false, dur: 0, riding: false, visible: true });
      setPanel(start);
      setStatus(`${label(start)} · terminal open`);
      return;
    }
    seq(async ({ wait, walkTo }) => {
      curRef.current = 0;
      await wait(700);
      setStatus("Entering the tower");
      setExitDoor(true);
      await wait(380);
      place({ x: DOOR_X, y: floorLine(0), facing: -1, walking: false, dur: 0, riding: false, visible: false });
      await wait(40);
      place({ ...walkerRef.current!, visible: true });
      await wait(260);
      setDoors(true);
      await walkTo(CAR.x);
      setExitDoor(false);
      place({ ...walkerRef.current!, facing: 1 });
      await wait(250);
      goFloor(start);
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Click a desk terminal: if the engineer is already on that floor, walk to it and open it. */
  const inspect = (f: number) => {
    if (curRef.current === f && !inCar()) {
      seq(async ({ walkTo }) => {
        await walkTo(STAND_X);
        place({ ...walkerRef.current!, facing: 1 });
        setPanel(f);
        sfx.keys();
        setStatus(`${label(f)} · terminal open`);
      });
    } else goFloor(f);
  };

  const closePanel = () => {
    setPanel(null);
    setStatus(`${label(curRef.current)} · pick a floor`);
  };

  /** Leave: ride down to the lobby, walk to the door and out. */
  const exiting = useRef(false);
  const leave = (el?: Element | null) => {
    if (exiting.current) return;
    exiting.current = true;
    const visible = walkerRef.current?.visible;
    seq(async ({ wait, walkTo, rideTo }) => {
      setPanel(null);
      if (visible && !reduceMotion()) {
        if (curRef.current !== 0) {
          if (!inCar()) await walkTo(CAR.x);
          setDoors(false);
          await wait(450);
          setStatus("Heading out");
          await rideTo(0);
          setDoors(true);
          await wait(450);
        }
        setStatus("Leaving the tower");
        setExitDoor(true);
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

  const stepRef = useRef({ leave, goFloor, closePanel });
  stepRef.current = { leave, goFloor, closePanel };
  const panelOpen = useRef(false);
  panelOpen.current = panel !== null;
  useEffect(() => {
    const onExit = (e: Event) => {
      e.preventDefault();
      stepRef.current.leave();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || document.querySelector("dialog[open]")) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;
      if (e.key === "Escape" && panelOpen.current) {
        e.preventDefault();
        stepRef.current.closePanel();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(n, Math.max(0, curRef.current + (e.key === "ArrowUp" ? 1 : -1)));
        if (next !== curRef.current) stepRef.current.goFloor(next);
      }
    };
    window.addEventListener("exe-scene-exit", onExit);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("exe-scene-exit", onExit);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [n]);

  // Shrink the terminal text until everything fits the box (no scrolling), down to a readable floor.
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
  useEffect(() => {
    if (panel !== null) panelRef.current?.focus({ preventScroll: true });
  }, [panel]);

  // Camera: the car stays centred while the building scrolls; on a narrow screen it also follows the engineer sideways.
  // On a phone the whole tower fits the screen, so the camera neither rides with the car nor pans.
  const compact = vp.w > 0 && vp.w < 640;
  const k = vp.w ? (compact ? Math.min(vp.w / ROOM_W, (vp.h - 120 - 16) / TOTAL) * 0.96 : Math.max(Math.min(vp.w / ROOM_W, vp.h / (FLOOR_H * 2.6)) * 0.95, Math.min(0.55, (vp.h / (FLOOR_H * 2.6)) * 0.95))) : 0.5;
  const camY = floorLine(carF) - FLOOR_H / 2;
  const wx = walker?.x ?? CAR.x;
  const tx = ROOM_W * k <= vp.w ? (vp.w - ROOM_W * k) / 2 : Math.min(0, Math.max(vp.w - ROOM_W * k, vp.w / 2 - wx * k));
  // 120 clears the floor buttons. With a floor's panel open (about 395px tall, from the bottom) the tower slides up so that floor stays in view.
  const ty = compact ? (panel !== null && panel >= 1 ? (120 + Math.max(200, vp.h - 395)) / 2 - camY * k : Math.max(120, (vp.h - TOTAL * k) / 2)) : vp.h / 2 - camY * k;

  const open = panel !== null && panel >= 1 ? career[panel - 1] : null;

  if (!n) return <Head index="04" title="Career tower" note="No experience published yet." />;

  return (
    <>
      <Head index="04" title="Career tower" note={`${n} floors, one company each, oldest at the bottom. Use the elevator buttons or the arrow keys.`} />
      <div className={`lab-viewport ct-viewport${riding ? " is-riding" : ""}`} ref={viewportRef}>
        <Stars />
        <div
          className="ct-tower"
          style={{ width: ROOM_W, height: TOTAL, transform: `translate(${tx}px, ${ty}px) scale(${k})`, transition: `transform ${ride || 450}ms ${EASE}` } as CSSProperties}
        >
          <span className="ct-roof" aria-hidden>
            CAREER TOWER
          </span>
          <span className="ct-shaft" style={{ left: SHAFT_X, width: 160, height: TOTAL }} aria-hidden />
          <span className="ct-cable" style={{ left: CAR.x - 1, height: floorLine(carF) - CAR.h, transition: `height ${ride}ms ${EASE}` }} aria-hidden />

          {Array.from({ length: n + 1 }, (_, f) => n - f).map((f) => {
            const top = (n - f) * FLOOR_H;
            const c = f >= 1 ? career[f - 1] : null;
            const era = f === 0 ? "lobby" : f <= n / 3 ? "retro" : f <= (2 * n) / 3 ? "modern" : "future";
            return (
              <div
                key={f}
                className={`ct-floor is-${era}${carF === f ? " is-here" : ""}`}
                style={{ left: OFFICE_X, top, width: OFFICE_W, height: FLOOR_H, "--fc": f === 0 ? "#7cff6b" : COLORS[(f - 1) % COLORS.length] } as CSSProperties}
              >
                <span className="ct-num" aria-hidden>
                  {f === 0 ? "L" : String(f).padStart(2, "0")}
                </span>
                <span className="ct-win" aria-hidden />
                {c ? (
                  <>
                    <span className="ct-sign" aria-hidden>
                      {c.org}
                      <small>{c.period}</small>
                    </span>
                    <span className="ct-desk" style={{ left: DESK.x, width: DESK.w }} aria-hidden />
                    <button
                      type="button"
                      className="ct-term"
                      style={{ left: DESK.x + 10 }}
                      onClick={() => inspect(f)}
                      aria-label={`Inspect the terminal on floor ${f}: ${c.org}, ${c.role}`}
                    >
                      <i />
                      <i />
                      <i />
                    </button>
                    <span className="ct-plate" style={{ left: DESK.x + 20 }} aria-hidden>
                      {c.role}
                    </span>
                    {/* a team of three round the table (none in the first job's room): two across it, one at its end */}
                    {f >= 2 &&
                      [0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`ct-mate ${i < 2 ? "is-front" : "is-side"}`}
                          style={{ left: i < 2 ? DESK.x + 160 + i * 92 : DESK.x + DESK.w - 24, "--d": `${i * 0.5}s` } as CSSProperties}
                          aria-hidden
                        >
                          {i < 2 ? <MateFront f={f} i={i} /> : <MateSide f={f} i={i} />}
                          {i === f % 3 && (
                            <span className="ct-bubble">
                              <i />
                              <i />
                              <i />
                            </span>
                          )}
                        </span>
                      ))}
                    <span className="ct-plant" aria-hidden />
                    <span className="ct-cab" aria-hidden />
                  </>
                ) : (
                  <>
                    <span className="ct-sign" aria-hidden>
                      Lobby
                      <small>Ground floor</small>
                    </span>
                    <span className="ct-reception" aria-hidden />
                  </>
                )}
              </div>
            );
          })}

          {/* the lobby's way out */}
          <button
            type="button"
            className={`room-door${exitDoor ? " is-open" : ""}`}
            style={{ left: DOOR.x, top: floorLine(0) - DOOR.h, width: DOOR.w, height: DOOR.h }}
            onClick={(e) => leave(e.currentTarget)}
            aria-label="Leave the career tower through the lobby door"
          >
            <span className="room-door-gap" />
            <span className="room-door-panel">
              <i />
            </span>
            <span className="room-door-sign">Exit</span>
          </button>

          {/* the glass elevator */}
          <div className={`ct-car${doors ? " is-open" : ""}`} style={{ left: CAR.x - CAR.w / 2, top: floorLine(carF) - CAR.h, width: CAR.w, height: CAR.h, transition: `top ${ride}ms ${EASE}` }}>
            <span className="ct-led" aria-hidden>
              {shown === 0 ? "L" : String(shown).padStart(2, "0")}
            </span>
            <span className="ct-glass ct-glass-l" aria-hidden />
            <span className="ct-glass ct-glass-r" aria-hidden />
          </div>

          {walker && (
            <span
              className={`lab-walker${walker.walking ? " is-walking" : ""}${walker.visible ? "" : " is-hidden"}`}
              style={{ transform: `translate(${walker.x}px, ${walker.y}px)`, transitionDuration: `${walker.dur}ms`, transitionTimingFunction: walker.riding ? EASE : "linear" }}
              aria-hidden
            >
              <span className="lab-walker-body" style={{ transform: `scaleX(${walker.facing})` }}>
                <Player gradId="plv-tower" />
              </span>
            </span>
          )}
        </div>

        {open && panel !== null && (
          <section
            key={open.id}
            ref={panelRef}
            tabIndex={-1}
            className="hg-holo ct-panel"
            style={{ "--bc": COLORS[(panel - 1) % COLORS.length] } as CSSProperties}
            aria-label={`Floor ${panel} terminal: ${open.org}`}
          >
            <header className="hg-holo-head">
              <div>
                <p className="x-kicker">
                  <span>Floor {String(panel).padStart(2, "0")}</span> {[open.period, open.location].filter(Boolean).join(" · ")}
                </p>
                <h2 className="hg-holo-title">{open.org}</h2>
                <p className="ct-role">{open.role}</p>
              </div>
              <button type="button" className="x-icon-btn" onClick={closePanel} aria-label="Close terminal (Esc)">
                <X size={16} aria-hidden />
              </button>
            </header>
            {open.highlights.length > 0 && (
              <ul className="x-list">
                {open.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            {open.tech.length > 0 && (
              <ul className="hg-tags" aria-label="Tech used">
                {open.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="ct-streaks" aria-hidden />

        <div className="room-hud">
          <span className="room-status" aria-live="polite">
            <b>{shown === 0 ? "L" : String(shown).padStart(2, "0")}</b> {status || "Preparing the tower"}
          </span>
        </div>

        {/* elevator buttons */}
        <nav className="ct-buttons" aria-label="Elevator">
          <button type="button" className="ct-btn ct-arrow" onClick={() => goFloor(Math.min(n, curRef.current + 1))} disabled={carF >= n} aria-label="Up one floor (↑)" title="Up (↑)">
            <ChevronUp size={16} aria-hidden />
          </button>
          {Array.from({ length: n + 1 }, (_, f) => n - f).map((f) => (
            <button
              key={f}
              type="button"
              className={`ct-btn${carF === f ? " is-lit" : ""}`}
              style={{ "--bc": f === 0 ? "#7cff6b" : COLORS[(f - 1) % COLORS.length] } as CSSProperties}
              onClick={() => goFloor(f)}
              aria-label={f === 0 ? "Lobby" : `Floor ${f}: ${career[f - 1].org}`}
              aria-pressed={carF === f}
              title={f === 0 ? "Lobby" : career[f - 1].org}
            >
              {f === 0 ? "L" : f}
            </button>
          ))}
          <button type="button" className="ct-btn ct-arrow" onClick={() => goFloor(Math.max(0, curRef.current - 1))} disabled={carF <= 0} aria-label="Down one floor (↓)" title="Down (↓)">
            <ChevronDown size={16} aria-hidden />
          </button>
        </nav>
      </div>
    </>
  );
}
