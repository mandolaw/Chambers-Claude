"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { C, sr, sn } from "@/lib/theme";
import { LS, UID, usePersist } from "@/lib/storage";
import { fireNotification, requestNotifyPermission } from "@/lib/notifications";
import { Lbl } from "@/components/atoms";

function AccountSettings(){
  const { data: session, status } = useSession();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [resendState, setResendState] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [resendMsg, setResendMsg] = useState("");

  useEffect(()=>{
    if(status!=="authenticated") return;
    fetch("/api/account").then(r=>r.ok?r.json():null).then(d=>{ if(d) setVerified(d.verified); });
  },[status]);

  if(status!=="authenticated") return (
    <div>
      <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 14px"}}>You're not signed in — your Rule and journal still work on this device, but you'll need an account to join a Cell with real brothers.</p>
      <a href="/login" style={{display:"block",textAlign:"center",padding:"12px",background:`${C.gold}14`,border:`1px solid ${C.gold}40`,color:C.gold,...sn,fontSize:"8px",letterSpacing:"4px",textTransform:"uppercase",textDecoration:"none"}}>Sign In</a>
    </div>
  );

  const resend = async () => {
    setResendState("sending"); setResendMsg("");
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = await res.json().catch(()=>({}));
    if(res.ok){ setResendState("sent"); }
    else { setResendState("error"); setResendMsg(data.error || "Could not send it."); }
  };

  return (
    <div>
      <div style={{...sr,fontSize:"14px",color:C.cream,marginBottom:"2px"}}>{session.user?.name}</div>
      <div style={{...sn,fontSize:"11px",color:C.dim,marginBottom:"10px"}}>{session.user?.email}</div>

      {verified===false && (
        <div style={{padding:"11px 13px",background:`${C.gold}10`,border:`1px solid ${C.gold}40`,marginBottom:"12px"}}>
          <div style={{...sn,fontSize:"8px",color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"6px"}}>Email not verified</div>
          <p style={{fontSize:"12px",color:C.dim,lineHeight:1.6,margin:"0 0 9px"}}>Verify to create or join a Cell.</p>
          {resendState==="sent" ? (
            <div style={{...sn,fontSize:"10px",color:C.green}}>✓ Sent — check your inbox.</div>
          ) : (
            <button onClick={resend} disabled={resendState==="sending"} style={{background:"transparent",border:`1px solid ${C.gold}50`,color:C.gold,padding:"7px 12px",cursor:"pointer",...sn,fontSize:"7px",letterSpacing:"2px",textTransform:"uppercase"}}>
              {resendState==="sending"?"Sending…":"Resend Verification Email"}
            </button>
          )}
          {resendState==="error" && <div style={{...sn,fontSize:"10px",color:"#E8AAAA",marginTop:"7px"}}>{resendMsg}</div>}
        </div>
      )}
      {verified===true && (
        <div style={{...sn,fontSize:"9px",color:C.green,letterSpacing:"1px",marginBottom:"12px"}}>✓ Email verified</div>
      )}

      <button onClick={()=>signOut({callbackUrl:"/"})} style={{width:"100%",padding:"11px",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",...sn,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase"}}>Sign Out</button>
    </div>
  );
}

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

export function SettingsScreen({onBack, onInstall}: {onBack: () => void; onInstall: () => void}){
  const [confirmed,setConfirmed]=useState(false);
  const [exported,setExported]=useState(false);

  const exportData=()=>{
    const keys=["ruleDone","dayChecked","readDates","verseChecked","chalDone","prayerLog","checkinQs","journal","journalEntries","ruleHistory","monthNotes","selMonth","hasVisited","lastVisit"];
    const data: Record<string, any> ={_uid:UID,_exported:new Date().toISOString()};
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
        <Lbl color={C.dim}>Account</Lbl>
        <AccountSettings/>
      </div>

      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"22px",marginBottom:"28px"}}>
        <Lbl color={C.dim}>Data</Lbl>
        <p style={{fontSize:"13px",color:C.dim,lineHeight:1.78,margin:"0 0 16px"}}>Your prayer log and journal are stored only on this device — export regularly to keep a backup. Your Cell (Brothers) and Contacts are saved to your account and don't need exporting.</p>
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
