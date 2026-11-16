"use client";

import { Volume2, VolumeX } from "lucide-react";
import { setMuted, useMuted } from "./audio";

/** The one sound on/off switch (it also silences the ambient beds). */
export function SoundButton() {
  const muted = useMuted();
  return (
    <button
      type="button"
      className="x-icon-btn"
      aria-pressed={muted}
      aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"}
      title={muted ? "Sound off" : "Sound on"}
      onClick={() => setMuted(!muted)}
    >
      {muted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
    </button>
  );
}
