"use client";
import { useState, useEffect } from "react";
import { C, sr, sn, SEASONS } from "@/lib/theme";
import { LOGO_IMG } from "@/lib/images";
import { LS, usePersist, getStreak } from "@/lib/storage";
import { useLocalReminders } from "@/lib/notifications";
import { NAV, PILLARS } from "@/data/nav";
import { CAL, WEEKLY_READINGS, LONG_STUDIES, currentWeekIdx } from "@/data/studyPlans";
import { EXAMEN_PROMPTS } from "@/data/examen";
import { VERSES_BY_MONTH, VERSE_TEXT } from "@/data/verses";
import { PROMISES } from "@/data/promises";
import { selectPrayers } from "@/data/prayers";
import { Rule, Lbl } from "@/components/atoms";
import { SpeakButton } from "@/components/SpeakButton";
import { GoldFlakes } from "@/components/GoldFlakes";
import { CandleTimer } from "@/components/CandleTimer";
import { SeasonalHero } from "@/components/SeasonalHero";
import { NoondayMode } from "@/components/NoondayMode";
import { StudyViewer, DayRow } from "@/components/StudyViewer";
import { IconRule, IconWay, IconPrayer, IconBrothers } from "@/components/icons";
import { BrothersTab } from "@/components/BrothersTab";

export function ChambersApp({intakeAnswers, onOpenSettings}: {intakeAnswers: any; onOpenSettings: () => void}){
  const today=new Date();
  const cm=today.getMonth(),cd=today.getDate(),dow=today.getDay();
  const weekIdx=currentWeekIdx();
  const hour=today.getHours();
  const isNoonday=hour>=11&&hour<15;

  const [tab,       setTab]       = useState("rule");
  const [showGold,  setShowGold]  = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showNoon,  setShowNoon]  = useState(false);
  const [pillarIdx, setPillarIdx] = useState(0);
  const [yearView,  setYearView]  = useState(false);
  const [yearMonth, setYearMonth] = useState(null);
  const [activeStudy, setActiveStudy] = useState(null);
  const [activePlanIdx, setActivePlanIdx] = useState(null);
  const [examenIdx, setExamenIdx] = useState(0);
  const [journalSaved,setJSaved]  = useState(false);
  const [showAddP,  setShowAddP]  = useState(false);
  const [prayerTab, setPrayerTab] = useState("log");   // log | promises
  const [openCat,   setOpenCat]   = useState(null);
  const [newPrayer, setNewPrayer] = useState("");
  const [newNote,   setNewNote]   = useState("");
  const [newImpMode,setNewImpMode]= useState(false);
  const [todayPrayer,setTodayPrayer]=useState(null);

  // Persisted
  const [ruleDone,    setRuleDone]    = usePersist("ruleDone",{});
  const [dayChecked,  setDayChecked]  = usePersist("dayChecked",{});
  const [readDates,   setReadDates]   = usePersist("readDates",[]);
  const [verseChecked,setVerseChecked]= usePersist("verseChecked",{});
  const [challengeDone,setChalDone]   = usePersist("chalDone",{});
  const [prayerLog,   setPrayerLog]   = usePersist("prayerLog",[]);
  const [journal,     setJournal]     = usePersist("journal","");
  const [journalEntries,setJournalEntries] = usePersist("journalEntries",[]);
  const [selMonth,    setSelMonth]    = usePersist("selMonth",cm);
  const [ruleHistory,  setRuleHistory]  = usePersist("ruleHistory",{});
  const [monthNotes,   setMonthNotes]   = usePersist("monthNotes",{});
  const [remindersOn,  setRemindersOn]  = usePersist("remindersOn",false);
  const [morningTime,  setMorningTime]  = usePersist("morningTime","07:00");
  const [eveningTime,  setEveningTime]  = usePersist("eveningTime","21:00");

  useLocalReminders(morningTime, eveningTime, remindersOn);

  useEffect(()=>{
    const s=intakeAnswers?.seasons||[],n=intakeAnswers?.needs||[];
    if(s.length&&n.length) setTodayPrayer(selectPrayers(s,n)[0]||null);
  },[]);

  useEffect(()=>{
    LS.set("lastVisit",new Date().toISOString());
  },[]);

  const cal=CAL[selMonth],season=SEASONS[cal.s],A=season.a;
  const todayVerse=(VERSES_BY_MONTH[cm]||[])[cd-1]||"Psalm 23:1";
  const vKey=`${cm}-${cd}`;
  const weekPlan=WEEKLY_READINGS[activePlanIdx!==null?activePlanIdx:weekIdx];
  const todayRead=weekPlan?.days[dow]||weekPlan?.days[0];
  const readStreak=getStreak(readDates);
  const todayRuleKey=today.toDateString();
  const todayRule=ruleDone[todayRuleKey]||{};
  const ruleCount=["prayer","scripture","discipline","examine","body"].filter(k=>todayRule[k]).length;
  const currentPillar=PILLARS[pillarIdx%4];

  const toggleRule=k=>{
    const updated={...todayRule,[k]:!todayRule[k]};
    setRuleDone(p=>({...p,[todayRuleKey]:updated}));
    // Track in history for progress view
    const monthKey=`${today.getFullYear()}-${String(cm+1).padStart(2,'0')}`;
    const dayKey=today.toISOString().split("T")[0];
    setRuleHistory(p=>({...p,[dayKey]:updated}));
  };
  const markRead=key=>{
    const wasOff=!dayChecked[key];
    setDayChecked(p=>({...p,[key]:wasOff}));
    if(wasOff) setReadDates(p=>[...p,today.toISOString().split("T")[0]]);
  };
  const markAnswered=id=>{
    setPrayerLog(p=>p.map(x=>x.id===id?{...x,answered:true,answeredOn:new Date().toLocaleDateString()}:x));
    setShowGold(true);setTimeout(()=>setShowGold(false),4000);
  };

  const RULE_ITEMS=[
    {k:"prayer",     icon:"✦",label:"Morning Prayer",      sub:"Before the phone. Before the news."},
    {k:"scripture",  icon:"∴",label:"Scripture Reading",   sub:"Today's passage — read and sat with."},
    {k:"discipline", icon:"⚒",label:"Fasting / Discipline",sub:"Whatever your current fast is. Keep it."},
    {k:"examine",    icon:"◉",label:"Evening Examen",      sub:"5 minutes reviewing the day before God."},
    {k:"body",       icon:"⚔",label:"Physical Discipline", sub:"Exercise, cold shower, or manual labor."},
  ];

  if(showTimer) return <CandleTimer A={A} onClose={()=>setShowTimer(false)}/>;
  if(showNoon)  return <NoondayMode A={A} onDismiss={()=>setShowNoon(false)}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.sand,...sr,overflowX:"hidden"}}>
      {showGold&&<GoldFlakes/>}
      <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${A},transparent)`}}/>

      {/* HEADER */}
      <header style={{padding:"16px 18px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{...sn,fontSize:"7px",letterSpacing:"6px",textTransform:"uppercase",color:A,marginBottom:"4px",display:"flex",alignItems:"center",gap:"6px"}}>
            <span>{season.icon}</span>{season.label} · {today.getFullYear()}
          </div>
          <img src={LOGO_IMG} alt="Chambers" style={{height:"44px",width:"auto",objectFit:"contain",mixBlendMode:"lighten",filter:"brightness(1.05) contrast(1.05)"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          {isNoonday&&(
            <button onClick={()=>setShowNoon(true)} title="Noonday Office" style={{background:C.surface,border:`1px solid ${A}40`,color:A,padding:"7px 10px",cursor:"pointer",fontSize:"14px",lineHeight:1}}>☽</button>
          )}
          <button onClick={()=>setShowTimer(true)} title="Candle Timer" style={{background:C.surface,border:`1px solid ${C.border}`,color:C.dim,padding:"7px 10px",cursor:"pointer",fontSize:"14px",lineHeight:1}}>🕯</button>
          <button onClick={onOpenSettings} title="Settings" style={{background:C.surface,border:`1px solid ${C.border}`,color:C.dim,padding:"7px 10px",cursor:"pointer",fontSize:"14px",lineHeight:1}}>⚙</button>
          {readStreak>0&&<div style={{...sn,fontSize:"7px",color:C.gold,letterSpacing:"1px"}}>🔥{readStreak}d</div>}
        </div>
      </header>

      {/* NAV */}
      <nav style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.surface,position:"sticky",top:0,zIndex:10}}>
        {NAV.map(({id,label})=>{
          const IconComp = {rule:IconRule, way:IconWay, prayer:IconPrayer, brothers:IconBrothers}[id];
          const iconColor = tab===id?A:C.dim;
          return (
            <button key={id} onClick={()=>{setTab(id);setYearView(false);setYearMonth(null);}} style={{flex:1,padding:"11px 2px 9px",background:"none",border:"none",cursor:"pointer",color:iconColor,...sn,fontSize:"6px",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`2px solid ${tab===id?A:"transparent"}`,transition:"all 0.25s",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
              <IconComp size={20} color={iconColor}/>{label}
            </button>
          );
        })}
      </nav>

      <main style={{paddingBottom:"80px"}}>

{/* ══ RULE TAB ══════════════════════════════════════════════ */}
{tab==="rule"&&(
<div style={{padding:"20px 18px 0"}}>

  {/* Seasonal Hero — the real front door, Netflix-style */}
  <SeasonalHero
    onEnterSeason={(id)=>{ setTab("way"); setYearView(true); }}
  />

  {/* Church year quick-access (secondary, always available) */}
  <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 14px",background:C.surface,border:`1px solid ${A}25`,marginBottom:"20px",cursor:"pointer"}} onClick={()=>{setTab("way");setYearView(true);}}>
    <span style={{fontSize:"18px",color:A}}>{season.icon}</span>
    <div style={{flex:1}}>
      <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:A,marginBottom:"2px"}}>{season.label} — {cal.theme}</div>
      <div style={{...sn,fontSize:"8px",color:C.dim}}>{season.sub} · Tap to explore the church year</div>
    </div>
    <span style={{color:C.dim,fontSize:"14px"}}>›</span>
  </div>

  {/* Daily Rule */}
  <div style={{marginBottom:"24px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
      <Lbl color={C.dim}>⌂  The Daily Rule</Lbl>
      <span style={{...sn,fontSize:"7px",color:ruleCount===5?C.green:A,letterSpacing:"2px"}}>{ruleCount}/5{ruleCount===5&&" ✦"}</span>
    </div>
    {RULE_ITEMS.map(item=>{
      const on=!!todayRule[item.k];
      return(
        <button key={item.k} onClick={()=>toggleRule(item.k)} style={{width:"100%",display:"flex",alignItems:"center",gap:"14px",padding:"13px 15px",background:on?`${A}10`:C.surface,border:`1px solid ${on?A:C.border}`,cursor:"pointer",textAlign:"left",marginBottom:"3px",transition:"all 0.2s"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,border:`1px solid ${on?A:C.hi}`,background:on?`${A}25`:C.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",color:on?A:C.hi,transition:"all 0.25s"}}>{on?"✓":item.icon}</div>
          <div style={{flex:1}}>
            <div style={{...sr,fontSize:"14px",color:on?C.cream:C.sand,marginBottom:"2px"}}>{item.label}</div>
            <div style={{...sn,fontSize:"8px",color:C.dim,lineHeight:1.4}}>{item.sub}</div>
          </div>
        </button>
      );
    })}
    {ruleCount===5&&(
      <div style={{textAlign:"center",padding:"11px",marginTop:"6px",background:`${C.green}12`,border:`1px solid ${C.green}40`}}>
        <span style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:C.green}}>☩  Rule Complete — Well done, brother.</span>
      </div>
    )}
  </div>

  {/* Today's reading */}
  <div style={{marginBottom:"22px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
      <Lbl color={C.dim}>ᚱ  Today's Reading</Lbl>
      {readStreak>0&&<span style={{...sn,fontSize:"7px",color:C.gold}}>🔥 {readStreak}d</span>}
    </div>
    <div style={{background:C.surface,border:`1px solid ${A}30`,overflow:"hidden"}}>
      <div style={{height:"2px",background:`linear-gradient(90deg,${A},${A}40)`}}/>
      <div style={{padding:"16px 16px 14px"}}>
        <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:A,marginBottom:"4px"}}>{todayRead?.day} · {weekPlan?.week}</div>
        <div style={{...sr,fontSize:"18px",color:C.cream,marginBottom:"5px"}}>{todayRead?.ref}</div>
        <p style={{fontSize:"13px",color:C.sand,opacity:0.82,lineHeight:1.72,margin:"0 0 13px"}}>{todayRead?.focus}</p>
        <button onClick={()=>markRead(`t-${today.toDateString()}`)} style={{display:"flex",alignItems:"center",gap:"7px",background:dayChecked[`t-${today.toDateString()}`]?`${A}18`:"transparent",border:`1px solid ${dayChecked[`t-${today.toDateString()}`]?A:C.hi}`,color:dayChecked[`t-${today.toDateString()}`]?A:C.dim,padding:"7px 14px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",transition:"all 0.3s"}}>
          <span>{dayChecked[`t-${today.toDateString()}`]?"✓":"○"}</span>
          {dayChecked[`t-${today.toDateString()}`]?"Done — streak kept":"Mark Complete"}
        </button>
      </div>
    </div>
  </div>

  {/* This week's memory verse — same all week, tied to the reading plan */}
  {weekPlan?.verse&&(
  <div style={{background:C.surface,border:`1px solid ${A}30`,padding:"16px 16px 14px",marginBottom:"24px"}}>
    <Lbl color={A}>✦  This Week's Memory Verse</Lbl>
    <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:C.dim,marginBottom:"8px"}}>{weekPlan.verse}</div>
    <p style={{...sr,fontSize:"16px",lineHeight:1.95,color:C.cream,margin:"0 0 12px",fontStyle:"italic"}}>"{weekPlan.vText}"</p>
    <button onClick={()=>setVerseChecked(p=>({...p,[`wk-${weekPlan.week}`]:!p[`wk-${weekPlan.week}`]}))} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:verseChecked[`wk-${weekPlan.week}`]?`${A}15`:"transparent",border:`1px solid ${verseChecked[`wk-${weekPlan.week}`]?A:C.hi}`,color:verseChecked[`wk-${weekPlan.week}`]?A:C.dim,padding:"6px 13px",cursor:"pointer",transition:"all 0.3s"}}>
      {verseChecked[`wk-${weekPlan.week}`]?"✓  Memorized":"Mark Memorized"}
    </button>
  </div>
  )}

  {/* Today's verse — full text */}
  <div style={{borderLeft:`2px solid ${A}45`,paddingLeft:"14px",marginBottom:"24px"}}>
    <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:A,marginBottom:"8px"}}>{todayVerse}</div>
    {VERSE_TEXT[todayVerse]&&(
      <p style={{...sr,fontSize:"16px",lineHeight:1.95,color:C.cream,margin:"0 0 11px",fontStyle:"italic",opacity:0.95}}>"{VERSE_TEXT[todayVerse]}"</p>
    )}
    <button onClick={()=>setVerseChecked(p=>({...p,[vKey]:!p[vKey]}))} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:verseChecked[vKey]?`${A}15`:"transparent",border:`1px solid ${verseChecked[vKey]?A:C.hi}`,color:verseChecked[vKey]?A:C.dim,padding:"6px 13px",cursor:"pointer",transition:"all 0.3s"}}>
      {verseChecked[vKey]?"✓  Meditated":"Mark Meditated"}
    </button>
  </div>

  {/* Evening Examen */}
  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"22px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
      <Lbl color={C.dim}>◉  Evening Examen</Lbl>
      <div style={{display:"flex",gap:"7px",alignItems:"center"}}>
        <span style={{...sn,fontSize:"7px",color:`${C.dim}50`,letterSpacing:"2px",textTransform:"uppercase"}}>⊕ Private</span>
        <button onClick={()=>setShowTimer(true)} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.dim,padding:"4px 8px",cursor:"pointer",fontSize:"12px"}}>🕯</button>
      </div>
    </div>
    <div style={{padding:"12px 14px",marginBottom:"11px",border:`1px solid ${C.border}`,background:C.surface,display:"flex",gap:"9px",alignItems:"flex-start"}}>
      <div style={{width:"2px",background:A,flexShrink:0,alignSelf:"stretch"}}/>
      <p style={{...sr,fontSize:"13px",fontStyle:"italic",color:C.sand,opacity:0.82,margin:0,flex:1,lineHeight:1.75}}>{EXAMEN_PROMPTS[examenIdx]}</p>
      <button onClick={()=>setExamenIdx(i=>(i+1)%EXAMEN_PROMPTS.length)} style={{background:"none",border:"none",color:A,cursor:"pointer",fontSize:"16px",flexShrink:0,padding:0}}>↻</button>
    </div>
    <textarea value={journal} onChange={e=>setJournal(e.target.value)} placeholder="Write freely. This is your space before God..." style={{width:"100%",minHeight:"130px",background:C.surface,border:`1px solid ${C.border}`,padding:"13px",color:C.sand,fontSize:"14px",lineHeight:1.8,...sr,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
    <div style={{display:"flex",gap:"7px",marginTop:"8px",marginBottom:"4px"}}>
      <button onClick={()=>{
                if(journal.trim()){
                  const entry={id:Date.now(),date:today.toLocaleDateString(),dateKey:today.toISOString().split("T")[0],prompt:EXAMEN_PROMPTS[examenIdx],text:journal.trim()};
                  setJournalEntries(p=>[entry,...p.filter(e=>e.dateKey!==entry.dateKey)]);
                  setJSaved(true);setTimeout(()=>setJSaved(false),2500);
                }
              }} style={{flex:1,background:journalSaved?`${A}20`:`${A}10`,border:`1px solid ${journalSaved?A:C.hi}`,color:A,padding:"10px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",transition:"all 0.3s"}}>{journalSaved?"✓  Saved":"Save Entry"}</button>
      <button onClick={()=>setJournal("")} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"10px 13px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase"}}>Clear</button>
    </div>
    <p style={{textAlign:"center",...sn,fontSize:"9px",color:C.dim,marginTop:"8px",letterSpacing:"2px",opacity:0.4}}>No one but you can read this.</p>

    {journalEntries.length>0&&(
      <div style={{marginTop:"22px",borderTop:`1px solid ${C.border}`,paddingTop:"18px"}}>
        <Lbl color={C.dim}>Past Entries</Lbl>
        {journalEntries.slice(0,5).map((e,i)=>(
          <div key={e.id} style={{marginBottom:"10px",padding:"14px",background:C.surface,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
              <div style={{...sn,fontSize:"7px",color:A,letterSpacing:"3px",textTransform:"uppercase"}}>{e.date}</div>
              <div style={{...sn,fontSize:"7px",color:C.dim,opacity:0.5}}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(e.dateKey).getDay()]}</div>
            </div>
            <div style={{...sn,fontSize:"8px",color:C.dim,fontStyle:"italic",marginBottom:"7px",opacity:0.7,lineHeight:1.5}}>{e.prompt}</div>
            <p style={{...sr,fontSize:"13px",color:C.sand,margin:0,lineHeight:1.78,opacity:0.85,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{e.text}</p>
          </div>
        ))}
        {journalEntries.length>5&&(
          <div style={{...sn,fontSize:"8px",color:C.dim,textAlign:"center",padding:"8px",opacity:0.6}}>{journalEntries.length-5} more entries in your history</div>
        )}
      </div>
    )}
  </div>
</div>
)}

{/* ══ WAY TAB ═══════════════════════════════════════════════ */}
{tab==="way"&&activeStudy&&(
  <StudyViewer study={activeStudy} onBack={()=>setActiveStudy(null)} A={A}/>
)}

{tab==="way"&&!yearView&&!activeStudy&&(
<div style={{padding:"20px 18px 0"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
    <Lbl color={C.dim}>ᚱ  The Way</Lbl>
    <button onClick={()=>{setYearView(true);setYearMonth(null);}} style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"4px 11px",cursor:"pointer"}}>⊕ The Year</button>
  </div>

  {/* Weekly plan */}
  <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:C.dim,marginBottom:"9px"}}>{weekPlan?.week}</div>
  <div style={{background:C.surface,border:`1px solid ${C.border}`,marginBottom:"22px"}}>
    {weekPlan?.days.map((d,i)=>{
      const isT=i===dow,dk=`w${weekIdx}-${i}`,done=!!dayChecked[dk];
      return <DayRow key={i} d={d} i={i} isT={isT} dk={dk} done={done} onMark={markRead} A={A} weekPlan={weekPlan}/>;
    })}
  </div>

  {/* Long-form 30-day studies */}
  <div style={{marginBottom:"22px"}}>
    <Lbl color={C.dim}>30-Day Field Guides</Lbl>
    {LONG_STUDIES.map(st=>(
      <button key={st.id} onClick={()=>setActiveStudy(st)} style={{width:"100%",textAlign:"left",display:"block",background:C.surface,border:`1px solid ${C.border}`,padding:"14px",marginBottom:"8px",cursor:"pointer"}}>
        <div style={{...sr,fontSize:"15px",color:C.cream,marginBottom:"3px"}}>{st.title}</div>
        <div style={{...sn,fontSize:"9px",color:C.dim,marginBottom:"6px"}}>{st.subtitle}</div>
        <div style={{...sn,fontSize:"8px",color:A}}>{st.days.length} days →</div>
      </button>
    ))}
  </div>

  <div style={{marginBottom:"28px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
      <Lbl color={C.dim} mb="0">All Plans</Lbl>
      {activePlanIdx!==null&&(
        <button onClick={()=>setActivePlanIdx(null)} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"3px 9px",cursor:"pointer"}}>Use This Week</button>
      )}
    </div>
    {WEEKLY_READINGS.map((plan,i)=>{
      const isSelected = activePlanIdx!==null ? i===activePlanIdx : i===weekIdx;
      const isAutoCurrent = activePlanIdx===null && i===weekIdx;
      return (
        <button key={i} onClick={()=>setActivePlanIdx(i)} style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"12px 0",borderBottom:`1px solid ${C.border}`,background:"none",border:"none",borderBottomWidth:"1px",borderBottomStyle:"solid",borderBottomColor:C.border,cursor:"pointer",textAlign:"left"}}>
          <div style={{width:"7px",height:"7px",borderRadius:"50%",flexShrink:0,background:isSelected?A:`${A}30`}}/>
          <div style={{flex:1,...sr,fontSize:"13px",color:isSelected?C.cream:C.sand}}>{plan.week}</div>
          {isAutoCurrent&&<span style={{...sn,fontSize:"7px",color:A,letterSpacing:"1px",textTransform:"uppercase"}}>This Week</span>}
          {activePlanIdx===i&&<span style={{...sn,fontSize:"7px",color:A,letterSpacing:"1px",textTransform:"uppercase"}}>Selected</span>}
        </button>
      );
    })}
  </div>

  {/* Progress — last 30 days rule heatmap */}
  {(()=>{
    const days=Array.from({length:30},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-29+i); d.setHours(0,0,0,0);
      const key=d.toISOString().split("T")[0];
      const rule=ruleHistory[key]||ruleDone[d.toDateString()]||{};
      const count=["prayer","scripture","discipline","examine","body"].filter(k=>rule[k]).length;
      const read=readDates.includes(key);
      return {key,count,read,d};
    });
    const totalFull=days.filter(d=>d.count===5).length;
    const totalRead=days.filter(d=>d.read).length;
    return(
      <div style={{marginTop:"28px",borderTop:`1px solid ${C.border}`,paddingTop:"22px"}}>
        <Lbl color={C.dim}>Your Progress — Last 30 Days</Lbl>
        <div style={{display:"flex",gap:"3px",marginBottom:"10px",flexWrap:"wrap"}}>
          {days.map(({key,count,read})=>{
            const intensity=count===0?0:count<=2?0.2:count<=4?0.55:1;
            const bg=count===0?(read?`${A}18`:"#1A1A17"):`${A}`;
            return(
              <div key={key} title={`${key}: ${count}/5 rule, ${read?"read":"no read"}`}
                style={{width:"9px",height:"9px",borderRadius:"2px",
                  background:count===0?(read?`${A}22`:C.raised):A,
                  opacity:count===0?1:intensity,
                  border:`1px solid ${count===5?A:C.border}`,
                  flexShrink:0,transition:"all 0.2s"}}/>
            );
          })}
        </div>
        <div style={{display:"flex",gap:"4px",alignItems:"center",marginBottom:"16px"}}>
          <div style={{width:"9px",height:"9px",borderRadius:"2px",background:C.raised,border:`1px solid ${C.border}`}}/>
          <span style={{...sn,fontSize:"7px",color:C.dim}}>No activity</span>
          <div style={{width:"9px",height:"9px",borderRadius:"2px",background:`${A}22`,border:`1px solid ${C.border}`,marginLeft:"8px"}}/>
          <span style={{...sn,fontSize:"7px",color:C.dim}}>Read only</span>
          <div style={{width:"9px",height:"9px",borderRadius:"2px",background:A,opacity:0.55,border:`1px solid ${A}`,marginLeft:"8px"}}/>
          <span style={{...sn,fontSize:"7px",color:C.dim}}>Partial rule</span>
          <div style={{width:"9px",height:"9px",borderRadius:"2px",background:A,border:`1px solid ${A}`,marginLeft:"8px"}}/>
          <span style={{...sn,fontSize:"7px",color:C.dim}}>Full rule</span>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {[
            {label:"Full Rule Days",val:totalFull,icon:"✦",max:30},
            {label:"Reading Days",  val:totalRead, icon:"ᚱ",max:30},
            {label:"Reading Streak",val:readStreak,icon:"🔥",max:null},
            {label:"Prayers Logged",val:prayerLog.length,icon:"◉",max:null},
            {label:"Answered",      val:prayerLog.filter(p=>p.answered).length,icon:"☩",max:null},
          ].map(({label,val,icon,max})=>(
            <div key={label} style={{flex:"1 1 calc(33% - 8px)",minWidth:"80px",padding:"12px 10px",background:C.surface,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:"16px",color:A,marginBottom:"4px"}}>{icon}</div>
              <div style={{...sr,fontSize:"20px",color:C.cream,marginBottom:"2px"}}>{val}{max?<span style={{...sn,fontSize:"9px",color:C.dim}}>/{max}</span>:""}</div>
              <div style={{...sn,fontSize:"7px",color:C.dim,letterSpacing:"1px",textTransform:"uppercase",lineHeight:1.4}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  })()}

  {/* Monthly challenge — single card */}
  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"22px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
      <Lbl color={C.dim}>{cal.month} Challenge</Lbl>
      <div style={{display:"flex",gap:"5px"}}>
        {PILLARS.map((p,i)=>(
          <button key={p.key} onClick={()=>setPillarIdx(i)} style={{width:"8px",height:"8px",borderRadius:"50%",background:pillarIdx%4===i?A:`${A}30`,border:"none",cursor:"pointer",padding:0,transition:"all 0.2s"}}/>
        ))}
      </div>
    </div>
    <div style={{background:C.surface,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{height:"2px",background:`linear-gradient(90deg,${A},${A}40)`}}/>
      <div style={{padding:"18px 18px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"11px",marginBottom:"12px"}}>
          <div style={{width:"34px",height:"34px",borderRadius:"50%",border:`1px solid ${A}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",color:A,background:`${A}15`,flexShrink:0}}>{currentPillar.icon}</div>
          <div>
            <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:A}}>{currentPillar.label}</div>
            <div style={{...sn,fontSize:"8px",color:C.dim,marginTop:"2px"}}>{currentPillar.note}</div>
          </div>
        </div>
        <div style={{borderLeft:`2px solid ${A}40`,paddingLeft:"12px",marginBottom:"13px"}}>
          <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>{cal.verse}</div>
          <p style={{...sr,fontSize:"13px",fontStyle:"italic",lineHeight:1.78,margin:0,color:C.sand,opacity:0.88}}>"{cal.vText}"</p>
        </div>
        <p style={{fontSize:"13px",lineHeight:1.82,margin:"0 0 14px",color:C.sand,opacity:0.92}}>{cal.challenges[currentPillar.key]}</p>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>setChalDone(p=>({...p,[`${selMonth}-${currentPillar.key}`]:!p[`${selMonth}-${currentPillar.key}`]}))} style={{display:"flex",alignItems:"center",gap:"6px",background:challengeDone[`${selMonth}-${currentPillar.key}`]?`${A}20`:"transparent",border:`1px solid ${challengeDone[`${selMonth}-${currentPillar.key}`]?A:C.hi}`,color:challengeDone[`${selMonth}-${currentPillar.key}`]?A:C.dim,padding:"7px 13px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",transition:"all 0.3s"}}>
            <span>{challengeDone[`${selMonth}-${currentPillar.key}`]?"✓":"○"}</span>
            {challengeDone[`${selMonth}-${currentPillar.key}`]?"Complete":"Mark Complete"}
          </button>
          <button onClick={()=>setPillarIdx(i=>(i+1)%4)} style={{...sn,fontSize:"7px",color:C.dim,letterSpacing:"2px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,padding:"7px 13px",cursor:"pointer"}}>Next →</button>
        </div>
      </div>
    </div>
  </div>
</div>
)}

{/* YEAR VIEW */}
{tab==="way"&&yearView&&yearMonth===null&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setYearView(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← The Way</button>
  <Lbl color={C.dim}>The Church Year</Lbl>
  <div style={{display:"flex",gap:"2px",marginBottom:"14px"}}>
    {CAL.map((m,i)=>{const s=SEASONS[m.s];return <div key={i} onClick={()=>setYearMonth(i)} title={m.month} style={{flex:1,height:"5px",background:s.a,cursor:"pointer",opacity:0.65}}/>;  })}
  </div>
  <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"18px"}}>
    {Object.values(SEASONS).map((s,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 9px",border:`1px solid ${s.a}35`,background:`${s.a}10`}}>
        <span style={{fontSize:"11px",color:s.a}}>{s.icon}</span>
        <span style={{...sn,fontSize:"7px",color:s.a,letterSpacing:"1px",textTransform:"uppercase"}}>{s.label}</span>
      </div>
    ))}
  </div>
  {CAL.map((m,i)=>{
    const s=SEASONS[m.s];
    return(
      <button key={i} onClick={()=>setYearMonth(i)} style={{width:"100%",display:"flex",alignItems:"center",gap:"13px",padding:"13px 0",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left"}}>
        <div style={{width:"34px",height:"34px",borderRadius:"50%",border:`1px solid ${s.a}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",color:s.a,background:`${s.a}10`,flexShrink:0}}>{s.icon}</div>
        <div style={{flex:1}}>
          <div style={{...sr,fontSize:"14px",color:C.cream}}>{m.month}</div>
          <div style={{...sn,fontSize:"8px",color:s.a,letterSpacing:"1px",textTransform:"uppercase",marginTop:"2px"}}>{m.theme}</div>
        </div>
        <span style={{color:C.dim,fontSize:"16px"}}>›</span>
      </button>
    );
  })}
</div>
)}

{tab==="way"&&yearView&&yearMonth!==null&&(()=>{
  const m=CAL[yearMonth],s=SEASONS[m.s];
  return(
    <div style={{padding:"20px 18px 0"}}>
      <button onClick={()=>setYearMonth(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Year</button>
      <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px"}}>
        <div style={{width:"50px",height:"50px",borderRadius:"50%",border:`1px solid ${s.a}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",color:s.a,background:`${s.a}12`,flexShrink:0}}>{s.icon}</div>
        <div>
          <h2 style={{...sr,fontSize:"22px",fontWeight:"normal",margin:0,color:C.cream}}>{m.month}</h2>
          <div style={{...sn,fontSize:"7px",color:s.a,letterSpacing:"3px",textTransform:"uppercase",marginTop:"3px"}}>{s.label} · {m.theme}</div>
        </div>
      </div>
      <div style={{borderLeft:`2px solid ${s.a}50`,paddingLeft:"14px",marginBottom:"22px"}}>
        <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:s.a,marginBottom:"6px"}}>{m.verse}</div>
        <p style={{...sr,fontSize:"15px",fontStyle:"italic",lineHeight:1.9,margin:0,color:C.cream,opacity:0.95}}>"{m.vText}"</p>
      </div>
      <Lbl color={C.dim}>Challenges</Lbl>
      {PILLARS.map(p=>(
        <div key={p.key} style={{padding:"13px 0",borderBottom:`1px solid ${C.border}`,display:"flex",gap:"12px"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",border:`1px solid ${s.a}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:s.a,flexShrink:0,marginTop:"2px"}}>{p.icon}</div>
          <div>
            <div style={{...sn,fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase",color:s.a,marginBottom:"4px"}}>{p.label}</div>
            <div style={{fontSize:"13px",color:C.sand,opacity:0.82,lineHeight:1.7}}>{m.challenges[p.key]}</div>
          </div>
        </div>
      ))}
      <div style={{marginTop:"14px",padding:"11px 14px",background:C.surface,border:`1px solid ${C.border}`}}>
        <div style={{...sn,fontSize:"8px",color:C.dim,lineHeight:1.6}}>{s.sub}</div>
      </div>
    </div>
  );
})()}

{/* ══ PRAYER TAB ════════════════════════════════════════════ */}
{tab==="prayer"&&(
<div style={{padding:"20px 18px 0"}}>

  {/* Sub-nav */}
  <div style={{display:"flex",gap:"4px",marginBottom:"20px"}}>
    {[["log","✦","Prayers"],["promises","◉","Promises"]].map(([id,ic,lb])=>(
      <button key={id} onClick={()=>setPrayerTab(id)} style={{flex:1,padding:"9px 4px",background:prayerTab===id?`${A}18`:"transparent",border:`1px solid ${prayerTab===id?A:C.border}`,color:prayerTab===id?A:C.dim,...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",transition:"all 0.2s"}}>
        <span style={{fontSize:"13px"}}>{ic}</span>{lb}
      </button>
    ))}
  </div>

  {prayerTab==="promises"&&(
    <div>
      <div style={{marginBottom:"18px"}}>
        <div style={{...sn,fontSize:"7px",letterSpacing:"5px",textTransform:"uppercase",color:A,marginBottom:"6px"}}>◉  The Promises of God</div>
        <p style={{...sr,fontSize:"13px",color:C.sand,lineHeight:1.85,margin:"0 0 14px",opacity:0.82}}>These are not suggestions. They are covenantal declarations from a God who cannot lie. Hold them when the ground moves.</p>
        <div style={{borderLeft:`2px solid ${A}50`,paddingLeft:"13px",marginBottom:"4px"}}>
          <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>2 Corinthians 1:20</div>
          <p style={{...sr,fontSize:"14px",fontStyle:"italic",lineHeight:1.88,color:C.cream,margin:0,opacity:0.95}}>"For no matter how many promises God has made, they are Yes in Christ. And so through him the Amen is spoken by us to the glory of God."</p>
        </div>
      </div>
      {PROMISES.map((cat,ci)=>(
        <div key={ci} style={{marginBottom:"6px"}}>
          <button onClick={()=>setOpenCat(openCat===ci?null:ci)} style={{width:"100%",display:"flex",alignItems:"center",gap:"13px",padding:"14px 16px",background:openCat===ci?`${A}12`:C.surface,border:`1px solid ${openCat===ci?A:C.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
            <div style={{width:"34px",height:"34px",borderRadius:"50%",border:`1px solid ${openCat===ci?A:C.hi}`,background:openCat===ci?`${A}20`:C.raised,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",color:openCat===ci?A:C.hi,flexShrink:0,transition:"all 0.2s"}}>{cat.icon}</div>
            <div style={{flex:1}}>
              <div style={{...sr,fontSize:"14px",color:openCat===ci?C.cream:C.sand}}>{cat.category}</div>
              <div style={{...sn,fontSize:"8px",color:C.dim,marginTop:"2px"}}>{cat.verses.length} promises</div>
            </div>
            <span style={{...sn,fontSize:"11px",color:openCat===ci?A:C.dim,transition:"all 0.2s"}}>{openCat===ci?"▲":"▼"}</span>
          </button>
          {openCat===ci&&(
            <div style={{border:`1px solid ${A}25`,borderTop:"none",background:C.raised}}>
              {cat.verses.map((v,vi)=>(
                <div key={vi} style={{padding:"16px 18px",borderBottom:vi<cat.verses.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"8px"}}>{v.ref}</div>
                  <p style={{...sr,fontSize:"14px",lineHeight:1.9,color:C.cream,margin:0,fontStyle:"italic",opacity:0.95}}>"{v.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {prayerTab==="log"&&(<div>

  {/* Today's prayer */}
  {todayPrayer&&(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:"20px"}}>
      <div style={{height:"2px",background:`linear-gradient(90deg,${A},${A}40)`}}/>
      <div style={{padding:"20px 20px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"5px"}}>
          <div style={{...sn,fontSize:"7px",letterSpacing:"5px",textTransform:"uppercase",color:A}}>✦  Your Prayer</div>
          <SpeakButton text={todayPrayer.text} A={A}/>
        </div>
        <h3 style={{...sr,fontSize:"18px",fontWeight:"normal",color:C.cream,margin:"0 0 4px"}}>{todayPrayer.title}</h3>
        <div style={{...sn,fontSize:"8px",color:`${C.gold}65`,letterSpacing:"1px",marginBottom:"18px"}}>{todayPrayer.src}</div>
        <div style={{borderLeft:`2px solid ${A}45`,paddingLeft:"16px"}}>
          <p style={{...sr,fontSize:"14px",lineHeight:2.0,color:C.sand,margin:0,fontStyle:"italic",whiteSpace:"pre-line"}}>{todayPrayer.text}</p>
        </div>
      </div>
    </div>
  )}

  {/* Impossible prayers — pinned */}
  {prayerLog.some(p=>p.impossible&&!p.answered)&&(
    <div style={{marginBottom:"18px"}}>
      <div style={{background:C.surface,border:`1px solid ${A}30`,overflow:"hidden",marginBottom:"14px"}}>
        <div style={{height:"2px",background:`linear-gradient(90deg,${A},${A}40)`}}/>
        <div style={{padding:"18px 18px 16px"}}>
          <div style={{...sn,fontSize:"7px",letterSpacing:"5px",textTransform:"uppercase",color:A,marginBottom:"10px"}}>✠  The Impossible List</div>
          <p style={{...sr,fontSize:"13px",color:C.sand,lineHeight:1.85,margin:"0 0 13px",opacity:0.88}}>These are the prayers you have stopped praying. The prodigal who will not come home. The broken marriage. The door that will not open. The man who will never change.</p>
          <p style={{...sr,fontSize:"13px",color:C.sand,lineHeight:1.85,margin:"0 0 16px",opacity:0.88}}>This list exists because the men of Scripture did not pray for the probable. They prayed for the impossible — and they named it, and they left it with God, and they did not take it back.</p>
          <div style={{borderLeft:`2px solid ${A}50`,paddingLeft:"13px",marginBottom:"13px"}}>
            <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:A,marginBottom:"5px"}}>Ephesians 3:19–20</div>
            <p style={{...sr,fontSize:"14px",fontStyle:"italic",lineHeight:1.9,color:C.cream,margin:0,opacity:0.95}}>"To know this love that surpasses knowledge — that you may be filled to the measure of all the fullness of God. Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us."</p>
          </div>
          <div style={{borderLeft:`2px solid ${A}35`,paddingLeft:"13px"}}>
            <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:`${A}80`,marginBottom:"5px"}}>Jeremiah 32:17</div>
            <p style={{...sr,fontSize:"13px",fontStyle:"italic",lineHeight:1.8,color:C.sand,margin:0,opacity:0.75}}>"Nothing is too hard for you."</p>
          </div>
        </div>
      </div>
      {prayerLog.filter(p=>p.impossible&&!p.answered).map(p=>(
        <div key={p.id} style={{background:C.raised,border:`1px solid ${A}25`,padding:"15px 18px",marginBottom:"6px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,width:"3px",height:"100%",background:A}}/>
          <div style={{paddingLeft:"11px"}}>
            <p style={{...sr,fontSize:"14px",lineHeight:1.8,color:C.cream,margin:"0 0 7px",fontStyle:"italic"}}>{p.text}</p>
            <div style={{...sn,fontSize:"8px",color:C.dim,marginBottom:"10px"}}>{p.date}</div>
            <button onClick={()=>markAnswered(p.id)} style={{background:`${A}18`,border:`1px solid ${A}50`,color:A,padding:"6px 14px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase"}}>✦ God Answered This</button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Add */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
    <Lbl color={C.dim}>Prayer Log</Lbl>
    <div style={{display:"flex",gap:"5px"}}>
      <button onClick={()=>{setShowAddP(true);setNewImpMode(false);}} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:`${A}14`,border:`1px solid ${A}40`,color:A,padding:"4px 10px",cursor:"pointer"}}>+ Prayer</button>
      <button onClick={()=>{setShowAddP(true);setNewImpMode(true);}} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"4px 10px",cursor:"pointer"}}>+ Impossible</button>
    </div>
  </div>

  {showAddP&&(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"14px",marginBottom:"14px"}}>
      {newImpMode&&<div style={{...sn,fontSize:"7px",color:A,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"8px"}}>✠ Impossible Request</div>}
      <textarea value={newPrayer} onChange={e=>setNewPrayer(e.target.value)} placeholder={newImpMode?"Write the impossible thing you're bringing to God...":"What are you praying for?"} rows={3} style={{width:"100%",background:C.raised,border:`1px solid ${C.border}`,padding:"9px 11px",color:C.cream,fontSize:"14px",...sr,outline:"none",boxSizing:"border-box",resize:"none",lineHeight:1.7,marginBottom:"7px"}}/>
      {!newImpMode&&<input value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Notes, Scripture..." style={{width:"100%",background:C.raised,border:`1px solid ${C.border}`,padding:"9px 11px",color:C.sand,fontSize:"13px",...sr,outline:"none",boxSizing:"border-box",marginBottom:"9px"}}/>}
      <div style={{display:"flex",gap:"7px"}}>
        <button onClick={()=>{if(newPrayer.trim()){setPrayerLog(p=>[{id:Date.now(),text:newPrayer.trim(),note:newNote.trim(),date:new Date().toLocaleDateString(),answered:false,impossible:newImpMode},...p]);setNewPrayer("");setNewNote("");setShowAddP(false);}}} style={{background:`${A}18`,border:`1px solid ${A}50`,color:A,padding:"8px 16px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>{newImpMode?"Leave It with God":"Add to Log"}</button>
        <button onClick={()=>setShowAddP(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"8px 13px",cursor:"pointer",...sn,fontSize:"7px",textTransform:"uppercase"}}>Cancel</button>
      </div>
    </div>
  )}

  {prayerLog.filter(p=>!p.impossible).length===0&&!prayerLog.some(p=>p.impossible&&!p.answered)&&(
    <div style={{textAlign:"center",padding:"30px",border:`1px solid ${C.border}`,color:C.dim,fontSize:"13px",lineHeight:1.7}}>No prayers logged yet.<br/>Tap + Prayer above to begin.</div>
  )}

  {prayerLog.filter(p=>!p.impossible).map(p=>(
    <div key={p.id} style={{background:p.answered?C.surface:C.raised,border:`1px solid ${p.answered?C.border:C.hi}`,padding:"14px 16px",marginBottom:"6px",opacity:p.answered?0.5:1}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:"11px"}}>
        <div style={{width:"9px",height:"9px",borderRadius:"50%",background:p.answered?A:`${A}40`,flexShrink:0,marginTop:"5px",border:`1px solid ${A}50`}}/>
        <div style={{flex:1}}>
          <div style={{...sr,fontSize:"13px",color:p.answered?C.dim:C.cream,marginBottom:"3px",textDecoration:p.answered?"line-through":"none"}}>{p.text}</div>
          {p.note&&<div style={{fontSize:"12px",color:C.dim,lineHeight:1.55,marginBottom:"4px"}}>{p.note}</div>}
          <div style={{...sn,fontSize:"8px",color:C.dim}}>{p.date}{p.answered&&` · Answered ${p.answeredOn}`}</div>
        </div>
      </div>
      {!p.answered&&<button onClick={()=>markAnswered(p.id)} style={{marginTop:"10px",background:"transparent",border:`1px solid ${A}35`,color:A,padding:"5px 13px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase"}}>✓ Mark Answered</button>}
    </div>
  ))}

  {prayerLog.filter(p=>p.impossible&&p.answered).map(p=>(
    <div key={p.id} style={{padding:"10px 14px",marginBottom:"5px",opacity:0.35,borderBottom:`1px solid ${C.border}`}}>
      <div style={{...sn,fontSize:"7px",color:A,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"3px"}}>✠ Answered — {p.answeredOn}</div>
      <p style={{...sr,fontSize:"13px",color:C.dim,margin:0,fontStyle:"italic",textDecoration:"line-through"}}>{p.text}</p>
    </div>
  ))}
  </div>)}
</div>
)}


{tab==="brothers"&&<BrothersTab A={A}/>}

      </main>
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${A}55,transparent)`,zIndex:10}}/>
    </div>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────
