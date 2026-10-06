import type { ReportData } from "@/type";
import { computeMaxFontByWidth } from "./reportPl";
import { resolveSasbPlantCode } from "./plantLogic";

/** SASB units สำหรับ fallback scan */
const SASB_UNITS = ["CCM", "ABS", "ABS3", "SAN3", "SAN12"];

export function resolveSasbReportData(): ReportData | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const qUnit = (params.get("unit") || "").toUpperCase();

  if (qUnit) {
    const raw = sessionStorage.getItem("recent_print_" + qUnit);
    if (raw) {
      try {
        return JSON.parse(raw) as ReportData;
      } catch {
        /* ignore */
      }
    }
  }

  for (const u of SASB_UNITS) {
    const raw = sessionStorage.getItem("recent_print_" + u);
    if (raw) {
      try {
        return JSON.parse(raw) as ReportData;
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

function buildMaterial(data: ReportData): string {
  return String(data.grade || "").trim();
}

/**
 * buildMaterialForQR — material ใน QR payload ของ SASB
 * ตัด package size (/900) ออก — เหลือแค่ grade ล้วน
 *   "GA300/900"    -> "GA300"
 *   "GA850SUB/850" -> "GA850SUB"
 * (ถ้าไม่มี "/" อยู่แล้ว คืนค่าเดิม)
 */
function buildMaterialForQR(data: ReportData): string {
  const material = buildMaterial(data);
  const slashIdx = material.indexOf("/");
  return slashIdx >= 0 ? material.slice(0, slashIdx) : material;
}

function generateLeftSide(data: ReportData): string {
  const titles = Array.isArray(data.titles) ? data.titles : [];
  if (titles.length === 0) return "";

  let html = `<div style="position: absolute; top: 270px; left: 0; width: 561px; text-align: center; padding-top: 1px;">`;
  titles.forEach((t) => {
    const text = t.text || "";
    const size = t.size || 30;
    const bold = t.bold ? "bold" : "normal";
    html += `<p class="sasb-title" style="font-size: ${size}px; font-weight: ${bold}; margin: 0;">${text}</p>`;
  });
  html += `</div>`;
  return html;
}

function generateRightSide(data: ReportData, runningNumber: string): string {
  const material = buildMaterial(data);
  const lot = String(data.lot || "");
  const netweight = String(data.netweight || "").replace(/,/g, "");
  const running = String(runningNumber);

  const showNSF = String(data.specialGrade || "").toUpperCase() === "Y";
  const nsfImg = data.nsfImage || "/images/nsf_logo.svg";

  const boxWidth = 529;
  const materialFontSize = computeMaxFontByWidth(
    material,
    "Arial",
    "bold",
    boxWidth - 20,
    24,
    55,
  );

  const mCtx = document.createElement("canvas").getContext("2d");
  let materialWidth = material.length * materialFontSize * 0.6;
  if (mCtx) {
    mCtx.font = `bold ${materialFontSize}px Arial`;
    materialWidth = mCtx.measureText(material).width;
  }
  const materialLeft = Math.max(0, (boxWidth - materialWidth) / 2);

  return `
  <div class="boxR" style="left: 580px; top: -25px">
    <div style="margin-top: 87px; width: 529px; height: 100px; border: none; position: relative;">
      <span style="position: absolute; left: ${materialLeft}px; top: 50%; transform: translateY(-50%); font-size: ${materialFontSize}px; font-weight: bold; white-space: nowrap; margin: 0; color: black;">${material}</span>
    </div>
    <div class="text-center-flex" style="height: 50px; border: none; margin-left: 170px; font-size: 40px; margin-top: 30px; font-weight: bold;">${lot}</div>
    <div class="text-center-flex" style="height: 50px; width: 150px; border: none; font-size: 40px; margin-top: 65px; margin-left: 279px;">${netweight}</div>
    <div class="abs_number" style="margin-top: 60px; margin-left: 320px;">${running}</div>
    ${
      showNSF
        ? `<div class="box-logo-tis" style="position: absolute; top: 340px; left: 370px;"><img src="${nsfImg}" alt="NSF" style="width: 30%; z-index: 3;" /></div>`
        : ""
    }
  </div>`;
}

function buildTopRightQRData(data: ReportData, runningNumber: string): string {
  // plant: ใช้ data.plantCode ถ้ามี; ถ้าว่าง fallback หาจาก API cache ด้วย grade
  const plant = resolveSasbPlantCode(data);
  const material = buildMaterialForQR(data); // SASB: ตัด package size ออก
  const lot = String(data.lot || "");
  const fix = "01";
  const running = String(runningNumber || "").padStart(3, "0");
  const packageSize = String(data.netweight || "").replace(/,/g, "");
  const tail = "JB1";
  return [plant, material, lot, fix, running, packageSize, tail].join("|");
}

function generateTopLeftQR(data: ReportData, runningNumber: string): string {
  const qrUrl = buildTopRightQRData(data, runningNumber);
  const size = 110;
  const qrId = `qr-tl-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  setTimeout(() => {
    const el = document.getElementById(qrId);
    const QR = (
      window as unknown as {
        QRCode?: new (el: HTMLElement, opts: object) => void;
      }
    ).QRCode;
    if (el && typeof QR !== "undefined") {
      new QR(el, { text: qrUrl, width: size, height: size });
    }
  }, 100);
  return `<div id="${qrId}" style="position: absolute; top: 26px; left: 26px; width: ${size}px; height: ${size}px;"></div>`;
}

export function generateSasbTagPage(
  pageNumber: number,
  data: ReportData,
): string {
  const controlprint = data.controlprint || { ft: false, lt: false, qr: true };
  const showTopLeftQR = controlprint.qr !== false;
  return `
   <section class="sheet">
    ${showTopLeftQR ? generateTopLeftQR(data, String(pageNumber)) : ""}
    ${generateLeftSide(data)}
    ${generateRightSide(data, String(pageNumber))}
    <div class="scissors-separator">✂️</div>
   </section>`;
}

export function buildMaterialForSpecs(data: ReportData): string {
  return buildMaterial(data);
}
