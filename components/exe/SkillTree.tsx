"use client";

import { sfx } from "./audio";
import {
  Building2,
  Cloud,
  Code2,
  Compass,
  Database,
  Hexagon,
  Layers,
  MapPin,
  Minus,
  Plus,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { Head, useArcade } from "./ExeScreens";
import { Player } from "./GameWorld";

/* ----------------------------------------------------------- floor map layout */
// 2D Architectural Floor Map & Skill Tree facility.
// Generous 2D layout: Central Lobby on the left, connected via hallway concourse
// to North Wing, South Wing, and East Nexus.
// No door overlay. No inner scrollbars. Entry aesthetic matches the home Skill Tree building.

const COLORS = ["#43d5ff", "#a77bff", "#48d9a0", "#ffd23f", "#ff85e6", "#6ee7b7", "#93c5fd", "#f472b6"];
const PORTRAIT_TOP = 56; // room for the status pill above a phone plan
const PORTRAIT_BOTTOM = 76; // and for the room tabs below it
const SPEED = 300; // walking speed, units per second (he only crosses the lobby)

// Room chrome, matching the card CSS: header, body padding, a floor strip for the engineer, footer.
const CHIP_W = 164;
const CHIP_ROW = 44; // 36px chip + 8px gap
const PAD_X = 36;
const CHROME = 78 + 28 + 64 + 30;
const LOBBY_W = 380;
const WALL = 4; // each room is inset by this much, so neighbours leave an 8px wall
const HOUSE_PAD = 16; // clear space between the house wall and the rooms inside it
const DOOR = 56; // length of a door opening
const LOBBY_WALK = 170; // how far he walks in from the door
const ZOOM_ROOM = 1.7; // zooming into a room: at most this much past the fitted view
const ZOOM_MAX = 2.4; // wheel / +: never past this
const MIN_SHARE = 70; // two rooms only get a door when they share at least this much wall

export interface RoomPlan {
  i: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  wing: string;
}
/** A door opening on the wall shared by rooms a and b (-1 is the lobby). */
export interface DoorPlan {
  a: number;
  b: number;
  x: number;
  y: number;
  vertical: boolean;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const fitCols = (w: number) => Math.max(1, Math.floor((w - PAD_X + 8) / (CHIP_W + 8)));
/** Chip columns that give the roomiest-looking cells (about 4:1) once the chips stretch to fill the room. */
function bestCols(n: number, w: number, h: number) {
  const innerW = w - PAD_X;
  const innerH = h - CHROME + 8;
  let best = 1;
  let score = Infinity;
  for (let c = 1; c <= Math.min(fitCols(w), n); c++) {
    const cell = innerW / c / (innerH / Math.ceil(n / c));
    const s = Math.abs(Math.log(cell / 4.2));
    if (s < score) (score = s, (best = c));
  }
  return best;
}
const needH = (n: number, w: number) => CHROME + Math.ceil(n / Math.min(fitCols(w), n)) * CHIP_ROW - 8;

const squareness = (r: Rect) => Math.max(r.w / r.h, r.h / r.w);

/**
 * Binary space partition. Each split gives each half area in proportion to its rooms; of every way to
 * cut (either direction, any point in the room order) it keeps the layout whose worst room is the most
 * room-shaped, so nothing ends up a sliver. A house has a handful of rooms, so searching all cuts is cheap.
 */
function bestPartition(items: Array<{ i: number; wt: number }>, r: Rect): { score: number; rects: Array<[number, Rect]> } {
  if (items.length === 1) return { score: squareness(r), rects: [[items[0].i, r]] };
  const total = items.reduce((n, it) => n + it.wt, 0);
  let best: { score: number; rects: Array<[number, Rect]> } | null = null;
  for (let k = 1; k < items.length; k++) {
    const f = items.slice(0, k).reduce((n, it) => n + it.wt, 0) / total;
    for (const vertical of [true, false]) {
      const ra = vertical ? { ...r, w: r.w * f } : { ...r, h: r.h * f };
      const rb = vertical ? { x: r.x + r.w * f, y: r.y, w: r.w * (1 - f), h: r.h } : { x: r.x, y: r.y + r.h * f, w: r.w, h: r.h * (1 - f) };
      const a = bestPartition(items.slice(0, k), ra);
      const b = bestPartition(items.slice(k), rb);
      // Worst room first; a small pull toward balanced halves breaks ties.
      const score = Math.max(a.score, b.score) + Math.abs(f - 0.5) * 0.05;
      if (!best || score < best.score) best = { score, rects: [...a.rects, ...b.rects] };
    }
  }
  return best!;
}

function partition(items: Array<{ i: number; wt: number }>, r: Rect, out: Rect[]) {
  for (const [i, rect] of bestPartition(items, r).rects) out[i] = rect;
}

/**
 * A house plan: the lobby on the left, the skill rooms filling the rest of a rectangle whose shape
 * follows the screen. Each room's area follows how much it has to hold, so rooms differ in size
 * and don't line up; the house grows until every room fits its chips.
 */
export function planHouse(counts: number[], aspect: number, portrait = false) {
  const ideal = counts.map((c) => {
    const cols = Math.min(6, Math.max(2, Math.round(Math.sqrt(c * 1.3))));
    return (cols * (CHIP_W + 8) + 28) * (CHROME + Math.ceil(c / cols) * CHIP_ROW - 8);
  });
  const area = ideal.reduce((n, a) => n + a, 0) * 1.12;
  let H = Math.max(640, (LOBBY_W + Math.sqrt(LOBBY_W ** 2 + 4 * aspect * area)) / (2 * aspect));
  const rects: Rect[] = [];
  let W: number;
  let lobby: Rect;
  if (portrait) {
    // Phones: no lobby, just every room full width in one column, as tall as its chips need.
    W = LOBBY_W;
    lobby = { x: 0, y: 0, w: W, h: 0 };
    H = 0;
    counts.forEach((c, i) => {
      rects[i] = { x: 0, y: H, w: W, h: needH(c, W) };
      H += rects[i].h;
    });
  } else {
    for (let t = 0; t < 90; t++, H *= 1.03) {
      partition(ideal.map((wt, i) => ({ i, wt })), { x: LOBBY_W, y: 0, w: aspect * H - LOBBY_W, h: H }, rects);
      if (rects.every((r, i) => r.w >= 200 && r.h >= needH(counts[i], r.w))) break;
    }
    W = LOBBY_W + rects.reduce((m, r) => Math.max(m, r.x + r.w - LOBBY_W), 0);
    lobby = { x: 0, y: 0, w: LOBBY_W, h: H };
  }
  const rooms: RoomPlan[] = rects.map((r, i) => {
    const cx = (r.x + r.w / 2) / W;
    const cy = (r.y + r.h / 2) / H;
    const dir = `${cy < 0.4 ? "N" : cy > 0.6 ? "S" : ""}${cx < 0.4 ? "W" : cx > 0.62 ? "E" : ""}`;
    return { i, ...r, cols: bestCols(counts[i], r.w, r.h), wing: `${dir || "CENTRAL"} WING` };
  });

  // Doors on every wall two rooms share for at least MIN_SHARE; if that leaves a room cut off, relax it.
  const all: Array<Rect & { id: number }> = [{ id: -1, ...lobby }, ...rooms.map((r) => ({ id: r.i, x: r.x, y: r.y, w: r.w, h: r.h }))];
  const build = (min: number) => {
    const out: DoorPlan[] = [];
    for (let p = 0; p < all.length; p++)
      for (let q = p + 1; q < all.length; q++) {
        const A = all[p];
        const B = all[q];
        for (const [L, R] of [[A, B], [B, A]] as const) {
          if (Math.abs(L.x + L.w - R.x) < 1) {
            const lo = Math.max(L.y, R.y);
            const hi = Math.min(L.y + L.h, R.y + R.h);
            if (hi - lo >= min) out.push({ a: L.id, b: R.id, x: R.x, y: (lo + hi) / 2, vertical: true });
          }
          if (Math.abs(L.y + L.h - R.y) < 1) {
            const lo = Math.max(L.x, R.x);
            const hi = Math.min(L.x + L.w, R.x + R.w);
            if (hi - lo >= min) out.push({ a: L.id, b: R.id, x: (lo + hi) / 2, y: R.y, vertical: false });
          }
        }
      }
    return out;
  };
  const connected = (ds: DoorPlan[]) => {
    const seen = new Set([-1]);
    for (let grow = true; grow; ) {
      grow = false;
      for (const d of ds) if (seen.has(d.a) !== seen.has(d.b)) (seen.add(d.a), seen.add(d.b), (grow = true));
    }
    return seen.size === all.length;
  };
  let doors = build(MIN_SHARE);
  if (!connected(doors)) doors = build(DOOR);
  if (!connected(doors)) doors = build(1);
  return { rooms, doors, lobby, W, H };
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
  if (/lang|core/.test(t)) return Code2;
  if (/mobile|front/.test(t)) return Smartphone;
  if (/cloud|backend|infra/.test(t)) return Cloud;
  if (/build|release|ci|devops/.test(t)) return Rocket;
  if (/test|observ|qa|audit/.test(t)) return ShieldCheck;
  if (/data|secur|state|db/.test(t)) return Database;
  return Hexagon;
}

export function Skills() {
  const groups = useArcade().skills;
  const total = groups.reduce((n, g) => n + g.skills.length, 0);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  // The house takes the screen's shape (rounded, so a small resize doesn't re-plan it).
  const aspect = vp.h ? Math.round(Math.min(2.2, Math.max(1.25, (vp.w / vp.h) * 0.92)) * 10) / 10 : 1.6;
  // On a phone the plan is one tall column (lobby on top) that fills the width and scrolls by dragging.
  const portrait = vp.w > 0 && vp.w < 640;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef(portrait);
  portraitRef.current = portrait;
  const { rooms, lobby, W, H } = useMemo(() => planHouse(groups.map((g) => g.skills.length), aspect, portrait), [groups, aspect, portrait]);
  const ro = useRef<ResizeObserver | null>(null);
  const viewportRef = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.current.observe(el);
  }, []);

  const [focus, setFocusRoom] = useState<number | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [smooth, setSmooth] = useState(true);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  // Fits the entire 2D Floor Map onto the screen
  const fitView = (): View => {
    if (portrait) {
      const k = (vp.w - 24) / (W + HOUSE_PAD * 2);
      return { k, x: (vp.w - W * k) / 2, y: PORTRAIT_TOP + HOUSE_PAD * k };
    }
    // Leave room for the status bar on top and the room tabs along the bottom.
    const k = vp.w && vp.h ? Math.min((vp.w - 40) / (W + HOUSE_PAD * 2), (vp.h - 150) / (H + HOUSE_PAD * 2)) : 0.55;
    return { k, x: (vp.w - W * k) / 2, y: 74 + (vp.h - 150 - H * k) / 2 };
  };

  const cam = portrait ? fitView() : (view ?? fitView());
  const camRef = useRef(cam);
  camRef.current = cam;

  const setFocus = (i: number | null) => {
    setFocusRoom(i);
    if (portrait) {
      // The phone plan is a native scroller (smooth with momentum on iOS): jump it to the room.
      const r = i === null ? null : rooms[i];
      scrollRef.current?.scrollTo({ top: r ? (HOUSE_PAD + r.y) * fitView().k : 0, behavior: reduce() ? "auto" : "smooth" });
      return;
    }
    setSmooth(true);
    if (i === null) return setView(null);
    const r = rooms[i];
    if (!r) return setView(null);
    // Smoothly zooms in on the room card so all skills fit clearly and legibly
    // Only a gentle zoom toward the room: it stays in context and the chips stay readable.
    const k = Math.min(Math.min((vp.w - 70) / r.w, (vp.h - 150) / r.h), fitView().k * ZOOM_ROOM);
    setView({
      k,
      x: vp.w / 2 - (r.x + r.w / 2) * k,
      y: 74 + (vp.h - 150) / 2 - (r.y + r.h / 2) * k,
    });
  };

  /** Zoom by factor f around a screen point (default: center of screen). */
  const zoom = (f: number, cx = vp.w / 2, cy = vp.h / 2, animate = true) => {
    if (portrait) return; // the phone plan scrolls instead
    const v = camRef.current;
    const fit = fitView();
    const k = Math.min(fit.k * ZOOM_MAX, Math.max(fit.k, v.k * f));
    setSmooth(animate);
    if (animate && f < 1 && v.k > fit.k * 1.02) sfx.bass(); // zooming out: a deep pulse
    setView(k <= fit.k * 1.002 ? null : { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k });
  };

  const [door, setDoor] = useState(false);
  const [status, setStatus] = useState("");
  const worldRef = useRef<HTMLDivElement | null>(null);
  const doorRef = useRef<HTMLButtonElement | null>(null);
  /** Foot of the lobby door in world units, read from layout so it follows the lobby's CSS. */
  const lobbySpot = () => {
    let x = 0;
    let y = 0;
    for (let el: HTMLElement | null = doorRef.current; el && el !== worldRef.current; el = el.offsetParent as HTMLElement | null) {
      x += el.offsetLeft;
      y += el.offsetTop;
    }
    return { x: x + (doorRef.current?.offsetWidth ?? 0) / 2, y: y + (doorRef.current?.offsetHeight ?? 0) };
  };

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

  /** Start a cancellable sequence of walker moves along corridor waypoints. */
  const sequence = (steps: (io: { wait: (ms: number) => Promise<void>; move: (x: number, y: number) => Promise<void> }) => Promise<void>) => {
    cancel();
    const run = runId.current;
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => later(() => (runId.current === run ? res() : rej(new Error("cancelled"))), ms));
    const move = async (x: number, y: number) => {
      const from = walkerRef.current;
      if (!from) return;
      const d = Math.hypot(x - from.x, y - from.y);
      if (d < 3) return;
      const dur = reduce() ? 0 : Math.max(140, (d / SPEED) * 1000);
      const facing = x < from.x - 2 ? -1 : x > from.x + 2 ? 1 : from.facing;
      setWalker({ ...from, x, y, facing, walking: true, dur });
      sfx.walk(dur);
      await wait(dur);
      setWalker((w) => w && { ...w, walking: false });
      await wait(25);
    };
    steps({ wait, move }).catch(() => {});
  };

  useEffect(() => {
    const t = window.setTimeout(sfx.whoosh, 120);
    return () => clearTimeout(t);
  }, []);

  // Entrance: the airlock door opens and the engineer steps into the lobby. Re-runs if the plan changes.
  const ready = vp.w > 0;
  useEffect(() => {
    if (!ready) return;
    if (portrait) return setStatus("Skills · scroll, or tap a room tab");
    sequence(async ({ wait, move }) => {
      await wait(reduce() ? 0 : 500);
      setStatus("Entering the skill house");
      setDoor(true);
      await wait(reduce() ? 0 : 350);
      const d = lobbySpot();
      setWalker({ x: d.x, y: d.y, facing: 1, walking: false, dur: 0, visible: true });
      await wait(60);
      await move(d.x + LOBBY_WALK, d.y);
      setDoor(false);
      setStatus("Hall · pick any room on the plan");
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, rooms, portrait]);

  /** Picking a room zooms the camera to it; the engineer stays in the lobby. */
  const goRoom = (i: number | null) => {
    setFocus(i);
    if (i === null) sfx.bass();
    else sfx.node(i); // crystalline ping, higher for each room further along
    setStatus(i === null ? "Hall · pick any room on the plan" : `${groups[i].title} · ${groups[i].skills.length} technologies`);
  };

  /** Leave: walk back to the door, step out, then the scene fades away. */
  const leave = () => {
    if (portraitRef.current) {
      window.location.hash = "/home"; // no lobby or walker on phones
      return;
    }
    sequence(async ({ wait, move }) => {
      setFocus(null);
      setStatus("Heading out");
      const d = lobbySpot();
      await move(d.x, d.y);
      setWalker((w) => w && { ...w, facing: -1 });
      setDoor(true);
      await wait(reduce() ? 0 : 380);
      setWalker((w) => w && { ...w, visible: false });
      await wait(reduce() ? 0 : 420);
      window.location.hash = "/home";
    });
  };
  const leaveRef = useRef(leave);
  leaveRef.current = leave;
  // The top-bar door button and Escape ask the scene to leave; claim it so the walk-out plays first.
  useEffect(() => {
    const onExit = (e: Event) => {
      e.preventDefault();
      leaveRef.current();
    };
    window.addEventListener("exe-scene-exit", onExit);
    return () => window.removeEventListener("exe-scene-exit", onExit);
  }, []);

  const exit = (el: Element) => {
    const scene = el.closest<HTMLElement>(".scene");
    const r = el.getBoundingClientRect();
    scene?.style.setProperty("--iris-x", `${r.left + r.width / 2}px`);
    scene?.style.setProperty("--iris-y", `${r.top + r.height / 2}px`);
    leave();
  };

  // Keyboard navigation & zoom controls
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e) => {
    if (e.metaKey || e.ctrlKey || document.querySelector("dialog[open]")) return;
    if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;

    if (e.key === "+" || e.key === "=") {
      zoom(1.28);
      e.preventDefault();
    } else if (e.key === "-" || e.key === "_") {
      zoom(1 / 1.28);
      e.preventDefault();
    } else if (e.key === "0" || (e.key === "Escape" && view)) {
      setFocus(null);
      e.preventDefault();
    } else if (e.key.toLowerCase() === "l" || e.key.toLowerCase() === "h") {
      goRoom(null);
      e.preventDefault();
    } else {
      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= groups.length) {
        goRoom(digit - 1);
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // Wheel zoom centered on cursor
  const elRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (portraitRef.current) return; // let the phone plan scroll natively
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomRef.current(factor, e.clientX - r.left, e.clientY - r.top, false);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Drag to pan across floor map
  // Fingers on the map: one pans, two pinch to zoom around their midpoint.
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);
  const spread = () => {
    const [a, b] = [...fingers.current.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (portraitRef.current) return; // native scroll on phones
    if ((e.target as Element).closest(".room-hud, .sr-tabs, .sr-zoom, .sr-kiosk, button")) return;
    fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (fingers.current.size === 2) {
      pinchDist.current = spread().d;
      drag.current = { x: e.clientX, y: e.clientY, moved: true }; // a pinch is never a click
    } else {
      drag.current = { x: e.clientX, y: e.clientY, moved: false };
    }
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (fingers.current.has(e.pointerId)) fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (fingers.current.size === 2) {
      const s = spread();
      const r = e.currentTarget.getBoundingClientRect();
      if (pinchDist.current > 0) zoom(s.d / pinchDist.current, s.x - r.left, s.y - r.top, false);
      pinchDist.current = s.d;
      return;
    }
    const d = drag.current;
    if (!d || !view) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
    if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    drag.current = { x: e.clientX, y: e.clientY, moved: true };
    setSmooth(false);
    setView((v) => v && { ...v, x: v.x + dx, y: v.y + dy });
  };
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    fingers.current.delete(e.pointerId);
    pinchDist.current = 0;
    const left = [...fingers.current.values()][0];
    // one finger left after a pinch: carry on panning from where it is, without a jump
    if (left) drag.current = { x: left.x, y: left.y, moved: true };
    else window.setTimeout(() => (drag.current = null), 0);
  };
  const clicked = (fn: () => void) => () => {
    if (!drag.current?.moved) fn();
  };

  if (!groups.length) return <Head index="02" title="Skill tree" note="No skills published yet." />;

  const zoomed = view !== null;
  /** Height of the phone scroller: the plan at its fitted scale plus the room above and below it. */
  const scrollH = PORTRAIT_TOP + (H + HOUSE_PAD * 2) * fitView().k + PORTRAIT_BOTTOM;

  const plan = (
    <>
        {/* fixed backdrop: it must not scale with the camera (a huge scaled layer flickers) */}
        <div className="sr-blueprint-grid" style={portrait ? { height: scrollH, bottom: "auto" } : undefined} aria-hidden />
        {/* rack focus: the room starts close and blurred behind a hologram veil, then pulls back into focus */}
        <div className="sr-veil" aria-hidden />
        <div className="sr-pull">
        <div
          ref={worldRef}
          className={`sr-world${smooth ? " is-smooth" : ""}`}
          style={{ width: W, height: H, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})` }}
        >
          {/* Blueprint backdrop: cyberpunk grid, coordinate marks, sector stamps */}
          <div className="sr-blueprint-markers" style={{ width: W, height: H }} aria-hidden>
            <span className="sr-mark sr-mark-tl">FLOOR MAP // 2D ARCHITECTURAL BLUEPRINT</span>
            <span className="sr-mark sr-mark-tr">ELEVATION 0.00M // ALL SYSTEMS NOMINAL</span>
            <span className="sr-mark sr-mark-bl">ROOT HUB: LOBBY // WINGS 01-0{groups.length}</span>
            <span className="sr-mark sr-mark-br">GRID: 32PX // CAD_ACTIVE</span>
          </div>

          {/* The house: outer walls, then rooms sharing walls, with door openings between them */}
          <div className="sr-house" style={{ left: -HOUSE_PAD, top: -HOUSE_PAD, width: W + HOUSE_PAD * 2, height: H + HOUSE_PAD * 2 }} aria-hidden />

          {/* Central Lobby Wing (Sector 00 — Root Hub of the Facility); phones skip it */}
          {!portrait && (
          <div
            className={`sr-lobby-wing ${focus === null ? "is-focused" : ""}`}
            style={{ left: lobby.x + WALL, top: lobby.y + WALL, width: lobby.w - WALL * 2, height: lobby.h - WALL * 2 }}
          >
            <div className="sr-card-head">
              <div className="sr-card-meta">
                <span className="sr-room-code sr-code-green">RM-00</span>
              </div>
              <div className="sr-room-title-row">
                <Building2 size={18} className="sr-icon-green" aria-hidden />
                <span className="sr-room-title">Entry</span>
                <b className="sr-badge-green">{groups.length} ROOMS</b>
              </div>
              <div className="sr-card-divider sr-div-green" />
            </div>

            {/* Directory: one big button per room, filling the hall */}
            <div className="sr-kiosk" role="region" aria-label="Rooms">
              <div className="sr-kiosk-sub">SECTIONS</div>
              <div className="sr-kiosk-items" role="list">
                {groups.map((g, i) => {
                  const Icon = iconFor(g.title);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`sr-kiosk-row ${focus === i ? "is-selected" : ""}`}
                      style={{ "--bc": COLORS[i % COLORS.length] } as CSSProperties}
                      onClick={clicked(() => goRoom(i))}
                      aria-label={`${g.title}, ${g.skills.length} skills`}
                    >
                      <span className="sr-kiosk-icon">
                        <Icon size={18} aria-hidden />
                      </span>
                      <div className="sr-kiosk-info">
                        <span className="sr-kiosk-tag">
                          RM-0{i + 1}
                        </span>
                        <span className="sr-kiosk-name">{g.title}</span>
                      </div>
                      <span className="sr-kiosk-count">{g.skills.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lobby floor: the front door, with a little room to walk */}
            <div className="sr-lobby-floor">
              <button
                type="button"
                ref={doorRef}
                className={`room-door sr-front-door${door ? " is-open" : ""}`}
                onClick={(e) => exit(e.currentTarget)}
                aria-label="Leave the skill house through the front door"
              >
                <span className="room-door-gap" />
                <span className="room-door-panel">
                  <i />
                </span>
                <span className="room-door-sign">Exit</span>
              </button>
            </div>

            {/* Lobby Footer Status Bar */}
            <div className="sr-card-foot">
              <div className="sr-card-leds">
                <span className="sr-led sr-led-ok" />
                <span className="sr-led sr-led-act" />
                <span className="sr-led sr-led-pwr" />
              </div>
              <span className="sr-lobby-concourse-exit">CONCOURSE ──▶</span>
            </div>
          </div>
          )}

          {/* Connected Skill Rooms across 2D Space (North, South, East) */}
          {groups.map((g, i) => {
            const r = rooms[i];
            if (!r) return null;
            const Icon = iconFor(g.title);
            const color = COLORS[i % COLORS.length];

            return (
              <div
                key={g.id}
                className={`sr-room ${focus === i ? "is-focus" : ""}`}
                style={
                  {
                    left: r.x + WALL,
                    top: r.y + WALL,
                    width: r.w - WALL * 2,
                    height: r.h - WALL * 2,
                    "--bc": color,
                    "--cols": r.cols,
                  } as CSSProperties
                }
                onClick={clicked(() => goRoom(i))}
                role="region"
                aria-label={`Room 0${i + 1}: ${g.title}, ${g.skills.length} technologies`}
              >
                {/* Consistent Card Header */}
                <div className="sr-card-head">
                  <div className="sr-card-meta">
                    <span className="sr-room-code">RM-0{i + 1}</span>
                  </div>
                  <div className="sr-room-title-row">
                    <Icon size={18} className="sr-room-icon" aria-hidden />
                    <span className="sr-room-title">{g.title}</span>
                    <b className="sr-room-badge">{g.skills.length} TECH</b>
                  </div>
                  <div className="sr-card-divider" />
                </div>

                {/* Card Body: Consistent, balanced grid filling the card (NO SCROLLS!) */}
                <div className="sr-card-body">
                  <div className="sr-chips">
                    {g.skills.map((s, n) => (
                      <div
                        key={s}
                        className="sr-chip"
                        title={s}
                        // the last chip takes the rest of its row, so no empty cell is left over
                        style={n === g.skills.length - 1 && g.skills.length % r.cols ? { gridColumn: `span ${r.cols - (g.skills.length % r.cols) + 1}` } : undefined}
                      >
                        <span className="sr-chip-indicator" />
                        <span className="sr-chip-text">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Status Bar & Micro Diagnostics */}
                <div className="sr-card-foot">
                  <div className="sr-card-leds">
                    <span className="sr-led sr-led-ok" />
                    <span className="sr-led sr-led-act" />
                    <span className="sr-led sr-led-pwr" />
                  </div>
                  <span className="sr-card-foot-text">NODE 0{i + 1} // ACTIVE</span>
                </div>

              </div>
            );
          })}

          {/* The engineer in the lobby */}
          {walker && (
            <div
              className={`sr-walker ${walker.walking ? "is-walking" : ""}${walker.visible ? "" : " is-hidden"}`}
              style={{
                transform: `translate(${walker.x}px, ${walker.y}px)`,
                transitionDuration: `${walker.dur}ms`,
              }}
              aria-hidden
            >
              <div className="sr-walker-avatar" style={{ transform: `scale(${0.9 * walker.facing}, 0.9)` }}>
                <Player gradId="plv-skills" />
              </div>
              <div className="sr-walker-shadow" />
            </div>
          )}
        </div>

        </div>

    </>
  );

  return (
    <>
      <Head
        index="02"
        title="Skill house plan"
        note={`${groups.length} rooms · ${total} technologies. Pick a room and the engineer walks you there.`}
      />
      <div
        className={`sr-viewport${zoomed ? " can-pan" : ""}${portrait ? " is-portrait" : ""}`}
        ref={(el) => {
          elRef.current = el;
          viewportRef(el);
        }}
        aria-label="Skills Complex floor map. Scroll or +/- to zoom, drag to pan, select any room to walk there."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {portrait ? (
          <div className="sr-scroll" ref={scrollRef}>
            <div style={{ height: scrollH }} aria-hidden />
            {plan}
          </div>
        ) : (
          plan
        )}

        {/* Status HUD Header */}
        <div className="room-hud">
          <span className="room-status" aria-live="polite">
            <span className="sr-status-pulse" />
            {status || "Skills Complex 2D Floor Map"}
          </span>
        </div>

        {/* Zoom & View floating toolbar */}
        {!portrait && (
        <div className="sr-zoom" role="toolbar" aria-label="Floor map zoom controls">
          <button type="button" onClick={() => zoom(1.3)} aria-label="Zoom in (+ or =)" title="Zoom in (+)">
            <Plus size={16} />
          </button>
          <button type="button" onClick={() => zoom(1 / 1.3)} aria-label="Zoom out (- or _)" title="Zoom out (-)">
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setFocus(null)}
            disabled={!zoomed}
            aria-label="Full floor map overview (0 or Esc)"
            title="Full 2D Floor Map (0 or Esc)"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={() => goRoom(null)}
            aria-label="Walk to Lobby (L)"
            title="Central Lobby Concourse (L)"
            className={focus === null ? "is-active" : ""}
          >
            <Building2 size={16} />
          </button>
        </div>
        )}

        {/* Room Navigation Tabs along the bottom */}
        <div className="sr-tabs" role="tablist" aria-label="Facility Rooms">
          {!portrait && (
          <button
            type="button"
            role="tab"
            aria-selected={focus === null}
            className={`sr-tab-btn ${focus === null ? "is-active" : ""}`}
            onClick={() => goRoom(null)}
          >
            <Building2 size={13} className="mr-1" />
            <span>Central Lobby</span>
          </button>
          )}
          {groups.map((g, i) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={focus === i}
              style={{ "--bc": COLORS[i % COLORS.length] } as CSSProperties}
              className={`sr-tab-btn ${focus === i ? "is-active" : ""}`}
              onClick={() => goRoom(i)}
            >
              <span className="sr-tab-code">RM-0{i + 1}</span>
              <span>{g.title}</span>
              <b>{g.skills.length}</b>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
