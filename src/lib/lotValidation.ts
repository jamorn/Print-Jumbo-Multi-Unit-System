import type { UnitId } from "@/type";
import { UNIT_META } from "./unitMeta";

// ============================================================
//  PL — validation
//  lot ตาม lotLength + lotPattern ของ unit
// ============================================================

/** ตรวจ lot (PL) ด้วย pattern ของ unit */
export function validatePlLot(
  lot: string,
  unit: UnitId,
): { valid: boolean; message: string } {
  const value = String(lot || "").trim();
  const meta = UNIT_META[unit];

  if (!meta) {
    return { valid: false, message: "ไม่รู้จัก Unit นี้" };
  }

  if (value.length !== meta.validation.lotLength) {
    return {
      valid: false,
      message: `Lot ต้องมี ${meta.validation.lotLength} หลัก`,
    };
  }

  const pattern = new RegExp(meta.validation.lotPattern);
  if (!pattern.test(value)) {
    return { valid: false, message: "รูปแบบ Lot ไม่ถูกต้อง" };
  }

  return { valid: true, message: "" };
}

// ============================================================
//  SASB — lot (10 หลัก = [prefix][YY][7 หลัก])
//  prefix ตาม package ของ grade
// ============================================================

/** ดึง package จาก grade string (ส่วนหลัง "/" ตัวสุดท้าย) */
export function extractSasbPackage(gradeString: string): string {
  const s = String(gradeString || "").trim();
  if (!s) return "";
  const normalized = s.replace(/\s*SUB\s*/i, "").trim();
  const parts = normalized.split("/");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].trim();
}

/**
 * คืน prefix (1 หลัก) จาก package string
 *   "01T".."09T"    -> "T"   (ตัน ≤ 10, T เดี่ยว)
 *   "20T","30T"     -> "3"   (ตัน > 10 = seabulk)
 *   "750"           -> "7"   (kg -> หลักแรก)
 *   "900"           -> "9"
 *   "120"           -> "1"
 *   "1000"          -> "T"   (1 ตัน = 01T)
 *   "20000"         -> "3"   (20 ตัน = 20T = seabulk)
 *
 * กฎ netweight ตัวเลขล้วน (จาก API):
 *   - <  1000            -> kg   -> หลักแรก
 *   - 1000..15999        -> ตัน   -> "T"   (01T..15T)
 *   - >= 16000 (SEABULK) -> ตัน >10 -> "3"  (16T..)
 */
const SEABULK_THRESHOLD = 16000;

export function resolveSasbLotPrefix(pkg: string): string {
  const p = String(pkg || "")
    .trim()
    .toUpperCase();
  if (!p) return "";

  // กลุ่มตันที่ระบุ "T" ตรง ๆ: "01T".."09T", "20T", "30T"
  if (/^\d+T$/.test(p)) {
    const num = parseInt(p.replace(/T$/, ""), 10);
    if (isNaN(num)) return "";
    if (num < SEABULK_THRESHOLD / 1000) return "T"; // < 16 ตัน (T เดี่ยว)
    return "3"; // >= 16 ตัน (seabulk)
  }

  // ตัวเลขล้วน -> ตีความ kg / ตัน
  if (/^\d+$/.test(p)) {
    const num = parseInt(p, 10);
    if (isNaN(num)) return "";
    if (num < 1000) return p.charAt(0); // kg -> หลักแรก
    if (num < SEABULK_THRESHOLD) return "T"; // 1000..15999 = ตัน (01T..15T)
    return "3"; // >= 16000 = seabulk (ตัน > 10)
  }

  return "";
}

/** ปี 2 หลัก (YY) ของปีปัจจุบัน */
export function getCurrentYearYY(): string {
  const yy = String(new Date().getFullYear() % 100);
  return yy.length === 1 ? "0" + yy : yy;
}

/** สร้าง LOT prefix (3 หลัก) = [prefix][YY] */
export function buildSasbLotPrefix(gradeString: string): string {
  const pkg = extractSasbPackage(gradeString);
  const prefix = resolveSasbLotPrefix(pkg);
  if (!prefix) return "";
  return prefix + getCurrentYearYY();
}

/**
 * ตรวจ LOT (SASB)
 *  - ยาว 10 หลัก
 *  - 3 หลักแรก = [prefix][YY]
 *  - 7 หลักท้าย = ตัวเลข
 */
export function validateSasbLot(
  lot: string,
  gradeString: string,
): { valid: boolean; message: string } {
  const value = String(lot || "").trim();

  if (value.length !== 10) {
    return { valid: false, message: "Lot ต้องมี 10 หลัก" };
  }

  if (!/^\d{7}$/.test(value.slice(3))) {
    return { valid: false, message: "Lot 7 หลักหลังสุดต้องเป็นตัวเลข" };
  }

  const expectedPrefix = buildSasbLotPrefix(gradeString);
  if (expectedPrefix && value.slice(0, 3) !== expectedPrefix) {
    return {
      valid: false,
      message: `Lot ต้องขึ้นต้นด้วย ${expectedPrefix} (ตาม package ของ Grade)`,
    };
  }

  return { valid: true, message: "" };
}
