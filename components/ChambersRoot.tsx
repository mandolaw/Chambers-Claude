"use client";
import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
const WARRIORS_IMG = "/images/warriors.jpg";
const MOSES_IMG    = "/images/moses.jpg";
const BROTHERS_IMG = "/images/brothers.jpg";
const LOGO_IMG     = "/images/logo.jpg";
// ─────────────────────────────────────────────────────────────
// CHAMBERS — A cell for men to fight the noonday demon
// Built around praktike: the daily discipline of the desert
//
// SYMBOL LEXICON (every mark chosen from history):
// ⌂  The Household — domain of the man (universal)
// ᚱ  Raidho — the right journey (Elder Futhark, c.200 AD)
// ✦  Navigator's Star — the fixed point (Pacific wayfinders)
// ⚔  Crossed Swords — oath of brotherhood (universal martial)
// ✠  Hospitallers Cross — courage, suffering, 1099 AD
// ⊕  Celtic Wheel Cross — heaven meeting earth, 8th century
// ☽  Vigil Crescent — the night watch (Roman Vigiles)
// ⚒  Ora et Labora — Benedictine labor as prayer
// ◉  Kyudo Target — sacred stillness before release
// ∴  Therefore Mark — Socratic examined truth
// ☩  Christogram — Constantine's labarum, life from death
// ─────────────────────────────────────────────────────────────

const C = {
  bg:"#0B0B09", surface:"#131311", raised:"#191917",
  border:"#242420", hi:"#2E2E28",
  sand:"#E8DEC8", dim:"#9A9080", cream:"#F2EDE0",
  gold:"#C8A86B", green:"#6A9E78", red:"#9E6A6A",
};
const sr = {fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',Georgia,serif"};
const sn = {fontFamily:"'Futura','Century Gothic','Trebuchet MS',Arial,sans-serif"};

const SEASONS = {
  epiphany:    {a:"#C8A86B",icon:"✦", label:"Epiphany",     sub:"Gold — the light revealed to nations"},
  lent:        {a:"#7A6EA8",icon:"✠", label:"Lent",         sub:"Violet — the desert, the stripping away"},
  easter:      {a:"#6A9E78",icon:"☩", label:"Eastertide",   sub:"White & gold — the empty tomb"},
  ordinary:    {a:"#7A9468",icon:"⊕", label:"Ordinary Time",sub:"Green — the long faithfulness"},
  advent:      {a:"#7A8CB0",icon:"☽", label:"Advent",       sub:"Blue — vigil, the night watch before dawn"},
  reformation: {a:"#B07848",icon:"⚒", label:"Reformation",  sub:"Red — the Spirit's fire"},
};

// ── LITURGICAL SEASON ENGINE ─────────────────────────────────
// Real date math — not decoration. Computes actual Easter (Western/
// Gregorian, via the Anonymous Gregorian algorithm), then derives
// Ash Wednesday, Lent, Holy Week, Eastertide, and Advent from it.

function computeEasterDate(year){
  // Anonymous Gregorian algorithm (Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a, b){
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b.setHours(0,0,0,0) - a.setHours(0,0,0,0)) / MS);
}

function nearestSunday(date, direction = -1){
  // direction -1 = on/before, +1 = on/after
  const d = new Date(date);
  const dow = d.getDay(); // 0 = Sunday
  if (dow === 0) return d;
  const offset = direction < 0 ? -dow : (7 - dow);
  return addDays(d, offset);
}

// Advent 1 = the 4th Sunday before Christmas (i.e. Sunday on/before Dec 25,
// then back 3 more full weeks). This matches the actual liturgical calendar.
function getAdventStart(year){
  const christmas = new Date(year, 11, 25);
  const sundayOnOrBeforeChristmas = nearestSunday(christmas, -1);
  return addDays(sundayOnOrBeforeChristmas, -21);
}

// Returns the full set of key dates for a given calendar year's Easter cycle
function getLiturgicalDates(year){
  const easter = computeEasterDate(year);
  const ashWednesday = addDays(easter, -46); // Lent = 46 days incl. Sundays, 40 fasting days
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const pentecost = addDays(easter, 49); // 7 weeks after Easter
  const eastertideEnd = pentecost;

  // Advent: the 4th Sunday before Christmas (real liturgical rule)
  const christmas = new Date(year, 11, 25);
  const adventStart = getAdventStart(year);

  return {
    easter, ashWednesday, palmSunday, holyThursday, goodFriday, holySaturday,
    pentecost, eastertideEnd, christmas, adventStart,
  };
}

// The core function: given "now", determine which season we're in,
// how many days into it, how many days remain, and what % complete.
function getCurrentLiturgicalSeason(now = new Date()){
  const year = now.getFullYear();
  const thisYear = getLiturgicalDates(year);
  const lastYearAdvent = getLiturgicalDates(year - 1).adventStart;
  const nextYearDates = getLiturgicalDates(year + 1);

  const inRange = (start, end) => now >= start && now < end;

  // Advent can span Nov/Dec of "this year" OR carry from late Nov of prior year
  // into early Dec — but adventStart is always computed per-year correctly,
  // so we just check this year's Advent window (Nov 27–Dec 24ish → Dec 25).
  if (inRange(thisYear.adventStart, thisYear.christmas)) {
    const totalDays = daysBetween(new Date(thisYear.adventStart), new Date(thisYear.christmas));
    const dayNum = daysBetween(new Date(thisYear.adventStart), new Date(now)) + 1;
    return {
      id: "advent", label: "Advent", isSpecial: true,
      dayNumber: dayNum, totalDays,
      startDate: thisYear.adventStart, endDate: thisYear.christmas,
      percentComplete: Math.min(100, Math.round((dayNum / totalDays) * 100)),
    };
  }

  if (inRange(thisYear.ashWednesday, thisYear.easter)) {
    const totalDays = daysBetween(new Date(thisYear.ashWednesday), new Date(thisYear.easter));
    const dayNum = daysBetween(new Date(thisYear.ashWednesday), new Date(now)) + 1;
    // Distinguish Holy Week as a sub-phase for UI emphasis
    const isHolyWeek = now >= thisYear.palmSunday && now < thisYear.easter;
    return {
      id: "lent", label: isHolyWeek ? "Holy Week" : "Lent", isSpecial: true,
      dayNumber: dayNum, totalDays,
      startDate: thisYear.ashWednesday, endDate: thisYear.easter,
      isHolyWeek,
      percentComplete: Math.min(100, Math.round((dayNum / totalDays) * 100)),
    };
  }

  if (inRange(thisYear.easter, thisYear.eastertideEnd)) {
    const totalDays = daysBetween(new Date(thisYear.easter), new Date(thisYear.eastertideEnd));
    const dayNum = daysBetween(new Date(thisYear.easter), new Date(now)) + 1;
    return {
      id: "eastertide", label: "Eastertide", isSpecial: true,
      dayNumber: dayNum, totalDays,
      startDate: thisYear.easter, endDate: thisYear.eastertideEnd,
      percentComplete: Math.min(100, Math.round((dayNum / totalDays) * 100)),
    };
  }

  // Everything else is Ordinary Time — always accessible, no countdown framing
  return {
    id: "ordinary", label: "Ordinary Time", isSpecial: false,
    dayNumber: null, totalDays: null,
    startDate: null, endDate: null,
    percentComplete: null,
  };
}

// Convenience: how many days until the next special season begins (for
// a "coming soon" teaser during Ordinary Time — a Netflix-style trailer).
function getNextSpecialSeason(now = new Date()){
  const year = now.getFullYear();
  const thisYear = getLiturgicalDates(year);
  const nextYear = getLiturgicalDates(year + 1);

  const candidates = [
    { id: "advent", label: "Advent", start: thisYear.adventStart },
    { id: "lent", label: "Lent", start: thisYear.ashWednesday },
    { id: "advent", label: "Advent", start: nextYear.adventStart },
  ].filter(c => c.start > now).sort((a,b) => a.start.getTime() - b.start.getTime());

  if (candidates.length === 0) return null;
  const next = candidates[0];
  const daysUntil = daysBetween(new Date(now), new Date(next.start));
  return { ...next, daysUntil };
}



const SEASON_OPTS = [
  {val:"dry",     icon:"☽", label:"Dry",             sub:"Far from God. Going through the motions."},
  {val:"hungry",  icon:"◉", label:"Hungry",          sub:"Wanting more. Not sure how to get there."},
  {val:"growing", icon:"⊕", label:"Growing",         sub:"Engaged. Ready to go deeper."},
  {val:"broken",  icon:"✠", label:"In a hard place", sub:"Something is breaking me right now."},
];
const NEED_OPTS = [
  {val:"word",       icon:"∴", label:"The Word",    sub:"More time in Scripture."},
  {val:"brothers",   icon:"⚔", label:"Brotherhood", sub:"Men who actually know me."},
  {val:"discipline", icon:"⚒", label:"Discipline",  sub:"Structure and accountability."},
  {val:"prayer",     icon:"✦", label:"Prayer",      sub:"To learn to actually talk to God."},
];

const NAV = [
  {id:"rule",    icon:"⌂", label:"Rule"},
  {id:"way",     icon:"ᚱ", label:"Way"},
  {id:"prayer",  icon:"✦", label:"Prayer"},
  {id:"brothers",icon:"⚔", label:"Brothers"},
];

const PILLARS = [
  {key:"spiritual",icon:"✦",label:"Spiritual",note:"The vertical — God to man"},
  {key:"social",   icon:"⚔",label:"Social",   note:"The horizontal — man to man"},
  {key:"emotional",icon:"◉",label:"Inner",     note:"What is unseen drives what is seen"},
  {key:"physical", icon:"⚒",label:"Physical",  note:"The body is not separate from the soul"},
];

// ── STORAGE ───────────────────────────────────────────────────
// Per-user namespacing — each device gets a UUID so data is always isolated
const getUserId=()=>{
  if(typeof window==="undefined") return "server";
  let id=localStorage.getItem("chambers_uid");
  if(!id){
    id="u_"+Math.random().toString(36).slice(2,10)+"_"+Date.now().toString(36);
    localStorage.setItem("chambers_uid",id);
  }
  return id;
};
const UID=getUserId();

const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem(UID+"_"+k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(UID+"_"+k,JSON.stringify(v));}catch{}},
  clear:()=>{
    try{
      const keys=Object.keys(localStorage).filter(k=>k.startsWith(UID+"_"));
      keys.forEach(k=>localStorage.removeItem(k));
    }catch{}
  },
};
function usePersist(key,def){
  const [s,ss]=useState(()=>LS.get(key,def));
  const set=v=>{const n=typeof v==="function"?v(s):v;ss(n);LS.set(key,n);};
  return [s,set];
}

function getStreak(dates: any[]){
  if(!dates||!dates.length) return 0;
  const today=new Date();today.setHours(0,0,0,0);
  const sorted=[...new Set(dates)].map(d=>new Date(d)).sort((a,b)=>b.getTime()-a.getTime());
  let n=0,cur=new Date(today);
  for(let d of sorted){
    const dd=new Date(d);dd.setHours(0,0,0,0);
    const diff=(cur.getTime()-dd.getTime())/86400000;
    if(diff===0||diff===1){n++;cur=dd;}else break;
  }
  return n;
}

const Rule = ()=><div style={{height:"1px",background:"rgba(200,168,107,0.09)"}}/>;
const Lbl  = ({children,color="#9A9080",mb="10px"})=>(
  <div style={{...sn,fontSize:"7px",letterSpacing:"5px",textTransform:"uppercase",color,marginBottom:mb}}>{children}</div>
);

// ── SPEAK — Web Speech API for hands-free / eyes-closed prayer ─
let _speakingUtterance=null;
function speakText(text, onEnd){
  try{
    if(!('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/\n/g," ... "));
    u.rate=0.85; u.pitch=0.95; u.volume=1;
    const voices=window.speechSynthesis.getVoices();
    const preferred=voices.find(v=>/male|david|daniel|alex/i.test(v.name)) || voices.find(v=>v.lang?.startsWith("en"));
    if(preferred) u.voice=preferred;
    if(onEnd) u.onend=onEnd;
    _speakingUtterance=u;
    window.speechSynthesis.speak(u);
    return true;
  }catch{ return false; }
}
function stopSpeaking(){
  try{ window.speechSynthesis.cancel(); }catch{}
}

// ── NOTIFICATIONS — local reminders, no backend required ───────
// Uses the Notification API directly. Works while the app/tab is open
// or backgrounded on platforms that allow it. True push (waking a closed
// app) requires a server + push subscription — flagged in Settings.
async function requestNotifyPermission(){
  try{
    if(!('Notification' in window)) return "unsupported";
    if(Notification.permission==="granted") return "granted";
    if(Notification.permission==="denied") return "denied";
    const res=await Notification.requestPermission();
    return res;
  }catch{ return "unsupported"; }
}
function fireNotification(title, body){
  try{
    if(!('Notification' in window) || Notification.permission!=="granted") return false;
    new Notification(title, {
      body, icon: undefined, badge: undefined,
      tag: "chambers-"+title.replace(/\s+/g,"-").toLowerCase(),
      silent:false,
    });
    return true;
  }catch{ return false; }
}
// Checks every 30s while the app is open; fires each reminder once per day
function useLocalReminders(morningTime, eveningTime, enabled){
  useEffect(()=>{
    if(!enabled) return;
    const check=()=>{
      const now=new Date();
      const hh=String(now.getHours()).padStart(2,"0");
      const mm=String(now.getMinutes()).padStart(2,"0");
      const nowStr=`${hh}:${mm}`;
      const todayKey=now.toDateString();

      if(morningTime && nowStr===morningTime){
        const firedKey="notif_morning_"+todayKey;
        if(!LS.get(firedKey,false)){
          fireNotification("Morning Prayer — Chambers","Before the phone. Before the news. Your Rule is waiting.");
          LS.set(firedKey,true);
        }
      }
      if(eveningTime && nowStr===eveningTime){
        const firedKey="notif_evening_"+todayKey;
        if(!LS.get(firedKey,false)){
          fireNotification("Evening Examen — Chambers","Five minutes to review the day before God.");
          LS.set(firedKey,true);
        }
      }
    };
    check();
    const id=setInterval(check,30000);
    return ()=>clearInterval(id);
  },[morningTime,eveningTime,enabled]);
}
function SpeakButton({text, A, size=13, label=""}){
  const [playing,setPlaying]=useState(false);
  const toggle=(e)=>{
    e.stopPropagation();
    if(playing){ stopSpeaking(); setPlaying(false); return; }
    const ok=speakText(text, ()=>setPlaying(false));
    if(ok) setPlaying(true);
  };
  return(
    <button onClick={toggle} title={playing?"Stop":"Listen"} style={{
      display:"inline-flex",alignItems:"center",gap:"6px",
      background:playing?`${A}20`:"transparent",
      border:`1px solid ${playing?A:C.hi}`,color:playing?A:C.dim,
      padding:label?"6px 12px":"6px 8px",cursor:"pointer",
      fontFamily:"'Futura','Century Gothic',sans-serif",fontSize:"10px",
      transition:"all 0.2s",flexShrink:0
    }}>
      <span style={{fontSize:size}}>{playing?"◼":"🔊"}</span>
      {label&&<span style={{fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase"}}>{playing?"Stop":label}</span>}
    </button>
  );
}

// ── GOLD FLAKES ───────────────────────────────────────────────
function GoldFlakes(){
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
function CandleTimer({A, onClose}){
  const OPTIONS=[2,5,10,15,20];
  const [mins,setMins]=useState(null);
  const [secs,setSecs]=useState(0);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [flicker,setFlicker]=useState(1);
  const intRef=useRef(null);

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

  const start=(m)=>{setMins(m);setSecs(m*60);setRunning(true);setDone(false);};
  const totalSecs=mins*60;
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
const PRAYERS={
  dry:{
    word:[
      {n:1,title:"Augustine's Confession",src:"Augustine, Confessions, 397 AD",text:"Late have I loved You, O Beauty ever ancient, ever new. Late have I loved You. But now — even in this numb season — I call out. You were within me, and I was outside. Break into my boredom. Shatter my religious autopilot."},
      {n:2,title:"The Empty Hands Prayer",src:"Desert Father, 4th century",text:"Lord, I come with empty hands and a dryer heart. I have no eloquence. I have no tears. I have only this: Help. That is the whole prayer."},
      {n:22,title:"Thomas Merton's Dark Prayer",src:"Thomas Merton, Thoughts in Solitude, 1958",text:"My Lord God, I have no idea where I am going. I do not see the road ahead of me. I cannot know for certain where it will end. Nor do I really know myself. But I believe that the desire to please You does in fact please You. I hope that I will never do anything apart from that desire."},
      {n:23,title:"The Numb Man's Cry",src:"Psalm 22:1-2, ancient",text:"My God, my God, why have you forsaken me? Why are you so far from saving me? I cry out by day, but you do not answer — by night, but I find no rest. Yet you are holy. I will keep crying."},
      {n:24,title:"Stay in Your Cell",src:"Desert Father, Abba Moses, 4th century",text:"Lord, I am staying. I am not running to distraction today. I am sitting in the dry room of my own soul, waiting for You. The desert fathers said: stay in your cell and your cell will teach you everything. I am here. Come."},
      {n:25,title:"Against Religious Performance",src:"Soren Kierkegaard, adapted",text:"Lord, keep me from being a man who says the right things and feels nothing. From wearing faith like a coat I never take off. From praying words that have no weight. Let something in me crack open and be real before You today."},
    ],
    brothers:[
      {n:3,title:"The Hermit's Confession",src:"St. Antony of Egypt, 3rd century",text:"I fled to the desert to be alone with You, but instead I found only myself — cold, distracted, and dry. Send me not an army, but one brother. One honest voice. One man who will say: I too am dry."},
      {n:26,title:"The Weight of Hiddenness",src:"Dietrich Bonhoeffer, Life Together, 1939",text:"He who is alone with his sin is utterly alone. Lord, I have been carrying this alone too long. The dryness is partly because I have no one who knows. Send me a brother who can stand in it with me."},
      {n:27,title:"The Iron Prayer",src:"Proverbs 27:17, Puritan tradition",text:"Iron sharpens iron, Lord — but iron that has gone cold cannot sharpen anything. Heat me again through the friction of honest brotherhood. Let a man speak truth into me that I cannot speak to myself."},
    ],
    discipline:[
      {n:4,title:"The Rule for the Numb",src:"St. Benedict, adapted, 6th century",text:"Lord, Benedict said: To labor is to pray. I have no prayer in me. So I will labor. I will make my bed. I will read one verse. I will kneel when I feel nothing. Let the small discipline of the body teach the lost discipline of the soul."},
      {n:28,title:"The Acre Prayer",src:"George MacDonald, adapted",text:"Lord, I cannot plow the whole field. But I can turn this one furrow in front of me. Not tomorrow's furrow. This one. That is the discipline I am offering You today. One furrow. Done faithfully."},
      {n:29,title:"The Returning Pilgrim",src:"Rule of Taize, adapted",text:"I will return to the simple things. Morning rising. One verse. Kneeling. Silence. I do not need a new strategy. I need to return to what I abandoned. Lord, receive my return."},
    ],
    prayer:[
      {n:5,title:"Prayers in Dryness",src:"C.S. Lewis, Letters to Malcolm",text:"Prayers offered in the state of dryness are those which please Him best. So I pray unto the void: I trust You. I do not feel You, but I trust You. That is my prayer. That is enough."},
      {n:30,title:"The Wordless Prayer",src:"Romans 8:26, ancient",text:"The Spirit intercedes for us with groans that words cannot express. Lord, I offer You groans today. I do not have the language for what I need. But You do. Translate my silence. Take my emptiness and fill it with whatever You know I need most."},
      {n:31,title:"Remain",src:"John 15:4, monastic tradition",text:"Remain in me. Lord, that is the whole instruction and I keep failing it. I leave. I drift. I forget. Draw me back. Not dramatically — just a quiet return to the vine. I am the branch. You are everything else."},
    ],
  },
  hungry:{
    word:[
      {n:6,title:"The Deer's Prayer",src:"Psalm 42, ancient",text:"As the deer pants for streams of water, so my soul pants for You, O God. My soul thirsts for the living God. I hunger for Your Word like hidden manna. Feed me from Your hand."},
      {n:32,title:"Open My Ears",src:"Origen of Alexandria, 3rd century",text:"Lord, I have read Your Word and seen only ink. Open the eyes of my heart. Let Scripture be not a mirror I glance at but a window I climb through. Show me the living God behind every verse. Make the Book breathe."},
      {n:33,title:"The Burning Road",src:"Luke 24:32, adapted",text:"Did not our hearts burn within us while he talked with us on the road and opened the Scriptures? Lord, make my heart burn again. Not with emotion but with recognition — the shock of truth landing in a place it was always meant to reach."},
      {n:34,title:"More Than Doctrine",src:"John 5:39-40, Puritan",text:"You search the Scriptures because you think that in them you have eternal life — and yet you refuse to come to Me. Lord, keep me from that error. Let Scripture be the arrow pointing to You, not the destination itself. I want the Person, not just the text."},
    ],
    brothers:[
      {n:7,title:"The Confessional Longing",src:"Dietrich Bonhoeffer, Life Together, 1939",text:"He who is alone with his sin is utterly alone. I do not want to be utterly alone. I want a brother to whom I can say: I am hungry for more, and ashamed of how little I want it."},
      {n:35,title:"Two Are Better",src:"Ecclesiastes 4:9-10, Celtic",text:"Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up. Lord, I need the kind of brother who notices when I fall before I do. Give me that man. Let me be that man."},
      {n:36,title:"The Methodist Question",src:"John Wesley, Class Meeting, 18th century",text:"Lord, the early Methodists asked each other every week: How is it with your soul? Give me one man who will ask me that question and wait — actually wait — for an honest answer. And give me the courage to give one."},
    ],
    discipline:[
      {n:8,title:"The Holy Dissatisfaction",src:"A.W. Tozer, The Pursuit of God, 1948",text:"Lord, Tozer prayed: I want to want You. I long to be filled with longing. That is my prayer. Let that holy dissatisfaction drive me to discipline, not despair."},
      {n:37,title:"The Early Watch",src:"Mark 1:35, monastic",text:"Very early in the morning, while it was still dark, Jesus got up and went to a solitary place to pray. Lord, before the world wakes and makes its demands — before the phone and the noise — let me find that solitary place. Even five minutes. Give me the discipline of the early watch."},
      {n:38,title:"Channel the Hunger",src:"A.W. Tozer, adapted",text:"Lord, holy appetite is rare and precious. Most men spend their hunger on things that cannot satisfy. I want to spend mine on You. Channel this restlessness. Give it a discipline to pour into so it does not dissipate into distraction."},
    ],
    prayer:[
      {n:9,title:"The Jacob-Wrestle",src:"Genesis 32, Puritan tradition",text:"Lord, I will not let You go unless You bless me. I am not wrestling an angel. I am wrestling my own half-heartedness. I will stay in prayer until hunger becomes encounter."},
      {n:39,title:"The Ask",src:"Matthew 7:7-8",text:"Ask and it will be given to you; seek and you will find; knock and the door will be opened. For everyone who asks receives. Lord, I am asking. Not timidly, not as a formality. I am knocking. I expect You to open. I am hungry and I believe You feed the hungry."},
      {n:40,title:"Filled with the Fullness",src:"Ephesians 3:19-20",text:"That you may be filled to the measure of all the fullness of God — Lord, I want that. All of it. I do not want a partial God or a managed spirituality. I want the immeasurably more. Do in me what I cannot ask or imagine."},
    ],
  },
  growing:{
    word:[
      {n:10,title:"The Humble Scholar",src:"Origen of Alexandria, 3rd century",text:"I have read Your Word a hundred times. But every time I approach it, I am a beginner. Keep me humble. Keep me teachable. The moment I think I understand Scripture, I have stopped growing."},
      {n:41,title:"Let It Read Me",src:"Eugene Peterson, Eat This Book",text:"Lord, Peterson said the first reading gets the information, the second reading lets it read you. I want the second reading. Let Your Word examine me while I examine it. Let it ask the questions."},
      {n:42,title:"The Lectio Prayer",src:"Benedictine tradition, Lectio Divina",text:"Lord, I come to Your Word not to master it but to be mastered by it. I will read slowly. I will sit with the phrase that catches me. I will not move on until You have spoken. Take as long as You need."},
    ],
    brothers:[
      {n:11,title:"The Sharpening Prayer",src:"Proverbs 27:17, Puritan tradition",text:"Iron sharpens iron. But sharpening requires friction. Give me brothers who will not just affirm me but challenge me. Who will say: I see a blind spot — and say it in love."},
      {n:43,title:"The Accountability Covenant",src:"Early Methodist tradition, adapted",text:"Lord, let me be known. Not performed before — known. Let one man in my life have access to the real record of my week. Not my highlight reel. My actual story. Give me the courage to be that accountable."},
      {n:44,title:"Bear One Another's Burdens",src:"Galatians 6:2, adapted",text:"Carry each other's burdens, and in this way you will fulfill the law of Christ. Lord, I want to be the kind of man other men can put their weight on. And I want to find the man I can put mine on. Make the load shared. That is how You designed it."},
    ],
    discipline:[
      {n:12,title:"The Long Obedience",src:"Eugene Peterson, 1980",text:"Lord, growth comes from a long obedience in the same direction. Give me the discipline of staying. Of morning prayer when I would rather sleep. Of faithfulness no one will ever applaud."},
      {n:45,title:"The Hidden Years",src:"Luke 2:52, monastic",text:"And Jesus grew in wisdom and stature, and in favor with God and man. Thirty years hidden before three years public. Lord, I want the results without the hiddenness. Teach me to trust the long formation. Grow me in secret."},
      {n:46,title:"The Forty-Day Prayer",src:"Desert Fathers, adapted",text:"Lord, the desert fathers said nothing significant happens in less than forty days. Let me commit to something for forty days. Not to earn Your favor — to train my will. The discipline is the prayer."},
    ],
    prayer:[
      {n:13,title:"The Listening Prayer",src:"1 Samuel 3, Celtic tradition",text:"Speak, Lord, for Your servant is listening. I have done all the talking for years. Now teach me to listen. Let my prayers be half the volume and twice the attention."},
      {n:47,title:"The Intercessor",src:"Rees Howells, 20th century",text:"Lord, Rees Howells learned to pray until something broke — in him or in the situation. I give up too quickly. Teach me to stay in the place of intercession until I know I have been heard. Let me become a man who actually moves things in prayer."},
      {n:48,title:"The Prayer of Examen",src:"St. Ignatius of Loyola, 16th century",text:"Lord, at the end of this day I want to see it as You saw it. Where were You moving and I missed it? Where did I resist You? Where did grace show up? Give me eyes that can review a day and find You in it — even in the mundane, even in the failure."},
    ],
  },
  broken:{
    word:[
      {n:14,title:"The Lament Psalm",src:"Psalm 13, ancient",text:"How long, O Lord? Will You forget me forever? How long will You hide Your face from me? Look on me and answer, Lord my God. Give light to my eyes. But I trust in Your unfailing love."},
      {n:49,title:"Where Else Would I Go",src:"John 6:68, adapted",text:"Lord, when You asked the disciples if they would leave, Peter said: Lord, to whom shall we go? You have the words of eternal life. That is where I am tonight. Not full of faith — just out of alternatives. So here I am. Still."},
      {n:50,title:"The Valley Psalm",src:"Psalm 23:4, ancient",text:"Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. Lord, I am in the valley. I cannot see the other side. But I choose to believe You are here — not watching from a distance but walking this exact ground with me."},
      {n:51,title:"He Has Been Here",src:"Isaiah 53:3-4",text:"He was despised and rejected by mankind, a man of suffering, familiar with pain. Surely he took up our pain and bore our suffering. Lord, You have been here. You know this place from the inside. Let that be enough for today."},
    ],
    brothers:[
      {n:15,title:"The Sitters' Prayer",src:"Job 2, monastic",text:"Lord, Job's friends sat with him in silence for seven days. That was their best moment. Send me friends who will just sit. Who will not fix, quote, or explain. Who will bring food and silence."},
      {n:52,title:"Weep With Me",src:"Romans 12:15, early church",text:"Rejoice with those who rejoice; mourn with those who mourn. Lord, I do not need someone to fix this. I need someone to mourn with me. Send me a man who is not afraid of grief. Who will not rush me to the resurrection before I have sat with the death."},
      {n:53,title:"The Hospital Ward",src:"Dietrich Bonhoeffer, adapted",text:"The church is not a community of the righteous but a community of sinners. We are all in the ward, Lord. Some are further along in recovery, some are just arriving. Nobody here is whole yet. Let me remember that about myself and about my brothers."},
    ],
    discipline:[
      {n:16,title:"One Small Act",src:"Ancient monasticism",text:"When everything is falling apart, make your bed. Lord, I cannot fix this crisis. But I can make my bed. I can read one verse. I can kneel for ten seconds. Let small disciplines hold me together."},
      {n:54,title:"The Holding Pattern",src:"Lamentations 3:26",text:"It is good to wait quietly for the salvation of the Lord. Lord, I do not want to wait. But if the discipline right now is simply to not run — not to numb, not to escape, not to fill the space — then that is what I offer. I will wait. Quietly."},
      {n:55,title:"The Refiner's Fire",src:"Malachi 3:3, adapted",text:"He will sit as a refiner and purifier of silver. Lord, the breaking is the refining. I do not want to waste this suffering. Let it purify something in me that could not be reached any other way."},
    ],
    prayer:[
      {n:17,title:"Gethsemane",src:"Matthew 26",text:"My Father, if it is possible, let this cup pass from me. Nevertheless, not as I will, but as You will. I am in the garden. I ask for another way. But I trust Your will more than my own."},
      {n:56,title:"The Groaning Prayer",src:"Romans 8:26",text:"The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes through wordless groans. Lord, I am offering groans today. The Spirit knows what to do with them. Take my wordless weight."},
      {n:57,title:"Out of the Depths",src:"Psalm 130:1-2, ancient",text:"Out of the depths I cry to you, Lord; Lord, hear my voice. Let your ears be attentive to my cry for mercy. Lord, I am not praying from strength or clarity. I am praying from the bottom. But the bottom is still inside the reach of Your hand."},
      {n:58,title:"The Night Watch",src:"Psalm 63:1, 6-7",text:"You, God, are my God, earnestly I seek you; I thirst for you, my whole being longs for you. On my bed I remember you; I think of you through the watches of the night. Because you are my help, I sing in the shadow of your wings."},
    ],
  },
  any:[
    {n:18,title:"The Serenity Prayer",src:"Reinhold Niebuhr, 1943",text:"God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference. Trusting that You will make all things right if I surrender to Your will."},
    {n:19,title:"The Prayer of Abandonment",src:"Charles de Foucauld, martyr, 1916",text:"Father, I abandon myself into Your hands. Do with me what You will. Whatever You may do, I thank You. I am ready for all. I accept all. Let only Your will be done in me."},
    {n:20,title:"Evening Prayer",src:"John Wesley, Journal, 1738",text:"Lord, I am not what I ought to be. I am not what I want to be. I am not what I hope to be. But by Your grace, I am not what I was. Let me sleep in Your peace tonight."},
    {n:21,title:"The Prison Wall Prayer",src:"Anonymous — found on a concentration camp wall, 1945",text:"I believe in the sun even when it is not shining.\nI believe in love even when I feel it not.\nI believe in God even when He is silent.\nAmen."},
    {n:59,title:"The Collect for Grace",src:"Book of Common Prayer, 1549",text:"O Lord, our heavenly Father, Almighty and everlasting God, who hast safely brought us to the beginning of this day: defend us in the same with thy mighty power; and grant that this day we fall into no sin, neither run into any kind of danger; but that all our doings may be ordered by thy governance, to do always that is righteous in thy sight. Amen."},
    {n:60,title:"The Breastplate of St. Patrick",src:"St. Patrick, 5th century Ireland",text:"Christ with me, Christ before me, Christ behind me, Christ in me, Christ beneath me, Christ above me, Christ on my right, Christ on my left, Christ when I lie down, Christ when I sit down, Christ when I arise. In the heart of every man who thinks of me, in the mouth of everyone who speaks of me."},
    {n:61,title:"The Prayer of St. Francis",src:"Attributed, 13th century",text:"Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light. Grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love."},
    {n:62,title:"The Jesus Prayer",src:"Desert Fathers, 5th century — used continuously for 1,500 years",text:"Lord Jesus Christ, Son of God, have mercy on me, a sinner.\n\nBreath in: Lord Jesus Christ, Son of God.\nBreath out: have mercy on me, a sinner.\n\nLet it become the rhythm underneath everything."},
    {n:63,title:"The Celtic Morning Prayer",src:"Celtic Christian tradition, adapted",text:"I arise today through God's strength to pilot me, God's might to uphold me, God's wisdom to guide me, God's eye to look before me, God's ear to hear me, God's word to speak for me, God's hand to guard me, God's way to lie before me. I arise today."},
    {n:64,title:"The Covenant Prayer",src:"John Wesley, Covenant Service, 1755",text:"I am no longer my own, but Thine. Put me to what Thou wilt, rank me with whom Thou wilt. Put me to doing, put me to suffering. Let me be employed for Thee or laid aside for Thee, exalted for Thee or brought low for Thee. Let me be full, let me be empty. I freely and heartily yield all things to Thy pleasure and disposal."},
    {n:65,title:"The Night Office",src:"Compline, ancient",text:"Be present, O merciful God, and protect us through the silent hours of this night, so that we who are wearied by the changes and chances of this fleeting world may repose upon Thy eternal changelessness. Amen."},
    {n:66,title:"The Warrior's Prayer",src:"Ephesians 6:10-12, adapted",text:"Lord, I remember today that my struggle is not against flesh and blood — not against the man who frustrates me, the situation that threatens me, or the weakness I despise in myself. My enemy is spiritual. My armor is Yours. Be my shield today."},
    {n:67,title:"Before Scripture",src:"Thomas Aquinas, before study, 13th century",text:"Creator of all things, true source of light and wisdom: graciously let a ray of Your light penetrate the darkness of my understanding. Give me a keen understanding, a retentive memory, the ability to grasp things correctly and to express them suitably. Amen."},
    {n:68,title:"The Publican's Prayer",src:"Luke 18:13, ancient",text:"God, have mercy on me, a sinner.\n\nThe Pharisee listed his accomplishments. The tax collector could only say this. Jesus said the tax collector went home justified. Lord, I come not with my record but with this seven-word prayer. It is enough."},
    {n:69,title:"For the Men Who Come After",src:"Chambers, adapted from Bonhoeffer",text:"Lord, let me be the kind of man who makes it easier for the men who come after me to believe. Who lives in such a way that my sons and brothers see in me a reason to trust You. Not a perfect man — a real one. One who kept going."},
  ],
};

// Prayers for the 11am-3pm "noonday demon" (acedia) window — the "dry"
// category is the closest thematic fit to spiritual listlessness.
const NOONDAY_PRAYERS = PRAYERS.dry.word;

// Returns at most 3 prayers, truly randomized each time, favoring prayers
// the man hasn't seen recently so the same handful don't keep resurfacing.
function selectPrayers(seasons,needs){
  const MAX_PRAYERS = 3;
  const RECENT_KEY = "recentPrayerIds";
  const recent = LS.get(RECENT_KEY, []); // array of prayer n's seen recently, most recent first

  // Build the full matching pool (season x need), deduped
  const pool = [];
  const seen = new Set();
  seasons.forEach(s=>needs.forEach(n=>{
    (PRAYERS[s]?.[n]||[]).forEach(p=>{
      if(!seen.has(p.n)){ seen.add(p.n); pool.push(p); }
    });
  }));
  // Always mix in the "any" pool too, so results aren't narrowly repetitive
  PRAYERS.any.forEach(p=>{
    if(!seen.has(p.n)){ seen.add(p.n); pool.push(p); }
  });

  if(pool.length===0) return [PRAYERS.any[Math.floor(Math.random()*PRAYERS.any.length)]];

  // Weight selection away from recently-seen prayers so repeats feel diverse.
  // A prayer seen recently gets a much lower chance of being picked again.
  const weighted = pool.map(p=>{
    const recentIdx = recent.indexOf(p.n);
    const weight = recentIdx===-1 ? 10 : Math.max(1, 10 - (recent.length - recentIdx));
    return {p, weight};
  });

  const picks = [];
  const remaining = [...weighted];
  while(picks.length < MAX_PRAYERS && remaining.length > 0){
    const totalWeight = remaining.reduce((sum,w)=>sum+w.weight,0);
    let r = Math.random()*totalWeight;
    let idx = 0;
    for(let i=0;i<remaining.length;i++){
      r -= remaining[i].weight;
      if(r<=0){ idx=i; break; }
    }
    picks.push(remaining[idx].p);
    remaining.splice(idx,1);
  }

  // Update recency memory (keep last 20 seen, most recent first)
  const newRecent = [...picks.map(p=>p.n), ...recent].filter((v,i,a)=>a.indexOf(v)===i).slice(0,20);
  LS.set(RECENT_KEY, newRecent);

  return picks;
}



// ── DATA ──────────────────────────────────────────────────────

const CAL=[
  {month:"January",  s:"epiphany",    theme:"Light Comes In",              verse:"John 1:4–5",   vText:"In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.",challenges:{spiritual:"Read the Gospel of John in 21 days. Spend 10 minutes in silence before reaching for your phone each morning.",social:"Write one handwritten letter of encouragement to someone you've been meaning to contact.",emotional:"Journal three times this week on gratitude only — no complaints, only thankfulness.",physical:"Wake up 30 minutes earlier every day this month. Use the time for God, not screens."}},
  {month:"February", s:"ordinary",    theme:"Preparation & Fasting",       verse:"Matt 6:17–18", vText:"But when you fast, put oil on your head and wash your face, so that it will not be obvious to others that you are fasting, but only to your Father, who sees what is done in secret.",challenges:{spiritual:"Fast from one meal per week. Give that money to a local ministry. Keep a prayer journal.",social:"Initiate a meal with someone outside your usual circle — a neighbor, coworker, acquaintance.",emotional:"Identify one recurring negative thought. Write it, then write a countering truth from Scripture.",physical:"Cut out alcohol or sugar for the entire month."}},
  {month:"March",    s:"lent",        theme:"The Desert Within",           verse:"Matthew 4:1",  vText:"Then Jesus was led by the Spirit into the wilderness to be tempted by the devil.",challenges:{spiritual:"Eliminate one digital distraction for 40 days. Pray the Lord's Prayer aloud, slowly, every morning.",social:"Reach out to a man who has drifted from faith. Not to lecture — just to be present.",emotional:"Sit in silence for 15 minutes three times this week. No podcasts, no music. Learn to be still.",physical:"Fast one full day this month. Drink only water. Dedicate each hunger pang as a prayer."}},
  {month:"April",    s:"easter",      theme:"Death & Resurrection",        verse:"Romans 6:4",   vText:"We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life.",challenges:{spiritual:"Read the Passion narrative in all four Gospels this Holy Week. Attend every service you can.",social:"Host a meal for Easter. Invite someone who has no family nearby.",emotional:"Identify one thing you're holding onto that needs to die. Write it down, confess it, release it.",physical:"Begin a consistent morning exercise routine — even 15 minutes daily. Start before Easter Sunday."}},
  {month:"May",      s:"easter",      theme:"The Risen Life",              verse:"Col 3:1",      vText:"Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God.",challenges:{spiritual:"Memorize one full Psalm this month. Practice Sabbath every Sunday — full rest, no work.",social:"Serve at your church in one unseen role. Tell no one about it.",emotional:"Write a letter to your younger self. What would you tell him about God, men, and what matters?",physical:"Train for and complete a 5K run or a significant hike by month's end."}},
  {month:"June",     s:"ordinary",    theme:"Iron in the Mundane",         verse:"Prov 27:17",   vText:"As iron sharpens iron, so one person sharpens another.",challenges:{spiritual:"Read one chapter of Proverbs every day. Ask God: where am I foolish?",social:"Start a weekly check-in call or coffee with one man. Commit to it for the rest of the year.",emotional:"Identify your primary emotional avoidance strategy. This month, choose to feel it instead.",physical:"Work with your hands — build, fix, or grow something tangible this month."}},
  {month:"July",     s:"ordinary",    theme:"The Warrior's Rest",          verse:"1 Sam 13:14",  vText:"The Lord has sought out a man after his own heart and appointed him ruler of his people.",challenges:{spiritual:"Read 1 & 2 Samuel. Wrestle with what it means to be a man after God's own heart.",social:"Take a full weekend digital fast. Spend real, unmediated time with family or close friends.",emotional:"Write out your personal story of faith — where you came from, where you are, where you're going.",physical:"Sleep 7+ hours every night this month. Track it. Treat sleep as an act of discipline."}},
  {month:"August",   s:"ordinary",    theme:"Brotherhood & Accountability", verse:"James 5:16",  vText:"Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.",challenges:{spiritual:"Study James with another man. Be ruthlessly honest about one area of ongoing struggle.",social:"Have one honest conversation where you say the hard thing you've been avoiding.",emotional:"Apologize to someone you've wronged. In person. Without excuses.",physical:"Work out with a brother at least twice this month. Compete together, not against each other."}},
  {month:"September",s:"ordinary",    theme:"Stewardship & Dominion",      verse:"Gen 2:15",     vText:"The Lord God took the man and put him in the Garden of Eden to work it and take care of it.",challenges:{spiritual:"Read Genesis 1–2 slowly. Meditate on what it means to bear the image of God.",social:"Volunteer for one manual or physical service project in your community.",emotional:"Audit your time. Does how you spend it match what you say you value?",physical:"Spend at least 3 hours outside in nature each week — hiking, working, or simply walking."}},
  {month:"October",  s:"reformation", theme:"The Reformer's Courage",      verse:"Romans 1:17",  vText:"For in the gospel the righteousness of God is revealed — a righteousness that is by faith from first to last, just as it is written: The righteous will live by faith.",challenges:{spiritual:"Study the Reformation. Read one piece on Luther, Calvin, or Tyndale this month.",social:"Identify where cowardice has cost you a relationship. Take one step toward repair.",emotional:"Name your greatest fear aloud — to God and to one trusted brother. Face it in prayer.",physical:"Take a cold shower every morning this month. Start 30 seconds. Build to 2 minutes."}},
  {month:"November", s:"ordinary",    theme:"Saints & Remembrance",        verse:"Heb 12:1",     vText:"Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.",challenges:{spiritual:"Study Hebrews 11. Write out which Hall of Faith figure you most identify with and why.",social:"Call or write your father, a mentor, or a father figure. Tell him what he's meant to you.",emotional:"Visit a cemetery or memorial. Sit with the weight of mortality and what it means to live well.",physical:"Begin a daily Advent preparation routine — early rising, prayer, and intentional stillness."}},
  {month:"December", s:"advent",      theme:"Waiting & Wondering",         verse:"Isaiah 9:6",   vText:"For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",challenges:{spiritual:"Light an Advent candle each week. Read Isaiah 9, 11, 40, and 53.",social:"Buy nothing for yourself this month. Give extravagantly — time, money, attention.",emotional:"Slow down. Resist the rush. Set one evening each week aside as technology-free family night.",physical:"Fast from food or social media every Friday in Advent as an act of waiting and longing."}},
];

const WEEKLY_READINGS=[
  {week:"Unseen Warfare — Week 1",days:[
    {day:"Sun",ref:"Proverbs 4:20–27",   focus:"List every gate to your heart. Guard each one today."},
    {day:"Mon",ref:"Matthew 15:18–19",   focus:"What comes out of your heart most naturally? Be honest."},
    {day:"Tue",ref:"Psalm 139:23–24",    focus:"Pray this psalm word for word. Ask God to search you."},
    {day:"Wed",ref:"James 1:13–15",      focus:"Trace one recent temptation back to its source desire."},
    {day:"Thu",ref:"Galatians 5:16–24",  focus:"Which fruit of the Spirit feels most absent right now?"},
    {day:"Fri",ref:"Proverbs 4:23",      focus:"What one gate needs a guard today? Name it and guard it."},
    {day:"Sat",ref:"Psalm 51:1–12",      focus:"Rest. Pray Psalm 51 slowly as your own confession."},
  ]},
  {week:"2 Timothy — Week 1",days:[
    {day:"Sun",ref:"2 Timothy 1:1–2",    focus:"Read the whole letter through. What words repeat?"},
    {day:"Mon",ref:"2 Timothy 1:6–7",    focus:"What gift has God given you? What has caused the flame to dim?"},
    {day:"Tue",ref:"2 Timothy 1:8–9",    focus:"What are we called not to be ashamed of? Where are you tempted?"},
    {day:"Wed",ref:"2 Timothy 1:10–12",  focus:"Believing a doctrine vs. believing a Person — what's the difference?"},
    {day:"Thu",ref:"2 Timothy 1:13–14",  focus:"What is the good deposit? How are we to guard it?"},
    {day:"Fri",ref:"2 Timothy 1:15–18",  focus:"What made Onesiphorus different from those who abandoned Paul?"},
    {day:"Sat",ref:"2 Timothy 1",        focus:"Write a one-paragraph summary. What is the central theme?"},
  ]},
  {week:"OT Leaders — Abraham",days:[
    {day:"Sun",ref:"Genesis 12, Heb 11:8–12",    focus:"What did Abraham believe that made him willing to go?"},
    {day:"Mon",ref:"Genesis 17, Gal 3:6–9",      focus:"What is the covenant? How does it connect to the gospel?"},
    {day:"Tue",ref:"Genesis 18:1–19:29",          focus:"How does Abraham intercede for Sodom? What does this teach?"},
    {day:"Wed",ref:"Genesis 20",                  focus:"Abraham lies again. What does this reveal about ongoing sin in a man of faith?"},
    {day:"Thu",ref:"Genesis 22, Heb 11:17–19",   focus:"What was God testing? What did Abraham believe about death?"},
    {day:"Fri",ref:"Romans 4:1–12",              focus:"How does Paul use Abraham to explain justification by faith?"},
    {day:"Sat",ref:"Genesis 12–22",              focus:"Upward, Inward, Outward — how did God develop Abraham in each?"},
  ]},
  {week:"Prayer Guide — Week 1",days:[
    {day:"Sun",ref:"Psalm 10:17–18",     focus:"Pray this as your call to worship. Sit in silence first."},
    {day:"Mon",ref:"Ephesians 4:1–6",    focus:"Where have I failed to love my neighbor this week?"},
    {day:"Tue",ref:"Ephesians 6:10–18",  focus:"Put on the full armor in prayer. Piece by piece, aloud."},
    {day:"Wed",ref:"Hebrews 12:1–3",     focus:"What weight do you need to lay aside? Name it in prayer."},
    {day:"Thu",ref:"1 Peter 3:8–12",     focus:"Pray for the men in your life by name. Ask God to strengthen each."},
    {day:"Fri",ref:"Hebrews 10:19–23",   focus:"Draw near with full assurance — not your record, but Christ's."},
    {day:"Sat",ref:"Psalm 23",           focus:"Rest. Read the psalm slowly. Receive it as a gift."},
  ]},

  // ── DAVID: A Man After God's Own Heart ────────────────────
  {week:"David — Man After God's Heart",days:[
    {day:"Sun",ref:"1 Samuel 13:14, 16:7",focus:"God chose David not for his appearance but his heart. What does God actually see when He looks at yours?"},
    {day:"Mon",ref:"1 Samuel 17:32–50",   focus:"David ran toward Goliath. What giant are you standing in front of right now? What is your sling?"},
    {day:"Tue",ref:"Psalm 51:1–17",       focus:"After his worst failure David wrote this. Read it as your own prayer. Don't skip any verse."},
    {day:"Wed",ref:"2 Samuel 9:1–13",     focus:"David kept his covenant with Jonathan by caring for Mephibosheth. Who do you owe loyalty to that you've forgotten?"},
    {day:"Thu",ref:"2 Samuel 11:1–5",     focus:"David was where he shouldn't have been, saw what he shouldn't have seen, and acted on it. Trace the descent. Where does your version of this start?"},
    {day:"Fri",ref:"Psalm 63:1–8",        focus:"Written in a desert wilderness. David thirsted for God more than rescue. What are you thirsting for right now?"},
    {day:"Sat",ref:"Acts 13:22, 1 Kings 2:1–4",focus:"David charged his son: walk in God's ways with all your heart. What charge would you give your son or a young man watching your life?"},
  ]},

  // ── SERMON ON THE MOUNT: The Upside-Down Kingdom ──────────
  {week:"Sermon on the Mount — Week 1",days:[
    {day:"Sun",ref:"Matthew 5:1–12",      focus:"The Beatitudes describe a man the world would not hire. Which one cuts closest to where you are failing?"},
    {day:"Mon",ref:"Matthew 5:13–20",     focus:"Salt and light — both are only useful when they make contact. Where are you keeping yourself separate when you should be present?"},
    {day:"Tue",ref:"Matthew 5:21–30",     focus:"Murder starts with contempt. Adultery starts with a look. Jesus goes to the root. What root in you needs cutting?"},
    {day:"Wed",ref:"Matthew 5:33–48",     focus:"Let your yes be yes. Be honest about the last time yours wasn't. What would it cost you to be ruthlessly straightforward this week?"},
    {day:"Thu",ref:"Matthew 6:1–18",      focus:"Giving, prayer, fasting — all three are corrupted by the audience. Who are you actually performing for?"},
    {day:"Fri",ref:"Matthew 6:19–34",     focus:"You cannot serve two masters. Name your second master honestly. Where does money, approval, or security compete with God for your obedience?"},
    {day:"Sat",ref:"Matthew 7:24–27",     focus:"The difference between the wise and foolish builder is not what they heard but what they did. What sermon have you heard that you have not yet obeyed?"},
  ]},

  // ── PAUL: The Making of an Apostle ────────────────────────
  {week:"Paul — Strength in Weakness",days:[
    {day:"Sun",ref:"Acts 9:1–22",         focus:"Saul was zealous, educated, and utterly wrong. God stopped him cold. When has God stopped you cold? What were you certain of that turned out to be wrong?"},
    {day:"Mon",ref:"Philippians 3:4–14",  focus:"Paul counted everything he had built as loss. List your credentials, achievements, reputation. Now read verse 8 again. What does this cost you?"},
    {day:"Tue",ref:"2 Corinthians 11:23–12:10",focus:"Paul's resume is suffering, not success. My power is made perfect in weakness. Where is your weakness right now? Can you offer it as the place God works?"},
    {day:"Wed",ref:"Philippians 4:10–13", focus:"I have learned, in whatever state I am, to be content. This is learned, not given. What is your current state? What would contentment look like in it?"},
    {day:"Thu",ref:"2 Timothy 4:6–8",     focus:"Paul at the end: I have fought the good fight, I have finished the race, I have kept the faith. Which of these three is hardest for you right now?"},
    {day:"Fri",ref:"Romans 7:15–8:2",     focus:"The thing I want to do I do not do; the thing I hate I do. Paul was honest about his war. Name yours. Then read 8:1 slowly."},
    {day:"Sat",ref:"Galatians 2:20",      focus:"I no longer live, but Christ lives in me. What would today look like if this were actually true? What would have to die?"},
  ]},

  // ── NEHEMIAH: The Leader Who Built and Fought ─────────────
  {week:"Nehemiah — The Builder's Courage",days:[
    {day:"Sun",ref:"Nehemiah 1:1–11",     focus:"Nehemiah heard bad news and his first response was to mourn, fast, and pray — not to fix. When crisis hits, what is your first move?"},
    {day:"Mon",ref:"Nehemiah 2:1–8",      focus:"Nehemiah was afraid but asked anyway. He had a plan and he asked specifically. What have you been afraid to ask for? What would a specific ask look like?"},
    {day:"Tue",ref:"Nehemiah 2:11–18",    focus:"Nehemiah surveyed the wall at night before he told anyone his plan. He knew what he was dealing with. What broken wall in your life have you not yet surveyed honestly?"},
    {day:"Wed",ref:"Nehemiah 4:1–23",     focus:"They built with one hand and held a weapon with the other. Formation and defense simultaneously. Where do you need to be building and fighting at the same time?"},
    {day:"Thu",ref:"Nehemiah 5:1–13",     focus:"The people were exploiting each other while building God's wall. Nehemiah confronted it publicly. What injustice are you tolerating because confronting it is costly?"},
    {day:"Fri",ref:"Nehemiah 6:1–16",     focus:"Sanballat tried four times to distract Nehemiah. I am doing a great work and I cannot come down. What is your great work? What keeps pulling you down from it?"},
    {day:"Sat",ref:"Nehemiah 8:1–12",     focus:"The wall is built. The people gather. The Word is read. They weep. Then Nehemiah says: do not grieve, for the joy of the Lord is your strength. What wall in your life is close enough to finished that you can say that today?"},
  ]},

  // ── UNSEEN WARFARE — Week 2 ───────────────────────────────
  {week:"Unseen Warfare — Week 2",days:[
    {day:"Sun",ref:"1 Peter 5:8–11",      focus:"Your enemy prowls like a lion. Lions stalk the isolated and the weak. Where are you most isolated right now?"},
    {day:"Mon",ref:"James 4:1–10",        focus:"Conflicts come from desires at war within you. Name the desire underneath your most persistent conflict this week."},
    {day:"Tue",ref:"Romans 8:5–14",       focus:"The mind set on the flesh versus the mind set on the Spirit. Which one describes your thought patterns this morning?"},
    {day:"Wed",ref:"Ephesians 4:26–27",   focus:"Do not give the devil a foothold. What foothold have you been leaving open? Name it without softening it."},
    {day:"Thu",ref:"1 Corinthians 6:18–20",focus:"Your body is a temple. Flee. Not negotiate, not manage — flee. What are you negotiating with that you should be fleeing?"},
    {day:"Fri",ref:"2 Corinthians 10:3–5",focus:"Take every thought captive. What thought patterns are you letting run free that need to be captured?"},
    {day:"Sat",ref:"Revelation 12:10–11", focus:"They overcame by the blood of the Lamb and the word of their testimony. What is your testimony? Write one sentence of it."},
  ]},

  // ── 2 TIMOTHY — Week 2 ───────────────────────────────────
  {week:"2 Timothy — Week 2",days:[
    {day:"Sun",ref:"2 Timothy 2:1–7",     focus:"Be strong in grace. Endure hardship. Paul gives three images: soldier, athlete, farmer. Which one best describes where you are in your faith right now?"},
    {day:"Mon",ref:"2 Timothy 2:8–13",    focus:"If we are faithless, he remains faithful. What does it mean to you that God's faithfulness is not contingent on yours?"},
    {day:"Tue",ref:"2 Timothy 2:14–26",   focus:"Flee youthful passions and pursue righteousness, faith, love, peace — along with those who call on the Lord from a pure heart. Who are those people in your life?"},
    {day:"Wed",ref:"2 Timothy 3:1–9",     focus:"Paul describes the last days and the list sounds like a news feed. Which of these characteristics have you noticed growing in yourself?"},
    {day:"Thu",ref:"2 Timothy 3:10–17",   focus:"All Scripture is God-breathed and useful. What book of the Bible have you never studied? Commit today to read it this month."},
    {day:"Fri",ref:"2 Timothy 4:1–5",     focus:"Preach the word in season and out of season. Men will turn away from truth and gather teachers who say what they want to hear. Where are you most tempted to listen only to what you want to hear?"},
    {day:"Sat",ref:"2 Timothy 4:6–18",    focus:"Paul at the end: only Luke is with me. Even the best men face abandonment. Who is your Luke? Are you someone's Luke?"},
  ]},
];

const LONG_STUDIES = [
  {
    id: "vigilia",
    title: "Vigilia — The Art of Watchfulness",
    subtitle: "30 Days Fighting the Noonday Demon",
    verse: "1 Corinthians 16:13",
    verseText: "Be watchful, stand firm in the faith, act like men, be strong.",
    days: [
      {n:1,title:"The Watchman's Post",ref:"Mark 13:35–37",verseText:"Watch ye therefore: for ye know not when the master of the house cometh, at even, or at midnight, or at the cockcrowing, or in the morning: Lest coming suddenly he find you sleeping. And what I say unto you I say unto all, Watch.",father:"Abba Anthony",fatherQuote:"The man who abides in solitude and is quiet has escaped from three wars: hearing, speech, and sight. Then he has only one war to fight — the war of his own heart.",reflection:"The doorkeeper's job is not complicated. It is not glamorous. It is just to watch. If he sleeps, the house is lost.",antirrhetic:"I am not asleep. I am watching. The master will return. And he will find me awake.",action:"Sit in your chamber for five minutes. Do not pray. Do not read. Just sit.",prayer:"Lord, teach me to watch. I am so easily distracted, so quickly asleep. Wake me. Keep me awake."},
      {n:2,title:"The Noonday Demon",ref:"Psalm 91:5–6",verseText:"Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day; Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.",father:"Evagrius Ponticus",fatherQuote:"The demon makes the sun seem to move slowly or not at all, so the day looks like fifty hours. He compels the monk to look constantly out the window, to leave his cell.",reflection:"This is not laziness. It is spiritual warfare. The demon wants you to leave your cell. The answer is to stay.",antirrhetic:"This is the noonday demon. I will not leave my chamber. I will not check my phone. I will stay.",action:"When you feel the urge to check your phone or leave your task, pause. Say aloud: 'This is the noonday demon.' Then stay.",prayer:"Lord, I know this numbness. Help me to stay. Help me to watch."},
      {n:3,title:"The Cell as Watchtower",ref:"Matthew 6:6",verseText:"But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.",father:"Abba Moses",fatherQuote:"Sit in your cell. Your cell will teach you everything.",reflection:"The cell is not a prison. It is a watchtower. From the cell you can see what you cannot see when you are running.",antirrhetic:"This room is my watchtower. I will not leave it. The cell will teach me everything.",action:"Choose a place in your home and designate it as your chamber. Return to it each day.",prayer:"Lord, this room is my cell. Teach me here. Let me not flee from the silence."},
      {n:4,title:"The Enemy of Distraction",ref:"1 John 2:15–16",verseText:"Love not the world, neither the things that are in the world. If any man love the world, the love of the Father is not in him. For all that is in the world, the lust of the flesh, and the lust of the eyes, and the pride of life, is not of the Father, but is of the world.",father:"Abba Poimen",fatherQuote:"If you are silent, you will find rest. If you are talkative, you will find nothing but trouble.",reflection:"The enemy of watchfulness is not evil. It is noise. The demon just needs to keep you from watching.",antirrhetic:"Silence is rest. Noise is exhaustion. I will choose the silence.",action:"Eliminate one source of noise today — an app, a notification, a podcast.",prayer:"Lord, I am surrounded by noise. Help me to choose silence."},
      {n:5,title:"The Watchman's Posture",ref:"Isaiah 21:6",verseText:"For thus hath the Lord said unto me, Go, set a watchman, let him declare what he seeth.",father:"Abba Arsenius",fatherQuote:"God knows that I love you, but I cannot be with God and with men at the same time.",reflection:"The watchman does not run to fight. He stands and he watches. And when he sees, he announces it.",antirrhetic:"I am a watchman. I will not be distracted. I will see what God shows me.",action:"Spend ten minutes watching the world around you — no phone. Learn to see.",prayer:"Lord, make me a watchman. Give me eyes to see."},
      {n:6,title:"Vigilance Over the Heart",ref:"Proverbs 4:23",verseText:"Keep thy heart with all diligence; for out of it are the issues of life.",father:"Abba Serapion",fatherQuote:"The heart of the monk is a spring. If it is pure, it brings forth living water. If polluted, it brings forth poison.",reflection:"You are the watchman of your own heart. If you are watching, you can see the enemy coming.",antirrhetic:"I guard my heart. The springs of life flow from it.",action:"Ask: what has been entering my heart today? Name one thing to guard against.",prayer:"Lord, guard my heart. I am a poor watchman. Watch over me."},
      {n:7,title:"Sabbath — Review of the Watch",ref:"Psalm 23:2",verseText:"He maketh me to lie down in green pastures: he leadeth me beside the still waters.",father:"Abba Poimen",fatherQuote:"The beginning of all good works is to guard your heart. The end of all good works is to rest in God.",reflection:"Rest is not laziness. It is an act of trust. It is saying: I have watched. Now God will watch.",antirrhetic:"I rest. Not because I am lazy, but because I trust God to watch while I sleep.",action:"Take a true Sabbath today. Rest from work, noise, and the endless scroll.",prayer:"Lord, I have watched this week. Now I rest. Watch over me while I sleep."},
      {n:8,title:"Watching Through Prayer",ref:"Colossians 4:2",verseText:"Continue in prayer, and watch in the same with thanksgiving.",father:"Abba Isaac",fatherQuote:"Prayer is the watchman of the soul. It stands at the gate and sees the enemy coming.",reflection:"Watchfulness and prayer are the same thing. To pray is to watch. To watch is to pray.",antirrhetic:"I will pray. I will watch. I will not be caught unprepared.",action:"Pray the Lord's Prayer today, slowly, one phrase at a time.",prayer:"Lord, teach me to pray. Let my prayer be my watch."},
      {n:9,title:"Silence as Watchfulness",ref:"Psalm 46:10",verseText:"Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",father:"Abba Arsenius",fatherQuote:"I have often regretted speaking, but never regretted silence.",reflection:"Silence is not empty. It is full — of presence, of waiting, of listening.",antirrhetic:"I will not fill the silence. I will let it speak.",action:"Spend ten minutes in silence today. No words, no music, no podcast.",prayer:"Lord, I am afraid of silence. Teach me to be still."},
      {n:10,title:"Guarding the Eyes",ref:"Job 31:1",verseText:"I made a covenant with mine eyes; why then should I think upon a maid?",father:"Abba Anthony",fatherQuote:"The eyes are the windows of the soul. If they are guarded, the soul is safe.",reflection:"What you see shapes what you desire. What you desire shapes what you become.",antirrhetic:"I will not gaze at what I should not desire. My eyes are covenant-bound.",action:"Notice what you are looking at today. Ask: is this helping me watch, or distracting me?",prayer:"Lord, guard my eyes. Let me see what is true, noble, pure, and lovely."},
      {n:11,title:"Guarding the Ears",ref:"Luke 8:18",verseText:"Take heed therefore how ye hear: for whosoever hath, to him shall be given; and whosoever hath not, from him shall be taken even that which he seemeth to have.",father:"Abba Anthony",fatherQuote:"The man who abides in solitude and is quiet has escaped from three wars: hearing, speech, and sight.",reflection:"What you hear shapes what you believe. What you believe shapes what you do.",antirrhetic:"I will guard my ears. I will listen for the voice of the Shepherd.",action:"Turn off one source of noise today. Let your ears rest.",prayer:"Lord, give me ears to hear. Let me listen for Your voice above the noise."},
      {n:12,title:"Guarding the Tongue",ref:"Psalm 141:3",verseText:"Set a watch, O Lord, before my mouth; keep the door of my lips.",father:"Abba Poimen",fatherQuote:"If you are silent, you will find rest. If you are talkative, you will find nothing but trouble.",reflection:"Words are quick to leave and impossible to retrieve. Every word shapes who you are becoming.",antirrhetic:"I will guard my tongue. I will speak only what builds up.",action:"Before you speak today, ask: is this true? Is it kind? Is it necessary?",prayer:"Lord, set a guard over my mouth. Let my words be few. Let them be true."},
      {n:13,title:"The Thought-Life",ref:"2 Corinthians 10:5",verseText:"Casting down imaginations, and every high thing that exalteth itself against the knowledge of God, and bringing into captivity every thought to the obedience of Christ.",father:"Evagrius Ponticus",fatherQuote:"If you cannot control your thoughts, you cannot control your actions. The thought is the seed of the deed.",reflection:"The watchman does not wait for the enemy to arrive. He sees the thought before it becomes action.",antirrhetic:"I will take every thought captive. I will bring every thought to Christ.",action:"When a negative thought arises today, name it. Say: this thought is not from God.",prayer:"Lord, give me watchfulness over my thoughts. Let me bring them to You."},
      {n:14,title:"Sabbath — Review of the Tools",ref:"Matthew 11:28",verseText:"Come unto me, all ye that labour and are heavy laden, and I will give you rest.",father:"Abba John the Dwarf",fatherQuote:"A man who works with his hands and prays with his heart has built a watchtower in his soul.",reflection:"These are not tasks to be checked off. They are disciplines to be cultivated — the walls of your watchtower.",antirrhetic:"I have watched. Now I rest. The watchtower is not a prison. It is a place of peace.",action:"Reflect on the tools you have learned this week. Thank God for each one.",prayer:"Lord, I thank you for the tools of watchfulness. Help me to rest in You."},
      {n:15,title:"Brotherly Watchfulness",ref:"Ecclesiastes 4:9–10",verseText:"Two are better than one; because they have a good reward for their labour. For if they fall, the one will lift up his fellow: but woe to him that is alone when he falleth; for he hath not another to help him up.",father:"Abba Poimen",fatherQuote:"A brother is a watchman. He sees what you cannot see. He warns you when you cannot see the danger.",reflection:"The demon's favorite strategy is isolation. You need a brother who will lift you up when you fall.",antirrhetic:"I am not alone. I have a brother. He watches with me.",action:"Reach out to one brother today. Ask: how are you, really? Then listen.",prayer:"Lord, thank you for my brothers. Help me to watch with them."},
      {n:16,title:"Confession as Watchfulness",ref:"James 5:16",verseText:"Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much.",father:"Abba Moses",fatherQuote:"Confession is the watchman's cry. It sounds the alarm. It warns the city that the enemy is near.",reflection:"The demon thrives in secrecy. But when you confess, you bring it into the light, and the light destroys it.",antirrhetic:"I will not hide my sin. I will confess it. And I will be healed.",action:"Find someone you trust. Tell him one thing you have been hiding.",prayer:"Lord, I am tempted to hide. Help me to confess. Let the light heal me."},
      {n:17,title:"The Watch of the Community",ref:"Hebrews 10:24–25",verseText:"And let us consider one another to provoke unto love and to good works: Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching.",father:"Abba Serapion",fatherQuote:"The community is a watchtower. When one man is weak, the wall holds him up. When one man sleeps, the others keep watch.",reflection:"You cannot watch alone. The noonday demon is too subtle — it will find the cracks.",antirrhetic:"I will not neglect meeting with my brothers. Together, we are a watchtower.",action:"If you are not part of a brotherhood, take one step toward joining one today.",prayer:"Lord, I need my brothers. Help me to find them."},
      {n:18,title:"The Watch of Love",ref:"Song of Songs 3:1–2",verseText:"By night on my bed I sought him whom my soul loveth: I sought him, but I found him not. I will rise now, and go about the city in the streets, and in the broad ways I will seek him whom my soul loveth: I sought him, but I found him not.",father:"Abba Poimen",fatherQuote:"Love is the watchman of the soul. It sees the beloved and cannot be distracted.",reflection:"Watchfulness is not just about avoiding sin. It is about waiting for God, loving Him so much you cannot be distracted.",antirrhetic:"I am watching for my Beloved. He is coming. I will not be distracted.",action:"Spend five minutes today in loving attention to God — not asking, not confessing, just loving Him.",prayer:"Lord, I love You. Help me to watch for You."},
      {n:19,title:"The Watch of Hope",ref:"Psalm 130:6",verseText:"My soul waiteth for the Lord more than they that watch for the morning: I say, more than they that watch for the morning.",father:"Abba Macarius",fatherQuote:"Hope is the watchman's lamp. It keeps the darkness from overwhelming the soul.",reflection:"The demon wants you to lose hope, to believe nothing will change. But the watchman knows the dawn is coming.",antirrhetic:"I wait for the Lord more than watchmen wait for the morning. The dawn is coming.",action:"Write down one thing you are hoping for. Hold it before God today.",prayer:"Lord, I wait for You. I hold my lamp of hope."},
      {n:20,title:"The Watch of Joy",ref:"John 15:11",verseText:"These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.",father:"Abba Silvanus",fatherQuote:"Joy is the watchman's song. It drives the noonday demon away.",reflection:"The demon cannot stand joy. It feeds on despair, on numbness. But joy — even small joy — breaks the spell.",antirrhetic:"I will sing. The noonday demon cannot stand my joy.",action:"Find one thing that brings you joy today. Spend time in it. Let it fill you.",prayer:"Lord, fill me with joy. Let it drive the noonday demon away."},
      {n:21,title:"Sabbath — Review of the Community",ref:"Matthew 18:20",verseText:"For where two or three are gathered together in my name, there am I in the midst of them.",father:"Abba Anthony",fatherQuote:"Your life and your death are with your neighbor. If you gain your brother, you have gained God.",reflection:"The community is not a support group. It is the watchtower. Together, you can see what you cannot see alone.",antirrhetic:"I am not alone. I am part of a community of watchers. Together, we will see the dawn.",action:"If you have a community, thank God for it. If not, pray for one.",prayer:"Lord, I thank you for my brothers. Help me to watch with them."},
      {n:22,title:"Watching Through Suffering",ref:"2 Corinthians 4:8–9",verseText:"We are troubled on every side, yet not distressed; we are perplexed, but not in despair; Persecuted, but not forsaken; cast down, but not destroyed.",father:"Abba Anthony",fatherQuote:"When you are suffering, do not leave your cell. Stay. The demon wants you to run. But staying is the victory.",reflection:"Suffering is the watchman's hardest test. Paul was afflicted but not crushed. He stayed.",antirrhetic:"I will not leave my cell. I will stay. Suffering will not drive me out.",action:"If you are suffering today, stay. Do not run. Let the suffering teach you.",prayer:"Lord, I am suffering. Help me to stay. Let me watch in the darkness."},
      {n:23,title:"Watching Against Despair",ref:"Lamentations 3:31–33",verseText:"For the Lord will not cast off for ever: But though he cause grief, yet will he have compassion according to the multitude of his mercies. For he doth not afflict willingly nor grieve the children of men.",father:"Abba Joseph",fatherQuote:"When you fall into despair, do not believe the despair. It is a lie. The truth is that God loves you.",reflection:"Despair is the demon's final weapon — to make you believe God has abandoned you. But He does not cast off forever.",antirrhetic:"Despair is a lie. God loves me. I will not believe the lie.",action:"If you are in despair today, say aloud: God loves me. This is true, even if I feel nothing.",prayer:"Lord, I am tempted to despair. Help me to believe that You love me."},
      {n:24,title:"Watching for the Lord's Coming",ref:"Romans 13:12",verseText:"The night is far spent, the day is at hand: let us therefore cast off the works of darkness, and let us put on the armour of light.",father:"Abba Syncletica",fatherQuote:"We who have renounced the world are like watchmen on a tower. We see the day approaching. And we prepare for it.",reflection:"The night is far gone. The day is at hand. The watchman prepares — casting off darkness, putting on light.",antirrhetic:"The night is ending. The day is coming. I will prepare myself for the Lord's coming.",action:"Do one thing today to prepare for the Lord's coming — confession, forgiveness, obedience.",prayer:"Lord, I wait for You. Prepare me for Your coming."},
      {n:25,title:"The Watch of the Mind",ref:"Romans 12:2",verseText:"And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",father:"Abba Isaac",fatherQuote:"The mind is the watchman's highest wall. If it falls, the city is lost.",reflection:"The demon attacks the mind — fills it with distraction, lies, despair. But the watchman renews his mind.",antirrhetic:"I will renew my mind. I will not be conformed to this world.",action:"Read a passage of Scripture slowly today. Write down one word or phrase that stands out.",prayer:"Lord, renew my mind. Let me see the world through Your eyes."},
      {n:26,title:"Watching Against Pride",ref:"Proverbs 16:18",verseText:"Pride goeth before destruction, and an haughty spirit before a fall.",father:"Abba Poimen",fatherQuote:"Pride is the noonday demon's disguise. It looks like confidence, but it is the enemy of watchfulness.",reflection:"The moment you think you are safe is the moment you are most vulnerable.",antirrhetic:"I am not safe. I am always watching. Pride is the enemy.",action:"Ask: where am I proud? Where have I stopped watching because I think I've arrived?",prayer:"Lord, keep me humble. Let me not think I have arrived."},
      {n:27,title:"The Watch of the Body",ref:"1 Corinthians 6:19–20",verseText:"What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own? For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God's.",father:"Abba Moses",fatherQuote:"The body is the watchman's house. If it is neglected, the watchman cannot watch.",reflection:"The demon attacks the body too — makes you tired, sluggish, numb. But the body is the temple of the Holy Spirit.",antirrhetic:"I will care for my body. It is not my own. It is the temple of the Holy Spirit.",action:"Do one thing today to care for your body — sleep, exercise, eat well, rest.",prayer:"Lord, help me to care for my body. Let me watch well."},
      {n:28,title:"The Watch of Eternity",ref:"Colossians 3:1–3",verseText:"If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God. Set your affection on things above, not on things on the earth. For ye are dead, and your life is hid with Christ in God.",father:"Abba Anthony",fatherQuote:"The watchman who sees eternity cannot be distracted by the things of time.",reflection:"The demon is a master of the immediate. But the watchman sees eternity — his life hidden with Christ in God.",antirrhetic:"I set my mind on things above. My life is hidden with Christ.",action:"Spend five minutes today thinking about eternity. What will matter forever?",prayer:"Lord, let me see eternity. Let me not be distracted by the things of time."},
      {n:29,title:"The Final Watch",ref:"Revelation 16:15",verseText:"Behold, I come as a thief. Blessed is he that watcheth, and keepeth his garments, lest he walk naked, and they see his shame.",father:"Abba Arsenius",fatherQuote:"I have spent my whole life watching. And now the night is almost over. The dawn is coming.",reflection:"The final watch is the longest — and the sweetest. Because the dawn is coming. The Lord is coming.",antirrhetic:"I have watched. I have stayed. The dawn is coming. I will see Him.",action:"Spend time with the reality of your own death today. Ask: if this were my last day, would I be ready?",prayer:"Lord, I have watched. Now I wait for You. Come, Lord Jesus."},
      {n:30,title:"The Watch Completed",ref:"Revelation 22:20",verseText:"He which testifieth these things saith, Surely I come quickly. Amen. Even so, come, Lord Jesus.",father:"Abba Anthony",fatherQuote:"The watchman's work is never finished. But he rests in the One who is coming.",reflection:"Thirty days of watchfulness. But the watch will never be finished. It is a way of life, not a task to complete.",antirrhetic:"I have watched. I will continue to watch. But I rest in the One who is coming.",action:"Today, rest. Let the watchfulness of thirty days settle into your soul.",prayer:"Lord, thank You for this journey. Help me to continue watching — always from a place of rest. Come, Lord Jesus."},
    ],
  },
  {
    id: "aristeia",
    title: "Aristeia — The Way of Excellence",
    subtitle: "30 Days of Formation for Men",
    verse: "Colossians 3:23–24",
    verseText: "Whatever you do, work heartily, as for the Lord and not for men, knowing that from the Lord you will receive the inheritance as your reward.",
    days: [
      {n:1,title:"The Day as Arena",ref:"1 Corinthians 9:24–25",verseText:"Know ye not that they which run in a race run all, but one receiveth the prize? So run, that ye may obtain. And every man that striveth for the mastery is temperate in all things. Now they do it to obtain a corruptible crown; but we an incorruptible.",father:"Abba Anthony",fatherQuote:"Every day I begin again. I do not look back at yesterday's victories. I do not despair over yesterday's failures. I begin again.",reflection:"The race is not a single event. It is a daily practice. The point is not the finish line — it is the running.",antirrhetic:"I do not need to win today. I need to show up today. I will practice excellence.",action:"Today, show up. Whatever you are avoiding — begin. Not to finish. Just to begin.",prayer:"Lord, help me to begin again today. Let me take one step. That is enough."},
      {n:2,title:"Training the Soul",ref:"1 Timothy 4:7–8",verseText:"But refuse profane and old wives' fables, and exercise thyself rather unto godliness. For bodily exercise profiteth little: but godliness is profitable unto all things, having promise of the life that now is, and of that which is to come.",father:"Evagrius",fatherQuote:"The soul is trained by silence. The mind is trained by Scripture. The heart is trained by prayer.",reflection:"The soul does not grow by accident. It grows by training. If the soul is neglected, nothing else matters.",antirrhetic:"I will train my soul. Silence will teach me. Scripture will shape me. Prayer will form me.",action:"Choose one practice for your soul today: silence, slow reading of a Psalm, or attentive prayer.",prayer:"Lord, teach me to train my soul. Form me into the man You created me to be."},
      {n:3,title:"Training the Body",ref:"1 Timothy 4:8",verseText:"For bodily exercise profiteth little: but godliness is profitable unto all things, having promise of the life that now is, and of that which is to come.",father:"Abba Dorotheos",fatherQuote:"A man once asked why the elders trained their bodies as well as their souls. Abba Dorotheos said, 'Because grace does not arrive through a body that has forgotten how to be commanded.'",reflection:"Bodily training holds some value, Paul says — not none. The body is the one part of you that responds honestly to repetition. It does not negotiate, does not rationalize, does not talk itself out of showing up. Discipline in the body teaches your soul what discipline actually feels like, so the soul stops treating obedience as an abstraction.",antirrhetic:"My body is where I practice obeying before I feel like it. What it learns, my soul borrows.",action:"Choose one physical discipline today that has nothing to do with how you look — only with what you can command.",prayer:"Lord, let my body become fluent in obedience, so my soul has a teacher close at hand."},
      {n:4,title:"Training the Mind",ref:"Romans 12:2",verseText:"And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",father:"Abba Isaac",fatherQuote:"The mind is the watchman's highest wall. If it falls, the city is lost.",reflection:"Renewing the mind is not passive. It is training — the daily practice of choosing what you will think about.",antirrhetic:"I will renew my mind. I will fill it with what is true and excellent.",action:"Read a passage of Scripture slowly today. Carry one word or phrase with you.",prayer:"Lord, renew my mind. Let me practice excellence in my thoughts."},
      {n:5,title:"Training the Heart",ref:"Proverbs 4:23",verseText:"Keep thy heart with all diligence; for out of it are the issues of life.",father:"Abba Serapion",fatherQuote:"The heart of the monk is a spring. If it is pure, it brings forth living water. If polluted, it brings forth poison.",reflection:"Training the heart is not suppressing emotions. It is directing them — practicing love and gratitude until they become second nature.",antirrhetic:"I guard my heart. I will train it to love what is good.",action:"Ask: what has been entering my heart today? Name one thing to guard against.",prayer:"Lord, train my heart to love what You love."},
      {n:6,title:"The Art of Showing Up",ref:"1 Corinthians 15:58",verseText:"Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.",father:"Abba Poimen",fatherQuote:"The man who shows up every day, even when he feels nothing, will outlast the man who only comes when he feels inspired.",reflection:"The practice of excellence is the practice of showing up — whether you feel like it or not.",antirrhetic:"I will show up today. I will not wait for inspiration.",action:"Show up today. Do the small thing in front of you. Do not wait until you feel like it.",prayer:"Lord, help me to show up. Let me practice faithfulness."},
      {n:7,title:"Sabbath — Review of the Practice",ref:"Psalm 23:2–3",verseText:"He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",father:"Abba Poimen",fatherQuote:"The beginning of all good works is to guard your heart. The end of all good works is to rest in God.",reflection:"Rest is essential to excellence. The athlete who never rests burns out.",antirrhetic:"I rest. Not because I am lazy, but because I trust God to form me.",action:"Take a true Sabbath today. Rest from work, striving, and the endless scroll.",prayer:"Lord, form me in the rest. Renew me for the coming week."},
      {n:8,title:"Entering the Arena",ref:"2 Timothy 4:7",verseText:"I have fought a good fight, I have finished my course, I have kept the faith.",father:"Abba Anthony",fatherQuote:"The arena is not the place where you win. It is the place where you are tested. And the testing is the making of you.",reflection:"You do not become excellent by avoiding difficulty. You become excellent by entering the arena.",antirrhetic:"I will enter the arena. I will embrace the struggle.",action:"Face one thing you have been avoiding today. Not to win — just to face it.",prayer:"Lord, give me courage to enter the arena. Let the testing make me."},
      {n:9,title:"The Wood on the Fire",ref:"James 1:2–4",verseText:"My brethren, count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh patience. But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.",father:"Abba Joseph",fatherQuote:"Every failure is wood on the fire. It does not destroy the fire. It feeds it.",reflection:"Failure is not the end. It is fuel. The man who never fails is the man who never tries.",antirrhetic:"This failure is wood on the fire. It does not destroy me. It feeds me.",action:"Think of one failure or setback. Ask: what did this teach me? Let it be fuel, not shame.",prayer:"Lord, help me to see failure as fuel."},
      {n:10,title:"The Beauty of Difficulty",ref:"Romans 5:3–4",verseText:"And not only so, but we glory in tribulations also: knowing that tribulation worketh patience; And patience, experience; and experience, hope.",father:"Abba Syncletica",fatherQuote:"The one who has never been tested does not know his own strength. The one who has never suffered does not know his own heart.",reflection:"Suffering produces endurance, endurance produces character, character produces hope. The chain begins with difficulty.",antirrhetic:"I do not fear difficulty. It is the school of excellence.",action:"Reflect on a difficult season in your life. What did it produce in you?",prayer:"Lord, thank You for the difficulty that has formed me."},
      {n:11,title:"The Cost of Excellence",ref:"Matthew 16:24",verseText:"Then said Jesus unto his disciples, If any man will come after me, let him deny himself, and take up his cross, and follow me.",father:"Abba Moses",fatherQuote:"Excellence costs everything. It costs you your comfort. It costs you your reputation. But it gives you something greater — yourself.",reflection:"You cannot pursue excellence and pursue comfort at the same time. You must choose.",antirrhetic:"I will pay the cost of excellence. I will deny myself.",action:"Identify one comfort you are unwilling to give up. Is it preventing your excellence?",prayer:"Lord, help me to pay the cost of excellence. Let me follow You."},
      {n:12,title:"The Plateau",ref:"Galatians 6:9",verseText:"And let us not be weary in well doing: for in due season we shall reap, if we faint not.",father:"Abba Sisoes",fatherQuote:"A brother asked Abba Sisoes, 'I do not feel I am making progress.' The old man said, 'Neither do I. And I have been at this fifty years.'",reflection:"Every man who trains hits the plateau — the season where effort stops producing visible growth. This is where most men quit training entirely, mistaking a flat line for a dead end. But the plateau is not the absence of formation. It is often the place where formation goes underground, into the parts of you that don't show on a chart.",antirrhetic:"I do not train for the feeling of progress. I train because the work itself is the offering.",action:"Name one area where you feel stuck today. Do the work anyway — without checking for results.",prayer:"Lord, when I cannot see growth, let me trust the discipline itself. Do not let me quit at the plateau."},
      {n:13,title:"The Perseverance of the Watchman",ref:"Hebrews 12:1",verseText:"Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us.",father:"Abba Poimen",fatherQuote:"Perseverance is the cure for acedia. The demon cannot stand against a man who refuses to leave.",reflection:"Perseverance is not about feeling strong. It is about refusing to leave.",antirrhetic:"I will persevere. I will not leave. The demon cannot stand against me.",action:"If you are struggling today, stay. Do not run. Let perseverance do its work.",prayer:"Lord, give me perseverance. Let me stay until the dawn."},
      {n:14,title:"Sabbath — Review of the Struggle",ref:"Matthew 11:28",verseText:"Come unto me, all ye that labour and are heavy laden, and I will give you rest.",father:"Abba John the Dwarf",fatherQuote:"The man who struggles and rests is stronger than the man who struggles without rest.",reflection:"Rest is not the absence of struggle. It is the completion of it.",antirrhetic:"I have struggled. Now I rest. My rest is not weakness. It is renewal.",action:"Reflect on the struggles of this week. Thank God for the struggle that is forming you.",prayer:"Lord, I thank You for the struggle. Now I rest in You."},
      {n:15,title:"The Testing of Faith",ref:"James 1:3–4",verseText:"Knowing this, that the trying of your faith worketh patience. But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.",father:"Abba Joseph",fatherQuote:"The testing is not punishment. It is training. God tests you not because He is angry, but because He is forming you.",reflection:"Testing is a sign of God's attention, not His displeasure. The fire is not destruction. It is refinement.",antirrhetic:"This testing is training. God is forming me. I will not despair.",action:"Think of a current struggle. Ask: what is God teaching me through this?",prayer:"Lord, I trust You in the testing. Make me complete."},
      {n:16,title:"The Struggle Against Shame",ref:"Romans 8:1",verseText:"There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.",father:"Abba Poimen",fatherQuote:"Shame is the noonday demon's tool. It makes you want to hide. But hiding is the enemy of excellence.",reflection:"There is no condemnation for those in Christ. Not less condemnation. None. The shame is a lie.",antirrhetic:"There is no condemnation. I will not hide. I will bring my failures into the light.",action:"If you are carrying shame, speak it aloud to one trusted person today.",prayer:"Lord, help me to believe there is no condemnation. Let me not hide."},
      {n:17,title:"The Struggle Against Comparison",ref:"Galatians 6:4",verseText:"But let every man prove his own work, and then shall he have rejoicing in himself alone, and not in another.",father:"Abba Moses",fatherQuote:"The man who compares himself to others is never at rest. He is either proud or envious. The man who compares himself to God is always growing.",reflection:"Excellence is not comparative. It is becoming who God created you to be — not who you are relative to anyone else.",antirrhetic:"I will not compare myself to others. I will compare myself to who God is calling me to become.",action:"Notice when you compare yourself to someone today. Name it. Ask: what is God calling me to become?",prayer:"Lord, free me from comparison."},
      {n:18,title:"The Struggle Against the Need to Be Liked",ref:"Galatians 1:10",verseText:"For do I now persuade men, or God? or do I seek to please men? for if I yet pleased men, I should not be the servant of Christ.",father:"Abba Arsenius",fatherQuote:"I have often regretted speaking, but never regretted silence. I have often regretted being disliked, but never regretted being faithful.",reflection:"You cannot please everyone and become excellent. You must choose.",antirrhetic:"I will not seek the approval of men. Excellence is worth being misunderstood.",action:"Say something true today that might not be liked. Not to provoke — just to be honest.",prayer:"Lord, free me from the need to be liked."},
      {n:19,title:"When You Fail Publicly",ref:"Proverbs 24:16",verseText:"For a just man falleth seven times, and riseth up again: but the wicked shall fall into mischief.",father:"Abba Zosimas",fatherQuote:"A righteous man falls seven times and rises again — not because he never falls, but because falling is not where his identity lives.",reflection:"There is a specific despair that comes from failing where others could see it — the missed deadline, the outburst in front of your family, the promise you couldn't keep. This despair whispers that the failure is now who you are. But your identity was never built on an unbroken record. It was built on being chosen before you had a record at all.",antirrhetic:"My failure is data, not verdict. I rise because rising is what righteous men do — not because I never fall.",action:"If you failed at something visible recently, do not manage the story today. Let it be seen, and rise anyway.",prayer:"Lord, when I fail where others can see, keep me from hiding. Let my rising be as visible as my falling."},
      {n:20,title:"The Struggle Against Fatigue",ref:"Isaiah 40:31",verseText:"But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",father:"Abba Moses",fatherQuote:"Fatigue is not failure. It is a signal. Excellence is not found in exhaustion. It is found in rhythm.",reflection:"The demon wants you to believe you are failing if you are tired. But those who wait on the Lord renew their strength.",antirrhetic:"I am tired. That is not failure. I will rest and be renewed.",action:"If you are fatigued today, rest. Sleep, walk, sit in silence.",prayer:"Lord, renew my strength. Let me rest in You."},
      {n:21,title:"Sabbath — The Struggle Completed",ref:"Isaiah 40:29",verseText:"He giveth power to the faint; and to them that have no might he increaseth strength.",father:"Abba Anthony",fatherQuote:"The man who struggles and rests is stronger than the man who struggles without rest.",reflection:"The Sabbath is not the end of the fight. It is the source of strength for the next fight.",antirrhetic:"I have struggled. I have rested. Now I am ready for the next struggle.",action:"Take a true Sabbath today. Let yourself be renewed.",prayer:"Lord, I thank You for the struggle. Renew me for the next fight."},
      {n:22,title:"The Call to Excellence",ref:"Colossians 3:23–24",verseText:"And whatsoever ye do, do it heartily, as to the Lord, and not unto men; Knowing that of the Lord ye shall receive the reward of the inheritance: for ye serve the Lord Christ.",father:"Abba Anthony",fatherQuote:"The work itself is not excellence. The faithfulness in the work is excellence.",reflection:"The man who is faithful in little will be faithful in much. Excellence is found in the small things.",antirrhetic:"I will work heartily. I will be faithful in the small things.",action:"Do one small thing today with excellence — as if doing it for the Lord.",prayer:"Lord, let excellence be my offering to You."},
      {n:23,title:"Excellence as Stewardship",ref:"1 Peter 4:10",verseText:"As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God.",father:"Abba Poimen",fatherQuote:"The gifts are not for you. They are for others. Excellence is not self-improvement. It is stewardship.",reflection:"Excellence is about being a good steward of what you have been given — for the sake of others.",antirrhetic:"I will use my gifts to serve. Excellence is stewardship.",action:"Identify one gift you have. Ask: who could I serve with this today?",prayer:"Lord, help me to steward my gifts."},
      {n:24,title:"The Excellence of Character",ref:"Galatians 5:22–23",verseText:"But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.",father:"Abba Serapion",fatherQuote:"The fruit is not the product of effort. It is the product of abiding. Excellence of character is not achieved. It is grown.",reflection:"You do not produce the fruit of the Spirit by effort. You produce it by abiding in Christ.",antirrhetic:"I will abide in Christ. The fruit will grow.",action:"Spend five minutes in silent abiding today — not asking, not striving, just being with God.",prayer:"Lord, let the fruit grow. Let excellence be the product of abiding."},
      {n:25,title:"The Excellence of Gratitude",ref:"1 Thessalonians 5:18",verseText:"In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",father:"Abba Silvanus",fatherQuote:"Gratitude is the watchman's song. It drives the noonday demon away.",reflection:"Gratitude is not a feeling. It is a practice — the discipline of seeing what is good, even in difficulty.",antirrhetic:"I will give thanks. In all circumstances.",action:"Name three things you are grateful for today. Write them down.",prayer:"Lord, I thank You. Help me to see what is good."},
      {n:26,title:"The Excellence of Generosity",ref:"2 Corinthians 9:7",verseText:"Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.",father:"Abba Moses",fatherQuote:"The generous man is not the man who has much. The generous man is the man who has been freed from the need to hold.",reflection:"The man who gives out of compulsion is still enslaved. Generosity is the excellence of freedom.",antirrhetic:"I will give cheerfully. I give because I am free.",action:"Give something today that costs you — time, attention, encouragement, forgiveness.",prayer:"Lord, free me from the need to hold. Let generosity be my excellence."},
      {n:27,title:"The Excellence of Forgiveness",ref:"Ephesians 4:32",verseText:"And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",father:"Abba Poimen",fatherQuote:"The man who forgives is stronger than the man who holds a grudge. Holding is weakness. Releasing is strength.",reflection:"Forgiveness is not weakness. It is strength. It is the hard path — and the hard path is the path of excellence.",antirrhetic:"I will forgive. Holding is weakness. Releasing is strength.",action:"Think of one person you need to forgive. Write a letter of forgiveness — you don't need to send it.",prayer:"Lord, help me to release what I have been holding."},
      {n:28,title:"The Excellence of Humility",ref:"Philippians 2:3",verseText:"Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves.",father:"Abba Anthony",fatherQuote:"The man who thinks he has arrived has not arrived. The man who knows he is still learning is the man who is growing.",reflection:"Humility is the freedom of not needing to be the center. It is the excellence of being teachable.",antirrhetic:"I have not arrived. I am still learning.",action:"Ask someone for feedback today: where am I blind? Where do I need to grow?",prayer:"Lord, keep me humble. Let me always be learning."},
      {n:29,title:"The Excellence of Legacy",ref:"2 Timothy 4:7–8",verseText:"I have fought a good fight, I have finished my course, I have kept the faith: Henceforth there is laid up for me a crown of righteousness, which the Lord, the righteous judge, shall give me at that day.",father:"Abba Arsenius",fatherQuote:"The only legacy that matters is the legacy of faithfulness. Not what you achieved. But who you became.",reflection:"The men who changed the world did not set out to change the world. They set out to be faithful.",antirrhetic:"I will be faithful. That is my legacy.",action:"Live today as if your life is a legacy. What would you want remembered about you?",prayer:"Lord, help me to be faithful. Let my legacy be a life lived for You."},
      {n:30,title:"The Practice Continues",ref:"Revelation 22:20",verseText:"He which testifieth these things saith, Surely I come quickly. Amen. Even so, come, Lord Jesus.",father:"Abba Anthony",fatherQuote:"The watchman's work is never finished. But he rests in the One who is coming. Excellence is not a destination. It is a direction.",reflection:"Thirty days of practice, struggle, and excellence. But the journey continues. Excellence is a direction, not a destination.",antirrhetic:"I have practiced. I have struggled. I have become. And I will continue.",action:"Rest today. Let the practice of thirty days settle into your soul. Tomorrow, begin again.",prayer:"Lord, help me to continue practicing, continue struggling, continue becoming. Come, Lord Jesus."},
    ],
  },
];

const EXAMEN_PROMPTS=[
  "Where did I sense God today — and where did I miss Him?",
  "When did I feel most alive today? When most drained?",
  "Where was I cowardly when courage was required?",
  "What am I grateful for? What do I need to confess?",
  "Who did I serve well today? Who did I neglect?",
  "What unfinished business do I need to bring to God before sleep?",
  "Where has pride shown up today? Where has grace?",
  "What one thing would make tomorrow better if I did it?",
];

const CONFESS_PROMPTS=[
  "Where have I been cowardly this week when courage was required?",
  "What am I hiding from the men closest to me?",
  "Where has pride blinded me to my own failures?",
  "Who have I failed to protect, provide for, or lead?",
  "What sin do I keep returning to, and what lie is feeding it?",
  "Where am I performing faith rather than living it?",
  "What would change if I truly believed God sees everything?",
  "Who have I wronged and not yet asked forgiveness from?",
];

const DEFAULT_CKQ=[
  "Did you spend time in Scripture every day?",
  "Were you faithful to this month's challenge?",
  "Where did you struggle — and did you seek help?",
  "Did you lead your family or household well this week?",
  "Are you walking in any unconfessed sin right now?",
  "Did you pray for your brothers by name this week?",
];

const VERSES_BY_MONTH={
  0:["John 1:1","John 1:4","Isaiah 60:1","Matthew 5:14","Psalm 27:1","John 8:12","Ephesians 5:8","1 John 1:5","Psalm 119:105","Matthew 4:16","John 12:46","2 Cor 4:6","Proverbs 4:18","Romans 13:12","1 Peter 2:9","Psalm 36:9","Isaiah 9:2","Matthew 5:16","Micah 7:8","Psalm 43:3","Acts 26:18","Isaiah 2:5","Ephesians 1:18","2 Sam 22:29","John 1:14","Col 1:12","Luke 1:79","Isaiah 58:10","Rev 21:23","John 3:21","Romans 15:13"],
  1:["Matthew 6:6","Joel 2:12","Isaiah 58:6","Psalm 51:17","Matthew 6:17","Daniel 9:3","Ezra 8:23","Acts 13:3","Luke 4:2","Neh 1:4","Isaiah 58:8","2 Chr 20:3","Luke 2:37","Acts 14:23","Matthew 6:33","Romans 8:26","Psalm 42:1","Lam 3:40","James 4:8","Hosea 6:3","Psalm 63:1","Phil 4:6","Isaiah 55:6","Psalm 34:8","Matthew 5:6","Hebrews 11:6","Isaiah 55:7","Zech 8:19"],
  2:["Matthew 4:4","Psalm 22:1","Isaiah 53:3","Luke 9:23","Romans 6:6","2 Cor 12:9","Hebrews 4:15","Psalm 51:1","Lam 3:22","Isaiah 40:31","Matthew 6:13","James 1:3","1 Peter 5:8","Psalm 46:1","Romans 5:8","Hebrews 12:2","Phil 3:10","Psalm 34:18","Isaiah 43:2","Gal 2:20","Romans 8:18","2 Tim 2:3","Psalm 25:5","1 Cor 10:13","Matthew 26:41","John 15:4","Psalm 91:1","Romans 12:2","James 4:7","Psalm 130:1","Isaiah 55:7"],
  3:["Romans 6:4","1 Cor 15:20","John 11:25","Matthew 28:6","1 Peter 1:3","Col 3:1","Romans 8:11","Acts 2:24","2 Cor 5:17","Rev 1:18","John 20:29","Romans 4:25","Eph 2:5","John 14:19","1 Cor 15:55","Romans 6:9","Hebrews 13:20","Isaiah 25:8","John 16:33","Romans 8:37","2 Tim 1:10","Acts 4:33","1 Cor 15:58","Romans 14:9","John 21:15","Phil 3:10","Luke 24:5","Romans 5:10","Col 2:12","John 3:16"],
  4:["Col 3:2","Romans 12:1","Eph 4:1","Gal 5:16","Romans 8:6","1 John 2:6","Micah 6:8","Phil 1:21","2 Cor 5:7","Col 1:10","John 10:10","Titus 2:12","Eph 5:15","Matthew 7:24","Psalm 1:1","James 1:22","John 15:8","Gal 2:20","Romans 6:13","1 Cor 6:19","2 Peter 1:5","Ezekiel 36:26","Isaiah 30:21","Psalm 37:4","Phil 3:14","1 John 3:2","Hebrews 10:24","Romans 14:8","Col 3:17","Phil 4:11","1 Peter 4:2"],
  5:["Prov 27:17","Proverbs 3:5","Proverbs 4:23","Proverbs 11:2","Proverbs 16:3","Proverbs 17:17","Proverbs 18:24","Proverbs 22:1","Proverbs 1:7","Proverbs 6:6","Proverbs 12:1","Proverbs 14:23","Proverbs 15:1","Proverbs 20:7","Proverbs 21:5","Proverbs 24:16","Proverbs 27:1","Proverbs 28:1","Proverbs 29:11","Proverbs 31:8","Eccl 4:9","Col 3:23","Proverbs 10:9","Proverbs 13:20","Proverbs 16:9","Proverbs 19:21","Phil 4:13","1 Cor 15:58","Proverbs 22:6","Proverbs 25:11"],
  6:["1 Sam 13:14","Psalm 23:1","Psalm 46:10","Matthew 11:28","Isaiah 30:15","Psalm 62:1","1 Kings 19:12","Hebrews 4:9","Psalm 37:7","Zeph 3:17","Joshua 1:9","2 Sam 7:18","1 Sam 17:45","Psalm 18:2","Isaiah 40:29","Romans 8:31","Neh 8:10","Psalm 3:3","Psalm 20:7","Isaiah 41:10","Judges 6:12","Eph 6:10","Psalm 18:32","Psalm 28:7","2 Chr 14:11","Deut 20:4","Psalm 144:1","Isaiah 40:28","Psalm 91:15","2 Cor 10:4","Psalm 62:6"],
  7:["James 5:16","James 1:2","James 1:19","James 1:22","James 2:17","James 3:17","James 4:7","James 4:10","James 5:13","Prov 27:17","Eccl 4:10","Gal 6:2","Hebrews 10:24","1 Thess 5:11","Proverbs 17:17","John 15:13","1 John 3:16","Col 3:13","Romans 12:10","Acts 2:42","1 Cor 13:7","Eph 4:32","Phil 2:3","1 Peter 1:22","Matthew 18:20","Romans 15:1","Phil 2:2","Romans 14:19","James 2:8","1 John 4:11","James 1:27"],
  8:["Gen 2:15","Psalm 24:1","Luke 16:10","Matthew 25:21","1 Cor 4:2","Deut 8:18","Col 3:23","Genesis 1:28","Proverbs 3:9","2 Cor 9:7","Luke 12:48","Romans 12:6","Eph 2:10","Psalm 90:12","1 Peter 4:10","Matthew 5:13","1 Tim 6:17","Malachi 3:10","Acts 20:35","Proverbs 13:22","Isaiah 58:7","Phil 4:19","Proverbs 22:9","Romans 8:32","Matthew 6:24","Haggai 2:8","Luke 21:4","Proverbs 11:24","Eccl 5:10","Matthew 19:21"],
  9:["Romans 1:17","Eph 2:8","Romans 3:24","Gal 3:11","Romans 5:1","Hebrews 11:1","John 6:29","Phil 3:9","Titus 3:5","Romans 4:5","2 Cor 5:21","Gal 2:16","Romans 8:1","Isaiah 61:10","John 5:24","Acts 13:38","Romans 3:28","2 Tim 1:9","1 Cor 1:30","Col 2:14","Romans 10:9","Isaiah 53:5","John 3:16","Romans 5:6","Hebrews 7:25","1 Peter 3:18","John 1:12","Romans 8:38","Gal 5:1","Jer 23:6","Rev 3:20"],
  10:["Heb 12:1","Hebrews 11:1","Rev 14:13","Psalm 116:15","2 Tim 4:7","Phil 1:21","John 14:2","Psalm 23:6","Romans 8:38","Job 19:25","1 Cor 15:42","Isaiah 25:8","Rev 21:4","Psalm 90:12","Luke 20:38","2 Cor 5:1","Col 3:4","Romans 14:8","Phil 3:20","Titus 2:13","James 4:14","Isaiah 40:8","Psalm 103:15","John 11:25","1 Thess 4:13","Hebrews 9:27","1 John 3:2","Romans 6:23","Psalm 90:10","Hebrews 11:13"],
  11:["Isaiah 9:6","Luke 1:35","Isaiah 7:14","Micah 5:2","Luke 1:46","Isaiah 40:3","Romans 13:12","Luke 2:11","Isaiah 11:1","Luke 1:78","Matthew 1:23","John 1:14","Gal 4:4","Isaiah 60:1","Luke 2:14","Phil 4:5","Rev 22:20","Romans 15:13","Isaiah 25:9","Luke 1:68","Matthew 2:10","Titus 2:13","1 John 4:9","Isaiah 35:4","Hebrews 1:3","Luke 4:18","2 Cor 9:15","Col 1:27","John 3:17","Isaiah 53:6","John 3:16"],
};

const VERSE_TEXT={
  "John 1:4–5":"In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.",
  "Matt 6:17–18":"But when you fast, put oil on your head and wash your face, so that it will not be obvious to others that you are fasting, but only to your Father, who sees what is done in secret.",
  "Matthew 4:1":"Then Jesus was led by the Spirit into the wilderness to be tempted by the devil.",
  "Romans 6:4":"We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life.",
  "Col 3:1":"Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God.",
  "Prov 27:17":"As iron sharpens iron, so one person sharpens another.",
  "1 Sam 13:14":"The Lord has sought out a man after his own heart and appointed him ruler of his people.",
  "James 5:16":"Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.",
  "Gen 2:15":"The Lord God took the man and put him in the Garden of Eden to work it and take care of it.",
  "Romans 1:17":"For in the gospel the righteousness of God is revealed — a righteousness that is by faith from first to last, just as it is written: The righteous will live by faith.",
  "Heb 12:1":"Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.",
  "Isaiah 9:6":"For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
  "Psalm 23:1":"The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
  "Psalm 46:10":"He says, Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
  "Matthew 11:28":"Come to me, all you who are weary and burdened, and I will give you rest.",
  "Joshua 1:9":"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
  "Isaiah 41:10":"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
  "Romans 8:38":"For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.",
  "John 3:16":"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  "Isaiah 40:31":"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
  "Psalm 27:1":"The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?",
  "Gal 2:20":"I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.",
  "Micah 6:8":"He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.",
  "John 15:13":"Greater love has no one than this: to lay down one's life for one's friends.",
  "Hebrews 11:1":"Now faith is confidence in what we hope for and assurance about what we do not see.",
  "Proverbs 4:23":"Above all else, guard your heart, for everything you do flows from it.",
  "Proverbs 3:5":"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
  "Lam 3:22":"Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
  "Psalm 51:1":"Have mercy on me, O God, according to your unfailing love; according to your great compassion blot out my transgressions.",
  "Neh 8:10":"Do not grieve, for the joy of the Lord is your strength.",
  // Reading plan verses
  "Proverbs 4:20–27":"My son, pay attention to what I say; turn your ear to my words. Do not let them out of your sight, keep them within your heart; for they are life to those who find them and health to one's whole body. Above all else, guard your heart, for everything you do flows from it.",
  "Matthew 15:18–19":"But the things that come out of a person's mouth come from the heart, and these defile them. For out of the heart come evil thoughts — murder, adultery, sexual immorality, theft, false testimony, slander.",
  "Psalm 139:23–24":"Search me, God, and know my heart; test me and know my anxious thoughts. See if there is any offensive way in me, and lead me in the way everlasting.",
  "James 1:13–15":"When tempted, no one should say, God is tempting me. For God cannot be tempted by evil, nor does he tempt anyone; but each person is tempted when they are dragged away by their own evil desire and enticed. Then, after desire has conceived, it gives birth to sin; and sin, when it is full-grown, gives birth to death.",
  "Galatians 5:16–24":"So I say, walk by the Spirit, and you will not gratify the desires of the flesh. For the flesh desires what is contrary to the Spirit, and the Spirit what is contrary to the flesh. They are in conflict with each other, so that you are not to do whatever you want. But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
  "Psalm 51:1–12":"Have mercy on me, O God, according to your unfailing love; according to your great compassion blot out my transgressions. Wash away all my iniquity and cleanse me from my sin. For I know my transgressions, and my sin is always before me. Against you, you only, have I sinned and done what is evil in your sight.",
  "2 Timothy 1:6–7":"For this reason I remind you to fan into flame the gift of God, which is in you through the laying on of my hands. For God did not give us a spirit of timidity, but a spirit of power, of love and of self-discipline.",
  "2 Timothy 1:8–9":"So do not be ashamed of the testimony about our Lord or of me his prisoner. Rather, join with me in suffering for the gospel, by the power of God, who has saved us and called us to a holy life.",
  "2 Timothy 1:10–12":"But it has now been revealed through the appearing of our Savior, Christ Jesus, who has destroyed death and has brought life and immortality to light through the gospel. That is why I am suffering as I am. Yet this is no cause for shame, because I know whom I have believed, and am convinced that he is able to guard what I have entrusted to him until that day.",
  "2 Timothy 1:13–14":"What you heard from me, keep as the pattern of sound teaching, with faith and love in Christ Jesus. Guard the good deposit that was entrusted to you — guard it with the help of the Holy Spirit who lives in us.",
  "Ephesians 4:1–6":"As a prisoner for the Lord, then, I urge you to live a life worthy of the calling you have received. Be completely humble and gentle; be patient, bearing with one another in love. Make every effort to keep the unity of the Spirit through the bond of peace.",
  "Ephesians 6:10–18":"Finally, be strong in the Lord and in his mighty power. Put on the full armor of God, so that you can take your stand against the devil's schemes. For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world.",
  "Hebrews 12:1–3":"Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us, fixing our eyes on Jesus, the pioneer and perfecter of faith.",
  "1 Peter 3:8–12":"Finally, all of you, be like-minded, be sympathetic, love one another, be compassionate and humble. Do not repay evil with evil or insult with insult. On the contrary, repay evil with blessing, because to this you were called so that you may inherit a blessing.",
  "Hebrews 10:19–23":"Therefore, brothers and sisters, since we have confidence to enter the Most Holy Place by the blood of Jesus, by a new and living way opened for us through the curtain, that is, his body, and since we have a great priest over the house of God, let us draw near to God with a sincere heart and with the full assurance that faith brings.",
  "Psalm 10:17–18":"You, Lord, hear the desire of the afflicted; you encourage them, and you listen to their cry, defending the fatherless and the oppressed, so that mere earthly mortals will never again strike terror.",
  // David study
  "1 Samuel 13:14":"But now your kingdom will not endure; the Lord has sought out a man after his own heart and appointed him ruler of his people, because you have not kept the Lord's command.",
  "1 Samuel 16:7":"But the Lord said to Samuel, Do not consider his appearance or his height, for I have rejected him. The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.",
  "1 Samuel 17:32–50":"David said to the Philistine, You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty, the God of the armies of Israel, whom you have defied. This day the Lord will deliver you into my hands.",
  "Psalm 63:1–8":"You, God, are my God, earnestly I seek you; I thirst for you, my whole being longs for you, in a dry and parched land where there is no water. I have seen you in the sanctuary and beheld your power and your glory.",
  "Acts 13:22":"After removing Saul, he made David their king. God testified concerning him: I have found David son of Jesse, a man after my own heart; he will do everything I want him to do.",
  // Sermon on the Mount
  "Matthew 5:1–12":"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they will be comforted. Blessed are the meek, for they will inherit the earth. Blessed are those who hunger and thirst for righteousness, for they will be filled.",
  "Matthew 5:13–20":"You are the salt of the earth. But if the salt loses its saltiness, how can it be made salty again? It is no longer good for anything, except to be thrown out and trampled underfoot. You are the light of the world. A town built on a hill cannot be hidden.",
  "Matthew 6:1–18":"Be careful not to practice your righteousness in front of others to be seen by them. If you do, you will have no reward from your Father in heaven.",
  "Matthew 6:19–34":"Do not store up for yourselves treasures on earth, where moths and vermin destroy. But store up for yourselves treasures in heaven. For where your treasure is, there your heart will be also.",
  "Matthew 7:24–27":"Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock. The rain came down, the streams rose, and the winds blew and beat against that house; yet it did not fall, because it had its foundation on the rock.",
  // Paul study
  "Acts 9:1–22":"Meanwhile, Saul was still breathing out murderous threats against the Lord's disciples. As he neared Damascus on his journey, suddenly a light from heaven flashed around him. He fell to the ground and heard a voice say to him, Saul, Saul, why do you persecute me?",
  "Philippians 3:4–14":"But whatever were gains to me I now consider loss for the sake of Christ. What is more, I consider everything a loss because of the surpassing worth of knowing Christ Jesus my Lord, for whose sake I have lost all things.",
  "Philippians 4:10–13":"I have learned to be content whatever the circumstances. I know what it is to be in need, and I know what it is to have plenty. I have learned the secret of being content in any and every situation. I can do all this through him who gives me strength.",
  "2 Timothy 4:6–8":"For I am already being poured out like a drink offering, and the time for my departure is near. I have fought the good fight, I have finished the race, I have kept the faith.",
  "Romans 7:15–8:2":"I do not understand what I do. For what I want to do I do not do, but what I hate I do. Therefore, there is now no condemnation for those who are in Christ Jesus.",
  // Nehemiah study
  "Nehemiah 1:1–11":"When I heard these things, I sat down and wept. For some days I mourned and fasted and prayed before the God of heaven.",
  "Nehemiah 2:1–8":"The king said to me, What is it you want? Then I prayed to the God of heaven, and I answered the king.",
  "Nehemiah 4:1–23":"Those who carried materials did their work with one hand and held a weapon in the other.",
  "Nehemiah 6:1–16":"I am carrying on a great project and cannot go down. Why should the work stop while I leave it and go down to you?",
  "Nehemiah 8:1–12":"Do not grieve, for the joy of the Lord is your strength.",
  // Unseen Warfare 2
  "1 Peter 5:8–11":"Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith.",
  "James 4:1–10":"What causes fights and quarrels among you? Don't they come from your desires that battle within you? Submit yourselves, then, to God. Resist the devil, and he will flee from you.",
  "2 Corinthians 10:3–5":"For though we live in the world, we do not wage war as the world does. The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds.",
  "Revelation 12:10–11":"They triumphed over him by the blood of the Lamb and by the word of their testimony; they did not love their lives so much as to shrink from death.",

};

const currentWeekIdx=()=>{
  const now=new Date(),start=new Date(now.getFullYear(),0,1);
  return Math.floor((now.getTime()-start.getTime())/(7*24*60*60*1000))%WEEKLY_READINGS.length;
};

const daysSinceLastVisit=()=>{
  const last=LS.get("lastVisit",null);
  if(!last) return 999;
  const diff=(Date.now()-new Date(last).getTime())/(1000*60*60*24);
  return Math.floor(diff);
};


// ── ONBOARDING ────────────────────────────────────────────────
function Onboarding({onComplete}){
  const [seasons,setSeasons]=useState([]);
  const [needs,setNeeds]=useState([]);
  const [prayers,setPrayers]=useState([]);
  const [pIdx,setPIdx]=useState(0);
  const [phase,setPhase]=useState("intake");
  const [entering,setEntering]=useState(false);

  const toggle=(arr,set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
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
function ReturnScreen({days, onContinue, A}){
  const [seasons,setSeasons]=useState([]);
  const [needs,setNeeds]=useState([]);
  const [phase,setPhase]=useState("welcome");
  const [prayer,setPrayer]=useState(null);
  const toggle=(arr,set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
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

const LITURGICAL_STYLE = {
  advent:     { a:"#7A8CB0", icon:"☽", bg:"linear-gradient(135deg, #1a2436 0%, #0B0B09 70%)", tagline:"A season of waiting. The night watch before dawn." },
  lent:       { a:"#7A6EA8", icon:"✠", bg:"linear-gradient(135deg, #221a36 0%, #0B0B09 70%)", tagline:"A season of stripping away. The desert, again." },
  eastertide: { a:"#6A9E78", icon:"☩", bg:"linear-gradient(135deg, #16281c 0%, #0B0B09 70%)", tagline:"The tomb is empty. Fifty days to live like it." },
};

function SeasonalHero({ C, sr, sn, onEnterSeason }){
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



function IconRule({size=22, color="#C8A86B"}){
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

function IconWay({size=22, color="#C8A86B"}){
  // A worn path with a rising star — the way, the pilgrim's road
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M8 40C14 34 16 28 14 22C12 16 16 10 24 10C32 10 36 16 34 22C32 28 34 34 40 40" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M24 4L25.6 9.2L31 9.2L26.8 12.4L28.4 17.6L24 14.4L19.6 17.6L21.2 12.4L17 9.2L22.4 9.2Z" fill={color}/>
      <path d="M8 40H40" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

function IconPrayer({size=22, color="#C8A86B"}){
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

function IconBrothers({size=22, color="#C8A86B"}){
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
function NoondayMode({A, onDismiss}){
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

function StudyViewer({study, onBack, A, C, sr, sn}){
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

function DayRow({d, i, isT, dk, done, onMark, A, VERSE_TEXT, sr, sn, C, weekPlan}){
  const [expanded, setExpanded] = useState(isT);
  const verseText = VERSE_TEXT[d.ref] || null;
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
const PROMISES = [
  {
    category: "Salvation & Eternal Life",
    icon: "☩",
    verses: [
      {ref:"John 3:16",      text:"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."},
      {ref:"Acts 2:21",      text:"And everyone who calls on the name of the Lord will be saved."},
      {ref:"Romans 10:9",    text:"If you declare with your mouth, Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved."},
      {ref:"John 5:24",      text:"Whoever hears my word and believes him who sent me has eternal life and will not be judged but has crossed over from death to life."},
      {ref:"Ephesians 2:8–9",text:"For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast."},
      {ref:"1 John 5:11–13", text:"God has given us eternal life, and this life is in his Son. Whoever has the Son has life; whoever does not have the Son of God does not have life."},
      {ref:"John 10:28",     text:"I give them eternal life, and they shall never perish; no one will snatch them out of my hand."},
      {ref:"Romans 6:23",    text:"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord."},
    ]
  },
  {
    category: "Forgiveness & Cleansing",
    icon: "✠",
    verses: [
      {ref:"1 John 1:9",      text:"If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness."},
      {ref:"Psalm 103:12",    text:"As far as the east is from the west, so far has he removed our transgressions from us."},
      {ref:"Isaiah 1:18",     text:"Though your sins are like scarlet, they shall be as white as snow; though they are red as crimson, they shall be like wool."},
      {ref:"Micah 7:18–19",   text:"You will again have compassion on us; you will tread our sins underfoot and hurl all our iniquities into the depths of the sea."},
      {ref:"Jeremiah 31:34",  text:"I will forgive their wickedness and will remember their sins no more."},
      {ref:"Ephesians 1:7",   text:"In him we have redemption through his blood, the forgiveness of sins, in accordance with the riches of God's grace."},
      {ref:"Colossians 2:13–14",text:"God made you alive with Christ. He forgave us all our sins, having canceled the charge of our legal indebtedness, which stood against us."},
    ]
  },
  {
    category: "Peace & Rest",
    icon: "☽",
    verses: [
      {ref:"John 14:27",          text:"Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid."},
      {ref:"Philippians 4:6–7",   text:"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."},
      {ref:"Matthew 11:28–30",    text:"Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls."},
      {ref:"Isaiah 26:3",         text:"You will keep in perfect peace those whose minds are steadfast, because they trust in you."},
      {ref:"John 16:33",          text:"I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world."},
      {ref:"Colossians 3:15",     text:"Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful."},
    ]
  },
  {
    category: "Provision & Needs",
    icon: "⊕",
    verses: [
      {ref:"Philippians 4:19",    text:"And my God will meet all your needs according to the riches of his glory in Christ Jesus."},
      {ref:"Matthew 6:31–33",     text:"So do not worry, saying, What shall we eat? or What shall we drink? or What shall we wear? For the pagans run after all these things, and your heavenly Father knows that you need them. But seek first his kingdom and his righteousness, and all these things will be given to you as well."},
      {ref:"Psalm 23:1",          text:"The Lord is my shepherd, I lack nothing."},
      {ref:"2 Corinthians 9:8",   text:"And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work."},
      {ref:"Romans 8:32",         text:"He who did not spare his own Son, but gave him up for us all — how will he not also, along with him, graciously give us all things?"},
      {ref:"Luke 6:38",           text:"Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap."},
    ]
  },
  {
    category: "Strength & Help in Trials",
    icon: "⚔",
    verses: [
      {ref:"Isaiah 41:10",        text:"Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."},
      {ref:"2 Corinthians 12:9",  text:"But he said to me, My grace is sufficient for you, for my power is made perfect in weakness. Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me."},
      {ref:"Psalm 46:1",          text:"God is our refuge and strength, an ever-present help in trouble."},
      {ref:"Isaiah 43:2",         text:"When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze."},
      {ref:"Romans 8:28",         text:"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."},
      {ref:"1 Corinthians 10:13", text:"No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it."},
      {ref:"Exodus 14:14",        text:"The Lord will fight for you; you need only to be still."},
    ]
  },
  {
    category: "Guidance & Wisdom",
    icon: "✦",
    verses: [
      {ref:"James 1:5",           text:"If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you."},
      {ref:"Proverbs 3:5–6",      text:"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."},
      {ref:"Psalm 32:8",          text:"I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you."},
      {ref:"Isaiah 30:21",        text:"Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, This is the way; walk in it."},
      {ref:"Psalm 119:105",       text:"Your word is a lamp for my feet, a light on my path."},
      {ref:"Jeremiah 33:3",       text:"Call to me and I will answer you and tell you great and unsearchable things you do not know."},
    ]
  },
  {
    category: "Protection & Safety",
    icon: "⚒",
    verses: [
      {ref:"Psalm 91:11–12",      text:"For he will command his angels concerning you to guard you in all your ways; they will lift you up in their hands, so that you will not strike your foot against a stone."},
      {ref:"2 Thessalonians 3:3", text:"But the Lord is faithful, and he will strengthen you and protect you from the evil one."},
      {ref:"Isaiah 54:17",        text:"No weapon forged against you will prevail, and you will refute every tongue that accuses you. This is the heritage of the servants of the Lord."},
      {ref:"Psalm 34:7",          text:"The angel of the Lord encamps around those who fear him, and he delivers them."},
      {ref:"Romans 8:31",         text:"What, then, shall we say in response to these things? If God is for us, who can be against us?"},
      {ref:"Psalm 27:1",          text:"The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?"},
    ]
  },
  {
    category: "God's Presence & Faithfulness",
    icon: "◉",
    verses: [
      {ref:"Hebrews 13:5",        text:"Never will I leave you; never will I forsake you."},
      {ref:"Matthew 28:20",       text:"And surely I am with you always, to the very end of the age."},
      {ref:"Joshua 1:9",          text:"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."},
      {ref:"Lamentations 3:22–23",text:"Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."},
      {ref:"Exodus 33:14",        text:"My Presence will go with you, and I will give you rest."},
      {ref:"1 Corinthians 1:9",   text:"God is faithful, who has called you into fellowship with his Son, Jesus Christ our Lord."},
      {ref:"1 Thessalonians 5:24",text:"The one who calls you is faithful, and he will do it."},
    ]
  },
];

function ChambersApp({intakeAnswers, onOpenSettings}){
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
  <SeasonalHero C={C} sr={sr} sn={sn}
    onEnterSeason={(id)=>{ /* TODO: route into full Advent/Lent daily content once written */ setTab("way"); setYearView(true); }}
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
  <StudyViewer study={activeStudy} onBack={()=>setActiveStudy(null)} A={A} C={C} sr={sr} sn={sn}/>
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
      return <DayRow key={i} d={d} i={i} isT={isT} dk={dk} done={done} onMark={markRead} A={A} VERSE_TEXT={VERSE_TEXT} sr={sr} sn={sn} C={C} weekPlan={weekPlan}/>;
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
function NotificationSettings(){
  const [remindersOn, setRemindersOn] = usePersist("remindersOn",false);
  const [morningTime, setMorningTime] = usePersist("morningTime","07:00");
  const [eveningTime, setEveningTime] = usePersist("eveningTime","21:00");
  const [permStatus,  setPermStatus]  = useState(
    (typeof Notification!=="undefined") ? Notification.permission : "unsupported"
  );
  const [testSent, setTestSent] = useState(false);

  const enable = async () => {
    const res = await requestNotifyPermission();
    setPermStatus(res);
    if(res==="granted") setRemindersOn(true);
  };

  const sendTest = () => {
    const ok = fireNotification("Chambers","This is a test — your reminders are working.");
    setTestSent(ok);
    setTimeout(()=>setTestSent(false),2500);
  };

  if(permStatus==="unsupported") return (
    <div style={{padding:"13px 14px",border:"1px solid #242420",background:"#131311",color:"#9A9080",fontSize:"12px",lineHeight:1.7}}>
      Notifications aren't supported in this browser. Try Chrome or Safari on your device, or add Chambers to your home screen first.
    </div>
  );

  return (
    <div>
      {permStatus!=="granted" && (
        <button onClick={enable} style={{width:"100%",padding:"13px",background:"#C8A86B14",border:"1px solid #C8A86B40",color:"#C8A86B",cursor:"pointer",fontFamily:"'Futura','Century Gothic',sans-serif",fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",marginBottom:"12px"}}>
          🔔  Enable Reminders
        </button>
      )}
      {permStatus==="denied" && (
        <div style={{padding:"11px 13px",border:"1px solid #9E6A6A40",background:"#9E6A6A10",color:"#E8AAAA",fontSize:"11px",lineHeight:1.6,marginBottom:"12px"}}>
          Notifications are blocked for this site. Enable them in your browser's site settings, then reload.
        </div>
      )}
      {permStatus==="granted" && (
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"#131311",border:"1px solid #242420",marginBottom:"12px"}}>
            <div>
              <div style={{fontFamily:"'Palatino Linotype',serif",fontSize:"14px",color:"#F2EDE0"}}>Reminders Active</div>
              <div style={{fontFamily:"'Futura',sans-serif",fontSize:"8px",color:"#9A9080",marginTop:"2px"}}>Permission granted ✓</div>
            </div>
            <button onClick={()=>setRemindersOn(r=>!r)} style={{width:"44px",height:"24px",borderRadius:"12px",border:"1px solid "+(remindersOn?"#C8A86B":"#242420"),background:remindersOn?"#C8A86B30":"#191917",position:"relative",cursor:"pointer"}}>
              <div style={{position:"absolute",top:"2px",left:remindersOn?"22px":"2px",width:"18px",height:"18px",borderRadius:"50%",background:remindersOn?"#C8A86B":"#9A9080",transition:"left 0.2s"}}/>
            </button>
          </div>

          {remindersOn && (
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",background:"#131311",border:"1px solid #242420"}}>
                <span style={{fontFamily:"'Futura',sans-serif",fontSize:"9px",color:"#9A9080",letterSpacing:"1px",textTransform:"uppercase"}}>✦ Morning Prayer</span>
                <input type="time" value={morningTime} onChange={e=>setMorningTime(e.target.value)} style={{background:"#191917",border:"1px solid #2E2E28",color:"#F2EDE0",padding:"6px 9px",fontFamily:"'Futura',sans-serif",fontSize:"13px",outline:"none"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",background:"#131311",border:"1px solid #242420"}}>
                <span style={{fontFamily:"'Futura',sans-serif",fontSize:"9px",color:"#9A9080",letterSpacing:"1px",textTransform:"uppercase"}}>◉ Evening Examen</span>
                <input type="time" value={eveningTime} onChange={e=>setEveningTime(e.target.value)} style={{background:"#191917",border:"1px solid #2E2E28",color:"#F2EDE0",padding:"6px 9px",fontFamily:"'Futura',sans-serif",fontSize:"13px",outline:"none"}}/>
              </div>
            </div>
          )}

          <button onClick={sendTest} style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid #242420",color:"#9A9080",cursor:"pointer",fontFamily:"'Futura',sans-serif",fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase"}}>
            {testSent?"✓ Sent — check your notifications":"Send Test Notification"}
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsScreen({onBack, onInstall}){
  const [confirmed,setConfirmed]=useState(false);
  const [exported,setExported]=useState(false);
  const [myName,setMyName]=usePersist("myName","Me");
  const [draft,setDraft]=useState(myName);

  const exportData=()=>{
    const keys=["ruleDone","dayChecked","readDates","verseChecked","chalDone","prayerLog","brothers","checkinQs","journal","journalEntries","ruleHistory","monthNotes","pastors","selMonth","cellPosts","myName","hasVisited","lastVisit"];
    const data={_uid:UID,_exported:new Date().toISOString()};
    keys.forEach(k=>{const v=LS.get(k,null);if(v!==null)data[k]=v;});
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`chambers-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();URL.revokeObjectURL(url);
    setExported(true);setTimeout(()=>setExported(false),3000);
  };

  const importData=()=>{
    const input=document.createElement("input");
    input.type="file";input.accept=".json";
    input.onchange=e=>{
      const file=(e.target as HTMLInputElement).files?.[0];
      if(!file) return;
      const reader=new FileReader();
      reader.onload=ev=>{
        try{
          const data=JSON.parse((ev.target as FileReader).result as string);
          Object.entries(data).forEach(([k,v])=>LS.set(k,v));
          window.location.reload();
        }catch{console.error("Invalid backup file.");}
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const resetData=()=>{
    if(confirmed){LS.clear();window.location.reload();}
    else{setConfirmed(true);setTimeout(()=>setConfirmed(false),4000);}
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.sand,...sr,padding:"28px 20px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:C.dim,...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"24px",padding:0}}>← Back</button>
      <h1 style={{...sr,fontSize:"22px",fontWeight:"normal",color:C.cream,margin:"0 0 24px"}}>Settings</h1>

      <div style={{marginBottom:"28px"}}>
        <Lbl color={C.dim}>Your Name</Lbl>
        <div style={{display:"flex",gap:"8px"}}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} style={{flex:1,background:C.surface,border:`1px solid ${C.hi}`,padding:"9px 12px",color:C.cream,fontSize:"14px",...sr,outline:"none"}}/>
          <button onClick={()=>setMyName(draft)} style={{background:`${C.gold}18`,border:`1px solid ${C.gold}50`,color:C.gold,padding:"9px 16px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase"}}>Save</button>
        </div>
        <div style={{...sn,fontSize:"9px",color:C.dim,marginTop:"6px",lineHeight:1.6}}>Used when you post to the Cell.</div>
      </div>

      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"22px",marginBottom:"28px"}}>
        <Lbl color={C.dim}>Data</Lbl>
        <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 16px"}}>Your prayer log, journal, and brothers are stored only on this device. Export regularly to keep a backup.</p>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <button onClick={exportData} style={{width:"100%",padding:"13px",background:`${C.gold}14`,border:`1px solid ${C.gold}40`,color:C.gold,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase"}}>
            {exported?"✓ Exported":"⊕  Export Data (JSON)"}
          </button>
          <button onClick={importData} style={{width:"100%",padding:"12px",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase"}}>
            ᚱ  Restore from Backup
          </button>
        </div>
      </div>

      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"22px"}}>
        <Lbl color={C.dim}>New Season</Lbl>
        <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 16px"}}>Begin again. All data will be cleared. This cannot be undone.</p>
        <div style={{borderLeft:`2px solid ${C.red}40`,paddingLeft:"13px",marginBottom:"14px"}}>
          <div style={{...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",color:`${C.red}80`,marginBottom:"5px"}}>Lamentations 3:22–23</div>
          <p style={{...sr,fontSize:"13px",fontStyle:"italic",color:C.sand,opacity:0.75,margin:0,lineHeight:1.75}}>"His compassions never fail. They are new every morning; great is your faithfulness."</p>
        </div>
        <button onClick={resetData} style={{width:"100%",padding:"13px",background:confirmed?`${C.red}20`:"transparent",border:`1px solid ${confirmed?C.red+"60":C.border}`,color:confirmed?"#E8AAAA":C.dim,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",transition:"all 0.3s"}}>
          {confirmed?"Tap Again to Confirm — This Cannot Be Undone":"✠  Begin a New Season"}
        </button>
      </div>

      <div style={{marginTop:"28px",borderTop:`1px solid ${C.border}`,paddingTop:"22px"}}>
        <Lbl color={C.dim}>Daily Reminders</Lbl>
        <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 14px",opacity:0.8}}>
          Local reminders for Morning Prayer and Evening Examen. These fire while Chambers is open in a tab — true background push (waking a closed app) requires a server, which this version does not yet have. Keep a tab open, or reopen daily for now.
        </p>
        <NotificationSettings/>
      </div>

      <div style={{marginTop:"28px",borderTop:`1px solid ${C.border}`,paddingTop:"22px"}}>
        <Lbl color={C.dim}>Install on Your Phone</Lbl>
        <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 14px",opacity:0.8}}>Add Chambers to your home screen so it opens like a native app — no browser bar, no App Store required.</p>
        <button onClick={onInstall} style={{width:"100%",padding:"13px",background:`${C.gold}14`,border:`1px solid ${C.gold}40`,color:C.gold,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",marginBottom:"8px"}}>
          ⌂  Add to Home Screen →
        </button>
      </div>

      <div style={{marginTop:"20px",padding:"14px",border:`1px solid ${C.border}`,background:C.surface}}>
        <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:C.dim,marginBottom:"6px"}}>About Chambers</div>
        <p style={{fontSize:"12px",color:C.dim,lineHeight:1.7,margin:0}}>A cell for men to fight the noonday demon.<br/>Built for the long obedience in the same direction.</p>
      </div>
    </div>
  );
}

// ── INSTALL GUIDE SCREEN ──────────────────────────────────────
function InstallGuide({onBack}){
  const [platform,setPlatform]=useState(null);
  const gold="#C8A86B";
  const sr={fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',Georgia,serif"};
  const sn={fontFamily:"'Futura','Century Gothic','Trebuchet MS',Arial,sans-serif"};

  const steps={
    iphone:[
      {n:"1",icon:"🌐",title:"Open Safari",body:"This must be Safari — not Chrome or another browser. Safari is the only browser on iPhone that supports Add to Home Screen."},
      {n:"2",icon:"🔗",title:"Go to the Chambers URL",body:"Type or paste your Chambers Vercel URL into the address bar. Example: chambers-yourname.vercel.app"},
      {n:"3",icon:"⬆",title:"Tap the Share Button",body:"At the bottom of Safari, tap the Share button — the square with an arrow pointing upward."},
      {n:"4",icon:"➕",title:"Tap 'Add to Home Screen'",body:"Scroll down in the share sheet until you see 'Add to Home Screen.' Tap it."},
      {n:"5",icon:"⌂",title:"Name it 'Chambers'",body:"The name field will pre-fill. Make sure it says Chambers. Then tap Add in the top right corner."},
      {n:"6",icon:"✦",title:"Find it on your Home Screen",body:"Chambers now appears on your iPhone home screen as a full-screen app. No browser bar. No distractions. Tap to enter."},
    ],
    android:[
      {n:"1",icon:"🌐",title:"Open Chrome",body:"Open Google Chrome on your Android device. Other browsers may work but Chrome is most reliable for this feature."},
      {n:"2",icon:"🔗",title:"Go to the Chambers URL",body:"Type or paste your Chambers Vercel URL into the address bar. Example: chambers-yourname.vercel.app"},
      {n:"3",icon:"⋮",title:"Tap the Three-Dot Menu",body:"In the top right corner of Chrome, tap the three vertical dots to open the menu."},
      {n:"4",icon:"➕",title:"Tap 'Add to Home Screen'",body:"Find and tap 'Add to Home Screen' in the menu. Chrome may also show a banner at the bottom — you can tap that instead."},
      {n:"5",icon:"⌂",title:"Name it 'Chambers' and Add",body:"Confirm the name is Chambers. Tap Add. Android may ask if you want to Add automatically or Add to Home Screen — choose Add to Home Screen."},
      {n:"6",icon:"✦",title:"Find it on your Home Screen",body:"Chambers appears on your Android home screen. Tap it to open full-screen, like a native app."},
    ],
  };

  return(
    <div style={{minHeight:"100vh",background:"#0B0B09",color:"#E8DEC8",...sr,padding:"0 0 40px"}}>
      <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${gold},transparent)`}}/>
      <div style={{padding:"24px 20px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#9A9080",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"24px",padding:0}}>← Back</button>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"36px",marginBottom:"10px"}}>⌂</div>
          <h1 style={{...sr,fontSize:"22px",fontWeight:"normal",color:"#F2EDE0",margin:"0 0 8px"}}>Add Chambers to Your Phone</h1>
          <p style={{...sn,fontSize:"9px",color:"#9A9080",letterSpacing:"2px",textTransform:"uppercase",margin:0}}>Install as a Home Screen App — Free, No App Store</p>
        </div>

        {/* What this does */}
        <div style={{padding:"16px",background:"#131311",border:`1px solid ${gold}30`,marginBottom:"24px"}}>
          <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:gold,marginBottom:"8px"}}>What This Does</div>
          <p style={{fontSize:"13px",color:"#E8DEC8",lineHeight:1.82,margin:"0 0 10px",opacity:0.9}}>
            Once installed, Chambers opens full-screen from your home screen like any native app. No browser bar. No address field. Just the app.
          </p>
          <p style={{fontSize:"13px",color:"#9A9080",lineHeight:1.78,margin:0}}>
            It works offline. Your data stays on your device. Nothing is tracked. This is your cell — private, fast, always ready.
          </p>
        </div>

        {/* Platform select */}
        {!platform&&(
          <div>
            <div style={{...sn,fontSize:"7px",letterSpacing:"5px",textTransform:"uppercase",color:"#9A9080",marginBottom:"12px",textAlign:"center"}}>Choose Your Device</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <button onClick={()=>setPlatform("iphone")} style={{width:"100%",padding:"18px 20px",background:"#131311",border:`1px solid ${gold}40`,cursor:"pointer",display:"flex",alignItems:"center",gap:"16px",textAlign:"left",transition:"all 0.2s"}}>
                <span style={{fontSize:"32px"}}>📱</span>
                <div>
                  <div style={{...sr,fontSize:"17px",color:"#F2EDE0",marginBottom:"3px"}}>iPhone</div>
                  <div style={{...sn,fontSize:"9px",color:"#9A9080",letterSpacing:"1px"}}>iOS — using Safari</div>
                </div>
                <span style={{marginLeft:"auto",color:gold,fontSize:"18px"}}>›</span>
              </button>
              <button onClick={()=>setPlatform("android")} style={{width:"100%",padding:"18px 20px",background:"#131311",border:`1px solid ${gold}40`,cursor:"pointer",display:"flex",alignItems:"center",gap:"16px",textAlign:"left",transition:"all 0.2s"}}>
                <span style={{fontSize:"32px"}}>📱</span>
                <div>
                  <div style={{...sr,fontSize:"17px",color:"#F2EDE0",marginBottom:"3px"}}>Android</div>
                  <div style={{...sn,fontSize:"9px",color:"#9A9080",letterSpacing:"1px"}}>Android — using Chrome</div>
                </div>
                <span style={{marginLeft:"auto",color:gold,fontSize:"18px"}}>›</span>
              </button>
            </div>

            {/* Vercel note */}
            <div style={{marginTop:"28px",borderTop:"1px solid #242420",paddingTop:"22px"}}>
              <div style={{...sn,fontSize:"7px",letterSpacing:"4px",textTransform:"uppercase",color:"#9A9080",marginBottom:"12px"}}>Don't Have a URL Yet?</div>
              <div style={{padding:"14px",background:"#131311",border:"1px solid #242420",marginBottom:"10px"}}>
                <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:gold,marginBottom:"8px"}}>Step 1 — Create a Free Vercel Account</div>
                <p style={{fontSize:"13px",color:"#9A9080",lineHeight:1.75,margin:0}}>Go to <span style={{color:gold}}>vercel.com</span> and sign up for free. No credit card required.</p>
              </div>
              <div style={{padding:"14px",background:"#131311",border:"1px solid #242420",marginBottom:"10px"}}>
                <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:gold,marginBottom:"8px"}}>Step 2 — Upload the App File</div>
                <p style={{fontSize:"13px",color:"#9A9080",lineHeight:1.75,margin:0}}>In Vercel, create a new project. Upload the Chambers JSX file. Vercel builds and deploys it automatically in under 60 seconds.</p>
              </div>
              <div style={{padding:"14px",background:"#131311",border:"1px solid #242420"}}>
                <div style={{...sn,fontSize:"7px",letterSpacing:"3px",textTransform:"uppercase",color:gold,marginBottom:"8px"}}>Step 3 — Copy Your URL</div>
                <p style={{fontSize:"13px",color:"#9A9080",lineHeight:1.75,margin:0}}>Vercel gives you a URL like <span style={{color:gold}}>chambers-abc123.vercel.app</span>. That is your app. Share it with your brothers. Each man adds it to his own home screen.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step-by-step guide */}
        {platform&&(
          <div>
            <button onClick={()=>setPlatform(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#9A9080",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"20px",padding:0}}>← Choose Device</button>
            <div style={{...sn,fontSize:"7px",letterSpacing:"5px",textTransform:"uppercase",color:gold,marginBottom:"16px",textAlign:"center"}}>
              {platform==="iphone"?"iPhone — Safari":"Android — Chrome"} · 6 Steps
            </div>
            {steps[platform].map((step,i)=>(
              <div key={i} style={{display:"flex",gap:"14px",marginBottom:"6px",padding:"16px",background:"#131311",border:`1px solid ${i===0?"#2E2E28":"#242420"}`}}>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                  <div style={{width:"34px",height:"34px",borderRadius:"50%",border:`1px solid ${gold}50`,background:`${gold}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>{step.icon}</div>
                  {i<steps[platform].length-1&&<div style={{width:"1px",flex:1,background:"#242420",minHeight:"20px"}}/>}
                </div>
                <div style={{flex:1,paddingTop:"2px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                    <span style={{...sn,fontSize:"7px",color:gold,letterSpacing:"2px"}}>STEP {step.n}</span>
                    <div style={{...sr,fontSize:"15px",color:"#F2EDE0"}}>{step.title}</div>
                  </div>
                  <p style={{fontSize:"13px",color:"#9A9080",lineHeight:1.8,margin:0}}>{step.body}</p>
                </div>
              </div>
            ))}

            {/* Success message */}
            <div style={{marginTop:"16px",padding:"18px",background:`${gold}12`,border:`1px solid ${gold}40`,textAlign:"center"}}>
              <div style={{fontSize:"28px",marginBottom:"8px"}}>✦</div>
              <div style={{...sr,fontSize:"16px",color:"#F2EDE0",marginBottom:"6px"}}>You're in.</div>
              <p style={{...sn,fontSize:"9px",color:"#9A9080",letterSpacing:"2px",textTransform:"uppercase",margin:"0 0 14px"}}>Chambers lives on your phone now.</p>
              <p style={{fontSize:"13px",color:"#9A9080",lineHeight:1.78,margin:0}}>Share your Vercel URL with your brothers. Every man in your cell adds it the same way. One URL. Everyone in.</p>
            </div>

            <button onClick={()=>setPlatform(null)} style={{width:"100%",marginTop:"14px",padding:"12px",background:"transparent",border:"1px solid #242420",color:"#9A9080",cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase"}}>← Back to Device Selection</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────
export default function Root(){
  const [phase,  setPhase]  = useState("loading");
  const [answers,setAnswers] = useState(null);
  const [fading, setFading]  = useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [showInstall, setShowInstall] =useState(false);

  const season=SEASONS[CAL[new Date().getMonth()].s];

  useEffect(()=>{
    const hasVisited=LS.get("hasVisited",false);
    const days=daysSinceLastVisit();
    if(!hasVisited){
      setPhase("onboarding");
    } else if(days>=3){
      setPhase("return");
    } else {
      const hour=new Date().getHours();
      if(hour>=11&&hour<15&&!LS.get("noondayDismissed_"+new Date().toDateString(),false)){
        setPhase("noonday");
      } else {
        setPhase("app");
      }
    }
  },[]);

  const handleOnboardingDone=(a)=>{
    setAnswers(a);
    LS.set("hasVisited",true);
    LS.set("lastVisit",new Date().toISOString());
    setFading(true);
    setTimeout(()=>setPhase("app"),700);
  };

  const handleReturnDone=()=>{
    LS.set("lastVisit",new Date().toISOString());
    setPhase("app");
  };

  const handleNoondayDone=()=>{
    LS.set("noondayDismissed_"+new Date().toDateString(),true);
    setPhase("app");
  };

  if(phase==="loading") return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <img src={LOGO_IMG} alt="Chambers" style={{width:"280px",height:"auto",objectFit:"contain",mixBlendMode:"lighten",filter:"brightness(1.05)"}}/>
    </div>
  );

  if(showInstall)  return <InstallGuide onBack={()=>setShowInstall(false)}/>;
  if(showSettings) return <SettingsScreen onBack={()=>setShowSettings(false)} onInstall={()=>{setShowSettings(false);setShowInstall(true);}}/>;

  if(phase==="onboarding") return(
    <div style={{opacity:fading?0:1,transition:"opacity 0.7s ease"}}>
      <Onboarding onComplete={handleOnboardingDone}/>
    </div>
  );

  if(phase==="return") return(
    <ReturnScreen days={daysSinceLastVisit()} onContinue={handleReturnDone} A={season.a}/>
  );

  if(phase==="noonday") return(
    <NoondayMode A={season.a} onDismiss={handleNoondayDone}/>
  );

  return(
    <ChambersApp
      intakeAnswers={answers||LS.get("intakeAnswers",{seasons:[],needs:[]})}
      onOpenSettings={()=>setShowSettings(true)}
    />
  );
}

