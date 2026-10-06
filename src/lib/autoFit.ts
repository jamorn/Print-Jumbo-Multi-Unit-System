/**
 * computeMaxFontByWidth
 * หา font-size (px) ที่ใหญ่ที่สุดที่ยังทำให้ข้อความ `text` พอดีกับ maxWidth
 * ใช้ canvas.measureText (แม่นยำ) — ถ้าไม่มี canvas ใช้ approximation
 *
 * Pattern: จาก ref/report.html (offline)
 */
export function computeMaxFontByWidth(
  text: string,
  fontFamily = "Arial",
  fontWeight = "bold",
  maxWidth = 600,
  minSize = 12,
  maxSize = 80,
): number {
  if (typeof document === "undefined") {
    // SSR fallback
    const approxChar = 0.6 * minSize;
    const est = Math.floor(maxWidth / (text.length * 0.6));
    return Math.max(minSize, Math.min(maxSize, est));
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext && canvas.getContext("2d");

  const measure = (size: number): number => {
    if (ctx) {
      ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
      return ctx.measureText(text).width;
    }
    const approxChar = 0.6 * size;
    return text.length * approxChar;
  };

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

/**
 * measureTextWidth — วัดความกว้างข้อความจริงที่ font-size ที่กำหนด
 */
export function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily = "Arial",
  fontWeight = "bold",
): number {
  if (typeof document === "undefined") {
    return text.length * fontSize * 0.6;
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}
