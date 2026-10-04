"use client";

import { useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/types";

const STORAGE_KEY = "trm-driver-briefing";

function casablancaNow() {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm");
}

function msUntilNext1900() {
  const now = new Date();
  const parts = formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd HH mm").split(/[ :-]/);
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const hour = Number(parts[3]);
  const minute = Number(parts[4]);
  const currentMinutes = hour * 60 + minute;
  const targetMinutes = 19 * 60;
  let wait = (targetMinutes - currentMinutes) * 60 * 1000;
  if (wait <= 0) wait += 24 * 60 * 60 * 1000;
  return wait;
}

async function notifyDriverBriefing(count: number, date: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }
  const title = "Khedma dyal ghedda";
  const body =
    count > 0
      ? `${count} services ghedda. Sift l liste l driver f WhatsApp.`
      : "Ma kayn hatta service ghedda.";
  const registration = await navigator.serviceWorker?.ready.catch(() => undefined);
  if (registration?.showNotification) {
    await registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      tag: `briefing-${date}`,
      data: { url: "/" },
    });
    return;
  }
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}

export function EveningNotifier({
  tomorrowCount,
  tomorrowDate,
}: {
  tomorrowCount: number;
  tomorrowDate: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;

    const shown = localStorage.getItem(STORAGE_KEY);
    const today = casablancaNow().slice(0, 10);
    const hour = Number(formatInTimeZone(new Date(), TIMEZONE, "H"));

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }

    if (hour >= 19 && shown !== today && Notification.permission === "granted") {
      notifyDriverBriefing(tomorrowCount, tomorrowDate);
      localStorage.setItem(STORAGE_KEY, today);
    }

    const wait = msUntilNext1900();
    const timer = window.setTimeout(() => {
      const stamp = casablancaNow().slice(0, 10);
      if (localStorage.getItem(STORAGE_KEY) === stamp) return;
      notifyDriverBriefing(tomorrowCount, tomorrowDate);
      localStorage.setItem(STORAGE_KEY, stamp);
    }, wait);

    return () => window.clearTimeout(timer);
  }, [tomorrowCount, tomorrowDate]);

  return null;
}
