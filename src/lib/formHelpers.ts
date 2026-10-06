import type { GradeOption } from "@/type";
import { useAppStore } from "@/store/useAppStore";
import { buildSasbLotPrefix } from "./lotValidation";
import { UNIT_META } from "./unitMeta";
import { loadGradeHistory } from "./gradeHistory";

/**
 * updateFormWithSelection (PL)
 * replicate window.updateFormWithSelection
 * - sets form.grade / netweight / template rules / lot prefix
 */
export function updateFormWithSelection(option: GradeOption): void {
  const store = useAppStore.getState();
  const unit = store.unit;
  const meta = UNIT_META[unit];

  const fullGrade =
    option.displayText && option.displayText.trim() !== ""
      ? option.displayText.trim()
      : option.isSub
        ? `${option.grade} SUB/${option.netweight}`
        : `${option.grade}/${option.netweight}`;

  // lot prefix (PL): [first char of netweight][YY], seabulk -> "9"
  const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
  const isSeabulk = option.netweight >= 16000;
  const lotPrefix = isSeabulk
    ? "9" + yy
    : String(option.netweight).charAt(0) + yy;

  const defaultTemplate = option.isSub ? "template1" : meta.defaultTemplate || "template1";

  store.setSelectedGrade(option);
  store.setForm({
    grade: fullGrade,
    netweight: String(option.netweight),
    lot: lotPrefix,
    template: defaultTemplate,
  });

  // restore from history ถ้ามี
  const hist = loadGradeHistory(unit, fullGrade);
  if (hist) {
    const cur = useAppStore.getState().form;
    store.setForm({
      lot: hist.lot && hist.lot.length === 10 ? hist.lot : cur.lot,
      fromPage: String(hist.fromPage || "1"),
      toPage: String(hist.toPage || "1"),
      template: option.isSub ? "template1" : hist.template || defaultTemplate,
      ft: hist.controlprint?.ft ?? false,
      lt: hist.controlprint?.lt ?? false,
      qr: hist.controlprint?.qr ?? true,
    });
  }
}

/**
 * updateSasbFormWithSelection (SASB)
 * replicate window.updateSasbFormWithSelection
 */
export function updateSasbFormWithSelection(option: GradeOption): void {
  const store = useAppStore.getState();
  const unit = store.unit;

  const fullGrade =
    option.displayText && option.displayText.trim() !== ""
      ? option.displayText.trim()
      : option.isSub
        ? `${option.grade}SUB/${option.netweight}`
        : `${option.grade}/${option.netweight}`;

  const prefix = buildSasbLotPrefix(fullGrade);

  store.setSelectedGrade(option);
  store.setForm({
    grade: fullGrade,
    netweight: String(option.netweight),
    plantName: option.plantName || "",
    specialGrade: option.specialGrade || "N",
    plantCode: option.plantCode || "",
    lot: prefix, // 3 หลักแรก
    template: "template4",
  });

  const hist = loadGradeHistory(unit, fullGrade);
  if (hist) {
    store.setForm({
      fromPage: String(hist.fromPage || "1"),
      toPage: String(hist.toPage || "1"),
      qr: hist.controlprint?.qr ?? true,
    });
  }
}
