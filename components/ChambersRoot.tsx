"use client";
import { useState, useEffect } from "react";
import { C, SEASONS } from "@/lib/theme";
import { LOGO_IMG } from "@/lib/images";
import { LS, daysSinceLastVisit } from "@/lib/storage";
import { CAL } from "@/data/studyPlans";
import { Onboarding } from "@/components/Onboarding";
import { ReturnScreen } from "@/components/ReturnScreen";
import { NoondayMode } from "@/components/NoondayMode";
import { SettingsScreen } from "@/components/SettingsScreen";
import { InstallGuide } from "@/components/InstallGuide";
import { ChambersApp } from "@/components/ChambersApp";

export default function Root(){
  const [phase,  setPhase]  = useState("loading");
  const [answers,setAnswers] = useState<{seasons: string[]; needs: string[]} | null>(null);
  const [fading, setFading]  = useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [showInstall, setShowInstall] =useState(false);

  const season=(SEASONS as any)[CAL[new Date().getMonth()].s];

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

  const handleOnboardingDone=(a: {seasons: string[]; needs: string[]})=>{
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
