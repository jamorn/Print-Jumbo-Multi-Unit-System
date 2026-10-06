"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { UNIT_META } from "@/lib/unitMeta";
import { shiftTable } from "@/lib/shiftLogic";
import { saveGradeHistory } from "@/lib/gradeHistory";
import { HistoryModal } from "./HistoryModal";
import type { ReportData } from "@/type";

const TEMPLATE_NAMES: Record<string, string> = {
  template1: "ไม่มีโลโก้ ไม่มีตรา",
  template2: "QR Code + มอก.",
  template3: "QR + มอก. + SIRIM",
};

export function FormPl() {
  const unit = useAppStore((s) => s.unit);
  const form = useAppStore((s) => s.form);
  const setForm = useAppStore((s) => s.setForm);
  const setReportData = useAppStore((s) => s.setReportData);
  const meta = UNIT_META[unit];

  const [errors, setErrors] = useState<{
    lot?: string;
    from?: string;
    to?: string;
  }>({});
  const [historyOpen, setHistoryOpen] = useState(false);

  // auto-set shift on first load
  useEffect(() => {
    if (!form.shiftManuallySet) {
      setForm({ shift: shiftTable() });
    }
  }, [form.shiftManuallySet, setForm]);

  const isSub = /\bSUB\b/i.test(form.grade);
  const templates = meta.availableTemplates || [
    "template1",
    "template2",
    "template3",
  ];

  function validatePages(from: string, to: string) {
    const f = parseInt(from, 10);
    const t = parseInt(to, 10);
    const err: typeof errors = {};
    if (isNaN(f) || f < 1) err.from = "ต้องมากกว่าหรือเท่ากับ 1";
    if (isNaN(t) || t < 1) err.to = "ต้องมากกว่าหรือเท่ากับ 1";
    if (!err.from && !err.to && f > t)
      err.from = "จากหน้าต้องไม่มากกว่าถึงหน้า";
    // 🔧 overwrite เฉพาะ from/to — คง lot error เดิมไว้
    setErrors((prev) => {
      const next = { ...prev };
      delete next.from;
      delete next.to;
      return { ...next, ...err };
    });
    return Object.keys(err).length === 0;
  }

  function validateLot(lot: string): boolean {
    const len = meta.validation.lotLength;
    if (lot.length === 0) {
      setErrors((e) => ({ ...e, lot: undefined }));
      return false;
    }
    if (lot.length !== len) {
      setErrors((e) => ({ ...e, lot: `⚠️ Lot ต้องมี ${len} หลัก` }));
      return false;
    }
    setErrors((e) => ({ ...e, lot: undefined }));
    return true;
  }

  // ปุ่ม submit เปิดเฉพาะเมื่อข้อมูลครบ + หน้าถูกต้อง
  const isValid = useMemo(() => {
    if (!form.grade || !form.netweight) return false;
    if (form.lot.length !== meta.validation.lotLength) return false;
    const f = parseInt(form.fromPage, 10);
    const t = parseInt(form.toPage, 10);
    if (isNaN(f) || f < 1) return false;
    if (isNaN(t) || t < 1) return false;
    if (f > t) return false;
    return true;
  }, [
    form.grade,
    form.netweight,
    form.lot,
    form.fromPage,
    form.toPage,
    meta.validation.lotLength,
  ]);

  function handleSubmit() {
    if (!form.grade || !form.netweight) {
      alert("กรุณาเลือก Grade จากตารางด้านซ้าย");
      return;
    }
    const len = meta.validation.lotLength;
    if (form.lot.length !== len) {
      alert("กรุณาใส่ Lot ให้ครบ " + len + " หลัก");
      return;
    }
    if (!validatePages(form.fromPage, form.toPage)) {
      alert("กรุณาตรวจสอบ จากหน้า/ถึงหน้า");
      return;
    }

    const reportData: ReportData = {
      unit,
      grade: form.grade,
      netweight: form.netweight,
      lot: form.lot,
      fromPage: form.fromPage,
      toPage: form.toPage,
      shift: form.shift,
      idate: form.idate,
      template: form.template || meta.defaultTemplate,
      controlprint: { ft: form.ft, lt: form.lt, qr: form.qr },
      plantCode: meta.gasKey.replace(/\D/g, ""),
      title1: meta.defaults?.title1 || "",
      title2: meta.defaults?.title2 || "",
    };

    saveGradeHistory(unit, form.grade, {
      lot: form.lot,
      netweight: form.netweight,
      fromPage: form.fromPage,
      toPage: form.toPage,
      shift: form.shift,
      idate: form.idate,
      template: form.template,
      controlprint: { ft: form.ft, lt: form.lt, qr: form.qr },
    });

    setReportData(reportData);
    sessionStorage.setItem("recent_print_" + unit, JSON.stringify(reportData));
    window.open("/report?unit=" + unit, "_blank");
  }

  return (
    <>
      <div className="theme-card rounded-xl p-6 shadow-lg">
        <div
          className="theme-border flex items-center justify-between rounded-xl border-b p-4"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <h2 className="theme-text-primary text-xl font-semibold">
            ข้อมูลการผลิตและการตั้งค่า
          </h2>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            🕐 ประวัติ
          </button>
        </div>

        <div className="p-6">
          <p className="theme-text-primary theme-border mb-4 border-b pb-2 font-bold">
            1. ข้อมูลการผลิต
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Lot">
              <input
                id="lot"
                inputMode="numeric"
                placeholder="ใส่ Lot การผลิต"
                value={form.lot}
                maxLength={meta.validation.lotLength}
                onChange={(e) => {
                  const v = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, meta.validation.lotLength);
                  setForm({ lot: v });
                  validateLot(v);
                }}
                className="theme-input w-full rounded-lg border p-2.5 shadow-sm"
              />
              {errors.lot && (
                <span className="text-sm font-medium text-red-500">
                  {errors.lot}
                </span>
              )}
            </Field>
            <Field label="Grade">
              <input
                id="grade"
                value={form.grade}
                readOnly
                placeholder="เลือกจากตาราง"
                className="theme-input w-full cursor-not-allowed rounded-lg border p-2.5 shadow-sm"
              />
            </Field>
            <Field label="Net Weight">
              <input
                id="netweight"
                value={form.netweight}
                readOnly
                placeholder="Net Weight"
                className="theme-input w-full cursor-not-allowed rounded-lg border p-2.5 shadow-sm"
              />
            </Field>
            <Field label="เครื่องหมาย มอก.">
              <input
                id="tis"
                value={isSub ? "N" : "Y"}
                readOnly
                className="theme-input w-full cursor-not-allowed rounded-lg border p-2.5 shadow-sm"
              />
            </Field>
          </div>

          <p className="theme-text-primary theme-border mb-4 border-b pb-2 font-bold">
            2. กะและวันที่
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="กะ">
              <select
                id="shift"
                value={form.shift}
                onChange={(e) =>
                  setForm({ shift: e.target.value, shiftManuallySet: true })
                }
                className="theme-input shift-select w-full rounded-lg border p-2.5 shadow-sm"
              >
                <option value="M">M (Morning)</option>
                <option value="E">E (Evening)</option>
                <option value="N">N (Night)</option>
              </select>
            </Field>
            <Field label="วันที่">
              <input
                id="idate"
                type="number"
                min={1}
                max={31}
                value={form.idate}
                onChange={(e) => setForm({ idate: e.target.value })}
                className="theme-input w-full rounded-lg border p-2.5 shadow-sm"
              />
            </Field>
          </div>

          <p className="theme-text-primary theme-border mb-4 border-b pb-2 font-bold">
            3. การตั้งค่าการพิมพ์
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="จากหน้า">
              <input
                id="frompage"
                type="number"
                min={1}
                value={form.fromPage}
                onChange={(e) => {
                  setForm({ fromPage: e.target.value });
                  validatePages(e.target.value, form.toPage);
                }}
                className="theme-input w-full rounded-lg border p-2.5 shadow-sm"
              />
              {errors.from && (
                <span className="text-sm font-medium text-red-500">
                  {errors.from}
                </span>
              )}
            </Field>
            <Field label="ถึงหน้า">
              <input
                id="topage"
                type="number"
                min={1}
                value={form.toPage}
                onChange={(e) => {
                  setForm({ toPage: e.target.value });
                  validatePages(form.fromPage, e.target.value);
                }}
                className="theme-input w-full rounded-lg border p-2.5 shadow-sm"
              />
              {errors.to && (
                <span className="text-sm font-medium text-red-500">
                  {errors.to}
                </span>
              )}
            </Field>
          </div>

          <p className="theme-text-primary theme-border mb-4 border-b pb-2 font-bold">
            4. เลือก Template (โลโก้และตรา)
          </p>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {templates.map((tpl) => {
              const disabled = isSub && tpl !== "template1";
              const selected = (form.template || meta.defaultTemplate) === tpl;
              return (
                <label
                  key={tpl}
                  className="cursor-pointer"
                  style={
                    disabled
                      ? { opacity: 0.45, pointerEvents: "none" }
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name="template"
                    value={tpl}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => setForm({ template: tpl })}
                    className="hidden"
                  />
                  <div
                    className="rounded-lg border-2 p-4 text-center transition-all"
                    style={{
                      borderColor: selected
                        ? "var(--primary-color)"
                        : "var(--border-color)",
                      backgroundColor: selected
                        ? "var(--bg-primary)"
                        : "var(--bg-secondary)",
                    }}
                  >
                    <div className="mb-2 text-2xl">📄</div>
                    <div className="theme-text-primary text-sm font-semibold">
                      {TEMPLATE_NAMES[tpl] || tpl}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <Check
              id="ft-checkbox"
              label="F/T (First Tag)"
              checked={form.ft}
              onChange={(v) => setForm({ ft: v })}
            />
            <Check
              id="lt-checkbox"
              label="L/T (Last Tag)"
              checked={form.lt}
              onChange={(v) => setForm({ lt: v })}
            />
            <Check
              id="qr-checkbox"
              label="พิมพ์ QR Code (มุมซ้ายบน)"
              checked={form.qr}
              onChange={(v) => setForm({ qr: v })}
            />
          </div>

          <button
            id="generateBtn"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full rounded-lg py-3 font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            ยืนยันและแสดงตัวอย่างหน้าพิมพ์
          </button>
        </div>
      </div>

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        unit={unit}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="theme-text-primary mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function Check({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span className="theme-text-primary text-sm font-medium">{label}</span>
    </label>
  );
}
