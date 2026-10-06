"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/types";
import { formatDisplayTime, formatShortDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

const SEEN_KEY = "trm-driver-seen-jobs";
const TODAY_KEY = "trm-driver-today-alert";
const TOMORROW_KEY = "trm-driver-tomorrow-alert";

export type DriverNotifyJob = {
  id: string;
  date: string;
  time: string;
  customerName: string;
  pickupLocation: string;
  destination: string;
  driverCommission: number;
};

function casablancaDate() {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd");
}

function casablancaHour() {
  return Number(formatInTimeZone(new Date(), TIMEZONE, "H"));
}

function msUntilNext1900() {
  const parts = formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd HH mm").split(/[ :-]/);
  const hour = Number(parts[3]);
  const minute = Number(parts[4]);
  const currentMinutes = hour * 60 + minute;
  const targetMinutes = 19 * 60;
  let wait = (targetMinutes - currentMinutes) * 60 * 1000;
  if (wait <= 0) wait += 24 * 60 * 60 * 1000;
  return wait;
}

async function showAlert(title: string, body: string, tag: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const registration = await navigator.serviceWorker?.ready.catch(() => undefined);
  if (registration?.showNotification) {
    await registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      tag,
      data: { url: "/driver" },
    });
    return;
  }
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}

function jobLine(job: DriverNotifyJob) {
  const route =
    job.pickupLocation && job.destination
      ? `${job.pickupLocation} → ${job.destination}`
      : job.pickupLocation || job.destination;
  const pay = job.driverCommission ? ` · ${formatMoney(job.driverCommission)}` : "";
  return `${formatShortDate(job.date)} ${formatDisplayTime(job.time)}${route ? ` · ${route}` : ""}${pay}`;
}

export function DriverNotifier({
  jobs,
  todayCount,
  tomorrowCount,
  tomorrowDate,
}: {
  jobs: DriverNotifyJob[];
  todayCount: number;
  tomorrowCount: number;
  tomorrowDate: string;
}) {
  const router = useRouter();
  const [needPermission, setNeedPermission] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    setNeedPermission(Notification.permission === "default");
    if (Notification.permission === "default") {
      Notification.requestPermission()
        .then((value) => setNeedPermission(value === "default"))
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = jobs.map((job) => job.id);
    const seenRaw = localStorage.getItem(SEEN_KEY);
    if (!seenRaw) {
      localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
      return;
    }
    let seen: string[] = [];
    try {
      seen = JSON.parse(seenRaw) as string[];
    } catch {
      seen = [];
    }
    const fresh = jobs.filter((job) => !seen.includes(job.id));
    if (fresh.length > 0 && Notification.permission === "granted") {
      const first = fresh[0];
      const extra = fresh.length > 1 ? ` +${fresh.length - 1} more` : "";
      showAlert("New job assigned", `${jobLine(first)}${extra}`, `job-${first.id}`);
    }
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  }, [jobs]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    const today = casablancaDate();
    if (todayCount > 0 && localStorage.getItem(TODAY_KEY) !== today && Notification.permission === "granted") {
      showAlert(
        "Today's jobs",
        `${todayCount} ${todayCount === 1 ? "job" : "jobs"} assigned to you today.`,
        `today-${today}`,
      );
      localStorage.setItem(TODAY_KEY, today);
    }

    const hour = casablancaHour();
    if (
      hour >= 19 &&
      localStorage.getItem(TOMORROW_KEY) !== today &&
      Notification.permission === "granted"
    ) {
      showAlert(
        "Tomorrow's jobs",
        tomorrowCount > 0
          ? `${tomorrowCount} ${tomorrowCount === 1 ? "job" : "jobs"} tomorrow.`
          : "No jobs assigned tomorrow.",
        `tomorrow-${tomorrowDate}`,
      );
      localStorage.setItem(TOMORROW_KEY, today);
    }

    const wait = msUntilNext1900();
    const timer = window.setTimeout(() => {
      const stamp = casablancaDate();
      if (localStorage.getItem(TOMORROW_KEY) === stamp) return;
      showAlert(
        "Tomorrow's jobs",
        tomorrowCount > 0
          ? `${tomorrowCount} ${tomorrowCount === 1 ? "job" : "jobs"} tomorrow.`
          : "No jobs assigned tomorrow.",
        `tomorrow-${tomorrowDate}`,
      );
      localStorage.setItem(TOMORROW_KEY, stamp);
    }, wait);

    return () => window.clearTimeout(timer);
  }, [todayCount, tomorrowCount, tomorrowDate]);

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 45000);
    return () => window.clearInterval(timer);
  }, [router]);

  if (!needPermission) return null;

  return (
    <button
      type="button"
      className="w-full rounded-[1.2rem] bg-sand px-4 py-3 text-left text-sm font-semibold text-primary"
      onClick={() => {
        Notification.requestPermission()
          .then((value) => setNeedPermission(value === "default"))
          .catch(() => undefined);
      }}
    >
      Turn on job alerts — we will notify you when work is assigned.
    </button>
  );
}
