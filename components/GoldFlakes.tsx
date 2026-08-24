import type { CSSProperties } from "react";
import { C } from "@/lib/theme";

export function GoldFlakes(){
  const fl=Array.from({length:20},(_,i)=>({
    id:i,left:`${5+Math.random()*90}%`,
    delay:`${Math.random()*4}s`,dur:`${5+Math.random()*5}s`,
    size:`${2+Math.random()*5}px`,op:0.25+Math.random()*0.55,
    drift:`${(Math.random()-0.5)*80}px`,
  }));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:99,overflow:"hidden"}}>
      <style>{`@keyframes gf{0%{transform:translateY(-10px) translateX(0) rotate(0);opacity:0}8%{opacity:1}92%{opacity:.3}100%{transform:translateY(100vh) translateX(var(--gd)) rotate(720deg);opacity:0}}`}</style>
      {fl.map(f=>(
        <div key={f.id} style={{position:"absolute",left:f.left,top:"-6px",
          width:f.size,height:f.size,borderRadius:"50%",background:C.gold,
          opacity:f.op,animation:`gf ${f.dur} ${f.delay} infinite linear`,
          boxShadow:`0 0 8px ${C.gold}90`,
          ...( {"--gd":f.drift} as CSSProperties )}}/>
      ))}
    </div>
  );
}

// ── CANDLE TIMER ──────────────────────────────────────────────
