/**
 * gradeHistory — replicate js/gradeHistoryManager.js
 *  เก็บประวัติการใช้งานแยกตาม unit ใน localStorage
 *  key: "grade_history_<unit>"
 */

export interface HistoryEntry {
  grade: string;
  lot: string;
  netweight: string | number;
  fromPage: string | number;
  toPage: string | number;
  shift?: string;
  idate?: string;
  template?: string;
  controlprint?: { ft: boolean; lt: boolean; qr?: boolean };
  timestamp: string;
}

const PREFIX = "grade_history";

function key(unit: string): string {
  return `${PREFIX}_${unit}`;
}

function loadAll(unit: string): Record<string, HistoryEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key(unit));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, HistoryEntry>;
  } catch {
    return {};
  }
}

export function saveGradeHistory(
  unit: string,
  gradeWithSub: string,
  formData: Omit<HistoryEntry, "grade" | "timestamp">,
): void {
  if (!gradeWithSub || !gradeWithSub.trim() || !unit) return;
  const history = loadAll(unit);
  history[gradeWithSub] = {
    grade: gradeWithSub,
    lot: String(formData.lot || ""),
    netweight: formData.netweight || "",
    fromPage: formData.fromPage ?? "1",
    toPage: formData.toPage ?? "1",
    shift: formData.shift || "M",
    idate: String(formData.idate || ""),
    template: formData.template || "template1",
    controlprint: formData.controlprint || { ft: false, lt: false },
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key(unit), JSON.stringify(history));
  } catch (e) {
    console.warn("saveGradeHistory failed:", e);
  }
}

export function loadGradeHistory(
  unit: string,
  grade: string,
): HistoryEntry | null {
  if (!grade || !unit) return null;
  const history = loadAll(unit);
  return history[grade] || null;
}

export function getGradeList(unit: string): string[] {
  return Object.keys(loadAll(unit));
}

/** ดึง entry ที่ timestamp ใหม่สุด (ใช้ prefill ฟอร์ม) */
export function getLatestHistory(
  unit: string,
): { grade: string; entry: HistoryEntry } | null {
  const history = loadAll(unit);
  const grades = Object.keys(history);
  if (grades.length === 0) return null;
  const latest = grades.reduce((best, g) => {
    if (!best) return g;
    const t1 = new Date(history[best].timestamp || 0).getTime();
    const t2 = new Date(history[g].timestamp || 0).getTime();
    return t2 > t1 ? g : best;
  }, "");
  return { grade: latest, entry: history[latest] };
}

export function deleteGradeHistory(unit: string, grade: string): void {
  const history = loadAll(unit);
  if (history[grade]) {
    delete history[grade];
    localStorage.setItem(key(unit), JSON.stringify(history));
  }
}

export function clearUnitHistory(unit: string): void {
  localStorage.removeItem(key(unit));
}
