import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";
import { notifyNewAppUpdateAsync } from "./notifications";

export const MYKET_PACKAGE_NAME = "com.amirtaha.courseselection";
export const MYKET_STORE_URL = `https://myket.ir/app/${MYKET_PACKAGE_NAME}`;
export const MYKET_INTENT_URL = `myket://details?id=${MYKET_PACKAGE_NAME}`;

export const STORAGE_KEY_LAST_NOTIFIED_VERSION = "app_update_last_notified_version";
export const STORAGE_KEY_DISMISSED_AT = "app_update_dismissed_at";

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string | null;
  storeUrl: string;
  isDismissedRecently?: boolean;
}

/**
 * تجزیه رشته نگارش (SemVer) به آرایه‌ای از اعداد صحیح
 * مثال: "1.0.2" -> [1, 0, 2] | "v1.2" -> [1, 2, 0]
 */
export function parseSemver(version: string): number[] {
  if (!version) return [0, 0, 0];
  const cleaned = version
    .replace(/^v/i, "")
    .replace(/[-+].*$/, "")
    .trim();
  const parts = cleaned
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

  while (parts.length < 3) {
    parts.push(0);
  }
  return parts.slice(0, 3);
}

/**
 * مقایسه دو نسخه:
 * خروجی: 1 اگر v1 جدیدتر باشد، -1 اگر v2 جدیدتر باشد، 0 اگر برابر باشند
 */
export function compareVersions(v1: string, v2: string): number {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);
  const len = Math.max(p1.length, p2.length);

  for (let i = 0; i < len; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * استخراج شماره نسخه منتشر شده در مایکت از داخل کد HTML صفحه برنامه
 */
export function extractMyketVersion(html: string): string | null {
  if (!html) return null;
  const match = html.match(/"softwareVersion"\s*:\s*"([^"]+)"/i);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * دریافت آنلاین آخرین نسخه از صفحه رسمی برنامه در مایکت
 */
export async function fetchMyketLatestVersion(timeoutMs = 7000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(MYKET_STORE_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) return null;
    const html = await response.text();
    return extractMyketVersion(html);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * دریافت نسخه جاری نصب شده روی گوشی
 */
export function getCurrentAppVersion(): string {
  return Constants.expoConfig?.version || "1.0.1";
}

/**
 * هدایت کاربر به مایکت (ابتدا اپلیکیشن مایکت، در صورت نبود مرورگر وب)
 */
export async function openMyket(): Promise<void> {
  if (Platform.OS === "android") {
    try {
      const canOpen = await Linking.canOpenURL(MYKET_INTENT_URL).catch(() => false);
      if (canOpen) {
        await Linking.openURL(MYKET_INTENT_URL);
        return;
      }
    } catch {}
  }

  await Linking.openURL(MYKET_STORE_URL).catch(() => {});
}

/**
 * بررسی وضعیت بروزرسانی، ارسال نوتیفیکیشن در صورت نسخه جدید، و گزارش وضعیت برای نمایش پاپ‌آپ
 */
export async function checkForUpdatesAsync(options?: {
  forceModal?: boolean;
}): Promise<UpdateCheckResult> {
  const currentVersion = getCurrentAppVersion();
  const latestVersion = await fetchMyketLatestVersion();

  if (!latestVersion) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: null,
      storeUrl: MYKET_STORE_URL,
    };
  }

  const isNewer = compareVersions(latestVersion, currentVersion) > 0;

  // بررسی وضعیت تاخیر (اسنوز) پاپ‌آپ: اگر کاربر در ۱۲ ساعت گذشته روی "بعداً" زده باشد
  let isDismissedRecently = false;
  if (isNewer && !options?.forceModal) {
    try {
      const dismissedAt = await AsyncStorage.getItem(STORAGE_KEY_DISMISSED_AT);
      if (dismissedAt) {
        const hoursAgo = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
        if (hoursAgo < 12) {
          isDismissedRecently = true;
        }
      }
    } catch {}
  }

  // ارسال نوتیفیکیشن گوشی در صورت انتشار نسخه جدید
  if (isNewer) {
    try {
      const lastNotified = await AsyncStorage.getItem(STORAGE_KEY_LAST_NOTIFIED_VERSION);
      if (lastNotified !== latestVersion) {
        await notifyNewAppUpdateAsync(latestVersion);
        await AsyncStorage.setItem(STORAGE_KEY_LAST_NOTIFIED_VERSION, latestVersion);
      }
    } catch {}
  }

  return {
    hasUpdate: isNewer,
    currentVersion,
    latestVersion,
    storeUrl: MYKET_STORE_URL,
    isDismissedRecently,
  };
}

/**
 * به تعویق انداختن پاپ‌آپ بروزرسانی برای دفعات بعدی
 */
export async function snoozeUpdateNoticeAsync(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_DISMISSED_AT, Date.now().toString());
  } catch {}
}
