// Normalize time strings (e.g. 8.5 to 08:30)
export function normalizeTimeStr(t: string | number): string {
  let str = (t || "").toString().trim();
  if (!str) return "";
  let hh = "00",
    mm = "00";
  if (str.includes(":")) [hh, mm] = str.split(":");
  else if (str.includes(".")) [hh, mm] = str.split(".");
  else {
    hh = str;
    mm = "00";
  }

  hh = hh.padStart(2, "0");
  if (mm.length === 1) {
    const m = Math.round(parseFloat("0." + mm) * 60) || 0;
    mm = String(m);
  }
  mm = (mm + "00").slice(0, 2);
  return `${hh}:${mm}`;
}

// Convert time to minutes (e.g. 8:30 to 510)
export function parseTimeToMinutes(t: string): number {
  const n = normalizeTimeStr(t);
  const [h, m] = n.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

// Check time overlap
export function overlap(
  a1: number,
  a2: number,
  b1: number,
  b2: number,
): boolean {
  return Math.max(a1, b1) < Math.min(a2, b2);
}

// Generate vibrant colors for glassmorphism
export function colorFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h << 5) - h + key.charCodeAt(i);
    h |= 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 85%, 60%)`;
}

export function toEnglishDigits(str: string): string {
  if (!str) return "";
  return str
    .replace(/[۰-۹]/g, (w) =>
      String(["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"].indexOf(w)),
    )
    .replace(/[٠-٩]/g, (w) =>
      String(["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"].indexOf(w)),
    );
}
