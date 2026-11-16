// Radio Tower transmit sound, synthesised with Web Audio: lock-on chirps, a pulsing sweep, then a green success blip.
// ~3.4s, matching the animation. Respects the shared mute switch.
import { soundOff } from "./crt-sound";

let ctx: AudioContext | null = null;

function tone(c: AudioContext, out: AudioNode, t: number, f0: number, f1: number, dur: number, level: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function playTransmit() {
  if (soundOff()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const c = ctx;
    const t = c.currentTime + 0.02;
    const out = c.createGain();
    out.gain.value = 0.16;
    out.connect(c.destination);
    // 1. dish swings round and locks: a few rising chirps, then a settled double beep
    [0, 0.28, 0.56, 0.84].forEach((d, i) => tone(c, out, t + d, 500 + i * 140, 900 + i * 220, 0.18, 0.5, "square"));
    tone(c, out, t + 1.2, 1400, 1400, 0.09, 0.45);
    tone(c, out, t + 1.34, 1400, 1400, 0.09, 0.45);
    // 2. the pulses leave: three falling sweeps
    [1.5, 2.0, 2.5].forEach((d) => tone(c, out, t + d, 1800, 240, 0.45, 0.4));
    // 3. success blip, rising two-tone
    tone(c, out, t + 3.1, 880, 880, 0.14, 0.55);
    tone(c, out, t + 3.26, 1320, 1320, 0.28, 0.55);
  } catch {
    // No Web Audio or blocked: the visuals still play.
  }
}
