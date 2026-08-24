"use client";
import { useState, useEffect } from "react";
import { C, sr, sn, SEASONS } from "@/lib/theme";
import { LOGO_IMG } from "@/lib/images";
import { LS, usePersist, getStreak } from "@/lib/storage";
import { useLocalReminders } from "@/lib/notifications";
import { NAV, PILLARS } from "@/data/nav";
import { CAL, WEEKLY_READINGS, LONG_STUDIES, currentWeekIdx } from "@/data/studyPlans";
import { EXAMEN_PROMPTS, CONFESS_PROMPTS, DEFAULT_CKQ } from "@/data/examen";
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
  const [bManage,   setBManage]   = useState(false);
  const [bView,     setBView]     = useState("list");
  const [editB,     setEditB]     = useState(null);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgText,   setMsgText]   = useState("");
  const [checkinMsg,setCheckinMsg]= useState("");
  const [newName,   setNewName]   = useState("");
  const [newPhone,  setNewPhone]  = useState("");
  const [newEmail,  setNewEmail]  = useState("");
  const [editQs,    setEditQs]    = useState(false);
  const [draftQs,   setDraftQs]   = useState([]);
  const [reachView, setReachView] = useState(null);
  const [reachTarget,setReachTarget]=useState(null);
  const [reachMsg,  setReachMsg]  = useState("");
  const [pView,     setPView]     = useState("list");
  const [editP,     setEditP]     = useState(null);
  const [pTarget,   setPTarget]   = useState(null);
  const [pMsg,      setPMsg]      = useState("");
  const [newPN,     setNewPN]     = useState("");
  const [newPR,     setNewPR]     = useState("");
  const [newPPh,    setNewPPh]    = useState("");
  const [newPEm,    setNewPEm]    = useState("");
  const [showAddP,  setShowAddP]  = useState(false);
  const [prayerTab, setPrayerTab] = useState("log");   // log | promises
  const [openCat,   setOpenCat]   = useState(null);
  const [newPrayer, setNewPrayer] = useState("");
  const [newNote,   setNewNote]   = useState("");
  const [newImpMode,setNewImpMode]= useState(false);
  const [todayPrayer,setTodayPrayer]=useState(null);
  const [redSent,   setRedSent]   = useState(false);
  const [showCellInput,setShowCellInput]=useState(false);
  const [cellDraft,setCellDraft]=useState("");

  // Persisted
  const [ruleDone,    setRuleDone]    = usePersist("ruleDone",{});
  const [dayChecked,  setDayChecked]  = usePersist("dayChecked",{});
  const [readDates,   setReadDates]   = usePersist("readDates",[]);
  const [verseChecked,setVerseChecked]= usePersist("verseChecked",{});
  const [challengeDone,setChalDone]   = usePersist("chalDone",{});
  const [prayerLog,   setPrayerLog]   = usePersist("prayerLog",[]);
  const [brothers,    setBrothers]    = usePersist("brothers",[
    {id:1,name:"Thomas W.",phone:"",email:"",checkedIn:false,lastCheckin:"Never",hist:[]},
    {id:2,name:"David M.", phone:"",email:"",checkedIn:false,lastCheckin:"Never",hist:[]},
  ]);
  const [checkinQs,   setCheckinQs]   = usePersist("checkinQs",DEFAULT_CKQ);
  const [journal,     setJournal]     = usePersist("journal","");
  const [journalEntries,setJournalEntries] = usePersist("journalEntries",[]);
  const [pastors,     setPastors]     = usePersist("pastors",[{id:1,name:"Your Pastor",role:"Senior Pastor",phone:"",email:""}]);
  const [selMonth,    setSelMonth]    = usePersist("selMonth",cm);
  const [cellPosts,   setCellPosts]   = usePersist("cellPosts",[]);
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
    const lastReset=LS.get("lastReset","");
    const mon=new Date();mon.setDate(mon.getDate()-mon.getDay()+1);mon.setHours(0,0,0,0);
    const key=mon.toDateString();
    if(lastReset!==key){
      setBrothers(prev=>prev.map(b=>({...b,checkedIn:false,lastCheckin:b.checkedIn?"Last week":b.lastCheckin})));
      LS.set("lastReset",key);
    }
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
  const checkedIn=brothers.filter(b=>b.checkedIn).length;
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
  const doCheckin=id=>{
    const ts=today.toISOString().split("T")[0];
    setBrothers(p=>p.map(b=>b.id===id?{...b,checkedIn:true,lastCheckin:"Today",hist:[...(b.hist||[]),ts]}:b));
  };
  const markAnswered=id=>{
    setPrayerLog(p=>p.map(x=>x.id===id?{...x,answered:true,answeredOn:new Date().toLocaleDateString()}:x));
    setShowGold(true);setTimeout(()=>setShowGold(false),4000);
  };
  const addCellPost=(text,type="word")=>{
    setCellPosts(p=>[{id:Date.now(),author:LS.get("myName","Me"),text,type,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString(),marks:{cross:0,flame:0},myMark:null},...p].slice(0,50));
  };
  const markCellPost=(id,mark)=>{
    setCellPosts(p=>p.map(post=>{
      if(post.id!==id) return post;
      const hadMark=post.myMark===mark;
      return {...post,marks:{...post.marks,[mark]:Math.max(0,(post.marks[mark]||0)+(hadMark?-1:1))},myMark:hadMark?null:mark};
    }));
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
            <button key={id} onClick={()=>{setTab(id);setReachView(null);setBView("list");setYearView(false);setYearMonth(null);}} style={{flex:1,padding:"11px 2px 9px",background:"none",border:"none",cursor:"pointer",color:iconColor,...sn,fontSize:"6px",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`2px solid ${tab===id?A:"transparent"}`,transition:"all 0.25s",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
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


{/* ══ BROTHERS TAB ══════════════════════════════════════════ */}
{tab==="brothers"&&!reachView&&bView==="list"&&(
<div style={{padding:"20px 18px 0"}}>

  {/* Red Button — one tap prayer flare */}
  <div style={{marginBottom:"18px"}}>
    {!redSent?(
      <button onClick={()=>{
        setRedSent(true);
        addCellPost("🚨 I need prayer right now. Please pray for me.","urgent");
        setTimeout(()=>setRedSent(false),10000);
      }} style={{width:"100%",padding:"14px",background:`${C.red}18`,border:`1px solid ${C.red}60`,color:"#E8AAAA",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"5px",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
        <span style={{fontSize:"16px"}}>✠</span>I Need Prayer Right Now
      </button>
    ):(
      <div style={{width:"100%",padding:"14px",background:`${C.green}12`,border:`1px solid ${C.green}40`,textAlign:"center",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",color:C.green,boxSizing:"border-box"}}>
        ✦ Sent — Your brothers are praying.
      </div>
    )}
  </div>

  {/* Brotherhood health */}
  <div style={{padding:"14px 16px",background:C.surface,border:`1px solid ${checkedIn===brothers.length&&brothers.length>0?C.green:C.gold}40`,marginBottom:"18px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"8px"}}>
      <span style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:C.dim}}>⚔ Weekly Health</span>
      <span style={{...sr,fontSize:"20px",color:checkedIn===brothers.length&&brothers.length>0?C.green:C.gold}}>
        {brothers.length?Math.round((checkedIn/brothers.length)*100):0}%
      </span>
    </div>
    <div style={{height:"3px",background:C.border,marginBottom:"7px"}}>
      <div style={{height:"100%",width:brothers.length?`${(checkedIn/brothers.length)*100}%`:"0%",background:checkedIn===brothers.length&&brothers.length>0?C.green:C.gold,transition:"width 0.6s"}}/>
    </div>
    <div style={{...sn,fontSize:"8px",color:C.dim}}>
      {checkedIn} of {brothers.length} checked in this week
      {checkedIn===brothers.length&&brothers.length>0&&<span style={{color:C.green,marginLeft:"8px"}}>✦ Full cohort</span>}
    </div>
  </div>

  {/* Cell feed */}
  <div style={{marginBottom:"20px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
      <Lbl color={C.dim}>The Cell</Lbl>
      <button onClick={()=>setShowCellInput(s=>!s)} style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",background:`${A}14`,border:`1px solid ${A}40`,color:A,padding:"4px 11px",cursor:"pointer"}}>+ Leave a Word</button>
    </div>
    {showCellInput&&(
      <div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"13px",marginBottom:"11px"}}>
        <textarea value={cellDraft} onChange={e=>setCellDraft(e.target.value)} placeholder="A verse, a weight, a prayer — one word for your brothers..." rows={3} style={{width:"100%",background:C.raised,border:`1px solid ${C.border}`,padding:"10px 12px",color:C.cream,fontSize:"14px",...sr,outline:"none",boxSizing:"border-box",resize:"none",lineHeight:1.75,marginBottom:"9px"}}/>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>{if(cellDraft.trim()){addCellPost(cellDraft.trim());setCellDraft("");setShowCellInput(false);}}} style={{flex:1,background:`${A}18`,border:`1px solid ${A}50`,color:A,padding:"9px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>Leave It</button>
          <button onClick={()=>{setShowCellInput(false);setCellDraft("");}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"9px 13px",cursor:"pointer",...sn,fontSize:"7px",textTransform:"uppercase"}}>Cancel</button>
        </div>
      </div>
    )}
    {cellPosts.length===0&&(
      <div style={{padding:"16px",border:`1px solid ${C.border}`,background:C.surface,textAlign:"center"}}>
        <p style={{...sn,fontSize:"8px",color:C.dim,letterSpacing:"2px",textTransform:"uppercase",margin:0,lineHeight:1.8}}>Leave a verse, a weight, or a prayer.<br/>Your brothers will see it here.</p>
      </div>
    )}
    {cellPosts.map(post=>(
      <div key={post.id} style={{background:post.type==="urgent"?`${C.red}10`:C.surface,border:`1px solid ${post.type==="urgent"?C.red+"40":C.border}`,padding:"14px 16px",marginBottom:"6px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{...sn,fontSize:"8px",color:post.type==="urgent"?"#E8AAAA":A,letterSpacing:"2px"}}>{post.author}</div>
          <div style={{...sn,fontSize:"8px",color:C.dim}}>{post.date} · {post.time}</div>
        </div>
        <p style={{...sr,fontSize:"14px",color:post.type==="urgent"?"#F2D8D8":C.cream,margin:"0 0 12px",lineHeight:1.75,fontStyle:post.type==="urgent"?"italic":"normal"}}>{post.text}</p>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>markCellPost(post.id,"cross")} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 11px",background:post.myMark==="cross"?`${A}20`:"transparent",border:`1px solid ${post.myMark==="cross"?A:C.border}`,color:post.myMark==="cross"?A:C.dim,cursor:"pointer",...sn,fontSize:"10px",transition:"all 0.2s"}}>
            ✠ {post.marks?.cross||0}
          </button>
          <button onClick={()=>markCellPost(post.id,"flame")} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 11px",background:post.myMark==="flame"?`${C.red}15`:"transparent",border:`1px solid ${post.myMark==="flame"?C.red+"60":C.border}`,color:post.myMark==="flame"?"#E8AAAA":C.dim,cursor:"pointer",...sn,fontSize:"10px",transition:"all 0.2s"}}>
            🔥 {post.marks?.flame||0}
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Brothers list */}
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"5px"}}>
    <Lbl color={C.dim}>⚔  Brothers</Lbl>
    <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
      <button onClick={()=>setBManage(m=>!m)} style={{background:"none",border:`1px solid ${C.border}`,cursor:"pointer",color:bManage?A:C.dim,padding:"4px 8px",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase"}}>{bManage?"Done":"Manage"}</button>
      <button onClick={()=>{setNewName("");setNewPhone("");setNewEmail("");setEditB(null);setBView("edit");}} style={{background:`${A}14`,border:`1px solid ${A}40`,color:A,padding:"4px 11px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>+ Add</button>
    </div>
  </div>
  <div style={{height:"1px",background:"rgba(200,168,107,0.09)",marginBottom:"4px"}}/>
  {brothers.map((b,i)=>{
    const bStreak=getStreak(b.hist||[]);
    return(
      <div key={b.id}>
        <div style={{display:"flex",alignItems:"center",gap:"13px",padding:"14px 0"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:"46px",height:"46px",borderRadius:"50%",border:`2px solid ${b.checkedIn?A:A+"25"}`,display:"flex",alignItems:"center",justifyContent:"center",...sr,fontSize:"16px",color:b.checkedIn?A:`${A}60`,background:b.checkedIn?`${A}15`:C.surface,transition:"all 0.3s"}}>{b.name[0].toUpperCase()}</div>
            {bStreak>=4&&<div style={{position:"absolute",top:"-3px",right:"-3px",fontSize:"10px"}}>🔥</div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
              <div style={{...sr,fontSize:"15px",color:C.cream}}>{b.name}</div>
              {bStreak>0&&<span style={{...sn,fontSize:"7px",color:A,letterSpacing:"1px"}}>{bStreak}w</span>}
            </div>
            <div style={{...sn,fontSize:"8px",color:b.checkedIn?A:C.dim,letterSpacing:"1px"}}>{b.checkedIn?"✓  Checked in this week":`Last: ${b.lastCheckin}`}</div>
          </div>
          <div style={{display:"flex",gap:"5px",flexShrink:0}}>
            <button onClick={()=>{setMsgTarget(b);setCheckinMsg("Checking in, brother. How are you holding up this week?");setBView("checkin");}} style={{background:b.checkedIn?`${A}18`:"transparent",border:`1px solid ${b.checkedIn?A:C.hi}`,color:b.checkedIn?A:C.dim,padding:"6px 10px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"1px",textTransform:"uppercase",transition:"all 0.2s"}}>{b.checkedIn?"✓":"Check In"}</button>
            <button onClick={()=>{setMsgTarget(b);setMsgText("");setBView("message");}} style={{background:"transparent",border:`1px solid ${C.hi}`,color:C.dim,padding:"6px 10px",cursor:"pointer",fontSize:"13px"}}>✉</button>
            {bManage&&<button onClick={()=>{setEditB(b);setNewName(b.name);setNewPhone(b.phone||"");setNewEmail(b.email||"");setBView("edit");}} style={{background:"transparent",border:`1px solid ${C.border}`,color:`${C.dim}60`,padding:"6px 9px",cursor:"pointer",fontSize:"11px"}}>✏</button>}
          </div>
        </div>
        {i<brothers.length-1&&<div style={{height:"1px",background:"rgba(200,168,107,0.09)"}}/>}
      </div>
    );
  })}
  {brothers.length===0&&<div style={{textAlign:"center",padding:"24px",color:C.dim,fontSize:"13px",lineHeight:1.7}}>No brothers added yet. Tap + Add above.</div>}

  {/* Check-in questions */}
  <div style={{marginTop:"22px",borderTop:`1px solid ${C.border}`,paddingTop:"18px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
      <Lbl color={C.dim}>Check-In Questions</Lbl>
      <button onClick={()=>{setDraftQs([...checkinQs]);setEditQs(true);}} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"4px 10px",cursor:"pointer"}}>Edit</button>
    </div>
    {editQs?(
      <div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"14px"}}>
        {draftQs.map((q,i)=>(
          <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"8px"}}>
            <span style={{...sn,fontSize:"9px",color:A,minWidth:"16px",marginTop:"10px"}}>{i+1}</span>
            <textarea value={q} onChange={e=>{const nq=[...draftQs];nq[i]=e.target.value;setDraftQs(nq);}} rows={2} style={{flex:1,background:C.raised,border:`1px solid ${C.hi}`,padding:"8px 10px",color:C.sand,fontSize:"12px",...sr,outline:"none",boxSizing:"border-box",resize:"none",lineHeight:1.6}}/>
            <button onClick={()=>setDraftQs(draftQs.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:`${C.dim}60`,cursor:"pointer",fontSize:"16px",marginTop:"7px",flexShrink:0}}>×</button>
          </div>
        ))}
        <button onClick={()=>setDraftQs([...draftQs,""])} style={{...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"5px 10px",cursor:"pointer",marginBottom:"12px",marginRight:"8px"}}>+ Add</button>
        <div style={{display:"flex",gap:"7px"}}>
          <button onClick={()=>{setCheckinQs(draftQs.filter(q=>q.trim()));setEditQs(false);}} style={{flex:1,background:`${A}18`,border:`1px solid ${A}50`,color:A,padding:"9px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>Save</button>
          <button onClick={()=>setEditQs(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"9px 13px",cursor:"pointer",...sn,fontSize:"7px",textTransform:"uppercase"}}>Cancel</button>
        </div>
      </div>
    ):(
      checkinQs.map((q,i)=>(
        <div key={i} style={{display:"flex",gap:"11px",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
          <span style={{color:A,...sn,fontSize:"9px",minWidth:"13px"}}>{i+1}</span>
          <span style={{fontSize:"12px",color:C.sand,opacity:0.7,lineHeight:1.65}}>{q}</span>
        </div>
      ))
    )}
  </div>

  {/* Reach out */}
  <div style={{marginTop:"22px",borderTop:`1px solid ${C.border}`,paddingTop:"18px",marginBottom:"6px"}}>
    <Lbl color={C.dim}>✠  Confession & Reach Out</Lbl>
    <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 14px",opacity:0.8}}>Confession happens to someone. Don't carry it alone.</p>
    <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
      <button onClick={()=>setReachView("brother")} style={{width:"100%",background:`${A}14`,border:`1px solid ${A}55`,color:A,padding:"13px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase"}}>⚔  Reach Out to a Brother</button>
      <button onClick={()=>{setReachView("pastor");setPView("list");}} style={{width:"100%",background:"transparent",border:`1px solid ${C.hi}`,color:C.dim,padding:"12px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase"}}>✦  Reach Out to a Pastor</button>
    </div>
    <div style={{marginTop:"18px"}}>
      <Lbl color={C.dim} mb="9px">Examination of Conscience</Lbl>
      {CONFESS_PROMPTS.map((p,i)=>(
        <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"13px",color:C.sand,opacity:0.6,lineHeight:1.65}}>{p}</div>
      ))}
    </div>
  </div>
</div>
)}

{/* BROTHER EDIT/ADD */}
{tab==="brothers"&&!reachView&&bView==="edit"&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setBView("list")} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <h2 style={{...sr,fontSize:"18px",fontWeight:"normal",margin:"0 0 18px",color:C.cream}}>{editB?"Edit Brother":"Add a Brother"}</h2>
  {[{label:"Name *",val:newName,set:setNewName,ph:"John Smith",type:"text"},{label:"Phone",val:newPhone,set:setNewPhone,ph:"+1 (555) 000-0000",type:"tel"},{label:"Email",val:newEmail,set:setNewEmail,ph:"john@example.com",type:"email"}].map(({label,val,set,ph,type})=>(
    <div key={label} style={{marginBottom:"14px"}}>
      <Lbl color={C.dim}>{label}</Lbl>
      <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",background:C.surface,border:`1px solid ${C.hi}`,padding:"10px 12px",color:C.cream,fontSize:"14px",...sr,outline:"none",boxSizing:"border-box"}}/>
    </div>
  ))}
  <div style={{display:"flex",gap:"7px",marginTop:"5px"}}>
    <button onClick={()=>{if(!newName.trim())return;if(!editB){setBrothers(p=>[...p,{id:Date.now(),name:newName.trim(),phone:newPhone.trim(),email:newEmail.trim(),checkedIn:false,lastCheckin:"Never",hist:[]}]);}else{setBrothers(p=>p.map(b=>b.id===editB.id?{...b,name:newName.trim(),phone:newPhone.trim(),email:newEmail.trim()}:b));}setBView("list");setEditB(null);}} style={{flex:1,background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"11px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase"}}>{editB?"Save":"Add Brother"}</button>
    {editB&&<button onClick={()=>{setBrothers(p=>p.filter(b=>b.id!==editB.id));setBView("list");setEditB(null);}} style={{background:"transparent",border:"1px solid #8A3A3A",color:"#C87A7A",padding:"11px 14px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase"}}>Remove</button>}
  </div>
</div>
)}

{/* CHECK-IN */}
{tab==="brothers"&&!reachView&&bView==="checkin"&&msgTarget&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setBView("list")} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <div style={{display:"flex",alignItems:"center",gap:"13px",padding:"15px 16px",background:C.surface,border:`1px solid ${C.border}`,marginBottom:"18px"}}>
    <div style={{width:"46px",height:"46px",borderRadius:"50%",border:`1px solid ${A}50`,display:"flex",alignItems:"center",justifyContent:"center",...sr,fontSize:"17px",color:A,background:`${A}14`,flexShrink:0}}>{msgTarget.name[0].toUpperCase()}</div>
    <div style={{...sr,fontSize:"16px",color:C.cream}}>{msgTarget.name}</div>
  </div>
  <Lbl color={C.dim}>Message</Lbl>
  <textarea value={checkinMsg} onChange={e=>setCheckinMsg(e.target.value)} style={{width:"100%",minHeight:"90px",background:C.surface,border:`1px solid ${C.border}`,padding:"13px",color:C.sand,fontSize:"13px",lineHeight:1.75,...sr,resize:"vertical",outline:"none",boxSizing:"border-box",marginBottom:"10px"}}/>
  <Lbl color={C.dim} mb="7px">Questions Included</Lbl>
  {checkinQs.map((q,i)=><div key={i} style={{...sn,fontSize:"8px",color:C.dim,padding:"4px 0",borderBottom:`1px solid ${C.border}`,opacity:0.65}}>{i+1}. {q}</div>)}
  <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"14px"}}>
    {(msgTarget.phone||msgTarget.email)&&(
      <div style={{padding:"12px 14px",background:`${A}10`,border:`1px solid ${A}40`,marginBottom:"4px"}}>
        <div style={{...sn,fontSize:"7px",color:A,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"8px"}}>Quick Send</div>
        <div style={{display:"flex",gap:"7px"}}>
          {msgTarget.phone&&<a href={`sms:${msgTarget.phone}?body=${encodeURIComponent(checkinMsg+"\n\n"+checkinQs.map((q,i)=>`${i+1}. ${q}`).join("\n"))}`} onClick={()=>{doCheckin(msgTarget.id);setTimeout(()=>setBView("list"),300);}} style={{flex:1,display:"block",textAlign:"center",background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",textDecoration:"none"}}>💬 SMS</a>}
          {msgTarget.email&&<a href={`mailto:${msgTarget.email}?subject=Chambers Check-In&body=${encodeURIComponent(checkinMsg+"\n\n"+checkinQs.map((q,i)=>`${i+1}. ${q}`).join("\n"))}`} onClick={()=>{doCheckin(msgTarget.id);setTimeout(()=>setBView("list"),300);}} style={{flex:1,display:"block",textAlign:"center",background:"transparent",border:`1px solid ${A}40`,color:A,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",textDecoration:"none"}}>✉ Email</a>}
        </div>
      </div>
    )}
    <button onClick={()=>{doCheckin(msgTarget.id);setBView("list");}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"11px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase"}}>Mark Checked In (No Message)</button>
  </div>
</div>
)}

{/* MESSAGE */}
{tab==="brothers"&&!reachView&&bView==="message"&&msgTarget&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setBView("list")} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <div style={{display:"flex",alignItems:"center",gap:"13px",padding:"15px 16px",background:C.surface,border:`1px solid ${C.border}`,marginBottom:"18px"}}>
    <div style={{width:"46px",height:"46px",borderRadius:"50%",border:`1px solid ${A}50`,display:"flex",alignItems:"center",justifyContent:"center",...sr,fontSize:"17px",color:A,background:`${A}14`,flexShrink:0}}>{msgTarget.name[0].toUpperCase()}</div>
    <div style={{...sr,fontSize:"16px",color:C.cream}}>{msgTarget.name}</div>
  </div>
  <Lbl color={C.dim}>Message</Lbl>
  <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Hey brother..." style={{width:"100%",minHeight:"130px",background:C.surface,border:`1px solid ${C.border}`,padding:"13px",color:C.sand,fontSize:"13px",lineHeight:1.75,...sr,resize:"vertical",outline:"none",boxSizing:"border-box",marginBottom:"13px"}}/>
  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
    {msgTarget.phone&&<a href={`sms:${msgTarget.phone}?body=${encodeURIComponent(msgText)}`} style={{display:"block",textAlign:"center",background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"12px",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",textDecoration:"none",boxSizing:"border-box"}}>💬 Send via SMS</a>}
    {msgTarget.email&&<a href={`mailto:${msgTarget.email}?body=${encodeURIComponent(msgText)}`} style={{display:"block",textAlign:"center",background:"transparent",border:`1px solid ${A}40`,color:A,padding:"12px",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",textDecoration:"none",boxSizing:"border-box"}}>✉ Send via Email</a>}
    {!msgTarget.phone&&!msgTarget.email&&<div style={{textAlign:"center",padding:"14px",border:`1px solid ${C.border}`,color:C.dim,fontSize:"12px"}}>Add contact info via Manage above.</div>}
  </div>
</div>
)}

{/* REACH OUT — BROTHER */}
{tab==="brothers"&&reachView==="brother"&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setReachView(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <h2 style={{...sr,fontSize:"18px",fontWeight:"normal",margin:"0 0 7px",color:C.cream}}>Reach Out to a Brother</h2>
  <p style={{fontSize:"13px",color:C.dim,lineHeight:1.75,margin:"0 0 16px"}}>You don't have to fight alone. Ask for prayer and presence.</p>
  <Lbl color={C.dim}>Select a Brother</Lbl>
  <div style={{display:"flex",flexDirection:"column",gap:"2px",marginBottom:"14px"}}>
    {brothers.map((b,i)=>(
      <div key={b.id}>
        <button onClick={()=>setReachTarget(prev=>prev?.id===b.id?null:b)} style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"11px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",border:`1px solid ${reachTarget?.id===b.id?A:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",...sr,fontSize:"14px",color:reachTarget?.id===b.id?A:C.dim,background:reachTarget?.id===b.id?`${A}12`:C.surface,flexShrink:0}}>{b.name[0].toUpperCase()}</div>
          <span style={{...sr,fontSize:"14px",color:reachTarget?.id===b.id?C.cream:C.sand,flex:1}}>{b.name}</span>
          {reachTarget?.id===b.id&&<span style={{color:A,fontSize:"12px"}}>✓</span>}
        </button>
        {i<brothers.length-1&&<div style={{height:"1px",background:"rgba(200,168,107,0.09)"}}/>}
      </div>
    ))}
  </div>
  {reachTarget&&(reachTarget.phone||reachTarget.email)&&(
    <div style={{padding:"12px 14px",background:`${A}10`,border:`1px solid ${A}40`,marginBottom:"13px"}}>
      <div style={{...sn,fontSize:"7px",color:A,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"8px"}}>Quick Send</div>
      <div style={{display:"flex",gap:"7px"}}>
        {reachTarget.phone&&<a href={`sms:${reachTarget.phone}?body=${encodeURIComponent("I'm struggling and need prayer. Can we talk?")}`} style={{flex:1,display:"block",textAlign:"center",background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",textDecoration:"none"}}>💬 SMS</a>}
        {reachTarget.email&&<a href={`mailto:${reachTarget.email}?subject=I need prayer&body=${encodeURIComponent("I'm struggling and need prayer. Can we talk?")}`} style={{flex:1,display:"block",textAlign:"center",background:"transparent",border:`1px solid ${A}40`,color:A,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",textDecoration:"none"}}>✉ Email</a>}
      </div>
    </div>
  )}
  <Lbl color={C.dim}>Custom Message</Lbl>
  <textarea value={reachMsg} onChange={e=>setReachMsg(e.target.value)} placeholder="I'm struggling and need prayer. Can we talk?" style={{width:"100%",minHeight:"90px",background:C.surface,border:`1px solid ${C.border}`,padding:"12px",color:C.sand,fontSize:"13px",lineHeight:1.75,...sr,resize:"vertical",outline:"none",boxSizing:"border-box",marginBottom:"11px"}}/>
  {!reachTarget&&<div style={{padding:"9px",border:`1px solid ${C.border}`,color:C.dim,fontSize:"12px",textAlign:"center",opacity:0.6,marginBottom:"9px"}}>Select a brother above</div>}
</div>
)}

{/* REACH OUT — PASTOR */}
{tab==="brothers"&&reachView==="pastor"&&pView==="list"&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setReachView(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
    <h2 style={{...sr,fontSize:"18px",fontWeight:"normal",margin:0,color:C.cream}}>Reach Out to a Pastor</h2>
    <button onClick={()=>{setNewPN("");setNewPR("");setNewPPh("");setNewPEm("");setEditP(null);setPView("edit");}} style={{background:`${A}14`,border:`1px solid ${A}40`,color:A,padding:"4px 10px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>+ Add</button>
  </div>
  <p style={{fontSize:"13px",color:C.dim,lineHeight:1.75,margin:"0 0 16px"}}>Some things need more than a brother. A pastor carries spiritual authority and pastoral counsel.</p>
  {pastors.map((p,i)=>(
    <div key={p.id}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 0"}}>
        <div style={{width:"42px",height:"42px",borderRadius:"50%",border:`1px solid ${A}50`,display:"flex",alignItems:"center",justifyContent:"center",...sr,fontSize:"15px",color:A,background:`${A}10`,flexShrink:0}}>{p.name[0]?.toUpperCase()||"P"}</div>
        <div style={{flex:1}}>
          <div style={{...sr,fontSize:"14px",color:C.cream}}>{p.name}</div>
          <div style={{...sn,fontSize:"8px",color:A,letterSpacing:"1px",marginTop:"2px",textTransform:"uppercase"}}>{p.role||"Pastor / Elder"}</div>
        </div>
        <div style={{display:"flex",gap:"5px"}}>
          <button onClick={()=>{setPTarget(p);setPMsg("");setPView("compose");}} style={{background:`${A}14`,border:`1px solid ${A}40`,color:A,padding:"5px 9px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"1px",textTransform:"uppercase"}}>Message</button>
          <button onClick={()=>{setEditP(p);setNewPN(p.name);setNewPR(p.role);setNewPPh(p.phone);setNewPEm(p.email);setPView("edit");}} style={{background:"transparent",border:`1px solid ${C.border}`,color:`${C.dim}60`,padding:"5px 8px",cursor:"pointer",fontSize:"10px"}}>✏</button>
        </div>
      </div>
      {i<pastors.length-1&&<div style={{height:"1px",background:"rgba(200,168,107,0.09)"}}/>}
    </div>
  ))}
</div>
)}

{tab==="brothers"&&reachView==="pastor"&&pView==="edit"&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setPView("list")} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <h2 style={{...sr,fontSize:"18px",fontWeight:"normal",margin:"0 0 18px",color:C.cream}}>{editP?"Edit Pastor":"Add a Pastor / Elder"}</h2>
  {[{label:"Name *",val:newPN,set:setNewPN,ph:"Pastor John Smith",type:"text"},{label:"Role",val:newPR,set:setNewPR,ph:"Senior Pastor, Elder…",type:"text"},{label:"Phone",val:newPPh,set:setNewPPh,ph:"+1 (555) 000-0000",type:"tel"},{label:"Email",val:newPEm,set:setNewPEm,ph:"pastor@church.com",type:"email"}].map(({label,val,set,ph,type})=>(
    <div key={label} style={{marginBottom:"13px"}}>
      <Lbl color={C.dim}>{label}</Lbl>
      <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",background:C.surface,border:`1px solid ${C.hi}`,padding:"9px 12px",color:C.cream,fontSize:"14px",...sr,outline:"none",boxSizing:"border-box"}}/>
    </div>
  ))}
  <div style={{display:"flex",gap:"7px",marginTop:"5px"}}>
    <button onClick={()=>{if(!newPN.trim())return;if(!editP){setPastors(p=>[...p,{id:Date.now(),name:newPN.trim(),role:newPR.trim(),phone:newPPh.trim(),email:newPEm.trim()}]);}else{setPastors(p=>p.map(x=>x.id===editP.id?{...x,name:newPN.trim(),role:newPR.trim(),phone:newPPh.trim(),email:newPEm.trim()}:x));}setPView("list");setEditP(null);}} style={{flex:1,background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"11px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase"}}>{editP?"Save":"Add Pastor"}</button>
    {editP&&<button onClick={()=>{setPastors(p=>p.filter(x=>x.id!==editP.id));setPView("list");setEditP(null);}} style={{background:"transparent",border:"1px solid #8A3A3A",color:"#C87A7A",padding:"11px 13px",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase"}}>Remove</button>}
  </div>
</div>
)}

{tab==="brothers"&&reachView==="pastor"&&pView==="compose"&&pTarget&&(
<div style={{padding:"20px 18px 0"}}>
  <button onClick={()=>setPView("list")} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"18px",padding:0}}>← Back</button>
  <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,marginBottom:"16px"}}>
    <div style={{width:"46px",height:"46px",borderRadius:"50%",border:`1px solid ${A}50`,display:"flex",alignItems:"center",justifyContent:"center",...sr,fontSize:"17px",color:A,background:`${A}14`,flexShrink:0}}>{pTarget.name[0]?.toUpperCase()||"P"}</div>
    <div>
      <div style={{...sr,fontSize:"14px",color:C.cream}}>{pTarget.name}</div>
      <div style={{...sn,fontSize:"8px",color:A,letterSpacing:"1px",marginTop:"2px",textTransform:"uppercase"}}>{pTarget.role||"Pastor / Elder"}</div>
    </div>
  </div>
  {(pTarget.phone||pTarget.email)&&(
    <div style={{padding:"12px 14px",background:`${A}10`,border:`1px solid ${A}40`,marginBottom:"14px"}}>
      <div style={{...sn,fontSize:"7px",color:A,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"8px"}}>Quick Send</div>
      <div style={{display:"flex",gap:"7px"}}>
        {pTarget.phone&&<a href={`sms:${pTarget.phone}?body=${encodeURIComponent("I need to speak with you. Can we meet this week?")}`} style={{flex:1,display:"block",textAlign:"center",background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",textDecoration:"none"}}>💬 SMS</a>}
        {pTarget.email&&<a href={`mailto:${pTarget.email}?subject=I need pastoral counsel&body=${encodeURIComponent("I need to speak with you. Can we meet this week?")}`} style={{flex:1,display:"block",textAlign:"center",background:"transparent",border:`1px solid ${A}40`,color:A,padding:"9px",...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",textDecoration:"none"}}>✉ Email</a>}
      </div>
    </div>
  )}
  <Lbl color={C.dim}>Templates</Lbl>
  <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"13px"}}>
    {["I've been struggling with something serious and need to speak with you in person. Can we meet?","I need pastoral counsel and prayer. There's something I need to confess and I'd appreciate your guidance.","I'm in a difficult season and could use your wisdom. Would you have time for me this week?"].map((t,i)=>(
      <button key={i} onClick={()=>setPMsg(t)} style={{textAlign:"left",background:pMsg===t?`${A}14`:C.surface,border:`1px solid ${pMsg===t?A:C.border}`,color:pMsg===t?A:C.dim,padding:"10px 12px",cursor:"pointer",fontSize:"12px",lineHeight:1.6,...sr,transition:"all 0.2s"}}>{t}</button>
    ))}
  </div>
  <textarea value={pMsg} onChange={e=>setPMsg(e.target.value)} placeholder="Or write your own..." style={{width:"100%",minHeight:"90px",background:C.surface,border:`1px solid ${C.border}`,padding:"12px",color:C.sand,fontSize:"13px",lineHeight:1.75,...sr,resize:"vertical",outline:"none",boxSizing:"border-box",marginBottom:"13px"}}/>
  <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
    {pTarget.phone&&<a href={`sms:${pTarget.phone}?body=${encodeURIComponent(pMsg||"I need to speak with you. Can we meet this week?")}`} style={{display:"block",textAlign:"center",background:`${A}18`,border:`1px solid ${A}55`,color:A,padding:"12px",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",textDecoration:"none",boxSizing:"border-box"}}>💬 Send via SMS</a>}
    {pTarget.email&&<a href={`mailto:${pTarget.email}?subject=I need pastoral counsel&body=${encodeURIComponent(pMsg||"I need to speak with you. Can we meet this week?")}`} style={{display:"block",textAlign:"center",background:"transparent",border:`1px solid ${A}40`,color:A,padding:"12px",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",textDecoration:"none",boxSizing:"border-box"}}>✉ Send via Email</a>}
  </div>
</div>
)}

      </main>
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${A}55,transparent)`,zIndex:10}}/>
    </div>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────
