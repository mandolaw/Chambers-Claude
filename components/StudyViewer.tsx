"use client";
import { useState } from "react";
import { C, sr, sn } from "@/lib/theme";
import { VERSE_TEXT } from "@/data/verses";
import { Lbl } from "@/components/atoms";

export function StudyViewer({study, onBack, A}: {study: any; onBack: () => void; A: string}){
  const [dayIdx, setDayIdx] = useState(0);
  const d = study.days[dayIdx];
  return (
    <div style={{padding:"20px 18px 0"}}>
      <button onClick={onBack} style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"4px 11px",cursor:"pointer",marginBottom:"14px"}}>← All Studies</button>
      <Lbl color={C.dim}>{study.title}</Lbl>
      <div style={{display:"flex",gap:"4px",marginBottom:"16px",flexWrap:"wrap"}}>
        {study.days.map((_,i)=>(
          <button key={i} onClick={()=>setDayIdx(i)} style={{width:"22px",height:"22px",fontSize:"9px",background:i===dayIdx?A:"transparent",color:i===dayIdx?"#0B0B09":C.dim,border:`1px solid ${i===dayIdx?A:C.border}`,cursor:"pointer",...sn}}>{i+1}</button>
        ))}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"18px",marginBottom:"14px"}}>
        <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"6px"}}>Day {d.n} · {d.ref}</div>
        <div style={{...sr,fontSize:"18px",color:C.cream,marginBottom:"12px"}}>{d.title}</div>
        {d.verseText&&(
          <div style={{borderLeft:`2px solid ${A}`,paddingLeft:"12px",marginBottom:"16px",background:`${A}0a`,padding:"10px 12px"}}>
            <div style={{...sr,fontStyle:"italic",fontSize:"14px",color:C.cream,lineHeight:1.65}}>"{d.verseText}"</div>
            <div style={{...sn,fontSize:"9px",color:A,marginTop:"6px",letterSpacing:"1px"}}>— {d.ref}</div>
          </div>
        )}
        <div style={{...sn,fontSize:"9px",color:A,marginBottom:"4px",textTransform:"uppercase",letterSpacing:"1px"}}>{d.father}</div>
        <div style={{...sr,fontStyle:"italic",fontSize:"13px",color:C.sand,marginBottom:"14px",lineHeight:1.6}}>"{d.fatherQuote}"</div>
        <div style={{fontSize:"13px",color:C.sand,marginBottom:"14px",lineHeight:1.6}}>{d.reflection}</div>
        <div style={{...sr,fontWeight:"bold",fontSize:"13px",color:A,textAlign:"center",margin:"14px 0",padding:"10px",border:`1px solid ${A}`,background:`${A}11`}}>{d.antirrhetic}</div>
        <div style={{...sn,fontSize:"9px",color:C.dim,marginBottom:"4px",textTransform:"uppercase"}}>Praktike</div>
        <div style={{fontSize:"13px",color:C.sand,marginBottom:"14px",lineHeight:1.6}}>{d.action}</div>
        <div style={{...sr,fontStyle:"italic",fontSize:"13px",color:C.dim,textAlign:"center"}}>{d.prayer}</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <button disabled={dayIdx===0} onClick={()=>setDayIdx(i=>i-1)} style={{...sn,fontSize:"8px",color:dayIdx===0?C.border:C.dim,background:"transparent",border:"none",cursor:dayIdx===0?"default":"pointer"}}>← Prev</button>
        <button disabled={dayIdx===study.days.length-1} onClick={()=>setDayIdx(i=>i+1)} style={{...sn,fontSize:"8px",color:dayIdx===study.days.length-1?C.border:A,background:"transparent",border:"none",cursor:"pointer"}}>Next →</button>
      </div>
    </div>
  );
}

export function DayRow({d, i, isT, dk, done, onMark, A, weekPlan}: {d: any; i: number; isT: boolean; dk: string; done: boolean; onMark: (dk: string) => void; A: string; weekPlan: any}){
  const [expanded, setExpanded] = useState(isT);
  const verseText = (VERSE_TEXT as any)[d.ref] || null;
  return(
    <div>
      <div onClick={()=>setExpanded(e=>!e)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 14px",background:isT?`${A}07`:"transparent",cursor:"pointer"}}>
        <div style={{...sn,fontSize:"8px",color:isT?A:C.dim,letterSpacing:"1px",minWidth:"30px",textAlign:"center"}}>
          {d.day}
          {isT&&<div style={{width:"4px",height:"4px",borderRadius:"50%",background:A,margin:"3px auto 0"}}/>}
        </div>
        <div style={{flex:1}}>
          <div style={{...sn,fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase",color:done?A:C.dim,marginBottom:"3px"}}>{d.ref}</div>
          {!expanded&&<div style={{fontSize:"12px",color:C.sand,opacity:done?0.38:0.72,lineHeight:1.55,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{d.focus}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
          <span style={{...sn,fontSize:"10px",color:C.dim,opacity:0.5}}>{expanded?"▲":"▼"}</span>
          <button onClick={e=>{e.stopPropagation();onMark(dk);}} style={{flexShrink:0,width:"26px",height:"26px",borderRadius:"50%",border:`1px solid ${done?A:C.hi}`,background:done?`${A}25`:"transparent",color:done?A:C.dim,cursor:"pointer",fontSize:"11px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>{done?"✓":""}</button>
        </div>
      </div>
      {expanded&&(
        <div style={{padding:"0 14px 16px 56px",background:isT?`${A}04`:"transparent"}}>
          {verseText&&(
            <div style={{borderLeft:`2px solid ${A}40`,paddingLeft:"13px",marginBottom:"11px"}}>
              <p style={{...sr,fontSize:"14px",fontStyle:"italic",lineHeight:1.88,color:C.cream,margin:0,opacity:0.92}}>"{verseText}"</p>
            </div>
          )}
          <div style={{...sn,fontSize:"8px",color:C.dim,lineHeight:1.65,opacity:0.82}}>{d.focus}</div>
        </div>
      )}
      {i<(weekPlan?.days.length-1||6)&&<div style={{height:"1px",background:"rgba(200,168,107,0.09)"}}/>}
    </div>
  );
}


// ── PROMISES OF GOD ──────────────────────────────────────────
