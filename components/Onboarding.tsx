"use client";
import { useState } from "react";
import { C, sr, sn } from "@/lib/theme";
import { BROTHERS_IMG, LOGO_IMG } from "@/lib/images";
import { SEASON_OPTS, NEED_OPTS } from "@/data/nav";
import { selectPrayers } from "@/data/prayers";
import { Lbl } from "@/components/atoms";
import { GoldFlakes } from "@/components/GoldFlakes";
import { SpeakButton } from "@/components/SpeakButton";

export function Onboarding({onComplete}: {onComplete: (a: {seasons: string[]; needs: string[]}) => void}){
  const [seasons,setSeasons]=useState<string[]>([]);
  const [needs,setNeeds]=useState<string[]>([]);
  const [prayers,setPrayers]=useState<any[]>([]);
  const [pIdx,setPIdx]=useState(0);
  const [phase,setPhase]=useState("intake");
  const [entering,setEntering]=useState(false);

  const toggle=(arr: string[], set: (fn: (p: string[]) => string[]) => void, v: string)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const ok=seasons.length>0&&needs.length>0;

  const handleReveal=()=>{setPrayers(selectPrayers(seasons,needs));setPIdx(0);setPhase("reveal");};
  const handleEnter=()=>{setEntering(true);setTimeout(()=>onComplete({seasons,needs}),800);};

  if(phase==="reveal"){
    const p=prayers[pIdx];
    return(
      <div style={{minHeight:"100vh",background:C.bg,...sr,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
        <GoldFlakes/>
        <div style={{height:"1px",background:`linear-gradient(90deg,transparent,${C.gold},transparent)`}}/>
        <div style={{flex:1,padding:"44px 28px 32px",display:"flex",flexDirection:"column",zIndex:2,position:"relative"}}>
          <div style={{textAlign:"center",marginBottom:"30px"}}>
            <div style={{fontSize:"40px",color:C.gold,lineHeight:1,textShadow:`0 0 60px ${C.gold}60`,marginBottom:"9px"}}>✦</div>
            <div style={{...sn,fontSize:"7px",letterSpacing:"6px",textTransform:"uppercase",color:C.gold}}>A Prayer for You</div>
            <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:`${C.gold}50`,marginTop:"4px"}}>Prayer {pIdx+1} of {prayers.length}</div>
          </div>
          <div style={{flex:1,background:C.surface,border:`1px solid ${C.hi}`,overflow:"hidden",position:"relative"}}>
            <div style={{height:"2px",background:`linear-gradient(90deg,${C.gold},${C.gold}40)`}}/>
            <div style={{position:"absolute",right:"14px",top:"12px",fontSize:"50px",color:C.gold,opacity:0.04,lineHeight:1}}>✦</div>
            <div style={{padding:"24px 22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",marginBottom:"4px"}}>
                <h2 style={{...sr,fontSize:"20px",fontWeight:"normal",color:C.cream,margin:0,lineHeight:1.25}}>{p.title}</h2>
                <SpeakButton text={p.text} A={C.gold}/>
              </div>
              <div style={{...sn,fontSize:"8px",letterSpacing:"2px",color:`${C.gold}65`,textTransform:"uppercase",marginBottom:"22px"}}>{p.src}</div>
              <div style={{borderLeft:`2px solid ${C.gold}45`,paddingLeft:"18px"}}>
                <p style={{...sr,fontSize:"15px",lineHeight:2.0,color:C.sand,margin:0,fontStyle:"italic",whiteSpace:"pre-line"}}>{p.text}</p>
              </div>
            </div>
          </div>
          {prayers.length>1&&(
            <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"20px"}}>
              {prayers.map((_,i)=>(
                <button key={i} onClick={()=>setPIdx(i)} style={{width:pIdx===i?"24px":"8px",height:"8px",borderRadius:"4px",background:pIdx===i?C.gold:`${C.gold}30`,border:"none",cursor:"pointer",transition:"all 0.3s"}}/>
              ))}
            </div>
          )}
          {prayers.length>1&&pIdx<prayers.length-1&&(
            <button onClick={()=>setPIdx(i=>i+1)} style={{marginTop:"10px",background:"transparent",border:`1px solid ${C.gold}25`,color:`${C.gold}80`,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer"}}>Another Prayer →</button>
          )}
          <div style={{marginTop:"20px",display:"flex",flexDirection:"column",gap:"9px"}}>
            <button onClick={handleEnter} style={{width:"100%",padding:"16px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"6px",textTransform:"uppercase",transition:"all 0.5s",border:`1px solid ${C.gold}70`,background:entering?C.gold:C.surface,color:entering?C.bg:C.gold}}>
              {entering?"Entering Chambers…":"Enter Chambers →"}
            </button>
            <button onClick={()=>onComplete({seasons,needs})} style={{background:"none",border:"none",color:`${C.dim}40`,padding:"10px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>Skip</button>
          </div>
        </div>
        <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${C.gold}50,transparent)`}}/>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.sand,...sr,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:"210px",flexShrink:0,overflow:"hidden"}}>
        <img src={BROTHERS_IMG} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 25%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(11,11,9,0.35) 0%,rgba(11,11,9,0.0) 35%,rgba(11,11,9,0.97) 100%)"}}/>
        <div style={{position:"absolute",bottom:"18px",left:"24px",right:"24px"}}>
          <img src={LOGO_IMG} alt="Chambers" style={{width:"220px",height:"auto",objectFit:"contain",mixBlendMode:"lighten",filter:"brightness(1.05)",marginBottom:"8px"}}/>
          <h1 style={{...sr,fontSize:"24px",fontWeight:"normal",color:C.cream,margin:"4px 0 0",lineHeight:1.15}}>Where are you<br/>right now?</h1>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"22px 22px 0"}}>
        <Lbl color={C.gold} mb="9px">How are you entering?</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"20px"}}>
          {SEASON_OPTS.map(opt=>{
            const on=seasons.includes(opt.val);
            return(
              <button key={opt.val} onClick={()=>toggle(seasons,setSeasons,opt.val)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 14px",background:on?`${C.gold}12`:C.surface,border:`1px solid ${on?C.gold:C.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",border:`1px solid ${on?C.gold:C.hi}`,background:on?`${C.gold}20`:C.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",color:on?C.gold:C.hi,flexShrink:0,transition:"all 0.2s"}}>{opt.icon}</div>
                <div style={{flex:1}}>
                  <div style={{...sr,fontSize:"15px",color:on?C.cream:C.sand,marginBottom:"2px"}}>{opt.label}</div>
                  <div style={{...sn,fontSize:"9px",color:C.dim,lineHeight:1.5}}>{opt.sub}</div>
                </div>
                <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`1px solid ${on?C.gold:C.hi}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                  {on&&<span style={{color:C.bg,fontSize:"9px",lineHeight:1}}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <Lbl color={C.gold} mb="9px">What do you need most?</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"18px"}}>
          {NEED_OPTS.map(opt=>{
            const on=needs.includes(opt.val);
            return(
              <button key={opt.val} onClick={()=>toggle(needs,setNeeds,opt.val)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 14px",background:on?`${C.gold}12`:C.surface,border:`1px solid ${on?C.gold:C.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",border:`1px solid ${on?C.gold:C.hi}`,background:on?`${C.gold}20`:C.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",color:on?C.gold:C.hi,flexShrink:0,transition:"all 0.2s"}}>{opt.icon}</div>
                <div style={{flex:1}}>
                  <div style={{...sr,fontSize:"15px",color:on?C.cream:C.sand,marginBottom:"2px"}}>{opt.label}</div>
                  <div style={{...sn,fontSize:"9px",color:C.dim,lineHeight:1.5}}>{opt.sub}</div>
                </div>
                <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`1px solid ${on?C.gold:C.hi}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                  {on&&<span style={{color:C.bg,fontSize:"9px",lineHeight:1}}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:"10px",padding:"11px 14px",background:C.surface,border:`1px solid ${C.border}`,marginBottom:"18px"}}>
          <span style={{color:C.gold,fontSize:"13px",flexShrink:0,marginTop:"1px"}}>⊕</span>
          <p style={{...sn,fontSize:"9px",color:C.dim,margin:0,lineHeight:1.65}}>Your answers stay on your device. Nothing is collected, sold, or tracked.</p>
        </div>
        <div style={{paddingBottom:"32px"}}>
          <button onClick={ok?handleReveal:undefined} disabled={!ok} style={{width:"100%",padding:"15px",cursor:ok?"pointer":"default",...sn,fontSize:"8px",letterSpacing:"6px",textTransform:"uppercase",transition:"all 0.4s",marginBottom:"10px",background:ok?`${C.gold}18`:"transparent",border:`1px solid ${ok?C.gold:C.border}`,color:ok?C.gold:C.dim}}>
            {ok?"✦  Receive a Prayer →":"Select from both lists"}
          </button>
          <button onClick={()=>onComplete({seasons:[],needs:[]})} style={{width:"100%",background:"none",border:"none",color:`${C.dim}40`,padding:"10px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>
            Skip — Enter the App
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RETURN SCREEN (3+ days away) ──────────────────────────────
