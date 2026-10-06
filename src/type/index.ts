// ============================================================
// Core Types — Print Tag Jumbo (Online / Next.js)
// ============================================================

/**
 * GradeItem — 1 รายการเกรด (ตรงกับ GAS "gradeData<plantCode>")
 */
export interface GradeItem {
  grade: string;
  netweightArray: number[];
  description: string;
  status: boolean;
  sub: boolean;
  plantName: string;
  plantCode: string;
  specialGrade: string; // "Y" | "N"
}

/**
 * GAS response: alldata = { gradeData1372: GradeItem[], gradeData1301: ... }
 * key เป็น dynamic — ขึ้นกับ plantCode
 */
export type AllDataResponse = {
  alldata: Record<string, GradeItem[]>;
};

/** โปรไฟล์ของแต่ละระบบงาน */
export type UnitProfile = "PL" | "SASB";

/** identifier ของ 8 หน่วยผลิต */
export type UnitId =
  | "HDPE"
  | "PP"
  | "PPC"
  | "CCM"
  | "ABS"
  | "ABS3"
  | "SAN12"
  | "SAN3";

/** title ฝั่งซ้าย (SASB) */
export interface TitleLine {
  text: string;
  size: number;
  bold: boolean;
}

/**
 * unitMeta — ข้อมูล level-unit ที่ hardcode ไว้ในแอป
 * (ไม่รวม gradeData ซึ่งดึงจาก GAS)
 */
export interface UnitMeta {
  id: UnitId;
  profile: UnitProfile;
  /** ชื่อที่แสดงบนปุ่ม (เช่น SAN12 -> "SAN1-2") */
  displayName: string;
  fullName: string;
  /** prefix สำหรับ QR (ถ้ามี) */
  qrPrefix?: string;
  /** titles SASB: แยกตาม specialGrade N/Y */
  titles?: {
    N: TitleLine[];
    Y: TitleLine[];
  };
  /** PL: title บรรทัด (title1/title2) */
  defaults?: {
    grade?: string;
    netweight?: string;
    title1?: string;
    title2?: string;
    backgroundImage?: string;
    hips_image?: string;
  };
  validation: {
    lotLength: number;
    lotPattern: string; // เก็บเป็น string แล้ว compile ตอนใช้
    requiredFields: string[];
  };
  /** plantCode ที่ใช้เป็น key ใน GAS (gradeData<key>) */
  gasKey: string;
  /** template ที่ใช้ได้ (PL) */
  availableTemplates?: string[];
  defaultTemplate?: string;
  /** สีของตาราง/ไอคอน unit */
  badgeColor?: string;
}

/** ข้อมูลที่ส่งจากฟอร์มไปหน้า report */
export interface ReportData {
  unit: UnitId;
  grade: string;
  netweight: string;
  lot: string;
  fromPage: string;
  toPage: string;
  shift?: string;
  idate?: string;
  template?: string;
  controlprint?: { ft: boolean; lt: boolean; qr: boolean };
  // PL extra
  title1?: string;
  title2?: string;
  sirim_title1?: string;
  sirim_title2?: string;
  sirim_title3?: string;
  qrCodeUrl?: string;
  // SASB extra
  titles?: TitleLine[];
  netweightArray?: number[];
  specialGrade?: string;
  plantName?: string;
  plantCode?: string;
  backgroundImage?: string;
  hips_image?: string;
  nsfImage?: string;
}

/** option ที่ได้จาก generateGradeOptions */
export interface GradeOption {
  grade: string;
  netweight: number;
  isSub: boolean;
  isSeabulk: boolean;
  gradeString: string;
  displayText: string;
  description?: string;
  // SASB extra
  specialGrade?: string;
  isSpecial?: boolean;
  plantCode?: string;
  plantName?: string;
}
