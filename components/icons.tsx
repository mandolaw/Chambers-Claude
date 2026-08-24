export function IconRule({size=22, color="#C8A86B"}){
  // A humble chamber / house — the daily rule, the cell you return to
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M6 22L24 7L42 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 20V40H37V20" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 40V29H28V40" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="14" r="1.6" fill={color}/>
      <path d="M11 20H37" stroke={color} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

export function IconWay({size=22, color="#C8A86B"}){
  // A worn path with a rising star — the way, the pilgrim's road
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M8 40C14 34 16 28 14 22C12 16 16 10 24 10C32 10 36 16 34 22C32 28 34 34 40 40" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M24 4L25.6 9.2L31 9.2L26.8 12.4L28.4 17.6L24 14.4L19.6 17.6L21.2 12.4L17 9.2L22.4 9.2Z" fill={color}/>
      <path d="M8 40H40" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function IconPrayer({size=22, color="#C8A86B"}){
  // A rising flame within a hand-drawn oval — the candle, prayer ascending
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6C24 6 30 16 30 24C30 29 27.3 32 24 32C20.7 32 18 29 18 24C18 16 24 6 24 6Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
      <path d="M24 14C24 14 27 19.5 27 24C27 26.5 25.7 28 24 28C22.3 28 21 26.5 21 24C21 19.5 24 14 24 14Z" fill={color} opacity="0.85"/>
      <path d="M15 40C15 35 19 32 24 32C29 32 33 35 33 40" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 40H37" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function IconBrothers({size=22, color="#C8A86B"}){
  // Crossed swords, hand-drawn, hilts bound — the oath of brotherhood
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M10 10L38 38" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M38 10L10 38" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M12 8L10 10L12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M36 8L38 10L36 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M20 28L28 28" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="2" fill={color}/>
    </svg>
  );
}

// ── NOONDAY MODE (11am–3pm) ───────────────────────────────────
