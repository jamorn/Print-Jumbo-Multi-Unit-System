import type { UnitId, UnitMeta } from "@/type";

/**
 * UNIT_META — ข้อมูล level-unit ที่ hardcode ไว้ในแอป
 * (gradeData ดึงจาก GAS API แทน)
 *
 * แหล่งอ้างอิง: offline config เดิม
 *   - js/unitConfig.js         (HDPE, PP, PPC)
 *   - js/unit_CCM_Config.js    (CCM)
 *   - js/unit_ABS_Config.js    (ABS)
 *   - js/unit_ABS3_Config.js   (ABS3)
 *   - js/unit_SAN3_Config.js   (SAN3)
 *   - js/unit_SAN12_Config.js  (SAN12)
 */
export const UNIT_META: Record<UnitId, UnitMeta> = {
  // ============================================================
  // PL
  // ============================================================
  HDPE: {
    id: "HDPE",
    profile: "PL",
    displayName: "HDPE",
    fullName: "High-Density Polyethylene",
    qrPrefix: "HDPE",
    gasKey: "gradeData1301",
    defaults: {
      grade: "P901BK",
      netweight: "750",
      title1: "HDPE",
      title2: "HIGH DENSITY POLYETHYLENE",
      backgroundImage: "images/polimaxx.jpg",
    },
    availableTemplates: ["template1", "template2", "template3"],
    defaultTemplate: "template3",
    validation: {
      lotLength: 10,
      lotPattern: "^\\d{10}$",
      requiredFields: [
        "grade",
        "netweight",
        "lot",
        "fromPage",
        "toPage",
        "shift",
        "idate",
      ],
    },
  },

  PP: {
    id: "PP",
    profile: "PL",
    displayName: "PP",
    fullName: "Polypropylene",
    qrPrefix: "PP",
    gasKey: "gradeData1311_1312",
    defaults: {
      grade: "1105SC",
      netweight: "750",
      title1: "PP",
      title2: "POLYPROPYLENE",
      backgroundImage: "images/polimaxx.jpg",
    },
    availableTemplates: ["template1", "template2"],
    defaultTemplate: "template2",
    validation: {
      lotLength: 10,
      lotPattern: "^\\d{10}$",
      requiredFields: [
        "grade",
        "netweight",
        "lot",
        "fromPage",
        "toPage",
        "shift",
        "idate",
      ],
    },
  },

  PPC: {
    id: "PPC",
    profile: "PL",
    displayName: "PPC",
    fullName: "Polypropylene Compound",
    qrPrefix: "PPC",
    gasKey: "gradeData1324",
    defaults: {
      grade: "FL203D",
      netweight: "750",
      title1: "PPC",
      title2: "POLYPROPYLENE COMPOUND",
      backgroundImage: "images/polimaxx.jpg",
    },
    availableTemplates: ["template1", "template2"],
    defaultTemplate: "template1",
    validation: {
      lotLength: 8, // PPC: lot 8 หลัก
      lotPattern: "^\\d{8}$",
      requiredFields: [
        "grade",
        "netweight",
        "lot",
        "fromPage",
        "toPage",
        "shift",
        "idate",
      ],
    },
  },

  // ============================================================
  // SASB
  // ============================================================
  CCM: {
    id: "CCM",
    profile: "SASB",
    displayName: "CCM",
    fullName: "ACRYLONITRILE BUTADIENE STYRENE",
    qrPrefix: "ABS",
    gasKey: "gradeData1377",
    titles: {
      N: [
        { text: "ABS", size: 60, bold: true },
        { text: "ACRYLONITRILE", size: 40, bold: false },
        { text: "BUTADIENE STYRENE", size: 40, bold: false },
      ],
      Y: [
        { text: "HIPS", size: 60, bold: true },
        { text: "HIGH IMPACT POLYSTYRENE", size: 35, bold: false },
      ],
    },
    defaults: {
      grade: "GA300",
      netweight: "750",
      backgroundImage: "images/polimaxx.jpg",
      hips_image: "images/nsf_logo.svg",
    },
    availableTemplates: ["template1", "template2", "template3"],
    defaultTemplate: "template1",
    validation: {
      lotLength: 10,
      lotPattern: "^[A-Z0-9]{10}$",
      requiredFields: ["grade", "netweight", "lot", "fromPage", "toPage"],
    },
  },

  ABS: {
    id: "ABS",
    profile: "SASB",
    displayName: "ABS",
    fullName: "Acrylonitrile Butadiene Styrene",
    qrPrefix: "ABS",
    gasKey: "gradeData1372",
    titles: {
      N: [
        { text: "ABS", size: 60, bold: true },
        { text: "ACRYLONITRILE", size: 40, bold: false },
        { text: "BUTADIENE STYRENE", size: 40, bold: false },
      ],
      Y: [
        { text: "HIPS", size: 60, bold: true },
        { text: "HIGH IMPACT POLYSTYRENE", size: 35, bold: false },
      ],
    },
    defaults: {
      grade: "GA300",
      netweight: "750",
      backgroundImage: "images/polimaxx.jpg",
      hips_image: "images/nsf_logo.svg",
    },
    availableTemplates: ["template1", "template2", "template3"],
    defaultTemplate: "template1",
    validation: {
      lotLength: 10,
      lotPattern: "^[A-Z0-9]{10}$",
      requiredFields: ["grade", "netweight", "lot", "fromPage", "toPage"],
    },
  },

  ABS3: {
    id: "ABS3",
    profile: "SASB",
    displayName: "ABS3",
    fullName: "ABS POWDER",
    qrPrefix: "ABS3",
    gasKey: "gradeData1373",
    titles: {
      N: [{ text: "ABS POWDER", size: 60, bold: true }],
      Y: [
        { text: "HIPS", size: 60, bold: true },
        { text: "HIGH IMPACT POLYSTYRENE", size: 35, bold: false },
      ],
    },
    defaults: {
      grade: "GA300",
      netweight: "750",
      backgroundImage: "images/polimaxx.jpg",
      hips_image: "images/nsf_logo.svg",
    },
    availableTemplates: ["template1", "template2", "template3"],
    defaultTemplate: "template1",
    validation: {
      lotLength: 10,
      lotPattern: "^[A-Z0-9]{10}$",
      requiredFields: ["grade", "netweight", "lot", "fromPage", "toPage"],
    },
  },

  SAN12: {
    id: "SAN12",
    profile: "SASB",
    displayName: "SAN1-2", // ปุ่มแสดงชื่อนี้
    fullName: "Acrylonitrile Butadiene Styrene",
    qrPrefix: "SAN12",
    gasKey: "gradeData1374",
    titles: {
      N: [
        { text: "SAN", size: 60, bold: true },
        { text: "STYRENE ACRYLONITRILE", size: 35, bold: false },
      ],
      Y: [
        { text: "HIPS", size: 60, bold: true },
        { text: "HIGH IMPACT POLYSTYRENE", size: 35, bold: false },
      ],
    },
    defaults: {
      grade: "GA300",
      netweight: "750",
      backgroundImage: "images/polimaxx.jpg",
      hips_image: "images/nsf_logo.svg",
    },
    availableTemplates: ["template1", "template2", "template3"],
    defaultTemplate: "template1",
    validation: {
      lotLength: 10,
      lotPattern: "^[A-Z0-9]{10}$",
      requiredFields: ["grade", "netweight", "lot", "fromPage", "toPage"],
    },
  },

  SAN3: {
    id: "SAN3",
    profile: "SASB",
    displayName: "SAN3",
    fullName: "STYRENE ACRYLONITRILE",
    qrPrefix: "SAN3",
    gasKey: "gradeData1375",
    titles: {
      N: [
        { text: "SAN", size: 60, bold: true },
        { text: "STYRENE ACRYLONITRILE", size: 35, bold: false },
      ],
      Y: [
        { text: "HIPS", size: 60, bold: true },
        { text: "HIGH IMPACT POLYSTYRENE", size: 35, bold: false },
      ],
    },
    defaults: {
      grade: "GA300",
      netweight: "750",
      backgroundImage: "images/polimaxx.jpg",
      hips_image: "images/nsf_logo.svg",
    },
    availableTemplates: ["template1", "template2", "template3"],
    defaultTemplate: "template1",
    validation: {
      lotLength: 10,
      lotPattern: "^[A-Z0-9]{10}$",
      requiredFields: ["grade", "netweight", "lot", "fromPage", "toPage"],
    },
  },
};

/** helper: ดึง meta ของ unit */
export function getUnitMeta(unit: UnitId): UnitMeta {
  return UNIT_META[unit];
}
