"use client";
import { useEffect, useState } from "react";
import { C, sr, sn } from "@/lib/theme";

type Stats = {
  totalUsers: number;
  verifiedUsers: number;
  dau: number;
  wau: number;
  mau: number;
  totalCells: number;
  checkInsThisWeek: number;
  totalPosts: number;
  generatedAt: string;
};

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "16px", flex: "1 1 140px" }}>
      <div style={{ ...sn, fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: C.dim, marginBottom: "8px" }}>{label}</div>
      <div style={{ ...sr, fontSize: "28px", color: C.cream }}>{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Not authorized.");
        setStats(data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.sand, ...sr, padding: "28px 20px" }}>
      <h1 style={{ ...sr, fontSize: "22px", fontWeight: "normal", color: C.cream, margin: "0 0 24px" }}>Usage</h1>
      {error && <div style={{ color: "#E8AAAA", fontSize: "13px" }}>{error}</div>}
      {stats && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
            <Tile label="Active Today" value={stats.dau} />
            <Tile label="Active This Week" value={stats.wau} />
            <Tile label="Active This Month" value={stats.mau} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <Tile label="Total Accounts" value={stats.totalUsers} />
            <Tile label="Verified" value={stats.verifiedUsers} />
            <Tile label="Cells" value={stats.totalCells} />
            <Tile label="Check-Ins This Week" value={stats.checkInsThisWeek} />
            <Tile label="Cell Posts (All Time)" value={stats.totalPosts} />
          </div>
          <div style={{ ...sn, fontSize: "9px", color: C.dim, marginTop: "24px" }}>
            As of {new Date(stats.generatedAt).toLocaleString()}. Counts only signed-in account activity — the Rule, prayer log, and journal stay device-only and untracked.
          </div>
        </>
      )}
    </div>
  );
}
