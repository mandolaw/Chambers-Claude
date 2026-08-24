"use client";
import { useState, useEffect, useRef } from "react";
import { C, sr, sn } from "@/lib/theme";
import { GoldFlakes } from "@/components/GoldFlakes";

export function CandleTimer({A, onClose}: {A: string; onClose: () => void}){
  const [mins,setMins]=useState<number | null>(null);
  const [secs,setSecs]=useState(0);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [flicker,setFlicker]=useState(1);
  const intRef=useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(()=>{
    if(!running) return;
    intRef.current=setInterval(()=>{
      setSecs(s=>{
        if(s<=1){
          clearInterval(intRef.current);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return s-1;
      });
      setFlicker(0.85+Math.random()*0.15);
    },1000);
    return ()=>clearInterval(intRef.current);
  },[running]);

  const start=(m: number)=>{setMins(m);setSecs(m*60);setRunning(true);setDone(false);};
  const totalSecs=(mins||0)*60;
  const progress=mins?((totalSecs-secs)/totalSecs):0;
  const mm=Math.floor(secs/60);
  const ss=String(secs%60).padStart(2,'0');

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(11,11,9,0.97)",zIndex:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px"}}>
      {!mins&&(
        <div style={{width:"100%",maxWidth:"340px"}}>
          <div style={{textAlign:"center",marginBottom:"32px"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>🕯</div>
            <h2 style={{...sr,fontSize:"22px",fontWeight:"normal",color:C.cream,margin:"0 0 8px"}}>Sit in Silence</h2>
            <p style={{...sn,fontSize:"9px",color:C.dim,letterSpacing:"2px",textTransform:"uppercase"}}>Choose your time</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"28px"}}>
            {[
              {m:2,  ref:"Psalm 46:10",       txt:'“Be still, and know that I am God.”'},
              {m:5,  ref:"Psalm 62:1",         txt:'“Truly my soul finds rest in God; my salvation comes from him.”'},
              {m:10, ref:"Psalm 131:2",        txt:'“I have calmed and quieted myself, I am like a weaned child with its mother; like a weaned child I am content.”'},
              {m:15, ref:"Isaiah 30:15",       txt:'“In repentance and rest is your salvation, in quietness and trust is your strength.”'},
              {m:20, ref:"Lamentations 3:26",  txt:'“It is good to wait quietly for the salvation of the Lord.”'},
            ].map(({m,ref,txt})=>(
              <button key={m} onClick={()=>start(m)} style={{display:"flex",flexDirection:"column",padding:"12px 14px",background:C.surface,border:`1px solid ${A}40`,color:A,...sn,cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}>
                <span style={{fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase",marginBottom:"5px"}}>{m} {m===1?"Minute":"Minutes"}</span>
                <span style={{...sr,fontSize:"12px",fontStyle:"italic",color:C.dim,lineHeight:1.6,opacity:0.85}}>{txt}</span>
                <span style={{...sn,fontSize:"7px",color:`${A}70`,letterSpacing:"1px",marginTop:"3px"}}>{ref}</span>
              </button>
            ))}
          </div>
          <div style={{borderLeft:`2px solid ${A}40`,paddingLeft:"14px",marginBottom:"28px"}}>
            <p style={{...sr,fontSize:"13px",fontStyle:"italic",color:C.dim,margin:0,lineHeight:1.8}}>"The desert fathers called silence the greatest weapon against the noonday demon. Choose your time. Enter the stillness."</p>
          </div>
          <button onClick={onClose} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"11px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>Cancel</button>
        </div>
      )}
      {mins&&!done&&(
        <div style={{textAlign:"center",width:"100%",maxWidth:"300px"}}>
          <div style={{fontSize:`${60+flicker*20}px`,marginBottom:"28px",transition:"font-size 0.5s",filter:`brightness(${0.8+flicker*0.2})`}}>🕯</div>
          {/* Progress ring */}
          <div style={{position:"relative",width:"160px",height:"160px",margin:"0 auto 28px"}}>
            <svg width="160" height="160" style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
              <circle cx="80" cy="80" r="70" fill="none" stroke={C.border} strokeWidth="2"/>
              <circle cx="80" cy="80" r="70" fill="none" stroke={A} strokeWidth="2"
                strokeDasharray={`${2*Math.PI*70}`}
                strokeDashoffset={`${2*Math.PI*70*(1-progress)}`}
                strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{...sr,fontSize:"36px",color:C.cream,lineHeight:1}}>{mm}:{ss}</div>
              <div style={{...sn,fontSize:"7px",color:C.dim,letterSpacing:"3px",textTransform:"uppercase",marginTop:"6px"}}>remaining</div>
            </div>
          </div>
          <p style={{...sr,fontSize:"14px",fontStyle:"italic",color:C.dim,margin:"0 0 28px",lineHeight:1.75}}>"Be still and know that I am God."</p>
          <button onClick={()=>{clearInterval(intRef.current);setMins(null);setRunning(false);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"10px 20px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>End Early</button>
        </div>
      )}
      {done&&(
        <div style={{textAlign:"center",width:"100%",maxWidth:"300px"}}>
          <GoldFlakes/>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>✦</div>
          <h2 style={{...sr,fontSize:"22px",fontWeight:"normal",color:C.cream,margin:"0 0 10px"}}>Well done, brother.</h2>
          <p style={{...sr,fontSize:"14px",fontStyle:"italic",color:C.dim,lineHeight:1.8,margin:"0 0 28px"}}>{mins} minutes given to silence.<br/>That is no small thing.</p>
          <button onClick={onClose} style={{width:"100%",background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"14px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase"}}>Return</button>
        </div>
      )}
    </div>
  );
}


// ── PRAYERS ───────────────────────────────────────────────────
