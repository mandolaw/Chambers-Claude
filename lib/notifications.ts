import { useEffect } from "react";
import { LS } from "@/lib/storage";

// Uses the Notification API directly. Works while the app/tab is open
// or backgrounded on platforms that allow it. True push (waking a closed
// app) requires a server + push subscription — flagged in Settings.
export async function requestNotifyPermission() {
  try {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const res = await Notification.requestPermission();
    return res;
  } catch {
    return "unsupported";
  }
}

export function fireNotification(title: string, body: string) {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return false;
    new Notification(title, {
      body,
      tag: "chambers-" + title.replace(/\s+/g, "-").toLowerCase(),
      silent: false,
    });
    return true;
  } catch {
    return false;
  }
}

// Checks every 30s while the app is open; fires each reminder once per day
export function useLocalReminders(morningTime: string | null, eveningTime: string | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const check = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const nowStr = `${hh}:${mm}`;
      const todayKey = now.toDateString();

      if (morningTime && nowStr === morningTime) {
        const firedKey = "notif_morning_" + todayKey;
        if (!LS.get(firedKey, false)) {
          fireNotification("Morning Prayer — Chambers", "Before the phone. Before the news. Your Rule is waiting.");
          LS.set(firedKey, true);
        }
      }
      if (eveningTime && nowStr === eveningTime) {
        const firedKey = "notif_evening_" + todayKey;
        if (!LS.get(firedKey, false)) {
          fireNotification("Evening Examen — Chambers", "Five minutes to review the day before God.");
          LS.set(firedKey, true);
        }
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [morningTime, eveningTime, enabled]);
}
