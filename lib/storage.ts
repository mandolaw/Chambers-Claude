import { useState } from "react";

const getUserId = () => {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("chambers_uid");
  if (!id) {
    id = "u_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
    localStorage.setItem("chambers_uid", id);
  }
  return id;
};
export const UID = getUserId();

export const LS = {
  get: (k: string, d: any) => {
    try {
      const v = localStorage.getItem(UID + "_" + k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k: string, v: any) => {
    try {
      localStorage.setItem(UID + "_" + k, JSON.stringify(v));
    } catch {}
  },
  clear: () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(UID + "_"));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
  },
};

export function usePersist<T>(key: string, def: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [s, ss] = useState<T>(() => LS.get(key, def));
  const set = (v: T | ((prev: T) => T)) => {
    const n = typeof v === "function" ? (v as (prev: T) => T)(s) : v;
    ss(n);
    LS.set(key, n);
  };
  return [s, set];
}

export function getStreak(dates: any[]) {
  if (!dates || !dates.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...new Set(dates)].map((d) => new Date(d as any)).sort((a, b) => b.getTime() - a.getTime());
  let n = 0,
    cur = new Date(today);
  for (let d of sorted) {
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    const diff = (cur.getTime() - dd.getTime()) / 86400000;
    if (diff === 0 || diff === 1) {
      n++;
      cur = dd;
    } else break;
  }
  return n;
}

export const daysSinceLastVisit = () => {
  const last = LS.get("lastVisit", null);
  if (!last) return 999;
  const diff = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
};
