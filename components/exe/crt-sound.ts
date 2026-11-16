// Lab sound effect, synthesised with Web Audio so there is no audio file to load or license.
// Sound is on by default but can be muted; the choice is remembered.

const KEY = "exe-sound-off";
let ctx: AudioContext | null = null;

export const soundOff = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
export const setSoundOff = (off: boolean) => {
  try {
    localStorage.setItem(KEY, off ? "1" : "0");
  } catch {}
};

/** Classic CRT turn-on: a degauss thump, a burst of crackling static, and a rising flyback whine (~1.2s). */
export function playCrtOn() {
  if (soundOff()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime + 0.02;
    const out = ctx.createGain();
    out.gain.value = 0.2;
    out.connect(ctx.destination);

    // 1. degauss thump
    const thump = ctx.createOscillator();
    const tg = ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(90, t);
    thump.frequency.exponentialRampToValueAtTime(34, t + 0.35);
    tg.gain.setValueAtTime(0, t);
    tg.gain.linearRampToValueAtTime(1, t + 0.01);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    thump.connect(tg).connect(out);
    thump.start(t);
    thump.stop(t + 0.5);

    // 2. static crackle: noise through a band-pass, its level flickering as it dies away
    const len = Math.floor(ctx.sampleRate * 0.9);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3200;
    band.Q.value = 0.7;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, t);
    for (let k = 0; k < 9; k++) ng.gain.setValueAtTime((0.5 - k * 0.05) * (k % 2 ? 0.35 : 1), t + 0.04 + k * 0.06);
    ng.gain.linearRampToValueAtTime(0, t + 0.7);
    noise.connect(band).connect(ng).connect(out);
    noise.start(t);
    noise.stop(t + 0.9);

    // 3. flyback whine: kept well below 15kHz so it is a soft rising tone, not a piercing one
    const whine = ctx.createOscillator();
    const wg = ctx.createGain();
    whine.type = "sine";
    whine.frequency.setValueAtTime(3500, t + 0.1);
    whine.frequency.exponentialRampToValueAtTime(9000, t + 0.7);
    wg.gain.setValueAtTime(0, t + 0.1);
    wg.gain.linearRampToValueAtTime(0.05, t + 0.3);
    wg.gain.exponentialRampToValueAtTime(0.0005, t + 1.2);
    whine.connect(wg).connect(out);
    whine.start(t + 0.1);
    whine.stop(t + 1.25);
  } catch {
    // No Web Audio, or the browser blocked it: the visuals still play.
  }
}
