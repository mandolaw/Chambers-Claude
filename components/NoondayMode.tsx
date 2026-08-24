"use client";
import { useState } from "react";
import { C, sr, sn } from "@/lib/theme";
import { NOONDAY_PRAYERS } from "@/data/prayers";
import { CandleTimer } from "@/components/CandleTimer";

export function NoondayMode({A, onDismiss}: {A: string; onDismiss: () => void}){
  const hour=new Date().getHours();
  const noondayPrayer=NOONDAY_PRAYERS[Math.floor(Math.random()*NOONDAY_PRAYERS.length)];
  const [showTimer,setShowTimer]=useState(false);

  if(showTimer) return <CandleTimer A={A} onClose={()=>setShowTimer(false)}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,...sr,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${A},transparent)`}}/>
      <div style={{flex:1,padding:"36px 24px",display:"flex",flexDirection:"column"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"32px",marginBottom:"8px"}}>☽</div>
          <div style={{...sn,fontSize:"7px",letterSpacing:"6px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>The Noonday Office</div>
          <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:C.dim}}>
            {hour===12?"Noon":hour<12?`${hour}am`:`${hour-12}pm`} — The hour of acedia
          </div>
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.hi}`,marginBottom:"18px",overflow:"hidden"}}>
          <div style={{height:"2px",background:`linear-gradient(90deg,${A},${A}40)`}}/>
          <div style={{padding:"20px 20px 18px"}}>
            <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>Against Acedia</div>
            <p style={{...sr,fontSize:"14px",lineHeight:1.9,color:C.dim,margin:"0 0 10px",fontStyle:"italic",opacity:0.8}}>
              The desert fathers called it the noonday demon — the spirit of listlessness that makes a man want to be anywhere but where he is.
            </p>
            <p style={{...sr,fontSize:"13px",color:C.dim,opacity:0.6,margin:0,lineHeight:1.7}}>You are here. That is enough. Sit for a moment before God.</p>
          </div>
        </div>

        <div style={{background:C.raised,border:`1px solid ${A}25`,padding:"20px 20px 18px",marginBottom:"18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,width:"3px",height:"100%",background:A}}/>
          <div style={{paddingLeft:"12px"}}>
            <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>✦  {noondayPrayer.title}</div>
            <div style={{...sn,fontSize:"8px",color:`${A}60`,marginBottom:"14px"}}>{noondayPrayer.src}</div>
            <p style={{...sr,fontSize:"14px",lineHeight:1.95,color:C.sand,margin:0,fontStyle:"italic"}}>{noondayPrayer.text}</p>
          </div>
        </div>

        <div style={{borderLeft:`2px solid ${A}40`,paddingLeft:"14px",marginBottom:"24px"}}>
          <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>Psalm 46:10</div>
          <p style={{...sr,fontSize:"14px",fontStyle:"italic",color:C.cream,margin:0,lineHeight:1.85,opacity:0.9}}>"Be still, and know that I am God."</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <button onClick={()=>setShowTimer(true)} style={{width:"100%",padding:"14px",background:`${A}18`,border:`1px solid ${A}55`,color:A,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase"}}>
            🕯  Sit in Silence
          </button>
          <button onClick={onDismiss} style={{width:"100%",padding:"12px",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase"}}>
            Enter the App →
          </button>
        </div>
      </div>
      <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${A}50,transparent)`}}/>
    </div>
  );
}



// ── DAY ROW — expandable reading day (hooks must be outside .map) ──────────

