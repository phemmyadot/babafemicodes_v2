// Trophy Hall atmosphere, synthesised with Web Audio (no audio files): a soft, slow pad with a long echo,
// sparse bell notes, and a chime when a trophy is inspected. Respects the same mute switch as the Lab.
import { soundOff } from "./crt-sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let stops: Array<() => void> = [];
let bells: number | null = null;
const getCtx = () => (ctx ??= new AudioContext());

export function startAmbient() {
  if (soundOff() || master) return;
  try {
    const c = getCtx();
    if (c.state === "suspended") void c.resume();
    const t = c.currentTime;
    const m = c.createGain();
    m.gain.setValueAtTime(0, t);
    m.gain.linearRampToValueAtTime(1, t + 2.5);
    master = m;

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1300;
    const out = c.createGain();
    out.gain.value = 0.07;
    const echo = c.createDelay(1.5);
    echo.delayTime.value = 0.65;
    const fb = c.createGain();
    fb.gain.value = 0.5;
    m.connect(lp);
    lp.connect(out);
    lp.connect(echo);
    echo.connect(fb);
    fb.connect(echo);
    echo.connect(out);
    out.connect(c.destination);

    // A minor, spread wide: A2 E3 A3 C4 E4 G4
    [110, 164.81, 220, 261.63, 329.63, 392].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      const lfo = c.createOscillator();
      const lg = c.createGain();
      o.type = i % 2 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = (i % 2 ? 1 : -1) * 6;
      g.gain.value = 0.12;
      lfo.frequency.value = 0.07 + i * 0.03; // slow swell
      lg.gain.value = 0.07;
      lfo.connect(lg);
      lg.connect(g.gain);
      o.connect(g);
      g.connect(m);
      o.start();
      lfo.start();
      stops.push(() => {
        o.stop();
        lfo.stop();
      });
    });

    const notes = [440, 523.25, 659.25, 783.99, 880];
    bells = window.setInterval(() => bell(notes[Math.floor(Math.random() * notes.length)], 0.18, 3.2), 4800);
  } catch {
    // No Web Audio or blocked: the hall is just quiet.
  }
}

export function stopAmbient() {
  if (bells) clearInterval(bells);
  bells = null;
  const m = master;
  const s = stops;
  master = null;
  stops = [];
  if (!m || !ctx) return;
  try {
    m.gain.cancelScheduledValues(ctx.currentTime);
    m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
    m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
  } catch {}
  window.setTimeout(() => {
    s.forEach((f) => {
      try {
        f();
      } catch {}
    });
    m.disconnect();
  }, 800);
}

function bell(freq: number, level: number, secs: number) {
  if (!ctx || !master || soundOff()) return;
  const t = ctx.currentTime;
  [1, 2.76].forEach((mul, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = "sine";
    o.frequency.value = freq * mul;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level / (i + 1), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + secs / (i + 1));
    o.connect(g);
    g.connect(master!);
    o.start(t);
    o.stop(t + secs);
  });
}

/** The chime when a trophy is picked out. */
export function playChime() {
  if (soundOff()) return;
  try {
    const c = getCtx();
    if (c.state === "suspended") void c.resume();
    if (!master) {
      // ambient not running (muted then un-muted elsewhere): play on its own
      const t = c.currentTime;
      [880, 1318.5].forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 1.8 / (i + 1));
        o.connect(g);
        g.connect(c.destination);
        o.start(t);
        o.stop(t + 2);
      });
      return;
    }
    bell(880, 0.5, 2.4);
  } catch {}
}
