"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { sfx } from "./audio";
import { playCrtOn } from "./crt-sound";
import { ATTRIBUTES, PROFILE, type PartSlot } from "./data";
import { Avatar, Head, Meta, ResumeButton, useArcade } from "./ExeScreens";
import { Player } from "./GameWorld";

type Phase = "build" | "booting" | "on";

const ALL = ATTRIBUTES.map((a) => a.slot);
const POST = [
  "B-ADO BIOS v8.0  (C) 2026",
  ...ATTRIBUTES.map((a) => `${a.part.padEnd(4)} ${a.name.padEnd(22, ".")} OK`),
  "Booting engineer profile...",
];
// Room geometry in design units; the room scales to fit the screen. Side view: door on the
// left, the PC table in the middle (open test-bench board + monitor), the parts shelf on the right.
// Everything shares one human scale: the engineer's sprite is 175 tall, a door is ~1.2x that and
// the desk reaches his hip. The room is taller than its contents need, so the camera sits back
// and the scene reads as a room with depth, not a close-up.
const ROOM_W = 1320;
const FLOOR = 640;
const ROOM_H = FLOOR + 80;
const ZOOM_OUT = 0.9; // pull the camera back a little more, so walls and floor frame the scene
const DOOR = { x: 40, w: 96, h: 215 };
const DOOR_X = DOOR.x + DOOR.w / 2;
const DESK_TOP = FLOOR - 100;
const BOARD = { x: 405, w: 270, h: 304, y: DESK_TOP - 304 };
const SCREEN = { x: 722, w: 160, h: 90, y: DESK_TOP - 50 - 90 }; // 50 = the monitor's stand
// After power-on, in the same room: the board shrinks on the desk and the monitor grows so the
// profile on it is readable. The engineer waits by the door.
const BOARD_DONE = { x: 215, w: 120, h: 135, y: DESK_TOP - 135 };
const SCREEN_DONE = { x: 400, w: 640, h: 360, y: DESK_TOP - 28 - 360 }; // 16:9 // 28 = the stand once it has grown
const BEZEL = 10;
// The profile is laid out once at the monitor's inner size and scaled with the room, so its margins never change.
const FIT = { w: SCREEN_DONE.w - BEZEL * 2, h: SCREEN_DONE.h - BEZEL * 2 };
const DESK = { x: 150, w: 920 };
const STAND_X = 382; // in the gap between the finished board and the monitor
/** A point along the board's width, so the standing spots follow the board's size. */
const onBoard = (f: number) => BOARD.x + f * BOARD.w;
const POWER_X = onBoard(0.94);
const SHELF = { x: 1060, y: FLOOR - 364, w: 232 };
const SHELF_ROWS = [FLOOR - 260, FLOOR - 160, FLOOR - 60];
// A part is drawn at this scale on the shelf, in his hands and in its socket, so it never changes size.
const PART_SCALE = BOARD.w / 640;
/** Where each part sits on the shelf (centre x, shelf-board y) and where he stands to fit it. */
const ON_SHELF: Record<PartSlot, { x: number; y: number }> = {
  cpu: { x: 1116, y: SHELF_ROWS[0] },
  gpu: { x: 1224, y: SHELF_ROWS[0] },
  ram: { x: 1116, y: SHELF_ROWS[1] },
  ssd: { x: 1224, y: SHELF_ROWS[1] },
  nic: { x: 1116, y: SHELF_ROWS[2] },
  npu: { x: 1224, y: SHELF_ROWS[2] },
};
const FIT_X: Record<PartSlot, number> = { cpu: onBoard(0.28), npu: onBoard(0.59), ram: onBoard(0.84), ssd: onBoard(0.28), nic: onBoard(0.59), gpu: onBoard(0.44) };
// Walking speed in room units per second; each trip's duration comes from its distance.
const SPEED = 780;
// Wait for the scene's entrance animation before the door opens.
const ENTER_DELAY = 700;
// Copper traces and vias, in % of the board (the SVG stretches; strokes keep their width).
// They run through the board margins and the gaps between sockets.
const TRACES = [
  "M95.5 32 V5 H58",
  "M96.6 34 V6.6 H60",
  "M95.5 62 V67.8 H81.4 V40.6 H41",
  "M96.6 64 V68.8 H82.4",
  "M40.8 40.6 V67.8 H6",
  "M3 12 V88.5 H38",
  "M4.2 14 V87.4 H36",
  "M41.8 8 H20",
  "M58 95.5 H90",
  "M81.4 68.8 V94.4 H70",
];
const VIAS: Array<[number, number]> = [
  [58, 5], [60, 6.6], [41, 40.6], [6, 67.8], [38, 88.5], [36, 87.4], [20, 8], [90, 95.5], [70, 94.4], [3, 12], [4.2, 14], [82.4, 68.8],
];
const SILK: Record<PartSlot, string> = { cpu: "CPU1", npu: "NPU1", ram: "DIMM_A1", ssd: "M2_1", nic: "PCIE_X1", gpu: "PCIE_X16" };

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Decorative part artwork, drawn in CSS (see .lab-art-* in exe.css). */
function PartArt({ slot }: { slot: PartSlot }) {
  return (
    <span className={`lab-art lab-art-${slot}`} aria-hidden>
      {slot === "gpu" && (
        <>
          <i />
          <i />
        </>
      )}
      {slot === "npu" && "AI"}
    </span>
  );
}

/**
 * Engineering Lab (Profile): a side-view room. The engineer comes in through the door, fetches
 * each part from the shelf and fits it on the open test bench, presses power, walks back out,
 * and the camera zooms into the monitor as it boots into the profile. The door (or the button
 * in the profile view) leaves the lab. Leaving unmounts this and cancels every pending step.
 */
export function Profile() {
  const { contact } = useArcade();
  const [installed, setInstalled] = useState<PartSlot[]>([]);
  const [phase, setPhase] = useState<Phase>("build");
  const [log, setLog] = useState<string[]>([]);
  const [powered, setPowered] = useState(false);
  // Bumps when the last part seats: plays the LED sweep and spark burst once.
  const [fx, setFx] = useState(0);
  const [door, setDoor] = useState(false);
  const [status, setStatus] = useState("");
  const [walker, setWalker] = useState<{
    x: number;
    facing: 1 | -1;
    walking: boolean;
    dur: number;
    carry: PartSlot | null;
    press: boolean;
    visible: boolean;
  } | null>(null);
  const walkerRef = useRef(walker);
  walkerRef.current = walker;
  const runId = useRef(0);
  const timers = useRef<number[]>([]);

  // Room viewport size, for fitting the room and for the monitor zoom.
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const ro = useRef<ResizeObserver | null>(null);
  const viewportRef = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.current.observe(el);
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const cancel = () => {
    runId.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const boot = useCallback(() => {
    setStatus("System online");
    setPhase("booting");
    setLog([]);
    POST.forEach((line, i) => later(() => setLog((l) => [...l, line]), 150 + i * 170));
    later(() => setPhase("on"), 150 + POST.length * 170 + 450);
    later(sfx.bootChime, 500);
  }, []);

  const finish = useCallback(() => {
    cancel();
    setInstalled(ALL);
    setPowered(true);
    setDoor(false);
    setWalker({ x: STAND_X, facing: 1, walking: false, dur: 0, carry: null, press: false, visible: true });
    setStatus("System online");
    setPhase("on");
  }, []);

  const assemble = useCallback(() => {
    cancel();
    setInstalled([]);
    setPowered(false);
    setFx(0);
    setLog([]);
    setDoor(false);
    setWalker(null);
    setStatus("");
    setPhase("build");
    if (reduceMotion()) {
      finish();
      return;
    }
    const run = runId.current;
    const wait = (ms: number) => new Promise<void>((res) => later(res, ms));
    const alive = () => runId.current === run;
    const set = (patch: Partial<NonNullable<typeof walker>>) => setWalker((w) => w && { ...w, ...patch });
    const walkTo = async (x: number, carry: PartSlot | null) => {
      const from = walkerRef.current;
      if (!from) return;
      const dur = Math.max(200, (Math.abs(x - from.x) / SPEED) * 1000);
      const facing = x < from.x - 2 ? -1 : x > from.x + 2 ? 1 : from.facing;
      // Functional update: a pose set just before this call may not have rendered yet.
      setWalker((w) => w && { ...w, x, facing, walking: true, dur, carry, press: false });
      sfx.walk(dur);
      await wait(dur);
      if (!alive()) throw new Error("cancelled");
      set({ walking: false });
      await wait(40);
    };
    (async () => {
      await wait(ENTER_DELAY);
      setStatus("Engineer entering the lab");
      setDoor(true);
      await wait(380);
      setWalker({ x: DOOR_X, facing: 1, walking: false, dur: 0, carry: null, press: false, visible: false });
      await wait(40);
      set({ visible: true });
      await wait(260);
      let first = true;
      for (const a of ATTRIBUTES) {
        setStatus(`Fetching the ${a.partName.toLowerCase()} · ${a.name}`);
        await walkTo(ON_SHELF[a.slot].x, null);
        if (first) {
          setDoor(false);
          first = false;
        }
        set({ press: true });
        await wait(170);
        set({ carry: a.slot, press: false });
        await wait(120);
        setStatus(`Fitting the ${a.part} · ${a.name}`);
        await walkTo(FIT_X[a.slot], a.slot);
        set({ press: true });
        await wait(150);
        setInstalled((s) => [...s, a.slot]);
        sfx.clack();
        set({ carry: null, press: false });
        await wait(150);
        if (a === ATTRIBUTES[ATTRIBUTES.length - 1]) {
          // Final part clicked in: LED sweep + sparks, and a beat to enjoy it before power.
          setFx((n) => n + 1);
          setStatus("All parts seated");
          await wait(800);
        }
      }
      setStatus("Powering on");
      await walkTo(POWER_X, null);
      set({ press: true });
      setPowered(true);
      sfx.whine();
      later(playCrtOn, 700);
      await wait(360);
      set({ press: false });
      setStatus("Engineer stepping back");
      await walkTo(STAND_X, null);
      set({ facing: 1 });
      await wait(200);
      if (alive()) boot();
    })().catch(() => {});
  }, [boot, finish]);

  useEffect(() => {
    assemble();
    return cancel;
  }, [assemble]);

  const skip = finish;

  /** Leave the lab: the engineer walks to the door and out, then the scene's exit wipe closes in on the door. */
  const exiting = useRef(false);
  const exitLab = (el?: Element | null) => {
    if (exiting.current) return;
    exiting.current = true;
    cancel();
    const run = runId.current;
    const wait = (ms: number) => new Promise<void>((res) => later(res, ms));
    const w = walkerRef.current;
    (async () => {
      if (w?.visible && !reduceMotion()) {
        setStatus("Leaving the lab");
        setDoor(true);
        const dur = Math.max(250, (Math.abs(w.x - DOOR_X) / SPEED) * 1000);
        setWalker((c) => c && { ...c, x: DOOR_X, facing: -1, walking: true, dur, carry: null, press: false });
        sfx.walk(dur);
        await wait(dur);
        setWalker((c) => c && { ...c, walking: false, visible: false });
        await wait(420);
      }
      if (runId.current !== run) return;
      const door = el ?? document.querySelector(".room-door");
      const scene = door?.closest<HTMLElement>(".scene");
      const r = door?.getBoundingClientRect();
      if (r) {
        scene?.style.setProperty("--iris-x", `${r.left + r.width / 2}px`);
        scene?.style.setProperty("--iris-y", `${r.top + r.height / 2}px`);
      }
      window.location.hash = "/home";
    })();
  };
  const exitRef = useRef(exitLab);
  exitRef.current = exitLab;
  // The top-bar door button and Escape ask the scene to leave; claim it so the walk-out plays first.
  useEffect(() => {
    const onExit = (e: Event) => {
      e.preventDefault();
      exitRef.current();
    };
    window.addEventListener("exe-scene-exit", onExit);
    return () => window.removeEventListener("exe-scene-exit", onExit);
  }, []);

  // The room is scaled to fit; the board/monitor swap sizes once the PC is on.
  const k = vp.w ? Math.min(vp.w / ROOM_W, vp.h / ROOM_H) * ZOOM_OUT : 0.5;
  const off = { x: (vp.w - ROOM_W * k) / 2, y: (vp.h - ROOM_H * k) / 2 };
  const done = phase !== "build";
  const board = done ? BOARD_DONE : BOARD;
  const screen = done ? SCREEN_DONE : SCREEN;
  // The monitor's content is real-size HTML laid over the screen (not scaled with the room), so
  // it stays readable. On narrow screens it takes the whole viewport instead.
  let ui = { left: off.x + (screen.x + BEZEL) * k, top: off.y + (screen.y + BEZEL) * k, width: (screen.w - BEZEL * 2) * k, height: (screen.h - BEZEL * 2) * k };
  // On phones the monitor is too small to read: the profile fills the viewport and scrolls instead.
  const fluid = ui.width < 330;
  if (fluid) ui = { left: 10, top: 56, width: vp.w - 20, height: vp.h - 66 };
  const fitScale = ui.width / FIT.w;

  return (
    <>
      <Head index="01" title="Engineering lab" note={done ? "System online. The engineer profile is on screen." : "Watch the engineer build the rig: every part is an attribute."} />
      <div className="lab-viewport" ref={viewportRef}>
        <div
          className={`lab-room${done ? " is-done" : ""}`}
          style={{ width: ROOM_W, height: ROOM_H, "--ps": PART_SCALE, transform: `translate(${off.x}px, ${off.y}px) scale(${k})` } as CSSProperties}
        >
          <span className="room-wall" aria-hidden />
          <span className="room-sign" style={{ top: FLOOR - 468 }} aria-hidden>
            B-ADO LAB
          </span>
          <span className="room-lamp" style={{ left: 600, height: DESK_TOP - BOARD.h - 70 }} aria-hidden />
          <span className="room-floor" style={{ top: FLOOR }} aria-hidden />

          <button
            type="button"
            className={`room-door${door ? " is-open" : ""}`}
            style={{ left: DOOR.x, top: FLOOR - DOOR.h, width: DOOR.w, height: DOOR.h }}
            onClick={(e) => exitLab(e.currentTarget)}
            aria-label="Leave the lab through the door"
          >
            <span className="room-door-gap" />
            <span className="room-door-panel">
              <i />
            </span>
            <span className="room-door-sign">Exit</span>
          </button>

          {/* PC table: open test-bench motherboard + monitor */}
          <span className="room-desk" style={{ left: DESK.x, top: DESK_TOP, width: DESK.w, height: FLOOR - DESK_TOP }} aria-hidden>
            <i />
            <i />
          </span>
          <div className="room-bench" style={{ left: board.x, top: board.y, width: board.w, height: board.h }}>
            <div className="room-board-scale" style={{ transform: `scale(${board.w / 640})` }}>
              <section
                className={`lab-board${powered ? " is-powered" : ""}`}
                aria-label={`Motherboard, ${installed.length} of ${ALL.length} parts installed${powered ? ", powered on" : ""}`}
              >
                {/* PCB artwork: traces, connectors and components. Decorative only. */}
                <svg className="pcb-traces" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <g className="pcb-trace-base">
                    {TRACES.map((d) => (
                      <path key={d} d={d} vectorEffect="non-scaling-stroke" />
                    ))}
                  </g>
                  <g className="pcb-trace-flow">
                    {TRACES.map((d) => (
                      <path key={d} d={d} vectorEffect="non-scaling-stroke" />
                    ))}
                  </g>
                  <g className="pcb-vias">
                    {VIAS.map(([x, y]) => (
                      <path key={`${x}-${y}`} d={`M${x} ${y}h0`} vectorEffect="non-scaling-stroke" />
                    ))}
                  </g>
                </svg>
                {fx > 0 && <span key={fx} className="lab-sweep" aria-hidden />}
                <span className="lab-board-name" aria-hidden>
                  B-ADO MOTHERBOARD REV 8
                </span>
                <span className="pcb-io" aria-hidden>
                  <i className="io-usb" />
                  <i className="io-usb" />
                  <i className="io-hdmi" />
                  <i className="io-lan" />
                  <b>REAR_IO</b>
                </span>
                <span className="pcb-eps" aria-hidden>
                  <i className="pins" />
                  <b>CPU_PWR</b>
                </span>
                <span className="pcb-atx" aria-hidden>
                  <i className="pins" />
                  <b>ATX_24P</b>
                </span>
                <span className="pcb-vrm" aria-hidden>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="pcb-caps" aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i key={i} />
                  ))}
                </span>
                <span className="pcb-bottom" aria-hidden>
                  <span className="pcb-cmos">
                    <i />
                    <b>BAT1</b>
                  </span>
                  <span className="pcb-pch">
                    <i />
                    <b>PCH</b>
                  </span>
                  <span className="pcb-sata">
                    <span>
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <b>SATA3</b>
                  </span>
                  <span className="pcb-fpanel">
                    <i className="pins" />
                    <b>F_PANEL</b>
                  </span>
                  <span className="pcb-pwr">
                    <i className="pcb-led" />
                    <i className="pcb-btn" />
                    <b>PWR</b>
                  </span>
                </span>
                {ATTRIBUTES.map((a) => {
                  const on = installed.includes(a.slot);
                  return (
                    <div
                      key={a.slot}
                      className={`lab-socket lab-socket-${a.slot}${on ? " is-on" : ""}`}
                      data-silk={SILK[a.slot]}
                    >
                      {on ? (
                        <span className="lab-part">
                          <PartArt slot={a.slot} />
                          <span className="lab-part-code">{a.part}</span>
                          <span className="lab-part-attr">{a.name}</span>
                          {fx > 0 && a === ATTRIBUTES[ATTRIBUTES.length - 1] && (
                            <span key={fx} className="lab-spark" aria-hidden>
                              {Array.from({ length: 14 }, (_, i) => (
                                <i key={i} style={{ "--a": `${i * (360 / 14) + (i % 2 ? 9 : 0)}deg`, "--d": `${44 + (i % 3) * 16}px` } as CSSProperties} />
                              ))}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="lab-empty">
                          <i className="lab-slot" aria-hidden />
                          {a.part} slot
                        </span>
                      )}
                    </div>
                  );
                })}
              </section>
            </div>
          </div>
          <div className={`room-monitor${powered ? " is-on" : ""}`} style={{ left: screen.x, top: screen.y, width: screen.w, height: screen.h }} aria-hidden>
            <span className="room-screen">{powered && !done ? "BOOT_" : ""}</span>
            <span className="room-monitor-stand" />
          </div>

          {/* parts shelf */}
          <span className="room-shelf" style={{ left: SHELF.x, top: SHELF.y, width: SHELF.w, height: FLOOR - SHELF.y }} aria-hidden>
            {SHELF_ROWS.map((y) => (
              <i key={y} style={{ top: y - SHELF.y }} />
            ))}
          </span>
          {ATTRIBUTES.map((a) =>
            installed.includes(a.slot) || walker?.carry === a.slot ? null : (
              <span key={a.slot} className={`room-shelf-part room-shelf-${a.slot}`} style={{ left: ON_SHELF[a.slot].x, top: ON_SHELF[a.slot].y }} aria-hidden>
                <PartArt slot={a.slot} />
              </span>
            ),
          )}
          {walker && (
            <span
              className={`lab-walker${walker.walking ? " is-walking" : ""}${walker.press ? " is-press" : ""}${walker.visible ? "" : " is-hidden"}`}
              style={{ transform: `translate(${walker.x}px, ${FLOOR}px)`, transitionDuration: `${walker.dur}ms` }}
              aria-hidden
            >
              {walker.carry && (
                <span className="lab-walker-carry">
                  <PartArt slot={walker.carry} />
                </span>
              )}
              <span className="lab-walker-body" style={{ transform: `scaleX(${walker.facing})` }}>
                <Player gradId="plv-lab" />
              </span>
            </span>
          )}
        </div>

        {done && (
          <section className="room-screen-ui" style={ui} aria-label="Monitor">
            <div className={`lab-fit${fluid ? " is-fluid" : ""}`} style={fluid ? undefined : { width: FIT.w, height: FIT.h, transform: `scale(${fitScale})` }}>
            {phase === "booting" ? (
              <pre className="lab-post" aria-live="polite">
                {log.join("\n")}
                <span className="lab-cursor">_</span>
              </pre>
            ) : (
            <div className="lab-desktop">
              <header className="lab-id">
                <Avatar />
                <div className="lab-id-text">
                  <h2 className="lab-name">{PROFILE.name}</h2>
                  <p className="lab-role">{PROFILE.role}</p>
                  <Meta
                    items={[
                      <>
                        <span className="x-dot" aria-hidden /> Available for opportunities
                      </>,
                    ]}
                  />
                </div>
              </header>
              <div className="lab-main">
              <div className="lab-col">
              <dl className="lab-facts">
                <div>
                  <dt>Specialization</dt>
                  <dd>{PROFILE.specialization}</dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>{PROFILE.experience}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{PROFILE.location}</dd>
                </div>
                <div>
                  <dt>Core tech</dt>
                  <dd>{PROFILE.core.join(", ")}</dd>
                </div>
              </dl>
              <div className="lab-actions">
                <ResumeButton className="x-btn x-btn-primary x-btn-sm" />
                {contact.linkedin && (
                  <a className="x-btn x-btn-sm" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    <LinkedinIcon size={14} /> LinkedIn
                  </a>
                )}
                {contact.github && (
                  <a className="x-btn x-btn-sm" href={contact.github} target="_blank" rel="noopener noreferrer">
                    <GithubIcon size={14} /> GitHub
                  </a>
                )}
              </div>
              </div>
              <ul className="lab-speclist" aria-label="System specs">
                {ATTRIBUTES.map((a) => (
                  <li key={a.slot}>
                    <strong>{a.name}</strong>
                    <span>{a.evidence}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
            )}
            </div>
          </section>
        )}

        <div className="room-hud">
          <span className="room-status" aria-live="polite">
            <b>
              {installed.length}/{ALL.length}
            </b>{" "}
            {status || "Preparing the lab"}
          </span>
          <span className="room-hud-actions">
            {done ? (
              <button type="button" className="x-btn x-btn-sm" onClick={assemble}>
                <RotateCcw size={14} aria-hidden /> Rebuild PC
              </button>
            ) : (
              <button type="button" className="x-btn x-btn-sm" onClick={skip}>
                Skip to profile
              </button>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
