"use client";

import { Cloud, Code2, Database, Hexagon, Minus, Plus, Rocket, ShieldCheck, Smartphone, ZoomOut, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { Head, useArcade } from "./ExeScreens";
import { Player } from "./GameWorld";

/* ----------------------------------------------------------------- layout */
// A cutaway house in design units: a hall (door + ladder) on the left, then one room per Sanity
// skill group over two floors. Each room is as wide as its content needs, so a group with more
// technologies gets a bigger room. The camera fits the whole house or zooms freely.

const COLORS = ["#4cd7f6", "#d0bcff", "#4edea3", "#fbbf24", "#ffb4ab", "#acedff", "#a5b4fc", "#f0abfc"];
const LOBBY_W = 250;
const ROOM_H = 300;
const ROOF = 130;
const GROUND = 34;
const WALL = 14;
const DOOR_X = 74;
const LIFT_X = 190;
const SPEED = 1000; // walking speed, units per second
const CHIP_W = 106;
const CHIP_ROWS = 5;

interface Room {
  i: number;
  f: number;
  x: number;
  w: number;
  cols: number;
}

/** Size each room from its skill count, then split the rooms over two floors of equal width. */
function plan(counts: number[]) {
  const sized = counts.map((n, i) => {
    const cols = Math.max(2, Math.ceil(n / CHIP_ROWS));
    return { i, cols, w: cols * CHIP_W + 34 };
  });
  // Greedy balance: widest rooms first, each onto the narrower floor.
  const floorsOf: number[][] = counts.length > 2 ? [[], []] : [[]];
  const width = floorsOf.map(() => 0);
  [...sized].sort((a, b) => b.w - a.w).forEach((r) => {
    const f = width.indexOf(Math.min(...width));
    floorsOf[f].push(r.i);
    width[f] += r.w;
  });
  const span = Math.max(...width);
  const rooms: Room[] = [];
  floorsOf.forEach((ids, f) => {
    let x = LOBBY_W;
    ids.sort((a, b) => a - b).forEach((i) => {
      const w = (sized[i].w * span) / width[f]; // stretch the narrower floor to the same total
      rooms[i] = { i, f, x, w, cols: sized[i].cols };
      x += w;
    });
  });
  return { rooms, floors: floorsOf.length, W: LOBBY_W + span + WALL };
}

interface View {
  k: number;
  x: number;
  y: number;
}

interface Walker {
  x: number;
  y: number;
  facing: 1 | -1;
  walking: boolean;
  dur: number;
  visible: boolean;
}

function iconFor(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (/lang/.test(t)) return Code2;
  if (/mobile|front/.test(t)) return Smartphone;
  if (/cloud|backend/.test(t)) return Cloud;
  if (/build|release|ci/.test(t)) return Rocket;
  if (/test|observ|qa/.test(t)) return ShieldCheck;
  if (/data|secur|state/.test(t)) return Database;
  return Hexagon;
}

/** Skill Tree: walk the engineer between connected rooms; each room holds one group's tech stack. */
export function Skills() {
  const groups = useArcade().skills;
  const total = groups.reduce((n, g) => n + g.skills.length, 0);
  const { rooms, floors, W } = useMemo(() => plan(groups.map((g) => g.skills.length)), [groups]);
  const H = ROOF + floors * ROOM_H + GROUND;
  const floorY = (f: number) => ROOF + (floors - f) * ROOM_H; // y of that storey's floor line
  const roomOf = (i: number) => ({ ...rooms[i], y: floorY(rooms[i].f) - ROOM_H });

  const [vp, setVp] = useState({ w: 0, h: 0 });
  const ro = useRef<ResizeObserver | null>(null);
  const viewportRef = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.current.observe(el);
  }, []);

  const [focus, setFocusRoom] = useState<number | null>(null); // the room the engineer is showing
  // Camera: null fits the whole house; otherwise a free view (wheel, +/-, drag, or a room).
  const [view, setView] = useState<View | null>(null);
  const [smooth, setSmooth] = useState(true);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const fitView = (): View => {
    const k = vp.w ? Math.min(vp.w / W, vp.h / H) : 0.5;
    return { k, x: (vp.w - W * k) / 2, y: (vp.h - H * k) / 2 };
  };
  const cam = view ?? fitView();
  const camRef = useRef(cam);
  camRef.current = cam;
  const setFocus = (i: number | null) => {
    setFocusRoom(i);
    setSmooth(true);
    if (i === null) return setView(null);
    const r = roomOf(i);
    const k = Math.min(vp.w / (r.w + 24), vp.h / (ROOM_H + 24));
    setView({ k, x: vp.w / 2 - (r.x + r.w / 2) * k, y: vp.h / 2 - (r.y + ROOM_H / 2) * k });
  };
  /** Zoom by f around a screen point (default: the centre). */
  const zoom = (f: number, cx = vp.w / 2, cy = vp.h / 2, animate = true) => {
    const v = camRef.current;
    const fit = fitView();
    const k = Math.min(fit.k * 5, Math.max(fit.k, v.k * f));
    setSmooth(animate);
    // Back at (or below) the fitted size: snap to the centred whole-house view.
    setView(k <= fit.k * 1.001 ? null : { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k });
  };
  const [door, setDoor] = useState(false);
  const [status, setStatus] = useState("");
  const [walker, setWalker] = useState<Walker | null>(null);
  const walkerRef = useRef(walker);
  walkerRef.current = walker;
  const runId = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const cancel = () => {
    runId.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Start a cancellable sequence of walker moves. */
  const sequence = (steps: (io: { wait: (ms: number) => Promise<void>; move: (x: number, y?: number) => Promise<void> }) => Promise<void>) => {
    cancel();
    const run = runId.current;
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => later(() => (runId.current === run ? res() : rej(new Error("cancelled"))), ms));
    const move = async (x: number, y?: number) => {
      const from = walkerRef.current;
      if (!from) return;
      const ty = y ?? from.y;
      const dur = reduce() ? 0 : Math.max(180, ty !== from.y ? 520 : (Math.abs(x - from.x) / SPEED) * 1000);
      const facing = x < from.x - 2 ? -1 : x > from.x + 2 ? 1 : from.facing;
      setWalker({ ...from, x, y: ty, facing, walking: ty === from.y, dur });
      await wait(dur);
      setWalker((w) => w && { ...w, walking: false });
      await wait(30);
    };
    steps({ wait, move }).catch(() => {});
  };

  // Entrance: the door opens and the engineer steps into the lobby.
  useEffect(() => {
    sequence(async ({ wait, move }) => {
      await wait(reduce() ? 0 : 650);
      setStatus("Engineer entering the building");
      setDoor(true);
      await wait(reduce() ? 0 : 350);
      setWalker({ x: DOOR_X, y: floorY(0), facing: 1, walking: false, dur: 0, visible: true });
      await wait(60);
      await move(LOBBY_W - 110);
      setDoor(false);
      setStatus("Pick a room to see its tech stack");
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Walk to room i (via the elevator if it is on another floor), then zoom into it. */
  const goRoom = (i: number | null) => {
    sequence(async ({ wait, move }) => {
      const from = walkerRef.current;
      if (!from) return;
      setFocus(null);
      const target = i === null ? { f: 0, cx: LOBBY_W - 110 } : { f: rooms[i].f, cx: rooms[i].x + rooms[i].w / 2 };
      const ty = floorY(target.f);
      setStatus(i === null ? "Heading back to the lobby" : `Walking to ${groups[i].title}`);
      if (ty !== from.y) {
        await move(LIFT_X);
        await move(LIFT_X, ty);
      }
      await move(target.cx);
      setWalker((w) => w && { ...w, facing: 1 });
      if (i === null) {
        setStatus("Pick a room to see its tech stack");
        return;
      }
      await wait(80);
      setFocus(i);
      setStatus(`${groups[i].title} · ${groups[i].skills.length} technologies`);
    });
  };

  const exit = (el: Element) => {
    cancel();
    const scene = el.closest<HTMLElement>(".scene");
    const r = el.getBoundingClientRect();
    scene?.style.setProperty("--iris-x", `${r.left + r.width / 2}px`);
    scene?.style.setProperty("--iris-y", `${r.top + r.height / 2}px`);
    window.location.hash = "/home";
  };
  // Keys work wherever focus is. Capture phase, so this runs before the scene's own Escape
  // handler: preventDefault here makes Escape zoom out first and leave only on a second press.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e) => {
    if (e.metaKey || e.ctrlKey || document.querySelector("dialog[open]")) return;
    if (e.target instanceof Element && e.target.closest("input, textarea")) return;
    if (e.key === "+" || e.key === "=") zoom(1.3);
    else if (e.key === "-" || e.key === "_") zoom(1 / 1.3);
    else if (e.key === "0") setFocus(null);
    else if (e.key === "Escape" && view) setFocus(null);
    else return;
    e.preventDefault();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // Wheel zoom toward the cursor (non-passive so the page doesn't scroll).
  const elRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomRef.current(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top, false);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Drag to pan once zoomed in. Capture starts only after a real drag, so clicks still reach rooms.
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(".room-hud, .sr-tabs, .sr-zoom")) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !view) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
    if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    drag.current = { x: e.clientX, y: e.clientY, moved: true };
    setSmooth(false);
    setView((v) => v && { ...v, x: v.x + dx, y: v.y + dy });
  };
  const onPointerUp = () => {
    // Keep `moved` until the click that follows has been ignored.
    window.setTimeout(() => (drag.current = null), 0);
  };
  const clicked = (fn: () => void) => () => {
    if (!drag.current?.moved) fn();
  };

  if (!groups.length) return <Head index="02" title="Skill tree" note="No skills published yet." />;

  const zoomed = view !== null;

  return (
    <>
      <Head index="02" title="Skill tree" note={`${groups.length} rooms · ${total} technologies. Pick a room and the engineer walks you there.`} />
      <div
        className={`sr-viewport${zoomed ? " can-pan" : ""}`}
        ref={(el) => {
          elRef.current = el;
          viewportRef(el);
        }}
        tabIndex={0}
        aria-label="Skill house. Scroll or press plus and minus to zoom, drag to move, pick a room to walk there."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={`sr-world${smooth ? " is-smooth" : ""}`}
          style={{ width: W, height: H, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})` }}
        >
          <span className="sr-sky" aria-hidden />
          <span className="sr-chimney" style={{ left: W * 0.72, top: 22 }} aria-hidden />
          <span className="sr-roof" style={{ height: ROOF - WALL }} aria-hidden>
            <b>Skill house</b>
          </span>
          <span className="sr-building" style={{ top: ROOF - WALL }} aria-hidden />
          <span className="sr-ground" style={{ top: floorY(0) }} aria-hidden />

          {/* lobby: entrance door and elevator shaft */}
          <span className="sr-lift" style={{ left: LIFT_X - 34, top: ROOF, height: floors * ROOM_H }} aria-hidden />
          <button
            type="button"
            className={`room-door sr-door${door ? " is-open" : ""}`}
            style={{ left: DOOR_X - 42, top: floorY(0) - 150, width: 84, height: 150 }}
            onClick={(e) => exit(e.currentTarget)}
            aria-label="Leave the building through the door"
          >
            <span className="room-door-gap" />
            <span className="room-door-panel">
              <i />
            </span>
            <span className="room-door-sign">Exit</span>
          </button>
          <button type="button" className="sr-lobby" style={{ left: WALL, top: floorY(0) - ROOM_H, width: LOBBY_W - WALL, height: ROOM_H }} onClick={clicked(() => goRoom(null))} aria-label="Walk back to the hall">
            <span>Hall</span>
          </button>

          {groups.map((g, i) => {
            const r = roomOf(i);
            const Icon = iconFor(g.title);
            return (
              <button
                key={g.id}
                type="button"
                className={`sr-room${focus === i ? " is-focus" : ""}`}
                style={{ left: r.x, top: r.y, width: r.w, height: ROOM_H, "--bc": COLORS[i % COLORS.length], "--cols": r.cols } as CSSProperties}
                onClick={clicked(() => goRoom(i))}
                aria-label={`${g.title}: ${g.skills.join(", ")}`}
                aria-pressed={focus === i}
              >
                <span className="sr-room-head">
                  <Icon size={18} aria-hidden /> {g.title} <b>{g.skills.length}</b>
                </span>
                <span className="sr-chips">
                  {g.skills.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </span>
                <span className="sr-lamp" />
                <span className="sr-doorway" />
              </button>
            );
          })}

          {walker && (
            <span
              className={`sr-walker${walker.walking ? " is-walking" : ""}`}
              style={{ transform: `translate(${walker.x}px, ${walker.y}px)`, transitionDuration: `${walker.dur}ms` }}
              aria-hidden
            >
              <span style={{ transform: `scaleX(${walker.facing})` }}>
                <Player gradId="plv-skills" />
              </span>
            </span>
          )}
        </div>

        <div className="room-hud">
          <span className="room-status" aria-live="polite">
            {status || "Opening the building"}
          </span>
        </div>
        <div className="sr-zoom" role="toolbar" aria-label="Zoom">
          <button type="button" onClick={() => zoom(1.3)} aria-label="Zoom in">
            <Plus size={16} />
          </button>
          <button type="button" onClick={() => zoom(1 / 1.3)} aria-label="Zoom out">
            <Minus size={16} />
          </button>
          <button type="button" onClick={() => setFocus(null)} disabled={!zoomed} aria-label="Zoom out to the whole house">
            <ZoomOut size={16} />
          </button>
        </div>
        <div className="sr-tabs" aria-label="Rooms">
          {groups.map((g, i) => (
            <button key={g.id} type="button" aria-pressed={focus === i} style={{ "--bc": COLORS[i % COLORS.length] } as CSSProperties} onClick={() => goRoom(i)}>
              {g.title} <b>{g.skills.length}</b>
            </button>
          ))}
        </div>
        {/* Phones: the zoomed room is still small, so its stack is also listed as real-size text. */}
        {focus !== null && zoomed && (
          <div className="sr-panel" style={{ "--bc": COLORS[focus % COLORS.length] } as CSSProperties}>
            <strong>{groups[focus].title}</strong>
            <span>{groups[focus].skills.join(" · ")}</span>
          </div>
        )}
      </div>
    </>
  );
}
