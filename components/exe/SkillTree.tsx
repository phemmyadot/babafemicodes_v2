"use client";

import { Cloud, Code2, Cpu, Database, Hexagon, Maximize2, Minus, Plus, Rocket, Search, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
} from "react";
import { PROFILE } from "./data";
import { Head, useArcade } from "./ExeScreens";

/* ----------------------------------------------------------------- layout */
// A radial "constellation": the engineer at the centre, one hub per Sanity skill group,
// and each group's technologies on widening rings inside that group's wedge.

const COLORS = ["#4cd7f6", "#d0bcff", "#4edea3", "#fbbf24", "#ffb4ab", "#acedff", "#a5b4fc", "#f0abfc"];
const HUB_R = 190;
const RING0 = 340;
const RING_STEP = 128;
const ARC = 132; // minimum spacing between nodes along a ring
const GAP = 0.14; // radians left empty between wedges

type Kind = "core" | "hub" | "skill";
interface TNode {
  id: string;
  kind: Kind;
  label: string;
  x: number;
  y: number;
  angle: number;
  branch: number;
  ring: number;
}
interface Edge {
  a: TNode;
  b: TNode;
  branch: number;
}
interface View {
  x: number;
  y: number;
  k: number;
}
type Box = { x: number; y: number; w: number; h: number };

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

/** "React Native" → "RN", "TypeScript" → "TS", "Docker" → "DO". */
const monogram = (s: string) => {
  const clean = s.replace(/\(.*\)/, "").trim();
  const caps = clean.match(/[A-Z0-9]/g) ?? [];
  return caps.length >= 2 ? caps.slice(0, 3).join("") : clean.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
};
const norm = (s: string) => s.toLowerCase().replace(/\(.*\)/, "").trim();

const boundsOf = (list: TNode[], pad = 100): Box => {
  const xs = list.map((n) => n.x);
  const ys = list.map((n) => n.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
};

function layout(groups: Array<{ id: string; title: string; skills: string[] }>) {
  const total = Math.max(1, groups.reduce((n, g) => n + g.skills.length, 0));
  const core: TNode = { id: "core", kind: "core", label: PROFILE.name, x: 0, y: 0, angle: 0, branch: -1, ring: -1 };
  const nodes: TNode[] = [core];
  const edges: Edge[] = [];
  let start = -Math.PI / 2;
  groups.forEach((g, b) => {
    // Wedge size: half shared equally, half by how many skills the group has.
    const share = 2 * Math.PI * (0.5 / groups.length + (0.5 * g.skills.length) / total);
    const mid = start + share / 2;
    const wedge = share - GAP;
    const hub: TNode = { id: `hub-${g.id}`, kind: "hub", label: g.title, x: Math.cos(mid) * HUB_R, y: Math.sin(mid) * HUB_R, angle: mid, branch: b, ring: 0 };
    nodes.push(hub);
    edges.push({ a: core, b: hub, branch: b });
    let prev = [hub];
    let placed = 0;
    for (let ring = 0; placed < g.skills.length; ring++) {
      const r = RING0 + ring * RING_STEP;
      const fit = Math.max(1, Math.floor((r * wedge) / ARC));
      const m = Math.min(fit, g.skills.length - placed);
      const step = wedge / fit;
      const cur: TNode[] = [];
      for (let j = 0; j < m; j++) {
        const a = mid + (j - (m - 1) / 2) * step;
        const label = g.skills[placed + j];
        const n: TNode = { id: `${g.id}:${label}`, kind: "skill", label, x: Math.cos(a) * r, y: Math.sin(a) * r, angle: a, branch: b, ring: ring + 1 };
        // Connect to the closest node one ring in: a branching circuit rather than a fan.
        const parent = prev.reduce((best, p) => (Math.abs(p.angle - a) < Math.abs(best.angle - a) ? p : best), prev[0]);
        nodes.push(n);
        edges.push({ a: parent, b: n, branch: b });
        cur.push(n);
      }
      prev = cur;
      placed += m;
    }
    start += share;
  });
  const bounds = boundsOf(nodes, 110);
  const reach = Math.max(...nodes.map((n) => Math.hypot(n.x, n.y)));
  const rings = [HUB_R, ...Array.from({ length: 10 }, (_, i) => RING0 + i * RING_STEP)].filter((r) => r <= reach + 1);
  return { nodes, edges, bounds, rings };
}

/* -------------------------------------------------------------- component */

export function Skills() {
  const { skills: groups, missions, career } = useArcade();
  const tree = useMemo(() => layout(groups), [groups]);
  const total = groups.reduce((n, g) => n + g.skills.length, 0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 0.3 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const anim = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const [selected, setSelected] = useState("core");
  const [branch, setBranch] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const fitTo = useCallback(
    (b: Box): View => {
      const k = Math.min(size.w / b.w, size.h / b.h) * 0.94;
      return { k, x: size.w / 2 - (b.x + b.w / 2) * k, y: size.h / 2 - (b.y + b.h / 2) * k };
    },
    [size],
  );
  const fitAll = useCallback(() => fitTo(tree.bounds), [fitTo, tree.bounds]);
  const kRange = useCallback(() => {
    const k = fitAll().k;
    return { min: k * 0.6, max: Math.max(2.2, k * 4) };
  }, [fitAll]);

  const animateTo = useCallback((to: View) => {
    cancelAnimationFrame(anim.current);
    const from = viewRef.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setView(to);
      return;
    }
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 420);
      const e = 1 - (1 - p) ** 3;
      setView({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, k: from.k + (to.k - from.k) * e });
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  /** Zoom by `f`, keeping the screen point (cx, cy) fixed (default: the centre). */
  const zoom = useCallback(
    (f: number, cx = size.w / 2, cy = size.h / 2, smooth = false) => {
      const v = viewRef.current;
      const { min, max } = kRange();
      const k = Math.min(max, Math.max(min, v.k * f));
      const next = { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
      if (smooth) animateTo(next);
      else setView(next);
    },
    [animateTo, kRange, size],
  );

  const centreOn = (n: TNode, k = Math.max(viewRef.current.k, 1)) => animateTo({ k, x: size.w / 2 - n.x * k, y: size.h / 2 - n.y * k });

  // Measure the canvas; fit the whole constellation on open and on resize.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(anim.current);
    };
  }, []);
  useEffect(() => {
    if (size.w > 1) setView(fitAll());
  }, [size, fitAll]);

  // Wheel zoom toward the cursor (non-passive so the page doesn't scroll).
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(".sc-hud")) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    cancelAnimationFrame(anim.current);
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const r = e.currentTarget.getBoundingClientRect();
    if (pts.length === 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinch.current) zoom(d / pinch.current, (pts[0].x + pts[1].x) / 2 - r.left, (pts[0].y + pts[1].y) / 2 - r.top);
      pinch.current = d;
      if (drag.current) drag.current.moved = true;
      return;
    }
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
    if (!d.moved) {
      d.moved = true;
      // Capture only once dragging, so a plain click still reaches the node under the pointer.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setView((v) => ({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }));
  };
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };
  const onKeyDown = (e: RKeyboardEvent) => {
    if ((e.target as Element).closest("input")) return;
    const v = viewRef.current;
    const pan = 80;
    const map: Record<string, () => void> = {
      "+": () => zoom(1.3, undefined, undefined, true),
      "=": () => zoom(1.3, undefined, undefined, true),
      "-": () => zoom(1 / 1.3, undefined, undefined, true),
      "0": () => animateTo(fitAll()),
      ArrowLeft: () => animateTo({ ...v, x: v.x + pan }),
      ArrowRight: () => animateTo({ ...v, x: v.x - pan }),
      ArrowUp: () => animateTo({ ...v, y: v.y + pan }),
      ArrowDown: () => animateTo({ ...v, y: v.y - pan }),
    };
    if (!map[e.key]) return;
    e.preventDefault();
    map[e.key]();
  };

  const pickBranch = (b: number | null) => {
    setBranch(b);
    setQuery("");
    if (b === null) {
      setSelected("core");
      animateTo(fitAll());
      return;
    }
    const list = tree.nodes.filter((n) => n.branch === b);
    setSelected(list.find((n) => n.kind === "hub")!.id);
    animateTo(fitTo(boundsOf(list)));
  };
  const select = (n: TNode) => {
    if (drag.current?.moved) return;
    setSelected(n.id);
  };

  const q = norm(query);
  const matches = q ? tree.nodes.filter((n) => n.kind === "skill" && norm(n.label).includes(q)) : [];
  const runSearch = () => {
    if (!matches[0]) return;
    setSelected(matches[0].id);
    setBranch(null);
    centreOn(matches[0], Math.max(viewRef.current.k, 1.1));
  };
  const dimmed = (n: TNode) =>
    n.kind !== "core" && (q ? !(n.kind === "skill" && norm(n.label).includes(q)) : branch !== null && n.branch !== branch);

  // Radar mini-map: the whole constellation scaled into a square, plus the visible window.
  const RADAR = 120;
  const rs = RADAR / Math.max(tree.bounds.w, tree.bounds.h);
  const ox = (RADAR - tree.bounds.w * rs) / 2;
  const oy = (RADAR - tree.bounds.h * rs) / 2;
  const rx = (x: number) => (x - tree.bounds.x) * rs + ox;
  const ry = (y: number) => (y - tree.bounds.y) * rs + oy;
  const win = { x: -view.x / view.k, y: -view.y / view.k, w: size.w / view.k, h: size.h / view.k };

  if (!groups.length) return <Head index="02" title="Skill tree" note="No skills published yet." />;

  const sel = tree.nodes.find((n) => n.id === selected) ?? tree.nodes[0];
  const selColor = sel.branch >= 0 ? COLORS[sel.branch % COLORS.length] : COLORS[0];
  const usedIn = sel.kind === "skill" ? missions.filter((m) => m.tech.some((t) => norm(t) === norm(sel.label))) : [];
  const usedAt = sel.kind === "skill" ? career.filter((c) => c.tech.some((t) => norm(t) === norm(sel.label))) : [];

  return (
    <>
      <Head index="02" title="Skill tree" note={`${groups.length} branches · ${total} technologies, straight from my stack.`} />
      <div className="sc">
        {/* branch sectors */}
        <nav className="sc-rail" aria-label="Branches">
          <p className="sc-micro">Branch sectors</p>
          <button type="button" className="sc-sector" aria-pressed={branch === null} onClick={() => pickBranch(null)}>
            <span className="sc-dot" style={{ background: "#e2e8f0" }} /> All branches <b>{total}</b>
          </button>
          {groups.map((g, i) => (
            <button
              key={g.id}
              type="button"
              className="sc-sector"
              aria-pressed={branch === i}
              style={{ "--bc": COLORS[i % COLORS.length] } as CSSProperties}
              onClick={() => pickBranch(i)}
            >
              <span className="sc-dot" /> {g.title} <b>{g.skills.length}</b>
            </button>
          ))}
        </nav>

        {/* constellation canvas */}
        <div
          ref={canvasRef}
          className="sc-canvas"
          tabIndex={0}
          aria-label="Skill constellation. Drag to pan, scroll or pinch to zoom, plus and minus keys to zoom, arrow keys to move."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <div className="sc-world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
            <svg
              className="sc-lines"
              style={{ left: tree.bounds.x, top: tree.bounds.y, width: tree.bounds.w, height: tree.bounds.h }}
              viewBox={`${tree.bounds.x} ${tree.bounds.y} ${tree.bounds.w} ${tree.bounds.h}`}
              aria-hidden
            >
              {tree.rings.map((r) => (
                <circle key={r} className="sc-orbit" cx="0" cy="0" r={r} />
              ))}
              {tree.edges.map((e, i) => (
                <line
                  key={i}
                  className={`sc-edge${branch === e.branch || sel.branch === e.branch ? " is-live" : ""}${dimmed(e.b) ? " is-dim" : ""}`}
                  x1={e.a.x}
                  y1={e.a.y}
                  x2={e.b.x}
                  y2={e.b.y}
                  pathLength={1}
                  style={{ "--bc": COLORS[e.branch % COLORS.length], "--d": e.b.ring } as CSSProperties}
                />
              ))}
            </svg>

            {tree.nodes.map((n) => {
              const color = n.branch >= 0 ? COLORS[n.branch % COLORS.length] : COLORS[0];
              const Icon = n.kind === "core" ? Cpu : n.kind === "hub" ? iconFor(n.label) : null;
              const count = n.kind === "hub" ? groups[n.branch].skills.length : 0;
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`sc-node sc-${n.kind}${selected === n.id ? " is-selected" : ""}${dimmed(n) ? " is-dim" : ""}`}
                  style={{ left: n.x, top: n.y, "--bc": color, "--d": n.ring + 1 } as CSSProperties}
                  aria-pressed={selected === n.id}
                  aria-label={n.kind === "skill" ? `${n.label}, ${groups[n.branch].title}` : n.kind === "hub" ? `${n.label} branch, ${count} technologies` : n.label}
                  onClick={() => select(n)}
                >
                  {Icon ? <Icon size={n.kind === "core" ? 30 : 22} aria-hidden /> : <span className="sc-mono">{monogram(n.label)}</span>}
                  <span className="sc-label">{n.kind === "core" ? "Engineer core" : n.label}</span>
                  {n.kind === "hub" && <span className="sc-sub">{count} nodes</span>}
                  {n.kind === "core" && <span className="sc-tag">Origin</span>}
                </button>
              );
            })}
          </div>

          {/* HUD */}
          <div className="sc-hud sc-hud-top">
            <span className="sc-status">
              <i /> Skill grid <span>// {groups.length} branches · {total} nodes</span>
            </span>
            <label className="sc-search">
              <Search size={14} aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch();
                  if (e.key === "Escape") setQuery("");
                }}
                placeholder="Scan nodes…"
                aria-label="Search technologies"
              />
              {q && <span className="sc-micro">{matches.length}</span>}
            </label>
          </div>
          <div className="sc-hud sc-zoom" role="toolbar" aria-label="Zoom">
            <button type="button" onClick={() => zoom(1.3, undefined, undefined, true)} aria-label="Zoom in">
              <Plus size={15} />
            </button>
            <button type="button" onClick={() => zoom(1 / 1.3, undefined, undefined, true)} aria-label="Zoom out">
              <Minus size={15} />
            </button>
            <button type="button" onClick={() => pickBranch(null)} aria-label="Reset view">
              <Maximize2 size={14} />
            </button>
          </div>
          <p className="sc-hud sc-hint">Drag to pan · scroll to zoom</p>
          <svg
            className="sc-hud sc-radar"
            width={RADAR}
            height={RADAR}
            viewBox={`0 0 ${RADAR} ${RADAR}`}
            role="img"
            aria-label="Mini-map. Click to move the view."
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const wx = (e.clientX - r.left - ox) / rs + tree.bounds.x;
              const wy = (e.clientY - r.top - oy) / rs + tree.bounds.y;
              const k = viewRef.current.k;
              animateTo({ k, x: size.w / 2 - wx * k, y: size.h / 2 - wy * k });
            }}
          >
            <circle cx={RADAR / 2} cy={RADAR / 2} r={RADAR / 2 - 6} className="sc-radar-ring" />
            <circle cx={RADAR / 2} cy={RADAR / 2} r={RADAR / 4} className="sc-radar-ring" />
            {tree.nodes.map((n) => (
              <circle key={n.id} cx={rx(n.x)} cy={ry(n.y)} r={n.kind === "skill" ? 1.3 : 2.4} fill={n.branch >= 0 ? COLORS[n.branch % COLORS.length] : "#fff"} />
            ))}
            <rect className="sc-radar-win" x={rx(win.x)} y={ry(win.y)} width={win.w * rs} height={win.h * rs} />
          </svg>
        </div>

        {/* inspector */}
        <aside className="sc-inspector" aria-live="polite" style={{ "--bc": selColor } as CSSProperties}>
          <span className="sc-badge">{sel.kind === "core" ? "Origin" : sel.kind === "hub" ? "Branch" : groups[sel.branch].title}</span>
          <h2 className="sc-title">{sel.kind === "core" ? PROFILE.name : sel.label}</h2>
          {sel.kind === "core" && (
            <>
              <p className="sc-sector-line">{PROFILE.role}</p>
              <p className="sc-p">{PROFILE.intro}</p>
              <p className="sc-micro">Branches</p>
              <div className="sc-chips">
                {groups.map((g, i) => (
                  <button key={g.id} type="button" style={{ "--bc": COLORS[i % COLORS.length] } as CSSProperties} onClick={() => pickBranch(i)}>
                    {g.title} · {g.skills.length}
                  </button>
                ))}
              </div>
            </>
          )}
          {sel.kind === "hub" && (
            <>
              <p className="sc-sector-line">{groups[sel.branch].skills.length} technologies</p>
              <div className="sc-chips">
                {tree.nodes
                  .filter((n) => n.kind === "skill" && n.branch === sel.branch)
                  .map((n) => (
                    <button key={n.id} type="button" onClick={() => setSelected(n.id)}>
                      {n.label}
                    </button>
                  ))}
              </div>
            </>
          )}
          {sel.kind === "skill" && (
            <>
              <p className="sc-sector-line">Sector: {groups[sel.branch].title}</p>
              <p className="sc-micro">Used in projects</p>
              {usedIn.length ? (
                <ul className="sc-list">
                  {usedIn.map((m) => (
                    <li key={m.id}>{m.title}</li>
                  ))}
                </ul>
              ) : (
                <p className="sc-p sc-muted">No published project lists it yet.</p>
              )}
              <p className="sc-micro">Used at</p>
              {usedAt.length ? (
                <ul className="sc-list">
                  {usedAt.map((c) => (
                    <li key={c.id}>
                      {c.org} <span>{c.role}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sc-p sc-muted">Part of my {groups[sel.branch].title.toLowerCase()} toolkit.</p>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
