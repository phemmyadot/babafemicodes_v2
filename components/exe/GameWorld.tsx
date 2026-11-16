"use client";

import { ChevronLeft, ChevronRight, Download, LogIn, Mail } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { DISTRICTS, IDLE_TIPS, PROFILE, STATS, WORLD_W, type DistrictId } from "./data";
import { Stat, useArcade, type Go } from "./ExeScreens";

const STAGE_H = 600;
const GROUND = 110;
const SPAWN_X = 540;
const MOBILE_SPAWN_X = 380;
const WALK = 330;
const AUTO_WALK = 900;
const SHARDS = [760, 1240, 1680, 1760, 2160, 2580, 2620, 3060, 3470, 3520];

/* ------------------------------------------------------------ backdrop */
// Deterministic so server and client render the same skyline.
function skyline(w: number, h: number, body: string, lit: string, seed: number) {
  let r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  let x = 0;
  let out = "";
  while (x < w) {
    const bw = 34 + rnd() * 64;
    const bh = h * 0.3 + rnd() * h * 0.62;
    out += `<rect x='${x | 0}' y='${(h - bh) | 0}' width='${bw | 0}' height='${bh | 0}' fill='${body}'/>`;
    for (let wy = h - bh + 10; wy < h - 8; wy += 14)
      for (let wx = x + 7; wx < x + bw - 9; wx += 12)
        if (rnd() < 0.32) out += `<rect x='${wx | 0}' y='${wy | 0}' width='5' height='7' fill='${lit}'/>`;
    x += bw + 3;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${out}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
/** A tile of random stars as an SVG background. Deterministic, so server and client render the same sky. */
function starTile(count: number, seed: number, w: number) {
  let r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const tones = ["#ffffff", "#ffffff", "#ffffff", "#cfe9ff", "#fff1c2", "#ffd6f0"];
  let out = "";
  for (let i = 0; i < count; i++) {
    const rad = (0.5 + rnd() * rnd() * 1.6).toFixed(2);
    out += `<circle cx='${(rnd() * w) | 0}' cy='${(rnd() * 520) | 0}' r='${rad}' fill='${tones[(rnd() * tones.length) | 0]}' opacity='${(0.45 + rnd() * 0.55).toFixed(2)}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='520'>${out}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const STARS_A = starTile(95, 11, 760);
const STARS_B = starTile(55, 77, 1090);

/** Night sky: a static field of stars and a second field that twinkles. */
export function Stars() {
  return (
    <>
      <div className="gw-stars" style={{ backgroundImage: STARS_A }} aria-hidden />
      <div className="gw-stars gw-stars-b" style={{ backgroundImage: STARS_B }} aria-hidden />
    </>
  );
}

const FAR = skyline(1400, 320, "#3b1d6e", "#ff9de2", 7);
const NEAR = skyline(1600, 240, "#1d1442", "#ffd23f", 42);

/* ---------------------------------------------------------- characters */

/** Which character walks the city. Set to "classic" to bring back the astronaut. */
const CHARACTER: "classic" | "baba" = "baba";

export function Player({ gradId = "plv" }: { gradId?: string }) {
  return CHARACTER === "baba" ? <BabaPlayer /> : <ClassicPlayer gradId={gradId} />;
}

/** The original astronaut-style engineer. */
function ClassicPlayer({ gradId }: { gradId: string }) {
  return (
    <svg className="pl-svg" viewBox="0 0 64 100" width="64" height="100" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" x2="1">
          <stop offset="0" stopColor="#43D5FF" />
          <stop offset="1" stopColor="#FF4FD8" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="97" rx="18" ry="3" fill="rgba(0,0,0,.35)" className="pl-shadow" />
      {/* Side view: legs share one hip and arms one shoulder; shoes point the way the player faces. */}
      <g className="pl-body">
        <g className="pl-leg pl-leg-b">
          <rect x="27" y="64" width="9" height="26" rx="4" fill="#3a2d7a" stroke="#160d33" strokeWidth="1.2" />
          <rect x="26" y="86" width="16" height="8" rx="4" fill="#FF4FD8" stroke="#160d33" strokeWidth="1.2" />
        </g>
        <g className="pl-arm pl-arm-b">
          <rect x="29" y="40" width="8" height="22" rx="4" fill="#8f66ff" stroke="#160d33" strokeWidth="1" />
        </g>
        <rect x="11" y="38" width="12" height="24" rx="4" fill="#FFD23F" />
        <line x1="15" y1="38" x2="11" y2="26" stroke="#FFD23F" strokeWidth="2" />
        <circle cx="11" cy="25" r="3" fill="#7CFF6B" className="pl-antenna" />
        <g className="pl-leg pl-leg-f">
          <rect x="31" y="64" width="9" height="26" rx="4" fill="#3a2d7a" stroke="#160d33" strokeWidth="1.2" />
          <rect x="30" y="86" width="16" height="8" rx="4" fill="#FF4FD8" stroke="#160d33" strokeWidth="1.2" />
        </g>
        <rect x="20" y="36" width="27" height="32" rx="10" fill="#A77BFF" />
        <rect x="20" y="50" width="27" height="4" fill="#FF4FD8" />
        <g className="pl-arm pl-arm-f">
          <rect x="31" y="40" width="8" height="22" rx="4" fill="#8f66ff" stroke="#160d33" strokeWidth="1" />
        </g>
        <circle cx="34" cy="23" r="15" fill="#E8F0FC" />
        <rect x="30" y="16" width="20" height="11" rx="5.5" fill={`url(#${gradId})`} />
        <rect x="33" y="18" width="5" height="3" rx="1.5" fill="#fff" opacity=".8" />
      </g>
    </svg>
  );
}

/**
 * Babafemi: low fade, black rectangular glasses, goatee with a little grey, solid cyan-teal jacket.
 * Side view facing right;
 * keeps the pl-* groups the walk animation drives.
 */
function BabaPlayer() {
  const skin = "#6b4026";
  const skinShade = "#57331f";
  const outline = "#1a0f0a";
  // Solid jacket in the city's main accent (cyan-teal): it stands out against the purple/pink scene.
  const jacket = "#1c9fc4";
  const jacketDark = "#137594";
  const beard = "#221611";
  return (
    <svg className="pl-svg" viewBox="0 0 64 100" width="64" height="100" aria-hidden>
      <ellipse cx="32" cy="97" rx="18" ry="3" fill="rgba(0,0,0,.35)" className="pl-shadow" />
      <g className="pl-body">
        {/* back leg + dark sneaker */}
        <g className="pl-leg pl-leg-b">
          <rect x="27" y="66" width="9" height="24" rx="4" fill="#1b2136" stroke={outline} strokeWidth="1.1" />
          <rect x="25" y="86" width="17" height="8" rx="4" fill="#2a2a33" stroke={outline} strokeWidth="1.1" />
          <rect x="25.5" y="91.4" width="16" height="2" rx="1" fill="#d9d9de" />
        </g>
        {/* back sleeve */}
        <g className="pl-arm pl-arm-b">
          <rect x="29" y="40" width="9" height="22" rx="4.5" fill={jacketDark} stroke={outline} strokeWidth="1" />
          <circle cx="33.5" cy="64.5" r="3" fill={skinShade} />
        </g>
        {/* front leg + dark sneaker */}
        <g className="pl-leg pl-leg-f">
          <rect x="31" y="66" width="9" height="24" rx="4" fill="#232a44" stroke={outline} strokeWidth="1.1" />
          <rect x="29" y="86" width="17" height="8" rx="4" fill="#33333d" stroke={outline} strokeWidth="1.1" />
          <rect x="29.5" y="91.4" width="16" height="2" rx="1" fill="#e4e4e8" />
        </g>
        {/* jacket: one solid colour, ribbing only hinted with faint lines */}
        <rect x="19" y="37" width="28" height="33" rx="9" fill={jacket} stroke={outline} strokeWidth="1" />
        <path d="M21 64.4 h24 M21 66.6 h24 M21 68.6 h24" stroke={jacketDark} strokeWidth=".5" />
        <rect x="24" y="35" width="18" height="5" rx="2.5" fill={jacket} stroke={outline} strokeWidth=".8" />
        {/* front sleeve */}
        <g className="pl-arm pl-arm-f">
          <rect x="31" y="40" width="9" height="22" rx="4.5" fill={jacket} stroke={outline} strokeWidth="1" />
          <circle cx="35.5" cy="64.5" r="3" fill={skin} stroke={outline} strokeWidth="0.8" />
        </g>
        {/* neck */}
        <rect x="30" y="29" width="9" height="9" rx="3" fill={skinShade} />
        {/* head in profile: cranium, forehead, brow, nose, lips, chin, jaw */}
        <path
          d="M33 6.5 C41 6.5 45.4 10.4 46 15.6 L46.6 18.4 C47.6 20.4 50.2 22.4 50.2 23.8 C50.2 25.1 48.2 25.7 46.5 25.9 C47.5 27 47.7 28.4 46.9 29.2 C47.7 30 47.7 31.2 46.7 31.8 C46.9 33.8 45.7 36 42.6 36.4 C39.2 36.8 36.6 35.2 34 33.6 C31.6 33 30 32 29 31 C23 30 20.5 26 20.6 20 C20.8 12 26 6.5 33 6.5 Z"
          fill={skin}
          stroke={outline}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* low fade over the back and crown */}
        <path d="M21.8 21.4 C21.3 12.4 26.4 7.2 33 7 C37 7 40 8 41.6 9.2 C37 8.6 32 9.4 28 12.2 C25 14.6 23.6 17.6 23.4 21.6 Z" fill="#20140e" opacity=".5" />
        {/* ear */}
        <ellipse cx="29" cy="21" rx="2.4" ry="3.4" fill={skinShade} stroke={outline} strokeWidth="0.8" />
        {/* moustache and goatee: under the nose, around the lower lip and over the chin */}
        <path d="M43.4 27.3 Q45.4 26.4 46.9 27.4" stroke={beard} strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <path d="M44 30.5 C45.1 31.3 46.2 31.7 46.8 31.8 C46.9 33.9 45.7 36.1 42.6 36.4 C41.1 36.5 40.3 35.4 40.7 34 C41.5 32.7 42.6 31.3 44 30.5 Z" fill={beard} />
        <path d="M43 33.6 l.4 1.8 M44.9 33.2 l.2 1.8" stroke="#bdb6ad" strokeWidth=".6" strokeLinecap="round" />
        {/* brow and glasses: lens on the face, arm back to the ear */}
        <path d="M38.6 14.6 Q41.6 13.6 44.8 14.6" stroke="#140c08" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <line x1="30.6" y1="18.6" x2="38" y2="18.4" stroke="#0b0b0b" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="37.6" y="15.8" width="8.4" height="6" rx="1.5" fill="rgba(170,215,255,.22)" stroke="#0b0b0b" strokeWidth="1.5" />
        <circle cx="42.4" cy="19" r="1" fill="#140c08" />
      </g>
    </svg>
  );
}

function Drone() {
  return (
    <svg viewBox="0 0 48 44" width="48" height="44" aria-hidden className="dr-svg">
      <rect x="10" y="2" width="28" height="4" rx="2" fill="#7CFF6B" className="dr-prop" />
      <rect x="23" y="5" width="2" height="6" fill="#9aabc4" />
      <circle cx="24" cy="24" r="14" fill="#E8F0FC" />
      <circle cx="24" cy="24" r="8" fill="#101A2B" />
      <circle cx="26" cy="23" r="4" fill="#43D5FF" className="dr-eye" />
      <rect x="6" y="22" width="5" height="9" rx="2.5" fill="#FF4FD8" />
      <rect x="37" y="22" width="5" height="9" rx="2.5" fill="#FF4FD8" />
    </svg>
  );
}

// Sky decoration: clouds drift right-to-left, flocks fly left-to-right through them.
const CLOUDS = [
  { top: "9%", w: 220, speed: 90, at: 0.1 },
  { top: "17%", w: 160, speed: 70, at: 0.55 },
  { top: "26%", w: 260, speed: 110, at: 0.8 },
  { top: "6%", w: 140, speed: 60, at: 0.35 },
];
const FLOCKS: Array<{ top: string; speed: number; at: number; birds: Array<[number, number, number]> }> = [
  { top: "13%", speed: 26, at: 0.45, birds: [[0, 14, 1], [36, 0, 0.85], [34, 30, 0.8], [70, 10, 0.7]] },
  { top: "22%", speed: 34, at: 0.15, birds: [[0, 8, 0.8], [30, 0, 0.7], [28, 22, 0.65]] },
];

function Bird({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: number }) {
  return (
    <svg className="gw-bird" viewBox="0 0 24 12" width={34 * scale} height={17 * scale} style={{ left: x, top: y, animationDelay: `${delay}s` }}>
      <path className="bird-wing bird-l" d="M12 7 Q7 1 1 3" />
      <path className="bird-wing bird-r" d="M12 7 Q17 1 23 3" />
    </svg>
  );
}

function Robot() {
  return (
    <svg viewBox="0 0 50 80" width="50" height="80" className="npc-bot" aria-hidden>
      <line x1="25" y1="4" x2="25" y2="14" stroke="#FFD23F" strokeWidth="2" />
      <circle cx="25" cy="4" r="3.5" fill="#FF4FD8" className="pl-antenna" />
      <rect x="9" y="14" width="32" height="24" rx="6" fill="#FF8A3D" />
      <rect x="14" y="21" width="22" height="9" rx="4.5" fill="#101A2B" />
      <circle cx="20" cy="25.5" r="2.5" fill="#43D5FF" className="dr-eye" />
      <circle cx="30" cy="25.5" r="2.5" fill="#43D5FF" className="dr-eye" />
      <rect x="12" y="40" width="26" height="24" rx="5" fill="#ffb27a" />
      <rect x="2" y="42" width="8" height="18" rx="4" fill="#FF8A3D" />
      <g className="bot-wave">
        <rect x="40" y="26" width="8" height="18" rx="4" fill="#FF8A3D" />
      </g>
      <rect x="15" y="64" width="7" height="14" rx="3" fill="#5b3a8f" />
      <rect x="28" y="64" width="7" height="14" rx="3" fill="#5b3a8f" />
    </svg>
  );
}

/* ----------------------------------------------------------- buildings */

const ART: Record<DistrictId, ReactNode> = {
  profile: (
    <svg viewBox="0 0 260 300" aria-hidden>
      <rect x="20" y="120" width="220" height="180" rx="8" fill="#123a5a" />
      <path d="M20 128 A110 110 0 0 1 240 128 Z" fill="#1b5f8a" />
      <path d="M60 128 A70 70 0 0 1 200 128" fill="none" stroke="#43D5FF" strokeWidth="3" className="glow-pulse" />
      <circle cx="80" cy="180" r="18" fill="#43D5FF" opacity=".85" />
      <circle cx="180" cy="180" r="18" fill="#FFD23F" opacity=".85" />
      <rect x="105" y="215" width="50" height="85" rx="25" fill="#081322" stroke="#43D5FF" strokeWidth="3" />
      <g className="dish">
        <path d="M178 40 a28 28 0 0 0 40 34 z" fill="#E8F0FC" />
        <line x1="196" y1="58" x2="196" y2="80" stroke="#E8F0FC" strokeWidth="4" />
      </g>
      <rect x="0" y="292" width="260" height="8" fill="#43D5FF" opacity=".5" />
    </svg>
  ),
  skills: (
    <svg viewBox="0 0 280 320" aria-hidden>
      <path d="M128 320 L132 170 Q140 120 150 170 L154 320 Z" fill="#5a3b1e" />
      <g stroke="#7CFF6B" strokeWidth="5" fill="none" strokeLinecap="round" className="glow-pulse">
        <path d="M140 200 Q90 170 60 120" />
        <path d="M140 190 Q190 160 220 110" />
        <path d="M140 170 Q110 120 100 60" />
        <path d="M140 165 Q170 110 182 50" />
        <path d="M140 215 Q80 210 40 190" />
        <path d="M140 215 Q200 210 242 186" />
      </g>
      {[
        [60, 120, "#43D5FF"],
        [220, 110, "#FF8A3D"],
        [100, 60, "#FFD23F"],
        [182, 50, "#FF4FD8"],
        [40, 190, "#A77BFF"],
        [242, 186, "#7CFF6B"],
      ].map(([cx, cy, c], i) => (
        <circle key={i} cx={cx} cy={cy} r="15" fill={c as string} className="orb" style={{ "--i": i } as CSSProperties} />
      ))}
      <ellipse cx="140" cy="314" rx="70" ry="8" fill="#7CFF6B" opacity=".35" />
    </svg>
  ),
  missions: (
    <svg viewBox="0 0 260 320" aria-hidden>
      <rect x="20" y="280" width="220" height="40" fill="#3a2350" />
      <rect x="20" y="276" width="220" height="6" fill="#FF8A3D" />
      <rect x="196" y="90" width="12" height="190" fill="#5b3a8f" />
      <rect x="160" y="140" width="40" height="6" fill="#5b3a8f" />
      <g className="rocket">
        <path d="M130 30 C160 70 160 140 154 240 L106 240 C100 140 100 70 130 30 Z" fill="#E8F0FC" />
        <path d="M130 30 C142 45 150 62 152 80 L108 80 C110 62 118 45 130 30 Z" fill="#FF4F6D" />
        <circle cx="130" cy="130" r="14" fill="#43D5FF" stroke="#101A2B" strokeWidth="4" />
        <path d="M106 200 L80 252 L108 240 Z M154 200 L180 252 L152 240 Z" fill="#FF8A3D" />
        <path className="flame" d="M112 240 Q130 300 148 240 Z" fill="#FFD23F" />
      </g>
      <circle cx="80" cy="270" r="14" fill="#fff" opacity=".25" className="smoke" />
      <circle cx="184" cy="272" r="12" fill="#fff" opacity=".2" className="smoke smoke-2" />
    </svg>
  ),
  career: (
    <svg viewBox="0 0 220 340" aria-hidden>
      <path d="M110 6 L110 40" stroke="#A77BFF" strokeWidth="4" />
      <circle cx="110" cy="6" r="6" fill="#FF4FD8" className="pl-antenna" />
      {[0, 1, 2, 3].map((f) => (
        <g key={f}>
          <rect x={30 + (3 - f) * 6} y={40 + (3 - f) * 70} width={160 - (3 - f) * 12} height="66" rx="6" fill={["#3a2160", "#452777", "#52308d", "#5f39a4"][f]} />
          <rect
            x={50 + (3 - f) * 6}
            y={58 + (3 - f) * 70}
            width={120 - (3 - f) * 12}
            height="22"
            rx="4"
            fill="#A77BFF"
            className="floor-lit"
            style={{ "--i": f } as CSSProperties}
          />
          <text x="110" y={74 + (3 - f) * 70} textAnchor="middle" fontSize="13" fontFamily="monospace" fill="#101A2B" fontWeight="700">
            STAGE 0{f + 1}
          </text>
        </g>
      ))}
    </svg>
  ),
  achievements: (
    <svg viewBox="0 0 280 300" aria-hidden>
      <path d="M10 110 L140 40 L270 110 Z" fill="#6b4a12" />
      <rect x="20" y="110" width="240" height="14" fill="#FFD23F" />
      {[40, 90, 170, 220].map((x) => (
        <rect key={x} x={x} y="124" width="20" height="160" fill="#4a3410" />
      ))}
      <rect x="10" y="284" width="260" height="16" fill="#FFD23F" opacity=".7" />
      <g className="trophy">
        <path d="M118 150 h44 v18 a22 22 0 0 1 -44 0 z" fill="#FFD23F" />
        <path d="M118 156 h-10 a10 10 0 0 0 10 16 M162 156 h10 a10 10 0 0 1 -10 16" stroke="#FFD23F" strokeWidth="4" fill="none" />
        <rect x="134" y="188" width="12" height="18" fill="#FFD23F" />
        <rect x="122" y="206" width="36" height="10" rx="2" fill="#FFD23F" />
      </g>
      {[
        [104, 146],
        [178, 160],
        [140, 132],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#fff" className="sparkle" style={{ "--i": i } as CSSProperties} />
      ))}
    </svg>
  ),
  comms: (
    <svg viewBox="0 0 220 360" aria-hidden>
      <path d="M110 70 L60 340 M110 70 L160 340 M78 240 L142 240 M88 170 L132 170 M70 300 L150 300 M78 240 L132 170 M142 240 L88 170 M70 300 L142 240" stroke="#FF4FD8" strokeWidth="5" fill="none" />
      <circle cx="110" cy="62" r="10" fill="#FFD23F" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="110" cy="62" r="20" fill="none" stroke="#FF4FD8" strokeWidth="3" className="wave" style={{ "--i": i } as CSSProperties} />
      ))}
      <rect x="40" y="330" width="140" height="30" rx="4" fill="#3a1640" />
    </svg>
  ),
};

/* ---------------------------------------------------------------- world */

export function GameWorld({ go, visited, active }: { go: Go; visited: Set<string>; active: boolean }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const droneRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState<DistrictId | null>(null);
  const [tip, setTip] = useState(0);
  const [got, setGot] = useState<number[]>([]);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Mutable game state lives in a ref: the loop writes styles directly, React renders only on events.
  const g = useRef({
    x: SPAWN_X,
    facing: 1,
    left: false,
    right: false,
    target: null as number | null,
    enter: null as DistrictId | null,
    droneX: SPAWN_X - 60,
    cam: 0,
    scale: 1,
    near: null as DistrictId | null,
    got: new Set<number>(),
  });

  const enterNear = () => g.current.near && go(g.current.near);
  const walkTo = (x: number, enter: DistrictId | null = null) => {
    g.current.target = Math.max(40, Math.min(WORLD_W - 40, x));
    g.current.enter = enter;
  };

  useEffect(() => {
    const id = window.setInterval(() => setTip((t) => (t + 1) % IDLE_TIPS.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const s = g.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones use a narrower billboard; start just past it so it is fully in view.
    if (window.innerWidth < 760) {
      s.x = MOBILE_SPAWN_X;
      s.droneX = MOBILE_SPAWN_X - 60;
    }
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const view = viewRef.current;
      if (view && activeRef.current) {
        const vw = view.clientWidth;
        const vh = view.clientHeight;
        s.scale = Math.max(0.55, Math.min(1.25, vh / STAGE_H, vw / 500));

        let dir = Number(s.right) - Number(s.left);
        let step = dir * WALK * dt;
        if (dir) s.target = null;
        else if (s.target !== null) {
          const d = s.target - s.x;
          const max = AUTO_WALK * dt;
          // Never step past the target: at low frame rates a full step overshot it,
          // and the player flipped back and forth around it every frame (visible shake).
          if (Math.abs(d) <= max || reduce) {
            step = d;
            s.target = null;
            if (s.enter) {
              const e = s.enter;
              s.enter = null;
              go(e);
            }
          } else {
            dir = Math.sign(d);
            step = dir * max;
          }
        }
        if (dir) s.facing = dir;
        s.x = Math.max(40, Math.min(WORLD_W - 40, s.x + step));
        s.droneX += (s.x - s.facing * 70 - s.droneX) * Math.min(1, dt * 3);

        // Dead-zone camera: only scroll once the player leaves the middle 30-70% of the view.
        const visW = vw / s.scale;
        if (s.x < s.cam + visW * 0.3) s.cam = s.x - visW * 0.3;
        else if (s.x > s.cam + visW * 0.7) s.cam = s.x - visW * 0.7;
        s.cam = Math.max(0, Math.min(Math.max(0, WORLD_W - visW), s.cam));

        const n = DISTRICTS.find((d) => Math.abs(s.x - (d.x + d.w / 2)) < d.w / 2)?.id ?? null;
        if (n !== s.near) {
          s.near = n;
          setNear(n);
        }
        for (let i = 0; i < SHARDS.length; i++) {
          if (!s.got.has(i) && Math.abs(s.x - SHARDS[i]) < 34) {
            s.got.add(i);
            setGot([...s.got]);
          }
        }

        const st = stageRef.current;
        if (st) st.style.transform = `translateX(${-s.cam * s.scale}px) scale(${s.scale})`;
        const p = playerRef.current;
        if (p) {
          p.style.transform = `translate(${s.x - 32}px, 0px) scaleX(${s.facing})`;
          p.classList.toggle("is-walking", dir !== 0);
        }
        const dr = droneRef.current;
        if (dr) dr.style.transform = `translateX(${s.droneX - 24}px)`;
        if (farRef.current) farRef.current.style.backgroundPositionX = `${-s.cam * s.scale * 0.2}px`;
        if (nearRef.current) nearRef.current.style.backgroundPositionX = `${-s.cam * s.scale * 0.45}px`;
        if (sunRef.current) sunRef.current.style.transform = `translateX(${-s.cam * s.scale * 0.05}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const within = (e: Event, sel: string) => e.target instanceof Element && !!e.target.closest(sel);
    const isTyping = (e: KeyboardEvent) => within(e, "input, textarea, select, [contenteditable]");
    const onDown = (e: KeyboardEvent) => {
      if (!activeRef.current || isTyping(e) || e.metaKey || e.ctrlKey || document.querySelector("dialog[open], .exe-boot")) return;
      const onButton = within(e, "button, a");
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") s.left = true;
      else if (k === "arrowright" || k === "d") s.right = true;
      else if ((k === "enter" || k === "e" || k === "arrowup") && !onButton && s.near) go(s.near);
      else return;
      e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") s.left = false;
      if (k === "arrowright" || k === "d") s.right = false;
    };
    const release = () => {
      s.left = false;
      s.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", release);
    };
  }, [go]);

  const nearD = DISTRICTS.find((d) => d.id === near);
  const { missions, skills, career, contact } = useArcade();
  const featured = missions.find((m) => m.featured) ?? missions[0];
  // Hints for Sanity-backed buildings are written from the live data.
  const live: Partial<Record<DistrictId, string>> = {
    skills: `${skills.length} branches, ${skills.reduce((n, b) => n + b.skills.length, 0)} technologies.`,
    missions: `${missions.length} missions inside${featured ? `, including ${featured.title}` : ""}.`,
    career: career.length
      ? `${career.length} floors: from ${career[0].org} to ${career[career.length - 1].org}.`
      : "",
  };
  const hint = nearD ? live[nearD.id] || nearD.hint : undefined;
  const hold = (side: "left" | "right") => ({
    onPointerDown: (e: PointerEvent) => {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      g.current[side] = true;
    },
    onPointerUp: () => (g.current[side] = false),
    onPointerCancel: () => (g.current[side] = false),
  });

  return (
    <section className="gw" aria-label="Game world. Walk between districts, or use the buttons for each building.">
      <div
        ref={viewRef}
        className="gw-view"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button, a")) return;
          const r = viewRef.current!.getBoundingClientRect();
          walkTo((e.clientX - r.left) / g.current.scale + g.current.cam);
        }}
      >
        <div className="gw-sky" />
        <Stars />
        <div className="gw-moon" ref={sunRef} />
        <div className="gw-far" ref={farRef} style={{ backgroundImage: FAR }} />
        {CLOUDS.map((c, i) => (
          <i key={i} className="gw-cloud" style={{ top: c.top, width: c.w, animationDuration: `${c.speed}s`, animationDelay: `${-c.speed * c.at}s` } as CSSProperties} aria-hidden />
        ))}
        {FLOCKS.map((f, i) => (
          <div key={i} className="gw-flock" style={{ top: f.top, animationDuration: `${f.speed}s`, animationDelay: `${-f.speed * f.at}s` }} aria-hidden>
            {f.birds.map(([x, y, s], j) => (
              <Bird key={j} x={x} y={y} scale={s} delay={j * 0.13} />
            ))}
          </div>
        ))}
        <div className="gw-blimp" aria-hidden>
          babafemicodes<span>.dev</span>
        </div>
        <div className="gw-near" ref={nearRef} style={{ backgroundImage: NEAR }} />

        <div className="gw-stage" ref={stageRef} style={{ width: WORLD_W, height: STAGE_H }}>
          <div className="gw-ground" />

          <div className="gw-billboard" style={{ left: 30, bottom: GROUND }}>
            <div className="gw-board">
              <p className="gw-board-kicker">{PROFILE.tagline}</p>
              <div className="gw-board-stats">
                {STATS.map((s) => (
                  <Stat key={s.label} {...s} />
                ))}
              </div>
            </div>
            <i className="gw-pole" />
            <i className="gw-pole gw-pole-r" />
          </div>

          {DISTRICTS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`gw-bld gw-bld-${d.id} ${near === d.id ? "is-near" : ""}`}
              style={{ left: d.x, bottom: GROUND, width: d.w, "--c": d.color } as CSSProperties}
              aria-label={`Enter ${d.name}${visited.has(d.id) ? " (visited)" : ""}`}
              onClick={(e) => {
                // Keyboard activation goes straight in; a click walks there first.
                if (e.detail === 0) go(d.id);
                else walkTo(d.x + d.w / 2, d.id);
              }}
            >
              <span className="gw-sign">
                {d.name}
                {visited.has(d.id) && <span className="gw-check"> ✓</span>}
              </span>
              {ART[d.id]}
            </button>
          ))}
          <div className="gw-npc" style={{ left: 1750, bottom: GROUND }}>
            <Robot />
          </div>

          {SHARDS.map((x, i) => (
            <i
              key={i}
              className={`gw-shard ${got.includes(i) ? "is-got" : ""}`}
              style={{ left: x - 10, bottom: GROUND + 70, "--i": i } as CSSProperties}
              aria-hidden
            />
          ))}

          <div className="gw-drone" ref={droneRef} style={{ bottom: GROUND + 250 }}>
            <p className="gw-bubble" aria-hidden key={nearD?.id ?? `tip-${tip}`}>
              {nearD ? (
                <>
                  <strong style={{ color: nearD.color }}>{nearD.name}.</strong> {hint} <kbd>Enter ↵</kbd>
                </>
              ) : (
                IDLE_TIPS[tip]
              )}
            </p>
            <Drone />
          </div>

          <div className="gw-player" ref={playerRef} style={{ bottom: GROUND }}>
            <Player />
          </div>
        </div>
      </div>

      {/* HUD: who this is and how to reach him, readable in under 10 seconds. */}
      <div className="gw-hud gw-card">
        <div className="gw-card-id">
          <p className="gw-avail">
            <span className="x-dot" aria-hidden /> <span className="gw-avail-text">Available for opportunities</span>
          </p>
          <h1 className="gw-name" tabIndex={-1} data-screen-title>
            {PROFILE.name}
          </h1>
          <p className="gw-role">
            {PROFILE.role}
            <span className="gw-role-more">
              {" "}
              · {PROFILE.core.join(" · ")} · {PROFILE.location}
            </span>
          </p>
        </div>
        <div className="gw-card-actions">
          {contact.resume && (
          <a className="x-btn x-btn-primary x-btn-sm" href={contact.resume} download aria-label="Download resume (PDF)">
            <Download size={14} aria-hidden /> <span className="gw-btn-text">Resume</span>
          </a>
          )}
          <a className="x-btn x-btn-sm" href={`mailto:${contact.email}`} aria-label="Email Babafemi">
            <Mail size={14} aria-hidden /> <span className="gw-btn-text">Email</span>
          </a>
        </div>
      </div>

      <p className="gw-tip-bar" aria-hidden>
        {nearD ? (
          <>
            <strong style={{ color: nearD.color }}>{nearD.name}:</strong> {hint}
          </>
        ) : (
          IDLE_TIPS[tip]
        )}
      </p>

      <div className="gw-hud gw-progress" aria-label="Exploration progress">
        <p>
          Districts <strong>{visited.size}</strong>/{DISTRICTS.length}
        </p>
        <span className="gw-bar">
          <span style={{ width: `${(visited.size / DISTRICTS.length) * 100}%` }} />
        </span>
        <p>
          Shards <strong className="gw-shard-count">{got.length}</strong>/{SHARDS.length} ✦
        </p>
      </div>

      <p className="gw-hint x-hide-touch">
        <kbd>←</kbd> <kbd>→</kbd> walk · <kbd>Enter</kbd> go inside · or click anywhere
      </p>

      <div className="gw-pad" aria-label="Touch controls" onContextMenu={(e) => e.preventDefault()}>
        <button type="button" aria-label="Walk left" {...hold("left")}>
          <ChevronLeft size={26} aria-hidden />
        </button>
        <button type="button" aria-label="Walk right" {...hold("right")}>
          <ChevronRight size={26} aria-hidden />
        </button>
        <button type="button" className="gw-enter" aria-label={nearD ? `Enter ${nearD.name}` : "Walk to a building to enter"} disabled={!nearD} onClick={enterNear}>
          <LogIn size={18} aria-hidden /> {nearD ? "Enter" : "—"}
        </button>
      </div>
    </section>
  );
}
