"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { C, sr, sn } from "@/lib/theme";
import { usePersist } from "@/lib/storage";
import { DEFAULT_CKQ, CONFESS_PROMPTS } from "@/data/examen";
import { Lbl } from "@/components/atoms";
import { useCell } from "@/hooks/useCell";
import { useContacts, type Contact } from "@/hooks/useContacts";

const PASTOR_TEMPLATES = [
  "I've been struggling with something serious and need to speak with you in person. Can we meet?",
  "I need pastoral counsel and prayer. There's something I need to confess and I'd appreciate your guidance.",
  "I'm in a difficult season and could use your wisdom. Would you have time for me this week?",
];

export function BrothersTab({ A }: { A: string }) {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const { cell, members, posts, loading, error, createCell, joinCell, checkIn, addPost, react } = useCell(signedIn);
  const { contacts, addContact, updateContact, removeContact } = useContacts(signedIn);

  const [checkinQs] = usePersist("checkinQs", DEFAULT_CKQ);
  const [showCellInput, setShowCellInput] = useState(false);
  const [cellDraft, setCellDraft] = useState("");
  const [redSent, setRedSent] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [cellName, setCellName] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [reachView, setReachView] = useState<"brother" | "pastor" | null>(null);
  const [pView, setPView] = useState<"list" | "edit" | "compose">("list");
  const [editP, setEditP] = useState<Contact | null>(null);
  const [pTarget, setPTarget] = useState<Contact | null>(null);
  const [pMsg, setPMsg] = useState("");
  const [pDraft, setPDraft] = useState({ name: "", role: "", phone: "", email: "" });

  const myId = (session?.user as any)?.id;
  const me = members.find((m) => m.id === myId);
  const checkedInCount = members.filter((m) => m.checkedIn).length;

  if (!signedIn) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "14px", color: A }}>⚔</div>
        <h2 style={{ ...sr, fontSize: "19px", fontWeight: "normal", color: C.cream, margin: "0 0 10px" }}>Brotherhood needs real brothers.</h2>
        <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.8, margin: "0 0 22px" }}>
          Sign in to create or join a Cell — a small, private group of men who can actually see each other's check-ins.
        </p>
        <a href="/login" style={{ display: "block", padding: "13px", background: `${A}18`, border: `1px solid ${A}55`, color: A, ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", textDecoration: "none", marginBottom: "10px" }}>Sign In</a>
        <a href="/signup" style={{ display: "block", padding: "12px", background: "transparent", border: `1px solid ${C.border}`, color: C.dim, ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", textDecoration: "none" }}>Create an Account</a>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: C.dim, fontSize: "12px" }}>Loading your cell…</div>;
  }

  if (!cell) {
    return (
      <div style={{ padding: "20px 18px 0" }}>
        <div style={{ marginBottom: "26px" }}>
          <Lbl color={C.dim}>Start a Cell</Lbl>
          <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.75, margin: "0 0 12px" }}>Create a Cell and share the invite code with real men — they'll see your check-ins, and you'll see theirs.</p>
          <input value={cellName} onChange={(e) => setCellName(e.target.value)} placeholder="e.g. Thursday Morning Cell"
            style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "10px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", marginBottom: "9px" }} />
          <button disabled={busy} onClick={async () => {
            setBusy(true); setFormError(null);
            try { await createCell(cellName || "My Cell"); } catch (e: any) { setFormError(e.message); }
            setBusy(false);
          }} style={{ width: "100%", padding: "12px", background: `${A}18`, border: `1px solid ${A}55`, color: A, cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase" }}>
            {busy ? "Creating…" : "Create Cell"}
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "22px" }}>
          <Lbl color={C.dim}>Join with a Code</Lbl>
          <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.75, margin: "0 0 12px" }}>Have an invite code from a brother? Enter it here.</p>
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123"
            style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "10px 12px", color: C.cream, fontSize: "14px", letterSpacing: "3px", ...sn, outline: "none", boxSizing: "border-box", marginBottom: "9px" }} />
          <button disabled={busy} onClick={async () => {
            setBusy(true); setFormError(null);
            try { await joinCell(joinCode); } catch (e: any) { setFormError(e.message); }
            setBusy(false);
          }} style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${C.border}`, color: C.dim, cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase" }}>
            {busy ? "Joining…" : "Join Cell"}
          </button>
        </div>

        {(formError || error) && <div style={{ color: "#E8AAAA", fontSize: "12px", marginTop: "14px" }}>{formError || error}</div>}
      </div>
    );
  }

  // ── PASTOR REACH-OUT ──────────────────────────────────────────
  if (reachView === "pastor") {
    if (pView === "compose" && pTarget) {
      return (
        <div style={{ padding: "20px 18px 0" }}>
          <button onClick={() => setPView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: C.dim, ...sn, fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "18px", padding: 0 }}>← Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: C.surface, border: `1px solid ${C.border}`, marginBottom: "16px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "50%", border: `1px solid ${A}50`, display: "flex", alignItems: "center", justifyContent: "center", ...sr, fontSize: "17px", color: A, background: `${A}14`, flexShrink: 0 }}>{pTarget.name[0]?.toUpperCase() || "P"}</div>
            <div>
              <div style={{ ...sr, fontSize: "14px", color: C.cream }}>{pTarget.name}</div>
              <div style={{ ...sn, fontSize: "8px", color: A, letterSpacing: "1px", marginTop: "2px", textTransform: "uppercase" }}>{pTarget.role || "Pastor / Elder"}</div>
            </div>
          </div>
          <Lbl color={C.dim}>Templates</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "13px" }}>
            {PASTOR_TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => setPMsg(t)} style={{ textAlign: "left", background: pMsg === t ? `${A}14` : C.surface, border: `1px solid ${pMsg === t ? A : C.border}`, color: pMsg === t ? A : C.dim, padding: "10px 12px", cursor: "pointer", fontSize: "12px", lineHeight: 1.6, ...sr }}>{t}</button>
            ))}
          </div>
          <textarea value={pMsg} onChange={(e) => setPMsg(e.target.value)} placeholder="Or write your own..." style={{ width: "100%", minHeight: "90px", background: C.surface, border: `1px solid ${C.border}`, padding: "12px", color: C.sand, fontSize: "13px", lineHeight: 1.75, ...sr, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "13px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {pTarget.phone && <a href={`sms:${pTarget.phone}?body=${encodeURIComponent(pMsg || PASTOR_TEMPLATES[0])}`} style={{ display: "block", textAlign: "center", background: `${A}18`, border: `1px solid ${A}55`, color: A, padding: "12px", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", textDecoration: "none", boxSizing: "border-box" }}>💬 Send via SMS</a>}
            {pTarget.email && <a href={`mailto:${pTarget.email}?subject=I need pastoral counsel&body=${encodeURIComponent(pMsg || PASTOR_TEMPLATES[0])}`} style={{ display: "block", textAlign: "center", background: "transparent", border: `1px solid ${A}40`, color: A, padding: "12px", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", textDecoration: "none", boxSizing: "border-box" }}>✉ Send via Email</a>}
          </div>
        </div>
      );
    }

    if (pView === "edit") {
      return (
        <div style={{ padding: "20px 18px 0" }}>
          <button onClick={() => setPView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: C.dim, ...sn, fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "18px", padding: 0 }}>← Back</button>
          <h2 style={{ ...sr, fontSize: "18px", fontWeight: "normal", margin: "0 0 18px", color: C.cream }}>{editP ? "Edit Pastor" : "Add a Pastor / Elder"}</h2>
          {[{ label: "Name *", key: "name", ph: "Pastor John Smith", type: "text" }, { label: "Role", key: "role", ph: "Senior Pastor, Elder…", type: "text" }, { label: "Phone", key: "phone", ph: "+1 (555) 000-0000", type: "tel" }, { label: "Email", key: "email", ph: "pastor@church.com", type: "email" }].map(({ label, key, ph, type }) => (
            <div key={key} style={{ marginBottom: "13px" }}>
              <Lbl color={C.dim}>{label}</Lbl>
              <input type={type} value={(pDraft as any)[key]} onChange={(e) => setPDraft((d) => ({ ...d, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: C.surface, border: `1px solid ${C.hi}`, padding: "9px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "7px", marginTop: "5px" }}>
            <button onClick={async () => {
              if (!pDraft.name.trim()) return;
              if (editP) await updateContact(editP.id, pDraft);
              else await addContact(pDraft);
              setPView("list"); setEditP(null);
            }} style={{ flex: 1, background: `${A}18`, border: `1px solid ${A}55`, color: A, padding: "11px", cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase" }}>{editP ? "Save" : "Add Pastor"}</button>
            {editP && <button onClick={async () => { await removeContact(editP.id); setPView("list"); setEditP(null); }} style={{ background: "transparent", border: "1px solid #8A3A3A", color: "#C87A7A", padding: "11px 13px", cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase" }}>Remove</button>}
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: "20px 18px 0" }}>
        <button onClick={() => setReachView(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.dim, ...sn, fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "18px", padding: 0 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 style={{ ...sr, fontSize: "18px", fontWeight: "normal", margin: 0, color: C.cream }}>Reach Out to a Pastor</h2>
          <button onClick={() => { setPDraft({ name: "", role: "", phone: "", email: "" }); setEditP(null); setPView("edit"); }} style={{ background: `${A}14`, border: `1px solid ${A}40`, color: A, padding: "4px 10px", cursor: "pointer", ...sn, fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase" }}>+ Add</button>
        </div>
        <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.75, margin: "0 0 16px" }}>Some things need more than a brother. A pastor carries spiritual authority and pastoral counsel.</p>
        {contacts.map((p, i) => (
          <div key={p.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", border: `1px solid ${A}50`, display: "flex", alignItems: "center", justifyContent: "center", ...sr, fontSize: "15px", color: A, background: `${A}10`, flexShrink: 0 }}>{p.name[0]?.toUpperCase() || "P"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...sr, fontSize: "14px", color: C.cream }}>{p.name}</div>
                <div style={{ ...sn, fontSize: "8px", color: A, letterSpacing: "1px", marginTop: "2px", textTransform: "uppercase" }}>{p.role || "Pastor / Elder"}</div>
              </div>
              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => { setPTarget(p); setPMsg(""); setPView("compose"); }} style={{ background: `${A}14`, border: `1px solid ${A}40`, color: A, padding: "5px 9px", cursor: "pointer", ...sn, fontSize: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Message</button>
                <button onClick={() => { setEditP(p); setPDraft({ name: p.name, role: p.role, phone: p.phone, email: p.email }); setPView("edit"); }} style={{ background: "transparent", border: `1px solid ${C.border}`, color: `${C.dim}60`, padding: "5px 8px", cursor: "pointer", fontSize: "10px" }}>✏</button>
              </div>
            </div>
            {i < contacts.length - 1 && <div style={{ height: "1px", background: "rgba(200,168,107,0.09)" }} />}
          </div>
        ))}
        {contacts.length === 0 && <div style={{ textAlign: "center", padding: "20px", color: C.dim, fontSize: "13px" }}>No pastors added yet.</div>}
      </div>
    );
  }

  if (reachView === "brother") {
    return (
      <div style={{ padding: "20px 18px 0" }}>
        <button onClick={() => setReachView(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.dim, ...sn, fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "18px", padding: 0 }}>← Back</button>
        <h2 style={{ ...sr, fontSize: "18px", fontWeight: "normal", margin: "0 0 7px", color: C.cream }}>Reach Out to a Brother</h2>
        <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.75, margin: "0 0 16px" }}>You don't have to fight alone. The fastest way is the Red Button below, or email a brother directly.</p>
        {members.filter((m) => m.id !== myId).map((m, i) => (
          <div key={m.id}>
            <a href={`mailto:${m.email}?subject=I need prayer&body=${encodeURIComponent("I'm struggling and need prayer. Can we talk?")}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 0", textDecoration: "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", ...sr, fontSize: "14px", color: C.dim, background: C.surface, flexShrink: 0 }}>{m.name[0]?.toUpperCase()}</div>
              <span style={{ ...sr, fontSize: "14px", color: C.sand, flex: 1 }}>{m.name}</span>
              <span style={{ color: A, fontSize: "11px" }}>✉ Email</span>
            </a>
            {i < members.length - 2 && <div style={{ height: "1px", background: "rgba(200,168,107,0.09)" }} />}
          </div>
        ))}
        {members.length <= 1 && <div style={{ textAlign: "center", padding: "20px", color: C.dim, fontSize: "13px" }}>No other brothers in this cell yet — share your invite code.</div>}
      </div>
    );
  }

  // ── CELL HOME ─────────────────────────────────────────────────
  return (
    <div style={{ padding: "20px 18px 0" }}>
      <div style={{ marginBottom: "18px" }}>
        {!redSent ? (
          <button onClick={() => { setRedSent(true); addPost("🚨 I need prayer right now. Please pray for me.", "prayer"); setTimeout(() => setRedSent(false), 10000); }}
            style={{ width: "100%", padding: "14px", background: `${C.red}18`, border: `1px solid ${C.red}60`, color: "#E8AAAA", cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "5px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>✠</span>I Need Prayer Right Now
          </button>
        ) : (
          <div style={{ width: "100%", padding: "14px", background: `${C.green}12`, border: `1px solid ${C.green}40`, textAlign: "center", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase", color: C.green, boxSizing: "border-box" }}>
            ✦ Sent — Your brothers are praying.
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px", background: C.surface, border: `1px solid ${checkedInCount === members.length && members.length > 0 ? C.green : C.gold}40`, marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
          <span style={{ ...sn, fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: C.dim }}>⚔ Weekly Health — {cell.name}</span>
          <span style={{ ...sr, fontSize: "20px", color: checkedInCount === members.length && members.length > 0 ? C.green : C.gold }}>
            {members.length ? Math.round((checkedInCount / members.length) * 100) : 0}%
          </span>
        </div>
        <div style={{ height: "3px", background: C.border, marginBottom: "7px" }}>
          <div style={{ height: "100%", width: members.length ? `${(checkedInCount / members.length) * 100}%` : "0%", background: checkedInCount === members.length && members.length > 0 ? C.green : C.gold, transition: "width 0.6s" }} />
        </div>
        <div style={{ ...sn, fontSize: "8px", color: C.dim }}>
          {checkedInCount} of {members.length} checked in this week
        </div>
        <div style={{ ...sn, fontSize: "8px", color: `${C.dim}90`, marginTop: "8px" }}>
          Invite code: <span style={{ color: A, letterSpacing: "2px" }}>{cell.inviteCode}</span> — share it with a brother to add him.
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <Lbl color={C.dim}>The Cell</Lbl>
          <button onClick={() => setShowCellInput((s) => !s)} style={{ ...sn, fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", background: `${A}14`, border: `1px solid ${A}40`, color: A, padding: "4px 11px", cursor: "pointer" }}>+ Leave a Word</button>
        </div>
        {showCellInput && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "13px", marginBottom: "11px" }}>
            <textarea value={cellDraft} onChange={(e) => setCellDraft(e.target.value)} placeholder="A verse, a weight, a prayer — one word for your brothers..." rows={3}
              style={{ width: "100%", background: C.raised, border: `1px solid ${C.border}`, padding: "10px 12px", color: C.cream, fontSize: "14px", ...sr, outline: "none", boxSizing: "border-box", resize: "none", lineHeight: 1.75, marginBottom: "9px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { if (cellDraft.trim()) { addPost(cellDraft.trim(), "verse"); setCellDraft(""); setShowCellInput(false); } }} style={{ flex: 1, background: `${A}18`, border: `1px solid ${A}50`, color: A, padding: "9px", cursor: "pointer", ...sn, fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase" }}>Leave It</button>
              <button onClick={() => { setShowCellInput(false); setCellDraft(""); }} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, padding: "9px 13px", cursor: "pointer", ...sn, fontSize: "7px", textTransform: "uppercase" }}>Cancel</button>
            </div>
          </div>
        )}
        {posts.length === 0 && (
          <div style={{ padding: "16px", border: `1px solid ${C.border}`, background: C.surface, textAlign: "center" }}>
            <p style={{ ...sn, fontSize: "8px", color: C.dim, letterSpacing: "2px", textTransform: "uppercase", margin: 0, lineHeight: 1.8 }}>Leave a verse, a weight, or a prayer.<br />Your brothers will see it here.</p>
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} style={{ background: post.text.startsWith("🚨") ? `${C.red}10` : C.surface, border: `1px solid ${post.text.startsWith("🚨") ? C.red + "40" : C.border}`, padding: "14px 16px", marginBottom: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ ...sn, fontSize: "8px", color: post.text.startsWith("🚨") ? "#E8AAAA" : A, letterSpacing: "2px" }}>{post.author}</div>
              <div style={{ ...sn, fontSize: "8px", color: C.dim }}>{new Date(post.createdAt).toLocaleDateString()}</div>
            </div>
            <p style={{ ...sr, fontSize: "14px", color: post.text.startsWith("🚨") ? "#F2D8D8" : C.cream, margin: "0 0 12px", lineHeight: 1.75, fontStyle: post.text.startsWith("🚨") ? "italic" : "normal" }}>{post.text}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => react(post.id, "cross")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", background: post.myMark === "cross" ? `${A}20` : "transparent", border: `1px solid ${post.myMark === "cross" ? A : C.border}`, color: post.myMark === "cross" ? A : C.dim, cursor: "pointer", ...sn, fontSize: "10px", transition: "all 0.2s" }}>
                ✠ {post.marks?.cross || 0}
              </button>
              <button onClick={() => react(post.id, "flame")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", background: post.myMark === "flame" ? `${C.red}15` : "transparent", border: `1px solid ${post.myMark === "flame" ? C.red + "60" : C.border}`, color: post.myMark === "flame" ? "#E8AAAA" : C.dim, cursor: "pointer", ...sn, fontSize: "10px", transition: "all 0.2s" }}>
                🔥 {post.marks?.flame || 0}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
        <Lbl color={C.dim}>⚔  Brothers</Lbl>
      </div>
      <div style={{ height: "1px", background: "rgba(200,168,107,0.09)", marginBottom: "4px" }} />
      {members.map((m, i) => (
        <div key={m.id}>
          <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "14px 0" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "50%", border: `2px solid ${m.checkedIn ? A : A + "25"}`, display: "flex", alignItems: "center", justifyContent: "center", ...sr, fontSize: "16px", color: m.checkedIn ? A : `${A}60`, background: m.checkedIn ? `${A}15` : C.surface, transition: "all 0.3s", flexShrink: 0 }}>{m.name[0]?.toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...sr, fontSize: "15px", color: C.cream }}>{m.name}{m.id === myId ? " (you)" : ""}</div>
              <div style={{ ...sn, fontSize: "8px", color: m.checkedIn ? A : C.dim, letterSpacing: "1px" }}>{m.checkedIn ? "✓  Checked in this week" : "Not checked in yet"}</div>
            </div>
            {m.id === myId && !m.checkedIn && (
              <button onClick={checkIn} style={{ background: "transparent", border: `1px solid ${C.hi}`, color: C.dim, padding: "6px 10px", cursor: "pointer", ...sn, fontSize: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Check In</button>
            )}
          </div>
          {i < members.length - 1 && <div style={{ height: "1px", background: "rgba(200,168,107,0.09)" }} />}
        </div>
      ))}

      <div style={{ marginTop: "22px", borderTop: `1px solid ${C.border}`, paddingTop: "18px" }}>
        <Lbl color={C.dim}>Check-In Questions</Lbl>
        {checkinQs.map((q: string, i: number) => (
          <div key={i} style={{ display: "flex", gap: "11px", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: A, ...sn, fontSize: "9px", minWidth: "13px" }}>{i + 1}</span>
            <span style={{ fontSize: "12px", color: C.sand, opacity: 0.7, lineHeight: 1.65 }}>{q}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "22px", borderTop: `1px solid ${C.border}`, paddingTop: "18px", marginBottom: "6px" }}>
        <Lbl color={C.dim}>✠  Confession & Reach Out</Lbl>
        <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.78, margin: "0 0 14px", opacity: 0.8 }}>Confession happens to someone. Don't carry it alone.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => setReachView("brother")} style={{ width: "100%", background: `${A}14`, border: `1px solid ${A}55`, color: A, padding: "13px", cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase" }}>⚔  Reach Out to a Brother</button>
          <button onClick={() => { setReachView("pastor"); setPView("list"); }} style={{ width: "100%", background: "transparent", border: `1px solid ${C.hi}`, color: C.dim, padding: "12px", cursor: "pointer", ...sn, fontSize: "8px", letterSpacing: "4px", textTransform: "uppercase" }}>✦  Reach Out to a Pastor</button>
        </div>
        <div style={{ marginTop: "18px" }}>
          <Lbl color={C.dim} mb="9px">Examination of Conscience</Lbl>
          {CONFESS_PROMPTS.map((p: string, i: number) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: "13px", color: C.sand, opacity: 0.6, lineHeight: 1.65 }}>{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
