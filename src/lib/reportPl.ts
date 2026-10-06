import type { ReportData } from "@/type";

/**
 * reportPl — replicate inline script ใน report.html (PL)
 * ทุกอย่างเป็น pure function คืน HTML string
 */

export function computeMaxFontByWidth(
  text: string,
  fontFamily = "Arial",
  fontWeight = "bold",
  maxWidth: number,
  minSize = 12,
  maxSize = 80,
): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext && canvas.getContext("2d");

  function measure(size: number): number {
    if (ctx) {
      ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
      return ctx.measureText(text).width;
    }
    return text.length * 0.6 * size;
  }

  let lo = minSize;
  let hi = maxSize;
  let best = minSize;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const w = measure(mid);
    if (w <= maxWidth) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function getLogoPositions(template: string) {
  if (template === "template1") return { tisLeft: 0, qrLeft: 0, sirimLeft: 0 };
  if (template === "template2")
    return { tisLeft: 152, qrLeft: 287, sirimLeft: 0 };
  return { tisLeft: 75, qrLeft: 210, sirimLeft: 335 };
}

function generateGradeHTML(grade: string, netweight: string): string {
  let displayGrade = grade || "";
  if ((!displayGrade.includes("/") || displayGrade.match(/^\//)) && netweight) {
    const nw = String(netweight).replace(/,/g, "");
    if (nw) displayGrade = `${displayGrade}/${nw}`;
  }
  if (displayGrade.includes("/SB/")) {
    const parts = displayGrade.split("/");
    displayGrade = parts[0] + "/" + parts[1];
  }

  const pageWidth = 1122.5;
  const centerX = pageWidth * 0.8;
  const margin = 12;
  const spaceLeft = centerX - margin;
  const spaceRight = pageWidth - centerX - margin;
  const allowedWidth = Math.max(80, Math.min(spaceLeft, spaceRight) * 2);

  const fontSize = computeMaxFontByWidth(
    displayGrade,
    "Arial",
    "bold",
    allowedWidth,
    28,
    60,
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext && canvas.getContext("2d");
  let textWidth = displayGrade.length * fontSize * 0.6;
  if (ctx) {
    ctx.font = `bold ${fontSize}px Arial`;
    textWidth = ctx.measureText(displayGrade).width;
  }

  const gradeLeft = centerX - textWidth / 2;
  const rightOffset = pageWidth - gradeLeft - textWidth;
  const topOffset = -35;

  return `<div style="position: absolute; right: ${rightOffset}px; top: ${topOffset}px; font-size: ${fontSize}px; color: black; margin: 0; text-align: right; white-space: nowrap; font-weight: bold;">${displayGrade}</div>`;
}

function generateLotHTML(
  lot: string,
  leftOffset: number,
  topOffset: number,
): string {
  return `<div style="position: absolute; left: ${leftOffset}px; top: ${topOffset}px; font-size: 50px; color: black; margin: 0; text-align: left; white-space: nowrap;">${lot}</div>`;
}

function generateNetWeightHTML(
  netWeight: string,
  leftOffset: number,
  topOffset: number,
): string {
  const formattedWeight = Number(netWeight).toLocaleString("en-US");
  let adjustedLeft = leftOffset;
  if (parseInt(netWeight, 10) >= 1000) {
    adjustedLeft = leftOffset - 30 - 5;
  } else {
    adjustedLeft = leftOffset + 5;
  }
  return `<div style="position: absolute; left: ${adjustedLeft}px; top: ${topOffset + 8}px; font-size: 50px; color: black; margin: 0; text-align: left; white-space: nowrap;">${formattedWeight}</div>`;
}

function generateTextHTML(
  text: string,
  leftOffset: number,
  topOffset: number,
  fontSize: number,
  display = "block",
  textAlign = "left",
  width = "auto",
): string {
  return `<div style="position: absolute; left: ${leftOffset}px; top: ${topOffset}px; font-size: ${fontSize}px; display: ${display}; text-align: ${textAlign}; width: ${width}; white-space: nowrap;">${text}</div>`;
}

function generateBoxes(
  runningNumber: string,
  date: string,
  shift: string,
  leftOffset: number,
  topOffset: number,
): string {
  const boxes: string[] = [];
  for (let i = 0; i < 3; i++)
    boxes.push(`<div class="bno">${runningNumber[i]}</div>`);
  boxes.push(`<div class="bno-middle">-</div>`);
  for (let i = 0; i < 2; i++) boxes.push(`<div class="bno">${date[i]}</div>`);
  boxes.push(`<div class="bno-middle">-</div>`);
  boxes.push(`<div class="bno">${shift}</div>`);
  return `<div style="position: absolute; left: ${leftOffset}px; top: ${topOffset}px; display: inline-block; white-space: nowrap; line-height: 0;">${boxes.join("")}</div>`;
}

function generateTISLogo(
  leftOffset: number,
  topOffset: number,
  width: number,
  unit: string,
): string {
  if (!leftOffset) return "";
  let tisText = "";
  if (unit === "HDPE") tisText = "TIS. 2559-2554 (2011)";
  else if (unit === "PP" || unit === "PPC") tisText = "TIS. 1306-2566";

  return `<div style="position: absolute; left: ${leftOffset}px; top: ${topOffset}px; width: ${width}px; display: block;"><img src="/images/mfg.png" alt="TIS Logo" style="width: 100%; height: auto;"><p style="font-size: 10px; text-align: center; margin-top: 3px; font-weight: bold; white-space: nowrap;">${tisText}</p></div>`;
}

function generateQRCode(
  leftOffset: number,
  topOffset: number,
  size: number,
  qrUrl?: string,
): string {
  if (!leftOffset) return "";
  const qrId = `qr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  setTimeout(() => {
    const el = document.getElementById(qrId);
    const QR = (
      window as unknown as {
        QRCode?: new (el: HTMLElement, opts: object) => void;
      }
    ).QRCode;
    if (el && typeof QR !== "undefined") {
      new QR(el, {
        text: qrUrl || "https://appdb.tisi.go.th/Q/i.php?d=1351525040",
        width: size,
        height: size,
      });
    }
  }, 100);
  return `<div id="${qrId}" style="position: absolute; left: ${leftOffset}px; top: ${topOffset}px; width: ${size}px; height: ${size}px;"></div>`;
}

function generateSIRIMLogo(
  leftOffset: number,
  topOffset: number,
  width: number,
  t1?: string,
  t2?: string,
  t3?: string,
): string {
  if (!leftOffset) return "";
  return `<div style="position: absolute; left: ${leftOffset}px; top: ${topOffset}px; width: ${width}px; display: block; text-align: center;"><img src="/images/sirim_logo.png" alt="SIRIM Logo" style="width: 100%; height: auto;"><div style="font-size: 9px; margin-top: 3px; line-height: 1.3; white-space: nowrap;"><p style="margin: 1px 0;">${t1 || "Certified to MS1058 : PART 1 : 2005"}</p><p style="margin: 1px 0;">${t2 || "Certified No. : PC004152"}</p><p style="margin: 1px 0; font-weight: bold;">${t3 || "Designation : PE100"}</p></div></div>`;
}

function generateFTHTML(
  rightOffset: number,
  topOffset: number,
  fontSize: number,
  display: string,
): string {
  return `<div style="position: absolute; top: ${topOffset}px; right: ${rightOffset}px; display: ${display};"><p style="font-size: ${fontSize}px">(F/T)</p></div>`;
}

function generateLTHTML(
  rightOffset: number,
  topOffset: number,
  fontSize: number,
  display: string,
): string {
  return `<div style="position: absolute; top: ${topOffset}px; right: ${rightOffset}px; display: ${display};"><p style="font-size: ${fontSize}px">(L/T)</p></div>`;
}

function getPlantCode(unit: string, lot: string): string {
  const u = (unit || "").toUpperCase();
  if (u === "HDPE") return "1301";
  if (u === "PPC") return "1324";
  if (u === "PP") {
    const lotStr = String(lot || "");
    if (lotStr.length >= 4) {
      const checkDigit = parseInt(lotStr.slice(-4).charAt(0), 10);
      if (checkDigit >= 1 && checkDigit <= 3) return "1311";
      if (checkDigit === 4 || checkDigit === 5) return "1312";
    }
    return "1311";
  }
  return "1301";
}

function buildTopRightQRData(data: ReportData, runningNumber: string): string {
  const plant = getPlantCode(data.unit, data.lot);
  let materialPkg = String(data.grade || "").trim();
  if (materialPkg.includes("/SB/")) {
    materialPkg = materialPkg.split("/").slice(0, 2).join("/");
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

export function generatePlTagPage(
  pageNumber: number,
  data: ReportData,
): string {
  const runningNumber = String(pageNumber).padStart(3, "0");
  const date = String(data.idate || new Date().getDate()).padStart(2, "0");
  const shift = data.shift || "M";
  const template = data.template || "template1";
  const controlprint = data.controlprint || { ft: false, lt: false, qr: true };

  let showTIS = false;
  let showQR = false;
  let showSIRIM = false;
  if (template === "template2") {
    showTIS = true;
    showQR = true;
  } else if (template === "template3") {
    showTIS = true;
    showQR = true;
    showSIRIM = data.unit === "HDPE";
  }

  const ftDisplay =
    controlprint.ft && pageNumber === parseInt(data.fromPage, 10)
      ? "block"
      : "none";
  const ltDisplay =
    controlprint.lt && pageNumber === parseInt(data.toPage, 10)
      ? "block"
      : "none";
  const showTopLeftQR = controlprint.qr !== false;

  const positions = getLogoPositions(template);

  const defaultTitles: Record<string, [string, string]> = {
    HDPE: ["HDPE", "HIGH DENSITY POLYETHYLENE"],
    PP: ["PP", "POLYPROPYLENE"],
    PPC: ["PPC", "POLYPROPYLENE COMPOUND"],
  };
  const [defTitle1, defTitle2] = defaultTitles[data.unit] || ["", ""];

  return `
   <section class="sheet">
    ${showTopLeftQR ? generateTopLeftQR(data, runningNumber) : ""}
    <div class="header">${generateGradeHTML(data.grade, data.netweight)}</div>
    ${generateLotHTML(data.lot || "N/A", 780, 210)}
    ${generateBoxes(runningNumber, date, shift, 775, 438)}
    ${generateNetWeightHTML(data.netweight || "N/A", 895, 320)}
    ${generateTextHTML(data.title1 || defTitle1, 0, 240, 60, "block", "center", "550px")}
    ${generateTextHTML(data.title2 || defTitle2, 0, 320, 30, "block", "center", "550px")}
    ${showTIS ? generateTISLogo(positions.tisLeft, 430, 120, data.unit) : ""}
    ${showQR ? generateQRCode(positions.qrLeft, 430, 110, data.qrCodeUrl) : ""}
    ${showSIRIM ? generateSIRIMLogo(positions.sirimLeft, 430, 140, data.sirim_title1, data.sirim_title2, data.sirim_title3) : ""}
    ${generateFTHTML(820, 315, 50, ftDisplay)}
    ${generateLTHTML(820, 495, 50, ltDisplay)}
    <div class="scissors-separator">✂️</div>
   </section>`;
}
