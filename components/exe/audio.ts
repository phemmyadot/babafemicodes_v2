// Arcade sound design, all synthesised with Web Audio (no audio files to load or license).
//   ambient(zone)  a looping bed per screen, crossfaded as you move between them
//   sfx.*          one-shot foley and UI sounds
// One mute switch for everything (persisted by crt-sound). Browsers keep audio suspended until a gesture, so the
// context is resumed on the first pointer/key event.
import { useSyncExternalStore } from "react";
import { setSoundOff, soundOff } from "./crt-sound";

export type Zone = "home" | "lab" | "skills" | "hangar" | "tower" | "gallery" | "radio";

let ctx: AudioContext | null = null;
let amb: GainNode;
let ambLp: BiquadFilterNode;
let fx: GainNode;
let noiseBuf: AudioBuffer;
let brownBuf: AudioBuffer;
let muted = false;
let started = false;
let current: Zone | null = null;
let running: { zone: Zone; gain: GainNode; stop: () => void } | null = null;
const listeners = new Set<() => void>();

function boot() {
  if (started || typeof window === "undefined") return;
  started = true;
  muted = soundOff();
  const wake = () => {
    if (ctx && ctx.state === "suspended") void ctx.resume();
    apply();
  };
  window.addEventListener("pointerdown", wake, true);
  window.addEventListener("keydown", wake, true);
}

function getCtx() {
  if (ctx) return ctx;
  const c = new AudioContext();
  const comp = c.createDynamicsCompressor();
  comp.connect(c.destination);
  ambLp = c.createBiquadFilter();
  ambLp.type = "lowpass";
  ambLp.frequency.value = 20000;
  ambLp.connect(comp);
  amb = c.createGain();
  amb.gain.value = 0.5;
  amb.connect(ambLp);
  fx = c.createGain();
  fx.gain.value = 0.9;
  fx.connect(comp);
  const mk = (brown: boolean) => {
    const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else d[i] = w;
    }
    return b;
  };
  noiseBuf = mk(false);
  brownBuf = mk(true);
  ctx = c;
  return c;
}

/* ------------------------------------------------------------------ mute state */

export const isMuted = () => {
  boot();
  return muted;
};
export function setMuted(m: boolean) {
  boot();
  muted = m;
  setSoundOff(m);
  listeners.forEach((l) => l());
  apply();
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
export const useMuted = () => useSyncExternalStore(subscribe, isMuted, () => false);

/* ------------------------------------------------------------------ small helpers */

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
type Kit = { c: AudioContext; out: GainNode; stops: Array<() => void>; every: (fn: () => void, ms: number, jitter?: number) => void };

function kit(c: AudioContext, out: GainNode): Kit {
  const stops: Array<() => void> = [];
  return {
    c,
    out,
    stops,
    every(fn, ms, jitter = 0) {
      let t: number;
      const loop = () => {
        fn();
        t = window.setTimeout(loop, ms + rnd(0, jitter));
      };
      t = window.setTimeout(loop, 600 + rnd(0, ms));
      stops.push(() => clearTimeout(t));
    },
  };
}
function osc(k: Kit, type: OscillatorType, f: number, vol: number, dest: AudioNode = k.out, detune = 0) {
  const o = k.c.createOscillator();
  const g = k.c.createGain();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = detune;
  g.gain.value = vol;
  o.connect(g);
  g.connect(dest);
  o.start();
  k.stops.push(() => o.stop());
  return { o, g };
}
function noiseLoop(k: Kit, brown: boolean, dest: AudioNode) {
  const s = k.c.createBufferSource();
  s.buffer = brown ? brownBuf : noiseBuf;
  s.loop = true;
  s.connect(dest);
  s.start();
  k.stops.push(() => s.stop());
}
function filt(c: AudioContext, type: BiquadFilterType, f: number, q = 0.7, dest?: AudioNode) {
  const b = c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  if (dest) b.connect(dest);
  return b;
}
function lfo(k: Kit, rate: number, depth: number, target: AudioParam) {
  const o = k.c.createOscillator();
  const g = k.c.createGain();
  o.frequency.value = rate;
  g.gain.value = depth;
  o.connect(g);
  g.connect(target);
  o.start();
  k.stops.push(() => o.stop());
}
function echoBus(k: Kit, time: number, fb: number, tone = 1800) {
  const c = k.c;
  const input = c.createGain();
  const d = c.createDelay(2);
  d.delayTime.value = time;
  const f = c.createGain();
  f.gain.value = fb;
  const lp = filt(c, "lowpass", tone);
  input.connect(k.out);
  input.connect(d);
  d.connect(lp);
  lp.connect(f);
  f.connect(d);
  lp.connect(k.out);
  return input;
}
/** A decaying tone with optional inharmonic partials (a bell, chime or glass ping). */
function ping(c: AudioContext, dest: AudioNode, t: number, f: number, vol: number, dur: number, partials: number[] = [1, 2.76]) {
  partials.forEach((m, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f * m;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol / (i + 1), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur / (i + 1));
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  });
}
function burst(c: AudioContext, dest: AudioNode, t: number, dur: number, type: BiquadFilterType, f: number, q: number, vol: number, f1?: number) {
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const b = filt(c, type, f, q);
  if (f1) b.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + Math.min(0.01, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  s.connect(b);
  b.connect(g);
  g.connect(dest);
  s.start(t, rnd(0, 1.5));
  s.stop(t + dur + 0.05);
}
function tone(c: AudioContext, dest: AudioNode, t: number, f0: number, f1: number, dur: number, vol: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/* ------------------------------------------------------------------ ambient beds */

const PENT = [392, 440, 523.25, 587.33, 659.25, 783.99];
const MUZAK = [
  [146.83, 220, 261.63, 329.63, 349.23], // Dm9-ish
  [196, 246.94, 293.66, 349.23, 440], // G13
  [130.81, 196, 246.94, 329.63, 392], // Cmaj9
  [110, 220, 277.18, 329.63, 392], // A7
];

const BUILD: Record<Zone, (k: Kit) => void> = {
  // distant city hum, a soft pad, a breeze, far traffic and the odd neon buzz
  home(k) {
    const { c } = k;
    const hum = filt(c, "lowpass", 220, 0.7, k.out);
    const hg = c.createGain();
    hg.gain.value = 0.9;
    hg.connect(hum);
    noiseLoop(k, true, hg);
    const padLp = filt(c, "lowpass", 800, 0.5, k.out);
    lfo(k, 0.05, 300, padLp.frequency);
    [110, 164.81, 220, 277.18].forEach((f, i) => osc(k, "triangle", f, 0.05, padLp, i % 2 ? 5 : -5));
    const br = filt(c, "bandpass", 700, 0.6, k.out);
    const bg = c.createGain();
    bg.gain.value = 0.05;
    bg.connect(br);
    lfo(k, 0.09, 0.04, bg.gain);
    noiseLoop(k, false, bg);
    k.every(() => burst(c, k.out, c.currentTime, 3.2, "lowpass", 350, 0.7, 0.1), 7000, 5000); // traffic swell
    k.every(() => tone(c, k.out, c.currentTime, 120, 118, 0.5, 0.012, "sawtooth"), 9000, 6000); // neon buzz
  },
  // server-rack fan, static, quiet rhythmic clicks
  lab(k) {
    const { c } = k;
    const fan = filt(c, "bandpass", 150, 1, k.out);
    const fg = c.createGain();
    fg.gain.value = 0.9;
    fg.connect(fan);
    noiseLoop(k, true, fg);
    osc(k, "sine", 60, 0.04);
    osc(k, "sine", 120, 0.025);
    k.every(() => burst(c, k.out, c.currentTime, 0.03, "highpass", 4000, 0.7, 0.05), 320, 500);
    k.every(() => tone(c, k.out, c.currentTime, 2200, 1500, 0.012, 0.03, "square"), 620, 120);
  },
  // airy sci-fi drone with soft harmonic chimes
  skills(k) {
    const { c } = k;
    [98, 146.83, 196.5].forEach((f, i) => {
      const { g } = osc(k, "sine", f, 0.07, k.out, i * 3);
      lfo(k, 0.06 + i * 0.03, 0.04, g.gain);
    });
    const air = filt(c, "highpass", 3000, 0.7, k.out);
    const ag = c.createGain();
    ag.gain.value = 0.012;
    ag.connect(air);
    lfo(k, 0.1, 0.008, ag.gain);
    noiseLoop(k, false, ag);
    const echo = echoBus(k, 0.55, 0.45);
    k.every(() => ping(c, echo, c.currentTime, PENT[(Math.random() * PENT.length) | 0], 0.05, 4), 4800, 2500);
  },
  // cavernous hangar: deep rumble, hydraulic hiss, far-off clangs
  hangar(k) {
    const { c } = k;
    const rum = filt(c, "lowpass", 90, 0.7, k.out);
    const rg = c.createGain();
    rg.gain.value = 1.2;
    rg.connect(rum);
    noiseLoop(k, true, rg);
    const echo = echoBus(k, 0.7, 0.5, 1200);
    k.every(() => ping(c, echo, c.currentTime, rnd(260, 340), 0.045, 3, [1, 1.9, 2.74, 4.1]), 9000, 5000);
    k.every(() => burst(c, k.out, c.currentTime, 0.9, "highpass", 2400, 0.8, 0.035, 1800), 7000, 4000);
  },
  // muffled lo-fi jazz in the elevator, wind in the shaft
  tower(k) {
    const { c } = k;
    const room = filt(c, "lowpass", 750, 0.6, k.out);
    let n = 0;
    k.every(
      () => {
        const t = c.currentTime;
        const ch = MUZAK[n++ % MUZAK.length];
        ch.forEach((f, i) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "triangle";
          o.frequency.value = f * (i === 0 ? 0.5 : 1);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(i === 0 ? 0.09 : 0.04, t + 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, t + 2.7);
          o.connect(g);
          g.connect(room);
          o.start(t);
          o.stop(t + 2.8);
        });
        tone(c, room, t + 1.4, ch[1] * 0.5, ch[1] * 0.5, 1.2, 0.07, "sine"); // walking bass
      },
      2800,
    );
    const wind = filt(c, "bandpass", 350, 0.5, k.out);
    const wg = c.createGain();
    wg.gain.value = 0.05;
    wg.connect(wind);
    lfo(k, 0.12, 0.03, wg.gain);
    noiseLoop(k, false, wg);
  },
  // quiet museum: warm pads and sparse bells in a long reverb
  gallery(k) {
    const { c } = k;
    const lp = filt(c, "lowpass", 1300, 0.7);
    const echo = echoBus(k, 0.65, 0.5, 1300);
    lp.connect(echo);
    [110, 164.81, 220, 261.63, 329.63, 392].forEach((f, i) => {
      const { g } = osc(k, i % 2 ? "sine" : "triangle", f, 0.11, lp, (i % 2 ? 1 : -1) * 6);
      lfo(k, 0.07 + i * 0.03, 0.07, g.gain);
    });
    k.every(() => ping(c, lp, c.currentTime, [440, 523.25, 659.25, 783.99, 880][(Math.random() * 5) | 0], 0.16, 3.2), 4800, 1500);
  },
  // wind whistling through scaffolding, a slow radar blip
  radio(k) {
    const { c } = k;
    const whistle = filt(c, "bandpass", 1400, 12, k.out);
    const wg = c.createGain();
    wg.gain.value = 0.05;
    wg.connect(whistle);
    lfo(k, 0.13, 420, whistle.frequency);
    lfo(k, 0.07, 0.03, wg.gain);
    noiseLoop(k, false, wg);
    const low = filt(c, "lowpass", 320, 0.6, k.out);
    const lg = c.createGain();
    lg.gain.value = 0.55;
    lfo(k, 0.1, 0.25, lg.gain);
    lg.connect(low);
    noiseLoop(k, true, lg);
    const echo = echoBus(k, 0.28, 0.4, 2500);
    k.every(() => tone(c, echo, c.currentTime, 1500, 1480, 0.07, 0.05), 3000);
  },
};

function apply() {
  if (!started) return;
  const want = muted ? null : current;
  if (running?.zone === want) return;
  if (running) {
    const old = running;
    running = null;
    if (ctx) {
      old.gain.gain.cancelScheduledValues(ctx.currentTime);
      old.gain.gain.setValueAtTime(old.gain.gain.value, ctx.currentTime);
      old.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
    }
    window.setTimeout(() => {
      old.stop();
      old.gain.disconnect();
    }, 900);
  }
  if (!want) return;
  try {
    const c = getCtx();
    if (c.state === "suspended") void c.resume();
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(1, c.currentTime + 0.7);
    g.connect(amb);
    const k = kit(c, g);
    BUILD[want](k);
    running = { zone: want, gain: g, stop: () => k.stops.forEach((s) => { try { s(); } catch {} }) };
  } catch {
    // no Web Audio: the app is silent
  }
}

/** Play this screen's ambient bed (null for silence). Safe to call repeatedly. */
export function ambient(zone: Zone | null) {
  boot();
  current = zone;
  apply();
}

/** Call from the first click (the Start button): creates and wakes the audio context inside the gesture. */
export function unlockAudio() {
  boot();
  try {
    const c = getCtx();
    if (c.state === "suspended") void c.resume();
  } catch {}
  apply();
}

/** Muffle the ambience (low-pass) before a door closes behind you. */
export function duck() {
  if (!ctx || muted) return;
  ambLp.frequency.cancelScheduledValues(ctx.currentTime);
  ambLp.frequency.setValueAtTime(ambLp.frequency.value, ctx.currentTime);
  ambLp.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.35);
}
/** Open the ambience back up (the new room's acoustic space). */
export function unduck() {
  if (!ctx) return;
  ambLp.frequency.cancelScheduledValues(ctx.currentTime);
  ambLp.frequency.setValueAtTime(ambLp.frequency.value, ctx.currentTime);
  ambLp.frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + 0.9);
}
/** Cut the ambience to silence for `ms`, then bring it back. */
export function hush(ms: number) {
  if (!ctx) return;
  amb.gain.cancelScheduledValues(ctx.currentTime);
  amb.gain.setValueAtTime(0, ctx.currentTime);
  amb.gain.setValueAtTime(0, ctx.currentTime + ms / 1000);
  amb.gain.linearRampToValueAtTime(0.5, ctx.currentTime + ms / 1000 + 1.2);
}

/* ------------------------------------------------------------------ one-shot effects */

function play(fn: (c: AudioContext, out: AudioNode, t: number) => void) {
  boot();
  if (muted) return;
  try {
    const c = getCtx();
    if (c.state === "suspended") void c.resume();
    fn(c, fx, c.currentTime + 0.01);
  } catch {}
}

let foot = 0;
export const sfx = {
  /** One footstep; call on each stride. */
  step: () =>
    play((c, o, t) => {
      const r = rnd(0.92, 1.08); // never the same step twice
      burst(c, o, t, 0.07, "lowpass", (500 + (foot++ % 2) * 120) * r, 0.8, 0.22);
      tone(c, o, t, 95 * r, 55 * r, 0.08, 0.14);
    }),
  /** Mechanical door latch click. */
  latch: () =>
    play((c, o, t) => {
      tone(c, o, t, 2200, 700, 0.012, 0.3, "square");
      burst(c, o, t, 0.05, "bandpass", 1200, 2, 0.25);
      tone(c, o, t + 0.09, 1500, 500, 0.014, 0.3, "square");
      tone(c, o, t + 0.09, 120, 70, 0.1, 0.25);
    }),
  /** Metallic/plastic clack: a part snapping on. */
  clack: () =>
    play((c, o, t) => {
      burst(c, o, t, 0.04, "bandpass", 2600, 3, 0.4);
      tone(c, o, t, 800, 300, 0.06, 0.3, "triangle");
      tone(c, o, t + 0.03, 1900, 1900, 0.02, 0.12, "square");
    }),
  /** Rising capacitor whine. */
  whine: (secs = 1.1) =>
    play((c, o, t) => {
      tone(c, o, t, 300, 2600, secs, 0.12, "sawtooth");
      tone(c, o, t, 150, 1300, secs, 0.06, "sine");
    }),
  /** CRT boot chime. */
  bootChime: () =>
    play((c, o, t) => {
      ping(c, o, t, 523.25, 0.18, 0.9, [1, 2]);
      ping(c, o, t + 0.16, 783.99, 0.18, 1.2, [1, 2]);
    }),
  /** Deep bass pulse (zooming out). */
  bass: () =>
    play((c, o, t) => {
      tone(c, o, t, 75, 38, 0.6, 0.5);
      burst(c, o, t, 0.25, "lowpass", 200, 0.7, 0.15);
    }),
  /** Crystalline ping; `depth` raises the pitch a little per step. */
  node: (depth = 0) =>
    play((c, o, t) => ping(c, o, t, 880 * 2 ** (Math.min(depth, 12) / 12), 0.22, 1.6, [1, 2.01, 3])),
  /** Heavy mechanical lock. */
  lock: () =>
    play((c, o, t) => {
      tone(c, o, t, 140, 50, 0.25, 0.45);
      burst(c, o, t, 0.08, "bandpass", 900, 1.5, 0.35);
      ping(c, o, t + 0.12, 310, 0.1, 0.7, [1, 1.9, 2.74, 4.1]);
      tone(c, o, t + 0.3, 1800, 600, 0.015, 0.25, "square");
    }),
  /** Warning klaxon: three beeps. */
  klaxon: () =>
    play((c, o, t) => {
      [0, 0.55, 1.1].forEach((d) => {
        tone(c, o, t + d, 880, 880, 0.22, 0.28, "sawtooth");
        tone(c, o, t + d + 0.25, 660, 660, 0.22, 0.28, "sawtooth");
      });
    }),
  /** Sub-bass rumble and thruster roar: it swells to a peak at the end, then cuts to silence. */
  roar: (secs = 2.3) =>
    play((c, o, t) => {
      const g = c.createGain();
      g.gain.setValueAtTime(0.02, t);
      g.gain.exponentialRampToValueAtTime(1, t + secs);
      g.gain.setValueAtTime(0, t + secs + 0.04);
      g.connect(o);
      burst(c, g, t, secs + 0.05, "lowpass", 300, 0.7, 0.6, 2600);
      tone(c, g, t, 46, 42, secs + 0.05, 0.7);
      tone(c, g, t + 0.2, 90, 66, secs - 0.15, 0.22, "sawtooth");
    }),
  /** Pitch-shifted hydraulic hum that slows to a halt as the elevator arrives. */
  hum: (secs: number) =>
    play((c, o, t) => {
      const lp = filt(c, "lowpass", 420);
      const g = c.createGain();
      const s1 = c.createOscillator();
      s1.type = "sawtooth";
      s1.frequency.setValueAtTime(52, t);
      s1.frequency.linearRampToValueAtTime(96, t + secs * 0.45);
      s1.frequency.exponentialRampToValueAtTime(38, t + secs);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.3);
      g.gain.setValueAtTime(0.16, t + secs - 0.4);
      g.gain.linearRampToValueAtTime(0, t + secs);
      s1.connect(lp);
      lp.connect(g);
      g.connect(o);
      s1.start(t);
      s1.stop(t + secs + 0.05);
      burst(c, o, t, secs, "bandpass", 260, 0.8, 0.06, 140);
    }),
  /** Quick digital whoosh with a high-pass sweep (rack focus into the Skill Tree). */
  whoosh: () =>
    play((c, o, t) => {
      burst(c, o, t, 0.6, "highpass", 300, 0.9, 0.3, 6500);
      tone(c, o, t, 400, 2600, 0.35, 0.08, "sine");
    }),
  /** Heavy sliding door. */
  slide: () =>
    play((c, o, t) => {
      burst(c, o, t, 0.7, "bandpass", 300, 1.2, 0.22, 900);
      tone(c, o, t + 0.6, 110, 60, 0.15, 0.4);
    }),
  /** Brass elevator ding. */
  ding: () =>
    play((c, o, t) => {
      ping(c, o, t, 1318.5, 0.3, 1.6, [1, 2, 3.01]);
    }),
  /** Office keyboard clatter. */
  keys: (n = 9) =>
    play((c, o, t) => {
      for (let i = 0; i < n; i++) {
        const at = t + i * rnd(0.05, 0.11);
        burst(c, o, at, 0.025, "bandpass", rnd(2200, 3400), 3, 0.2);
        tone(c, o, at, rnd(600, 900), 300, 0.03, 0.12, "triangle");
      }
    }),
  /** Soft glass-case hum. */
  glass: () =>
    play((c, o, t) => {
      [220, 330].forEach((f) => tone(c, o, t, f, f * 1.01, 1.4, 0.07));
    }),
  /** Spotlight: low whoosh and a shimmer of chimes. */
  spotlight: () =>
    play((c, o, t) => {
      burst(c, o, t, 0.9, "bandpass", 180, 0.8, 0.3, 2000);
      tone(c, o, t, 80, 50, 0.9, 0.25);
      [2093, 2637, 3136, 3951].forEach((f, i) => ping(c, o, t + 0.5 + i * 0.09, f, 0.07, 1.6));
    }),
  /** A retro mechanical key clack (typing in the terminal). */
  key: () =>
    play((c, o, t) => {
      burst(c, o, t, 0.03, "bandpass", rnd(1500, 2200), 2.5, 0.3);
      tone(c, o, t, rnd(1100, 1400), 420, 0.04, 0.18, "square");
    }),
  /** Satellite servo whir. */
  servo: (secs = 1.3) =>
    play((c, o, t) => {
      const osc1 = c.createOscillator();
      const g = c.createGain();
      const lp = filt(c, "lowpass", 900);
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(80, t);
      osc1.frequency.linearRampToValueAtTime(150, t + secs * 0.6);
      osc1.frequency.linearRampToValueAtTime(95, t + secs);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.13, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + secs);
      osc1.connect(lp);
      lp.connect(g);
      g.connect(o);
      osc1.start(t);
      osc1.stop(t + secs + 0.05);
    }),
  /** Morse-style data burst. */
  burstData: () =>
    play((c, o, t) => {
      let at = t;
      [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1].forEach((dash) => {
        const len = dash ? 0.12 : 0.05;
        tone(c, o, at, 1000, 1000, len, 0.18, "square");
        at += len + 0.04;
      });
    }),
  /** Warm confirmation chime. */
  confirm: () =>
    play((c, o, t) => {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => ping(c, o, t + i * 0.11, f, 0.18, 1.6, [1, 2]));
    }),
  /** Schedule footsteps for a walk lasting `ms` (about one per 270ms). */
  walk: (ms: number) => {
    if (muted || ms < 120) return;
    for (let t = 120; t < ms; t += 270) window.setTimeout(sfx.step, t);
  },
};
