import * as Notifications from "expo-notifications";
import { toGregorian } from "jalaali-js";
import { Platform } from "react-native";
import { Course } from "../types";
import {
  normalizeTimeStr,
  parseTimeToMinutes,
  toEnglishDigits,
} from "./helpers";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn("[notifications] در این محیط در دسترس نیست:", e);
}

export const CLASS_REMINDER_LEAD_MINUTES = 15;
export const EVENING_DIGEST_HOUR = 21;
export const EVENING_DIGEST_MINUTE = 30;
export const EXAM_REMINDER_HOUR = 20;

const CHANNEL_CLASS = "class-reminders";
const CHANNEL_DIGEST = "daily-digest";
const CHANNEL_EXAM = "exam-reminders";

// Expo: 1=یکشنبه ... 7=شنبه
const WEEKDAY_NUMBER: Record<string, number> = {
  شنبه: 7,
  یکشنبه: 1,
  دوشنبه: 2,
  سه‌شنبه: 3,
  چهارشنبه: 4,
  پنجشنبه: 5,
};
const DAY_NAME_BY_WEEKDAY: Record<number, string> = Object.fromEntries(
  Object.entries(WEEKDAY_NUMBER).map(([name, num]) => [num, name]),
);

export async function setupNotificationChannelsAsync() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_CLASS, {
    name: "یادآور شروع کلاس",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 200, 200],
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_DIGEST, {
    name: "یادآور شبانه برنامه فردا",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_EXAM, {
    name: "یادآور امتحان",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 200, 300],
  });
}

export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function minutesToHourMinute(totalMinutes: number) {
  const clamped = Math.max(0, totalMinutes);
  return { hour: Math.floor(clamped / 60) % 24, minute: clamped % 60 };
}

function examDateTime(course: Course): Date | null {
  if (!course.exam_date || !course.exam_time) return null;
  const [jy, jm, jd] = toEnglishDigits(course.exam_date)
    .split("/")
    .map((n) => parseInt(n, 10));
  if (!jy || !jm || !jd) return null;
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  const normalized = normalizeTimeStr(toEnglishDigits(course.exam_time));
  const [hh, mm] = normalized.split(":").map(Number);
  return new Date(gy, gm - 1, gd, hh || 0, mm || 0, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function scheduleClassStartReminders(course: Course) {
  for (let i = 0; i < course.sessions.length; i++) {
    const session = course.sessions[i];
    const weekday = WEEKDAY_NUMBER[session.day];
    if (!weekday) continue;

    const startMinutes = parseTimeToMinutes(session.start);
    if (isNaN(startMinutes)) continue;
    const { hour, minute } = minutesToHourMinute(
      startMinutes - CLASS_REMINDER_LEAD_MINUTES,
    );

    await Notifications.scheduleNotificationAsync({
      identifier: `class-reminder:${course.id}:${i}`,
      content: {
        title: "🎓 کلاست داره شروع میشه",
        body: `${CLASS_REMINDER_LEAD_MINUTES} دقیقه دیگه کلاس «${course.name}» ساعت ${session.start} شروع می‌شود.`,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_CLASS } : {}),
      },
    });
  }
}

async function scheduleExamReminders(course: Course) {
  const examAt = examDateTime(course);
  if (!examAt) return;
  const now = new Date();

  const weekBefore = addDays(examAt, -7);
  weekBefore.setHours(EXAM_REMINDER_HOUR, 0, 0, 0);

  const dayBefore = addDays(examAt, -1);
  dayBefore.setHours(EXAM_REMINDER_HOUR, 0, 0, 0);

  const oneHourBefore = new Date(examAt.getTime() - 60 * 60 * 1000);

  const jobs = [
    {
      id: `exam-reminder:${course.id}:week-before`,
      date: weekBefore,
      body: `یک هفته تا امتحان «${course.name}» مونده (${course.exam_date} ساعت ${course.exam_time}).`,
    },
    {
      id: `exam-reminder:${course.id}:day-before`,
      date: dayBefore,
      body: `فردا امتحان «${course.name}» داری (ساعت ${course.exam_time}).`,
    },
    {
      id: `exam-reminder:${course.id}:hour-before`,
      date: oneHourBefore,
      body: `۱ ساعت دیگه امتحان «${course.name}» شروع می‌شود!`,
    },
  ];

  for (const job of jobs) {
    if (job.date.getTime() <= now.getTime()) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: job.id,
      content: { title: "📝 یادآور امتحان", body: job.body, sound: "default" },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: job.date,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_EXAM } : {}),
      },
    });
  }
}

async function scheduleEveningDigests(courses: Course[]) {
  for (let weekday = 1; weekday <= 7; weekday++) {
    const nextWeekday = (weekday % 7) + 1;
    const nextDayName = DAY_NAME_BY_WEEKDAY[nextWeekday];
    if (!nextDayName) continue;

    const coursesTomorrow = courses.filter((c) =>
      c.sessions.some((s) => s.day === nextDayName),
    );
    if (coursesTomorrow.length === 0) continue;

    const names = coursesTomorrow.map((c) => c.name).join("، ");
    await Notifications.scheduleNotificationAsync({
      identifier: `evening-digest:${weekday}`,
      content: {
        title: "📅 فردا دانشگاه داری",
        body: `فردا کلاس داری: ${names}`,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: EVENING_DIGEST_HOUR,
        minute: EVENING_DIGEST_MINUTE,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_DIGEST } : {}),
      },
    });
  }
}

export async function syncAllNotifications(courses: Course[]) {
  if (Platform.OS === "web") return;

  try {
    const current = await Notifications.getPermissionsAsync();
    let isGranted = current.granted;

    if (!isGranted && current.canAskAgain) {
      const requested = await Notifications.requestPermissionsAsync();
      isGranted = requested.granted;
    }

    if (!isGranted) {
      await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
    await setupNotificationChannelsAsync().catch(() => {});
    await scheduleEveningDigests(courses).catch(() => {});
    for (const course of courses) {
      await scheduleClassStartReminders(course).catch(() => {});
      await scheduleExamReminders(course).catch(() => {});
    }
  } catch (e) {
    console.warn("[notifications] sync failed:", e);
  }
}
