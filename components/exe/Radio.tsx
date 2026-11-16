"use client";

import { Mail } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { sfx } from "./audio";
import { Head, useArcade } from "./ExeScreens";
import { Player, skyline, Stars } from "./GameWorld";

// Radio Tower: the highest rooftop at dusk. The engineer climbs out of the stairwell door and stands at a
// radio console. The terminal panel takes the message; "Transmit signal" swings the satellite dish round to
// lock on a target, pulses waves into the sky, and ends with a green blip. The console's frequency dials
// are the quick links (GitHub, LinkedIn, email).
const ROOM_W = 1300;
const FLOOR = 640;
const ROOM_H = FLOOR + 80;
const DOOR = { x: 1130, w: 96, h: 215 };
const DOOR_X = DOOR.x + DOOR.w / 2;
const CONSOLE = { x: 500, w: 270, h: 110 };
const STAND_X = 840;
const SPEED = 780;
const PIVOT = { x: 960, y: FLOOR - 270 }; // the dish's mount
const TARGET = { x: 1170, y: 140 }; // the point in the sky it locks on
const LOCK_DEG = (Math.atan2(TARGET.x - PIVOT.x, PIVOT.y - TARGET.y) * 180) / Math.PI;
const IDLE_DEG = -26;
const CITY_FAR = skyline(1400, 240, "#1b1244", "#ffb36b", 21);
const CITY_NEAR = skyline(1400, 150, "#0d0a26", "#ffd23f", 8);
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "idle" | "lock" | "send" | "ok";
type Walker = { x: number; facing: 1 | -1; walking: boolean; dur: number; visible: boolean };

export function Radio() {
  const { contact } = useArcade();
  const [vp, setVp] = useState({ w: 0, h: 0 });
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
  const [phase, setPhase] = useState<Phase>("idle");

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

  // Entrance: out of the stairwell door and over to the console.
  useEffect(() => {
    if (reduceMotion()) {
      place({ x: STAND_X, facing: -1, walking: false, dur: 0, visible: true });
      setStatus("Radio Tower · ready to transmit");
      return;
    }
    seq(async ({ wait, walkTo }) => {
      await wait(700);
      setStatus("Climbing to the roof");
      setDoor(true);
      await wait(380);
      place({ x: DOOR_X, facing: -1, walking: false, dur: 0, visible: false });
      await wait(40);
      place({ ...walkerRef.current!, visible: true });
      await wait(260);
      await walkTo(STAND_X);
      setDoor(false);
      place({ ...walkerRef.current!, facing: -1 });
      setStatus("Radio Tower · ready to transmit");
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exiting = useRef(false);
  const leave = (el?: Element | null) => {
    if (exiting.current) return;
    exiting.current = true;
    const w = walkerRef.current;
    seq(async ({ wait, walkTo }) => {
      if (w?.visible && !reduceMotion()) {
        setStatus("Heading back down");
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
  useEffect(() => {
    const onExit = (e: Event) => {
      e.preventDefault();
      leaveRef.current();
    };
    window.addEventListener("exe-scene-exit", onExit);
    return () => window.removeEventListener("exe-scene-exit", onExit);
  }, []);

  /** Transmit: lock on, pulse, green blip; then hand the message to the visitor's mail app. */
  const transmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phase === "lock" || phase === "send") return;
    const f = new FormData(e.currentTarget);
    const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`;
    const mail = `mailto:${contact.email}?subject=${encodeURIComponent(String(f.get("subject")))}&body=${encodeURIComponent(body)}`;
    // shortcut: there is no mail backend, so the message goes via the visitor's mail app; add an API route to send it directly.
    if (reduceMotion()) {
      setPhase("ok");
      setStatus("Signal locked · message ready in your mail app");
      window.location.href = mail;
      return;
    }
    sfx.servo(1.4); // the dish swings round
    setPhase("lock");
    setStatus("Acquiring target…");
    later(() => {
      setPhase("send");
      sfx.burstData(); // morse-style data burst
      setStatus("Transmitting…");
    }, 1500);
    later(() => {
      setPhase("ok");
      sfx.confirm();
      setStatus("Signal locked · message ready in your mail app");
    }, 3100);
    later(() => {
      window.location.href = mail;
    }, 3500);
  };

  // Camera: the whole rooftop when it fits; on a narrow screen it keeps a readable size and follows the engineer.
  const fit = vp.w ? Math.min(vp.w / ROOM_W, vp.h / ROOM_H) * 0.92 : 0.5;
  const k = vp.w ? Math.max(fit, Math.min(0.55, (vp.h / ROOM_H) * 0.92)) : 0.5;
  const wx = walker?.x ?? STAND_X;
  const tx = ROOM_W * k <= vp.w ? (vp.w - ROOM_W * k) / 2 : Math.min(0, Math.max(vp.w - ROOM_W * k, vp.w / 2 - wx * k));
  const ty = (vp.h - ROOM_H * k) / 2;
  const roomMove = ROOM_W * k > vp.w && walker?.walking ? walker.dur : 450;

  const busy = phase === "lock" || phase === "send";
  const aim = phase === "idle" ? IDLE_DEG : LOCK_DEG;
  const dials = [
    contact.github && { key: "gh", href: contact.github, label: "GitHub", icon: <GithubIcon size={22} />, ext: true },
    contact.linkedin && { key: "li", href: contact.linkedin, label: "LinkedIn", icon: <LinkedinIcon size={22} />, ext: true },
    contact.email && { key: "em", href: `mailto:${contact.email}`, label: "Email", icon: <Mail size={22} aria-hidden />, ext: false },
  ].filter(Boolean) as Array<{ key: string; href: string; label: string; icon: React.ReactNode; ext: boolean }>;

  return (
    <>
      <Head index="06" title="Radio tower" note="Send a message: fill in the terminal and transmit. The dials on the console link to GitHub, LinkedIn and email." />
      <div className={`lab-viewport rt-viewport is-${phase}`} ref={viewportRef}>
        <Stars />
        <div
          className="lab-room rt-room"
          style={{ width: ROOM_W, height: ROOM_H, transform: `translate(${tx}px, ${ty}px) scale(${k})`, transition: `transform ${roomMove}ms linear` } as CSSProperties}
        >
          <span className="rt-city rt-city-far" style={{ top: FLOOR - 250, backgroundImage: CITY_FAR }} aria-hidden />
          <span className="rt-city rt-city-near" style={{ top: FLOOR - 150, backgroundImage: CITY_NEAR }} aria-hidden />
          <span className="rt-roof" style={{ top: FLOOR }} aria-hidden />
          <span className="rt-rail" style={{ top: FLOOR - 62 }} aria-hidden />

          {/* radio mast with aviation lights */}
          <svg className="rt-mast" style={{ left: 250, top: FLOOR - 470 }} width="110" height="470" viewBox="0 0 110 470" aria-hidden>
            <g stroke="#6c7396" strokeWidth="4" fill="none">
              <path d="M10 470 L55 8 L100 470" />
              <path d="M24 330 L86 330 M33 240 L77 240 M41 160 L69 160 M48 90 L62 90" />
              <path d="M10 470 L86 330 L24 330 L77 240 L33 240 L69 160 L41 160 L62 90 L48 90 L55 8" strokeWidth="2" />
            </g>
          </svg>
          <i className="rt-light" style={{ left: 250 + 55 - 7, top: FLOOR - 470 - 6 }} aria-hidden />
          <i className="rt-light" style={{ left: 250 + 70 - 7, top: FLOOR - 470 + 240 }} aria-hidden />
          <i className="rt-light" style={{ left: 250 + 30 - 7, top: FLOOR - 470 + 400, animationDelay: "0.7s" }} aria-hidden />

          {/* the satellite dish: aims, then pulses waves up its axis */}
          <span className="rt-pole" style={{ left: PIVOT.x - 7, top: PIVOT.y, height: FLOOR - PIVOT.y }} aria-hidden />
          <span className={`rt-dish${phase === "idle" ? " is-scan" : ""}`} style={{ left: PIVOT.x, top: PIVOT.y, "--a": `${aim}deg` } as CSSProperties} aria-hidden>
            <span className="rt-dish-sweep">
              <svg width="220" height="130" viewBox="-110 -78 220 130" overflow="visible">
                <defs>
                  <linearGradient id="rt-dish-g" x1="0" x2="1">
                    <stop offset="0" stopColor="#8f98bd" />
                    <stop offset="0.5" stopColor="#eef1ff" />
                    <stop offset="1" stopColor="#7f89b0" />
                  </linearGradient>
                </defs>
                <path d="M-100 -22 Q0 78 100 -22 Q0 28 -100 -22 Z" fill="url(#rt-dish-g)" stroke="#5b6490" strokeWidth="2" />
                <path d="M0 24 L0 -66" stroke="#aab2d6" strokeWidth="4" />
                <circle cx="0" cy="-68" r="6" fill="#ffd23f" />
              </svg>
              <span className="rt-waves">
                <i />
                <i />
                <i />
              </span>
            </span>
          </span>
          {/* the thing it locks on to */}
          <span className="rt-target" style={{ left: TARGET.x - 20, top: TARGET.y - 20 }} aria-hidden>
            <i />
          </span>

          {/* radio console with frequency dials */}
          <div className="rt-console" style={{ left: CONSOLE.x, top: FLOOR - CONSOLE.h, width: CONSOLE.w, height: CONSOLE.h }}>
            <span className="rt-scope" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="rt-leds" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="rt-grille" aria-hidden />
          </div>
          {dials.map((d, i) => (
            <a
              key={d.key}
              className="rt-dial"
              style={{ left: CONSOLE.x + 22 + i * 82, top: FLOOR - CONSOLE.h + 12 }}
              href={d.href}
              {...(d.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={`${d.label}${d.ext ? " (opens in a new tab)" : ""}`}
              title={d.label}
            >
              <span className="rt-dial-ring" />
              {d.icon}
              <small>{d.label}</small>
            </a>
          ))}

          <button
            type="button"
            className={`room-door${door ? " is-open" : ""}`}
            style={{ left: DOOR.x, top: FLOOR - DOOR.h, width: DOOR.w, height: DOOR.h }}
            onClick={(e) => leave(e.currentTarget)}
            aria-label="Go back down the stairwell"
          >
            <span className="room-door-gap" />
            <span className="room-door-panel">
              <i />
            </span>
            <span className="room-door-sign">Exit</span>
          </button>

          {walker && (
            <span
              className={`lab-walker${walker.walking ? " is-walking" : ""}${walker.visible ? "" : " is-hidden"}`}
              style={{ transform: `translate(${walker.x}px, ${FLOOR}px)`, transitionDuration: `${walker.dur}ms` }}
              aria-hidden
            >
              <span className="lab-walker-body" style={{ transform: `scaleX(${walker.facing})` }}>
                <Player gradId="plv-radio" />
              </span>
            </span>
          )}
        </div>

        {/* the terminal */}
        <form className="hg-holo rt-term is-left" onSubmit={transmit} onKeyDown={(e) => !e.metaKey && !e.ctrlKey && !["Shift", "Control", "Alt", "Meta", "Tab", "CapsLock"].includes(e.key) && sfx.key()} aria-label="Transmit a message">
          <p className="rt-prompt">
            <span>&gt;</span> OPEN CHANNEL · looking for an engineer to build something meaningful? Let&rsquo;s talk.
          </p>
          <fieldset disabled={busy} className="rt-fields">
            <label>
              <span>NAME</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              <span>EMAIL</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              <span>SUBJECT</span>
              <input name="subject" required />
            </label>
            <label>
              <span>MESSAGE</span>
              <textarea name="message" required rows={3} />
            </label>
          </fieldset>
          <button type="submit" className="x-btn x-btn-primary" disabled={busy}>
            {busy ? "Transmitting…" : "Transmit signal"}
          </button>
          <p className={`rt-blip${phase === "ok" ? " is-ok" : ""}`} role="status">
            {phase === "ok" ? "✔ Signal locked. Your mail app opened with the message ready; press send there to deliver it." : ""}
          </p>
        </form>

        <div className="room-hud">
          <span className={`room-status${phase === "ok" ? " is-ok" : ""}`} aria-live="polite">
            <b>{phase === "ok" ? "✔" : "●"}</b> {status || "Preparing the roof"}
          </span>
        </div>
      </div>
    </>
  );
}
