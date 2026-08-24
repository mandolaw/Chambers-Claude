"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { C, sr, sn } from "@/lib/theme";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Something went wrong.");
      return;
    }
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (signInRes?.error) setError("Account created — but sign-in failed. Try signing in.");
    else router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.sand, ...sr, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: "320px" }}>
        <h1 style={{ ...sr, fontSize: "22px", fontWeight: "normal", color: C.cream, margin: "0 0 6px" }}>Create an Account</h1>
        <p style={{ ...sn, fontSize: "10px", color: C.dim, letterSpacing: "1px", margin: "0 0 24px", lineHeight: 1.6 }}>
          Needed only to connect with real brothers in a Cell. Your prayer log and journal stay on this device either way.
        </p>

        <input type="text" required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "11px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "11px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />
        <input type="password" required placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "11px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", marginBottom: "14px" }} />

        {error && <div style={{ color: "#E8AAAA", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}

        <button type="submit" disabled={busy} style={{ width: "100%", padding: "13px", background: `${C.gold}18`, border: `1px solid ${C.gold}55`, color: C.gold, cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "12px" }}>
          {busy ? "Creating Account…" : "Create Account"}
        </button>
        <a href="/login" style={{ display: "block", textAlign: "center", ...sn, fontSize: "9px", color: C.dim, letterSpacing: "1px", textDecoration: "none" }}>
          Already have an account? Sign in
        </a>
      </form>
    </div>
  );
}
