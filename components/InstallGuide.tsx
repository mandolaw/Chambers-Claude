"use client";
import { useState } from "react";
import { sr, sn } from "@/lib/theme";

export function InstallGuide({onBack}: {onBack: () => void}){
  const [platform,setPlatform]=useState<string | null>(null);
  const gold="#C8A86B";

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
