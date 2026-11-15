"use client";

import { Hand, HandGrab, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { ATTRIBUTES, PROFILE, type PartSlot } from "./data";
import { Avatar, Head, ResumeButton, useArcade } from "./ExeScreens";

type Phase = "build" | "booting" | "on";

const ALL = ATTRIBUTES.map((a) => a.slot);
const POST = [
  "B-ADO BIOS v8.0  (C) 2026",
  ...ATTRIBUTES.map((a) => `${a.part.padEnd(4)} ${a.name.padEnd(22, ".")} OK`),
  "Booting engineer profile...",
];
// Pick-and-place timing per part (ms from the part's start): reach the bench, grab,
// carry to the socket, lower it in, let go. Transitions in exe.css match these gaps.
const START = 400;
const STEP = 860;
const GRAB = 280;
const CARRY = 340;
const DROP = 660;
const RELEASE = 780;
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
 * Engineering Lab (Profile). On open, a hand assembles the PC by clicking each socket,
 * then it boots into the engineer profile. Closing the room unmounts this and cancels
 * every pending step, so each visit starts from an empty board.
 */
export function Profile() {
  const { contact } = useArcade();
  const [installed, setInstalled] = useState<PartSlot[]>([]);
  const [phase, setPhase] = useState<Phase>("build");
  const [log, setLog] = useState<string[]>([]);
  // Where the hand is, and what it holds: "reach" (empty), "carry" (holding the part), "drop" (lowering it in).
  const [hand, setHand] = useState<{ x: number; y: number; slot: PartSlot; mode: "reach" | "carry" | "drop" } | null>(null);
  const labRef = useRef<HTMLDivElement>(null);
  const socketRefs = useRef<Partial<Record<PartSlot, HTMLDivElement | null>>>({});
  const trayRefs = useRef<Partial<Record<PartSlot, HTMLLIElement | null>>>({});
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const cancel = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const boot = useCallback(() => {
    setHand(null);
    setPhase("booting");
    setLog([]);
    POST.forEach((line, i) => later(() => setLog((l) => [...l, line]), 150 + i * 170));
    later(() => setPhase("on"), 150 + POST.length * 170 + 450);
  }, []);

  const assemble = useCallback(() => {
    cancel();
    setInstalled([]);
    setLog([]);
    setPhase("build");
    if (reduceMotion()) {
      setInstalled(ALL);
      setPhase("on");
      return;
    }
    const centre = (el: Element | null | undefined) => {
      const box = labRef.current?.getBoundingClientRect();
      const r = el?.getBoundingClientRect();
      return box && r ? { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 } : null;
    };
    const go = (slot: PartSlot, at: "tray" | "socket", mode: "reach" | "carry" | "drop") => {
      const p = centre(at === "tray" ? trayRefs.current[slot] : socketRefs.current[slot]);
      if (p) setHand({ ...p, slot, mode });
    };
    ALL.forEach((slot, i) => {
      const t = START + i * STEP;
      later(() => go(slot, "tray", "reach"), t);
      later(() => go(slot, "tray", "carry"), t + GRAB);
      later(() => go(slot, "socket", "carry"), t + CARRY);
      later(() => go(slot, "socket", "drop"), t + DROP);
      later(() => {
        setInstalled((s) => [...s, slot]);
        go(slot, "socket", "reach");
      }, t + RELEASE);
    });
    later(boot, START + ALL.length * STEP + 250);
  }, [boot]);

  useEffect(() => {
    assemble();
    return cancel;
  }, [assemble]);

  const skip = () => {
    cancel();
    setHand(null);
    setInstalled(ALL);
    setPhase("on");
  };

  if (phase !== "build") {
    return (
      <>
        <Head index="01" title="Engineering lab" note="System online. The engineer profile is loaded." />
        <div className="lab-on">
          <section className="lab-monitor" aria-label="Monitor">
            <div className="lab-screen">
              {phase === "booting" ? (
                <pre className="lab-post" aria-live="polite">
                  {log.join("\n")}
                  <span className="lab-cursor">_</span>
                </pre>
              ) : (
                <div className="lab-profile">
                  <Avatar />
                  <div>
                    <p className="x-kicker">
                      <span className="x-dot" aria-hidden /> Available for opportunities
                    </p>
                    <h2 className="lab-name">{PROFILE.name}</h2>
                    <p className="lab-role">{PROFILE.role}</p>
                    <p className="lab-intro">{PROFILE.intro}</p>
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
                    <div className="x-actions">
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
                </div>
              )}
            </div>
            <span className="lab-stand" aria-hidden />
          </section>

          <aside className="x-panel lab-specs" aria-label="System specs">
            <h2 className="x-h2">System specs</h2>
            <ul>
              {ATTRIBUTES.map((a) => (
                <li key={a.slot}>
                  <span className={`lab-tag lab-tag-${a.slot}`}>{a.part}</span>
                  <span>
                    <strong>{a.name}</strong>
                    <span className="x-muted">{a.evidence}</span>
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" className="x-btn x-btn-sm" onClick={assemble}>
              <RotateCcw size={14} aria-hidden /> Rebuild PC
            </button>
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <Head index="01" title="Engineering lab" note="Assembling the engineer: every part is an attribute." />
      <div className="lab" ref={labRef}>
        <section className="lab-board" aria-label={`Motherboard, ${installed.length} of ${ALL.length} parts installed`}>
          <span className="lab-board-name" aria-hidden>
            B-ADO · MOTHERBOARD · REV 8
          </span>
          {ATTRIBUTES.map((a) => {
            const on = installed.includes(a.slot);
            return (
              <div
                key={a.slot}
                ref={(el) => {
                  socketRefs.current[a.slot] = el;
                }}
                className={`lab-socket lab-socket-${a.slot}${on ? " is-on" : ""}`}
              >
                {on ? (
                  <span className="lab-part">
                    <PartArt slot={a.slot} />
                    <span className="lab-part-code">{a.part}</span>
                    <span className="lab-part-attr">{a.name}</span>
                  </span>
                ) : (
                  <span className="lab-empty">{a.part} slot</span>
                )}
              </div>
            );
          })}
        </section>

        <aside className="x-panel lab-bench" aria-label="Parts bench">
          <h2 className="x-h2">Parts bench</h2>
          <div className="lab-bench-meta">
            <p className="x-muted" aria-live="polite">
              {installed.length}/{ALL.length} installed
            </p>
            <button type="button" className="x-link" onClick={skip}>
              Skip to profile
            </button>
          </div>
          <ul className="lab-tray">
            {ATTRIBUTES.map((a) => {
              const on = installed.includes(a.slot);
              return (
                <li
                  key={a.slot}
                  ref={(el) => {
                    trayRefs.current[a.slot] = el;
                  }}
                  className={`lab-tray-item${on ? " is-done" : ""}${!on && hand?.slot === a.slot && hand.mode !== "reach" ? " is-picked" : ""}`}
                >
                  <span className={`lab-tag lab-tag-${a.slot}`}>{a.part}</span>
                  <span className="lab-tray-text">
                    <strong>{a.partName}</strong>
                    <span>{a.name}</span>
                  </span>
                  <span className="lab-tray-state">{on ? "✓" : hand?.slot === a.slot && hand.mode !== "reach" ? "moving" : "…"}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        {hand && (
          <span className={`lab-hand is-${hand.mode}`} style={{ transform: `translate(${hand.x}px, ${hand.y}px)` }} aria-hidden>
            {hand.mode !== "reach" && (
              <span className="lab-carried">
                <PartArt slot={hand.slot} />
              </span>
            )}
            {hand.mode === "reach" ? <Hand size={42} strokeWidth={1.6} /> : <HandGrab size={42} strokeWidth={1.6} />}
          </span>
        )}
      </div>
    </>
  );
}
