"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { C, sr, sn } from "@/lib/theme";

function VerifiedInner() {
  const params = useSearchParams();
  const ok = params.get("ok") === "1";
  const reason = params.get("reason");

  const message = ok
    ? "Your email is verified. You can create or join a Cell now."
    : reason === "expired"
    ? "That verification link has expired. Sign in and resend one from Settings."
    : "That verification link isn't valid. Sign in and resend one from Settings.";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.sand, ...sr, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: "36px", marginBottom: "16px", color: ok ? C.green : C.gold }}>{ok ? "✦" : "✠"}</div>
      <h1 style={{ ...sr, fontSize: "20px", fontWeight: "normal", color: C.cream, margin: "0 0 12px", maxWidth: "340px" }}>{message}</h1>
      <a href="/" style={{ marginTop: "18px", display: "inline-block", padding: "12px 24px", background: `${C.gold}18`, border: `1px solid ${C.gold}55`, color: C.gold, ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", textDecoration: "none" }}>
        Enter Chambers
      </a>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={null}>
      <VerifiedInner />
    </Suspense>
  );
}
