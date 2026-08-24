"use client";
import { useState } from "react";
import { C, sr, sn } from "@/lib/theme";
import { MOSES_IMG } from "@/lib/images";
import { SEASON_OPTS, NEED_OPTS } from "@/data/nav";
import { selectPrayers } from "@/data/prayers";
import { Lbl } from "@/components/atoms";
import { GoldFlakes } from "@/components/GoldFlakes";

export function ReturnScreen({days, onContinue, A}: {days: number; onContinue: () => void; A: string}){
  const [seasons,setSeasons]=useState<string[]>([]);
  const [needs,setNeeds]=useState<string[]>([]);
  const [phase,setPhase]=useState("welcome");
  const [prayer,setPrayer]=useState<any>(null);
  const toggle=(arr: string[], set: (fn: (p: string[]) => string[]) => void, v: string)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const ok=seasons.length>0&&needs.length>0;

  const RETURN_VERSES=[
    {ref:"Lamentations 3:22–23",text:"Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."},
    {ref:"Luke 15:20",text:"But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him."},
    {ref:"Isaiah 43:18–19",text:"Forget the former things; do not dwell on the past. See, I am doing a new thing! Now it springs up; do you not perceive it?"},
  ];
  const rv=RETURN_VERSES[days%3];

  if(phase==="welcome") return(
    <div style={{minHeight:"100vh",background:C.bg,...sr,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:"200px",flexShrink:0,overflow:"hidden"}}>
        <img src={MOSES_IMG} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(11,11,9,0.2) 0%,rgba(11,11,9,0.97) 100%)"}}/>
      </div>
      <div style={{flex:1,padding:"28px 24px",display:"flex",flexDirection:"column"}}>
        <div style={{...sn,fontSize:"7px",letterSpacing:"6px",textTransform:"uppercase",color:A,marginBottom:"12px"}}>Welcome Back</div>
        <h1 style={{...sr,fontSize:"26px",fontWeight:"normal",color:C.cream,margin:"0 0 16px",lineHeight:1.2}}>You've been away<br/>{days} {days===1?"day":"days"}.</h1>
        <div style={{borderLeft:`2px solid ${A}50`,paddingLeft:"16px",marginBottom:"24px"}}>
          <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"6px"}}>{rv.ref}</div>
          <p style={{...sr,fontSize:"15px",fontStyle:"italic",lineHeight:1.9,color:C.sand,margin:0,opacity:0.95}}>"{rv.text}"</p>
        </div>
        <p style={{fontSize:"13px",color:C.dim,lineHeight:1.85,margin:"0 0 28px"}}>There is no shame here. The door was never locked. Tell us where you are right now and we'll give you a prayer to re-enter with.</p>
        <button onClick={()=>setPhase("intake")} style={{width:"100%",padding:"15px",background:`${A}18`,border:`1px solid ${A}55`,color:A,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase",marginBottom:"10px"}}>Where I Am Now →</button>
        <button onClick={onContinue} style={{background:"none",border:"none",color:`${C.dim}40`,padding:"10px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>Enter Without a Prayer</button>
      </div>
    </div>
  );

  if(phase==="intake") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.sand,...sr,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"28px 24px 0",flex:1,overflowY:"auto"}}>
        <button onClick={()=>setPhase("welcome")} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"20px",padding:0}}>← Back</button>
        <Lbl color={A} mb="9px">Where are you right now?</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"20px"}}>
          {SEASON_OPTS.map(opt=>{
            const on=seasons.includes(opt.val);
            return(
              <button key={opt.val} onClick={()=>toggle(seasons,setSeasons,opt.val)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"11px 13px",background:on?`${A}12`:C.surface,border:`1px solid ${on?A:C.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",border:`1px solid ${on?A:C.hi}`,background:on?`${A}20`:C.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:on?A:C.hi,flexShrink:0}}>{opt.icon}</div>
                <div style={{flex:1}}>
                  <div style={{...sr,fontSize:"14px",color:on?C.cream:C.sand}}>{opt.label}</div>
                  <div style={{...sn,fontSize:"9px",color:C.dim,marginTop:"1px"}}>{opt.sub}</div>
                </div>
                {on&&<span style={{color:A,fontSize:"12px",flexShrink:0}}>✓</span>}
              </button>
            );
          })}
        </div>
        <Lbl color={A} mb="9px">What do you need most?</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"20px"}}>
          {NEED_OPTS.map(opt=>{
            const on=needs.includes(opt.val);
            return(
              <button key={opt.val} onClick={()=>toggle(needs,setNeeds,opt.val)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"11px 13px",background:on?`${A}12`:C.surface,border:`1px solid ${on?A:C.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",border:`1px solid ${on?A:C.hi}`,background:on?`${A}20`:C.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:on?A:C.hi,flexShrink:0}}>{opt.icon}</div>
                <div style={{flex:1}}>
                  <div style={{...sr,fontSize:"14px",color:on?C.cream:C.sand}}>{opt.label}</div>
                  <div style={{...sn,fontSize:"9px",color:C.dim,marginTop:"1px"}}>{opt.sub}</div>
                </div>
                {on&&<span style={{color:A,fontSize:"12px",flexShrink:0}}>✓</span>}
              </button>
            );
          })}
        </div>
        <div style={{paddingBottom:"32px"}}>
          <button onClick={()=>{if(ok){setPrayer(selectPrayers(seasons,needs)[0]);setPhase("prayer");}}} disabled={!ok} style={{width:"100%",padding:"14px",cursor:ok?"pointer":"default",...sn,fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase",transition:"all 0.4s",marginBottom:"10px",background:ok?`${A}18`:"transparent",border:`1px solid ${ok?A:C.border}`,color:ok?A:C.dim}}>
            {ok?"Receive a Prayer →":"Select from both lists"}
          </button>
          <button onClick={onContinue} style={{background:"none",border:"none",color:`${C.dim}40`,padding:"10px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",width:"100%"}}>Skip — Enter the App</button>
        </div>
      </div>
    </div>
  );

  if(phase==="prayer"&&prayer) return(
    <div style={{minHeight:"100vh",background:C.bg,...sr,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <GoldFlakes/>
      <div style={{flex:1,padding:"44px 28px 32px",display:"flex",flexDirection:"column",zIndex:2,position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"36px",color:A,lineHeight:1,textShadow:`0 0 50px ${A}60`,marginBottom:"8px"}}>✦</div>
          <div style={{...sn,fontSize:"7px",letterSpacing:"6px",textTransform:"uppercase",color:A}}>A Prayer for Your Return</div>
        </div>
        <div style={{flex:1,background:C.surface,border:`1px solid ${C.hi}`,overflow:"hidden"}}>
          <div style={{height:"2px",background:`linear-gradient(90deg,${A},${A}40)`}}/>
          <div style={{padding:"22px 20px"}}>
            <h2 style={{...sr,fontSize:"19px",fontWeight:"normal",color:C.cream,margin:"0 0 4px"}}>{prayer.title}</h2>
            <div style={{...sn,fontSize:"8px",color:`${A}65`,letterSpacing:"1px",marginBottom:"20px"}}>{prayer.src}</div>
            <div style={{borderLeft:`2px solid ${A}45`,paddingLeft:"16px"}}>
              <p style={{...sr,fontSize:"14px",lineHeight:2.0,color:C.sand,margin:0,fontStyle:"italic",whiteSpace:"pre-line"}}>{prayer.text}</p>
            </div>
          </div>
        </div>
        <button onClick={onContinue} style={{width:"100%",marginTop:"20px",padding:"15px",background:`${A}18`,border:`1px solid ${A}55`,color:A,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase"}}>Enter Chambers →</button>
      </div>
    </div>
  );

  return null;
}


// ── CUSTOM ILLUSTRATED NAV ICONS ────────────────────────────────
// Hand-drawn SVG marks, etched-gold-on-dark style, replacing Unicode glyphs

// ── SEASONAL HERO ────────────────────────────────────────────
// The "Netflix front door" — during Advent, Lent, or Eastertide,
// this replaces the generic month banner with a full-attention
// seasonal card: day count, progress, direct entry into that
// season's content. During Ordinary Time, it teases what's coming.

