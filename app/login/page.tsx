"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { C, sr, sn } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setError("Wrong email or password.");
    else router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.sand, ...sr, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: "320px" }}>
        <h1 style={{ ...sr, fontSize: "22px", fontWeight: "normal", color: C.cream, margin: "0 0 6px" }}>Sign In</h1>
        <p style={{ ...sn, fontSize: "10px", color: C.dim, letterSpacing: "1px", margin: "0 0 24px" }}>Enter Chambers with your account.</p>

        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "11px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "11px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", marginBottom: "14px" }} />

        {error && <div style={{ color: "#E8AAAA", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}

        <button type="submit" disabled={busy} style={{ width: "100%", padding: "13px", background: `${C.gold}18`, border: `1px solid ${C.gold}55`, color: C.gold, cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "12px" }}>
          {busy ? "Signing In…" : "Sign In"}
        </button>
        <a href="/signup" style={{ display: "block", textAlign: "center", ...sn, fontSize: "9px", color: C.dim, letterSpacing: "1px", textDecoration: "none" }}>
          Need an account? Sign up
        </a>
      </form>
    </div>
  );
}
