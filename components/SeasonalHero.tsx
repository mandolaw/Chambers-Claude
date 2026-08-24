"use client";
import { useState } from "react";
import { C, sr, sn, LITURGICAL_STYLE } from "@/lib/theme";
import { getCurrentLiturgicalSeason, getNextSpecialSeason } from "@/lib/liturgical";

export function SeasonalHero({ onEnterSeason }: { onEnterSeason: (id: string) => void }){
  const [liturgical] = useState(() => getCurrentLiturgicalSeason());
  const [nextSeason] = useState(() => getNextSpecialSeason());

  if (liturgical.isSpecial) {
    const style = LITURGICAL_STYLE[liturgical.id] || LITURGICAL_STYLE.advent;
    const isHolyWeek = liturgical.isHolyWeek;
    return (
      <div
        onClick={() => onEnterSeason(liturgical.id)}
        style={{
          position: "relative", overflow: "hidden", cursor: "pointer",
          background: style.bg, border: `1px solid ${style.a}45`,
          marginBottom: "22px", padding: "22px 20px",
        }}
      >
        <div style={{ position: "absolute", top: -20, right: -10, fontSize: "110px", opacity: 0.06, color: style.a, lineHeight: 1 }}>{style.icon}</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...sn, fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: style.a, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px" }}>{style.icon}</span>
            {isHolyWeek ? "Holy Week" : liturgical.label}
            <span style={{ opacity: 0.5 }}>·</span>
            <span>Day {liturgical.dayNumber} of {liturgical.totalDays}</span>
          </div>
          <div style={{ ...sr, fontSize: "22px", color: C.cream, marginBottom: "8px", lineHeight: 1.2 }}>
            {liturgical.label}
          </div>
          <div style={{ ...sn, fontSize: "11px", color: C.sand, opacity: 0.75, marginBottom: "16px", lineHeight: 1.5, fontStyle: "italic" }}>
            {style.tagline}
          </div>
          <div style={{ height: "3px", background: `${style.a}22`, borderRadius: "2px", marginBottom: "14px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${liturgical.percentComplete}%`, background: style.a, borderRadius: "2px", transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ ...sn, fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: style.a }}>
              Continue Today's Reading →
            </span>
            <span style={{ ...sn, fontSize: "9px", color: C.dim }}>{liturgical.percentComplete}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Ordinary Time: no countdown pressure, but tease what's coming if it's close
  const showTeaser = nextSeason && nextSeason.daysUntil <= 21;
  return (
    <div style={{ marginBottom: "22px" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
        <div style={{ ...sn, fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color: C.dim, marginBottom: "6px" }}>
          ⊕ Ordinary Time
        </div>
        <div style={{ ...sn, fontSize: "10px", color: C.sand, opacity: 0.7, lineHeight: 1.5 }}>
          The long faithfulness. No countdown — just the daily Rule.
        </div>
      </div>
      {showTeaser && (
        <div style={{ marginTop: "8px", padding: "12px 16px", border: `1px dashed ${C.dim}40`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...sn, fontSize: "9px", color: C.dim, letterSpacing: "1px" }}>
            {nextSeason.label} begins in {nextSeason.daysUntil} {nextSeason.daysUntil === 1 ? "day" : "days"}
          </span>
          <span style={{ ...sn, fontSize: "9px", color: C.gold }}>Coming Soon</span>
        </div>
      )}
    </div>
  );
}



