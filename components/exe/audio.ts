// Arcade sound design, all synthesised with Web Audio (no audio files to load or license).
//   ambient(zone)  a looping bed per screen, crossfaded as you move between them
//   sfx.*          one-shot foley and UI sounds
// One mute switch for everything (persisted by crt-sound). Browsers keep audio suspended until a gesture, so the
// context is resumed on the first pointer/key event.
import { useSyncExternalStore } from "react";
import { setSoundOff, soundOff } from "./crt-sound";

export type Zone =
  "home" | "lab" | "skills" | "hangar" | "tower" | "gallery" | "radio";

let ctx: AudioContext | null = null;
let amb: GainNode;
let ambLp: BiquadFilterNode;
let fx: GainNode;
let noiseBuf: AudioBuffer;
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
  const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noiseBuf = b;
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
export const useMuted = () =>
  useSyncExternalStore(subscribe, isMuted, () => false);

/* ------------------------------------------------------------------ small helpers */

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
type Kit = {
  c: AudioContext;
  out: GainNode;
  stops: Array<() => void>;
  every: (fn: () => void, ms: number, jitter?: number) => void;
};

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
function filt(
  c: AudioContext,
  type: BiquadFilterType,
  f: number,
  q = 0.7,
  dest?: AudioNode,
) {
  const b = c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  if (dest) b.connect(dest);
  return b;
}
/** A decaying tone with optional inharmonic partials (a bell, chime or glass ping). */
function ping(
  c: AudioContext,
  dest: AudioNode,
  t: number,
  f: number,
  vol: number,
  dur: number,
  partials: number[] = [1, 2.76],
) {
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
function burst(
  c: AudioContext,
  dest: AudioNode,
  t: number,
  dur: number,
  type: BiquadFilterType,
  f: number,
  q: number,
  vol: number,
  f1?: number,
) {
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
function tone(
  c: AudioContext,
  dest: AudioNode,
  t: number,
  f0: number,
  f1: number,
  dur: number,
  vol: number,
  type: OscillatorType = "sine",
) {
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


// Every screen plays the same calm tune (the old per-room beds were held drones and noise, which read as a hum).
// D Dorian at 72 BPM: a deep sub drone, a warm low-passed pad and a few sparse electric-piano plucks in a big hall reverb.
// Eight bars (about 27s) in four chords, each held for two bars, then it loops.
function calmTune(k: Kit) {
  const { c } = k;
  const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
  const STEP = 60 / 72 / 2; // an eighth note
  const CHORD_S = 16 * STEP; // two bars
  // the hall: a long, dark noise tail
  const hall = c.createConvolver();
  const len = Math.floor(c.sampleRate * 3.4);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let n = 0; n < len; n++) d[n] = (Math.random() * 2 - 1) * (1 - n / len) ** 2.6;
  }
  hall.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.45;
  hall.connect(filt(c, "lowpass", 1600, 0.4, wet));
  wet.connect(k.out);
  const keysLp = filt(c, "lowpass", 1800, 0.5);
  const dry = c.createGain();
  dry.gain.value = 0.55;
  keysLp.connect(dry);
  dry.connect(k.out);
  keysLp.connect(hall);

  /** One steady voice: slow swell in, held, long fade out. */
  const voice = (type: OscillatorType, f: number, t: number, hold: number, vol: number, attack: number, release: number, dest: AudioNode) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.setValueAtTime(vol, t + hold);
    g.gain.linearRampToValueAtTime(0, t + hold + release);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + hold + release + 0.1);
  };
  /** A soft electric-piano pluck: a sine with a quieter octave and a short tine. */
  const pluck = (f: number, t: number, len: number, level: number) => {
    [[1, level, len], [2, level * 0.28, len * 0.6], [5, level * 0.08, 0.25]].forEach(([m, vol, dur]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
      o.connect(g);
      g.connect(keysLp);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  };

  // [bass, pad notes, melody as [start step, note, length in steps]], MIDI numbers (C4 = 60)
  const CHORDS: Array<{ bass: number; pad: number[]; mel: Array<[number, number, number]> }> = [
    { bass: 26, pad: [38, 41, 45, 48, 52], mel: [[0, 57, 4], [6, 52, 6]] }, // Dm9
    { bass: 34, pad: [34, 38, 41, 45], mel: [[2, 53, 4], [8, 50, 4]] }, // Bbmaj7
    { bass: 31, pad: [31, 34, 38, 41, 45], mel: [[0, 50, 4], [4, 57, 8]] }, // Gm9
    { bass: 33, pad: [33, 36, 40, 43], mel: [[2, 52, 4], [8, 48, 4]] }, // Am7
  ];
  const playChord = (idx: number, t: number) => {
    const ch = CHORDS[idx % CHORDS.length];
    // the bass is a soft low note that blooms and dies away, not a held drone (a sustained sub reads as a hum)
    voice("sine", hz(ch.bass + 12), t, 0.6, 0.025, 0.4, 2.2, k.out);
    // no held pad at all (a sustained low tone is what read as a hum): the chord is spelled out as slow soft plucks, each fading to silence
    const arp = ch.pad.filter((n) => n >= 38).map((n) => n + 12);
    const ORDER = [0, 1, 2, 3, 2, 1, 3, 2];
    ORDER.forEach((o, i) => pluck(hz(arp[o % arp.length]), t + i * 2 * STEP, 1.8, 0.02));
    ch.mel.forEach(([step, n, steps]) => pluck(hz(n), t + step * STEP, steps * STEP + 1.4, 0.05));
  };

  // schedule one chord at a time, a second ahead, on the audio clock so the loop never drifts
  let idx = 0;
  let nextAt = c.currentTime + 0.1;
  let timer = 0;
  const queue = () => {
    playChord(idx++, nextAt);
    nextAt += CHORD_S;
    timer = window.setTimeout(queue, Math.max(0, (nextAt - c.currentTime - 1) * 1000));
  };
  queue();
  k.stops.push(() => clearTimeout(timer));
}

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
    calmTune(k);
    running = {
      zone: want,
      gain: g,
      stop: () =>
        k.stops.forEach((s) => {
          try {
            s();
          } catch {}
        }),
    };
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

let walkTimers: number[] = [];

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
      burst(c, o, t, 0.07, "lowpass", (380 + (foot++ % 2) * 80) * r, 0.7, 0.035);
      tone(c, o, t, 85 * r, 55 * r, 0.08, 0.02);
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
    play((c, o, t) =>
      ping(
        c,
        o,
        t,
        880 * 2 ** (Math.min(depth, 12) / 12),
        0.22,
        1.6,
        [1, 2.01, 3],
      ),
    ),
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
  /** A soft, smooth glide for the elevator ride: a quiet low sine that eases up and back down, with a faint air whisper. */
  hum: (secs: number) =>
    play((c, o, t) => {
      const lp = filt(c, "lowpass", 320, 0.3);
      const g = c.createGain();
      const s1 = c.createOscillator();
      s1.type = "sine";
      s1.frequency.setValueAtTime(110, t);
      s1.frequency.linearRampToValueAtTime(146, t + secs * 0.5);
      s1.frequency.linearRampToValueAtTime(110, t + secs);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + Math.min(0.8, secs * 0.35));
      g.gain.setValueAtTime(0.045, t + Math.max(0.1, secs - 0.9));
      g.gain.linearRampToValueAtTime(0, t + secs);
      s1.connect(lp);
      lp.connect(g);
      g.connect(o);
      s1.start(t);
      s1.stop(t + secs + 0.05);
      burst(c, o, t, secs, "bandpass", 500, 0.5, 0.012, 300);
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
      burst(c, o, t, 0.7, "bandpass", 300, 1.2, 0.08, 900);
      tone(c, o, t + 0.6, 110, 70, 0.15, 0.12);
    }),
  /** Brass elevator ding. */
  ding: () =>
    play((c, o, t) => {
      ping(c, o, t, 880, 0.1, 1.4, [1, 2]);
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
      [2093, 2637, 3136, 3951].forEach((f, i) =>
        ping(c, o, t + 0.5 + i * 0.09, f, 0.07, 1.6),
      );
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
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        ping(c, o, t + i * 0.11, f, 0.18, 1.6, [1, 2]),
      );
    }),
  /** Schedule footsteps for a walk lasting `ms` (about one per 270ms). */
  walk: (ms: number) => {
    sfx.stopWalk(); // a new walk replaces the old one
    if (muted || ms < 120) return;
    for (let t = 120; t < ms; t += 270)
      walkTimers.push(window.setTimeout(sfx.step, t));
  },
  /** Cancel footsteps still queued, e.g. when the scene is left. */
  stopWalk: () => {
    walkTimers.forEach(clearTimeout);
    walkTimers = [];
  },
};
