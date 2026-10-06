/**
 * shiftLogic — replicate js/shift_compare.js
 *  - M (Morning) 06:00–13:59
 *  - E (Evening) 14:00–21:59
 *  - N (Night)   22:00–05:59
 */
export type Shift = "M" | "E" | "N";

export function shiftTable(date: Date = new Date()): Shift {
  const hour = date.getHours();
  if (hour >= 6 && hour < 14) return "M";
  if (hour >= 14 && hour < 22) return "E";
  return "N";
}

export const SHIFT_STATUS_TEXT: Record<Shift, string> = {
  M: "ตอนนี้คือเวลาทำงานของกะเช้า",
  E: "ตอนนี้คือเวลาทำงานของกะบ่าย",
  N: "ตอนนี้คือเวลาทำงานของกะดึก",
};

export function getShiftStatusText(shift: Shift): string {
  return SHIFT_STATUS_TEXT[shift] || "-";
}
