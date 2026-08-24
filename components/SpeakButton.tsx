"use client";
import { useState } from "react";
import { C } from "@/lib/theme";
import { speakText, stopSpeaking } from "@/lib/speech";

export function SpeakButton({ text, A, size = 13, label = "" }: { text: string; A: string; size?: number; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    const ok = speakText(text, () => setPlaying(false));
    if (ok) setPlaying(true);
  };
  return (
    <button
      onClick={toggle}
      title={playing ? "Stop" : "Listen"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: playing ? `${A}20` : "transparent",
        border: `1px solid ${playing ? A : C.hi}`,
        color: playing ? A : C.dim,
        padding: label ? "6px 12px" : "6px 8px",
        cursor: "pointer",
        fontFamily: "'Futura','Century Gothic',sans-serif",
        fontSize: "10px",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: size }}>{playing ? "◼" : "🔊"}</span>
      {label && <span style={{ fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase" }}>{playing ? "Stop" : label}</span>}
    </button>
  );
}
