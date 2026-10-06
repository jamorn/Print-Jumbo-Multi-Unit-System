import type { ReportData, UnitId } from "@/type";
import { getCachedAlldata } from "./gasClient";
import { UNIT_KEY_MAP } from "./unitMapping";

/**
 * getPlantCode — หา plant code (สำหรับ QR) จาก unit + lot
 *
 * กฎ (PL):  จาก report.html เดิม
 *  - HDPE -> 1301 (ตายตัว)
 *  - PPC  -> 1324 (ตายตัว, lot 8 หลัก)
 *  - PP   -> ใช้ 4 ตัวท้ายของ lot (10 หลัก) → เอาตัวแรก (extruder)
 *             1,2,3 -> 1311 ; 4,5 -> 1312
 *
 * SASB: ใช้ plantCode ของ grade
 */
export function getPlantCode(unit: string, lot: string): string {
  const u = (unit || "").toUpperCase();

  if (u === "HDPE") return "1301";
  if (u === "PPC") return "1324";

  if (u === "PP") {
    const lotStr = String(lot || "");
    if (lotStr.length >= 4) {
      const last4 = lotStr.slice(-4); // e.g. "4272"
      const checkDigit = parseInt(last4.charAt(0), 10); // -> 4
      if (checkDigit >= 1 && checkDigit <= 3) return "1311";
      if (checkDigit === 4 || checkDigit === 5) return "1312";
    }
    return "1311"; // fallback
  }

  return "1301"; // fallback
}

/**
 * resolveSasbPlantCode — หา plantCode ของ SASB
 * 1) ใช้ data.plantCode ถ้ามี
 * 2) ถ้าว่าง → ค้นจาก API cache (localStorage "gas_alldata")
 *    โดย match grade + unit
 *
 * เหตุผล: API ส่ง plantCode มาครบในแต่ละ gradeItem แล้ว
 *         (เช่น { grade: "AN450R 5204", plantCode: "1377", ... })
 *         จึง fallback ได้เมื่อ form.plantCode ว่าง
 */
export function resolveSasbPlantCode(data: {
  unit?: string;
  grade?: string;
  plantCode?: string;
}): string {
  const direct = String(data.plantCode || "").trim();
  if (direct) return direct;

  const u = data.unit as UnitId | undefined;
  if (!u) return "";

  const alldata = getCachedAlldata();
  if (!alldata || !alldata.alldata) return "";

  const key = UNIT_KEY_MAP[u];
  if (!key) return "";

  const items = alldata.alldata[key];
  if (!Array.isArray(items)) return "";

  // grade ในรายงานเป็น "grade ล้วน" (ตัด /netweight ออกแล้ว)
  // แต่ใน API อาจเป็น "AN450R 5204" — เทียบแบบ trim + case-insensitive
  const target = String(data.grade || "")
    .trim()
    .toUpperCase();
  if (!target) return "";

  const found = items.find(
    (it) =>
      String(it.grade || "")
        .trim()
        .toUpperCase() === target,
  );
  return found ? String(found.plantCode || "").trim() : "";
}

/**
 * buildTopRightQRData (PL)
 *   plant|material/packageSize|lot|01|runningNumber|packageSize|JB1
 * - Seabulk grade: "P901BK/SB/16500" -> "P901BK/SB"
 * - Normal grade : "1105PC/750"       -> "1105PC/750"
 */
export function buildPlQrData(data: ReportData, runningNumber: string): string {
  const plant = getPlantCode(data.unit, data.lot);

  let materialPkg = String(data.grade || "").trim();
  if (materialPkg.includes("/SB/")) {
    materialPkg = materialPkg.split("/").slice(0, 2).join("/"); // "P901BK/SB"
  } else if (!materialPkg.includes("/") && data.netweight) {
    materialPkg = `${materialPkg}/${String(data.netweight).replace(/,/g, "")}`;
  }

  const lot = String(data.lot || "");
  const fix = "01";
  const running = String(runningNumber || "").padStart(3, "0");
  const packageSize = String(data.netweight || "").replace(/,/g, "");
  const tail = "JB1";

  return [plant, materialPkg, lot, fix, running, packageSize, tail].join("|");
}

/**
 * buildSasbQrData
 *   <plantCode>|<material>|<lot>|01|<running>|<netweight>|JB1
 */
export function buildSasbQrData(
  data: ReportData,
  runningNumber: string,
): string {
  // fallback: ถ้า data.plantCode ว่าง -> หาจาก API cache ด้วย grade
  const plant = resolveSasbPlantCode(data);
  const material = buildSasbMaterial(data);
  const lot = String(data.lot || "");
  const fix = "01";
  const running = String(runningNumber || "").padStart(3, "0");
  const packageSize = String(data.netweight || "").replace(/,/g, "");
  const tail = "JB1";
  return [plant, material, lot, fix, running, packageSize, tail].join("|");
}

/**
 * buildSasbMaterial — material สำหรับ QR SASB
 * SASB ตัด package size (/900) ออก — เหลือ grade ล้วน
 *   "GA300/900" -> "GA300"
 */
function buildSasbMaterial(data: ReportData): string {
  let material = String(data.grade || "").trim();
  const slashIdx = material.indexOf("/");
  if (slashIdx >= 0) material = material.slice(0, slashIdx);
  return material;
}
