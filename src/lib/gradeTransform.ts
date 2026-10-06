import type { AllDataResponse, GradeItem, UnitId } from "@/type";
import { UNIT_KEY_MAP } from "./unitMapping";

/**
 * getGradeItems — ดึง grade items ของ unit จาก alldata
 *   unit → gasKey (gradeData<plantCode>) → alldata[gasKey]
 */
export function getGradeItems(
  alldata: AllDataResponse | null,
  unit: UnitId,
): GradeItem[] {
  if (!alldata || !alldata.alldata) return [];
  const key = UNIT_KEY_MAP[unit];
  if (!key) return [];
  return alldata.alldata[key] || [];
}

/**
 * filterActiveGrades — กรองเฉพาะ status=true
 * (grade ที่ยังใช้งานอยู่)
 */
export function filterActiveGrades(items: GradeItem[]): GradeItem[] {
  return items.filter((g) => g.status !== false);
}

/**
 * dedupGrades — ลบ grade ซ้ำ (กรณี GAS รวมมาแล้วปกติจะไม่ซ้ำ
 * แต่กันไว้เพื่อความชัวร์ — เก็บตัวแรกที่เจอ)
 */
export function dedupGrades(items: GradeItem[]): GradeItem[] {
  const seen = new Set<string>();
  const out: GradeItem[] = [];
  for (const g of items) {
    // key = grade + sub (เพราะ grade เดียวกันอาจมีทั้ง sub และไม่ sub)
    const k = `${g.grade}__${g.sub ? "S" : "N"}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(g);
  }
  return out;
}

/** pipeline: ดึง + clean (dedup + active) */
export function getCleanGradeItems(
  alldata: AllDataResponse | null,
  unit: UnitId,
): GradeItem[] {
  return dedupGrades(filterActiveGrades(getGradeItems(alldata, unit)));
}
