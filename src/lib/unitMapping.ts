import type { UnitId, UnitProfile } from "@/type";

/**
 * UNIT_KEY_MAP — map unit → key ใน GAS "alldata"
 * key = "gradeData" + plantCode (ตาม GAS)
 *
 * หมายเหตุ: "gradeData1311_1312" เป็น case พิเศษ (ยุบ PP 2 plant: 1311 + 1312)
 */
export const UNIT_KEY_MAP: Record<UnitId, string> = {
  // ---- PL ----
  HDPE: "gradeData1301",
  PP: "gradeData1311_1312", // พิเศษ: ยุบ 2 plant
  PPC: "gradeData1324",
  // ---- SASB ----
  CCM: "gradeData1377",
  ABS: "gradeData1372",
  ABS3: "gradeData1373",
  SAN12: "gradeData1374",
  SAN3: "gradeData1375",
};

/** ระบบงานของแต่ละ unit */
export const UNIT_PROFILE: Record<UnitId, UnitProfile> = {
  HDPE: "PL",
  PP: "PL",
  PPC: "PL",
  CCM: "SASB",
  ABS: "SASB",
  ABS3: "SASB",
  SAN12: "SASB",
  SAN3: "SASB",
};

/** ลำดับ unit ที่แสดงบน navbar */
export const UNIT_ORDER_PL: UnitId[] = ["HDPE", "PP", "PPC"];
export const UNIT_ORDER_SASB: UnitId[] = ["CCM", "ABS", "ABS3", "SAN12", "SAN3"];
export const UNIT_ORDER_ALL: UnitId[] = [...UNIT_ORDER_PL, ...UNIT_ORDER_SASB];

/** helper: unit → key */
export function getGasKey(unit: UnitId): string {
  return UNIT_KEY_MAP[unit];
}

/** helper: unit → profile */
export function getProfile(unit: UnitId): UnitProfile {
  return UNIT_PROFILE[unit];
}

/** helper: เช็คว่าเป็น unit SASB */
export function isSasbUnit(unit: string): boolean {
  return UNIT_PROFILE[unit as UnitId] === "SASB";
}

/** helper: เช็คว่าเป็น unit PL */
export function isPlUnit(unit: string): boolean {
  return UNIT_PROFILE[unit as UnitId] === "PL";
}
