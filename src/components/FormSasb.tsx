"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { UNIT_META } from "@/lib/unitMeta";
import { buildSasbLotPrefix, validateSasbLot } from "@/lib/lotValidation";
import { saveGradeHistory } from "@/lib/gradeHistory";
import { HistoryModal } from "./HistoryModal";
import type { ReportData } from "@/type";

export function FormSasb() {
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
  const lotRef = useRef<HTMLInputElement>(null);

  const prefix = buildSasbLotPrefix(form.grade);

  // วางเคอร์เซอร์หลัง prefix
  useEffect(() => {
    if (lotRef.current && prefix) {
      const pos = Math.max(form.lot.length, prefix.length);
      lotRef.current.setSelectionRange(pos, pos);
    }
  }, [form.grade, prefix, form.lot.length]);

  function validatePages(from: string, to: string) {
    const f = parseInt(from, 10);
    const t = parseInt(to, 10);
    const err: typeof errors = {};
    if (isNaN(f) || f < 1) err.from = "ต้องมากกว่าหรือเท่ากับ 1";
    if (isNaN(t) || t < 1) err.to = "ต้องมากกว่าหรือเท่ากับ 1";
    if (!err.from && !err.to && f > t)
      err.from = "จากหน้าต้องไม่มากกว่าถึงหน้า";
    // 🔧 overwrite เฉพาะ from/to — คง lot error เดิมไว้
    //    (ห้าม merge แบบ ...prev เพราะ error เก่าจะค้างไม่หาย)
    setErrors((prev) => {
      const next = { ...prev };
      delete next.from;
      delete next.to;
      return { ...next, ...err };
    });
    return Object.keys(err).length === 0;
  }

  function handleLotChange(raw: string) {
    if (prefix) {
      const tail = raw.slice(prefix.length).replace(/\D/g, "");
      const maxTail = 10 - prefix.length;
      const next = prefix + tail.slice(0, maxTail);
      setForm({ lot: next });
      const res = validateSasbLot(next, form.grade);
      setErrors((prev) => ({
        ...prev,
        lot: res.valid ? undefined : res.message,
      }));
    } else {
      const next = raw.replace(/\D/g, "").slice(0, 10);
      setForm({ lot: next });
    }
  }

  // ปุ่ม submit เปิดเฉพาะเมื่อข้อมูลครบ + หน้าถูกต้อง
  const isValid = useMemo(() => {
    if (!form.grade || !form.netweight) return false;
    if (!validateSasbLot(form.lot, form.grade).valid) return false;
    const f = parseInt(form.fromPage, 10);
    const t = parseInt(form.toPage, 10);
    if (isNaN(f) || f < 1) return false;
    if (isNaN(t) || t < 1) return false;
    if (f > t) return false;
    return true;
  }, [form.grade, form.netweight, form.lot, form.fromPage, form.toPage]);

  function handleSubmit() {
    if (!form.grade || !form.netweight) {
      alert("กรุณาเลือก Grade จากตารางด้านซ้าย");
      return;
    }
    const lotCheck = validateSasbLot(form.lot, form.grade);
    if (!lotCheck.valid) {
      alert(lotCheck.message);
      return;
    }
    if (!validatePages(form.fromPage, form.toPage)) {
      alert("กรุณาตรวจสอบ จากหน้า/ถึงหน้า");
      return;
    }
    const titlesSet = meta.titles || { N: [], Y: [] };
    const titles = titlesSet[(form.specialGrade as "N" | "Y") || "N"] || [];

    // SASB: ตัด package size (/750) ออก — ส่งแค่ grade ล้วน
    //   "GA800/750"    -> "GA800"
    //   "GA850SUB/850" -> "GA850SUB"
    const gradeForReport = form.grade.split("/")[0];

    const reportData: ReportData = {
      unit,
      grade: gradeForReport,
      netweight: form.netweight,
      lot: form.lot,
      fromPage: form.fromPage,
      toPage: form.toPage,
      template: "template4",
      controlprint: { ft: false, lt: false, qr: form.qr },
      titles,
      specialGrade: form.specialGrade || "N",
      plantCode: form.plantCode || "",
      plantName: form.plantName || "",
      backgroundImage: meta.defaults?.backgroundImage || "",
      nsfImage: meta.defaults?.hips_image || "images/nsf_logo.svg",
    };

    saveGradeHistory(unit, form.grade, {
      lot: form.lot,
      netweight: form.netweight,
      fromPage: form.fromPage,
      toPage: form.toPage,
      template: "template4",
      controlprint: { ft: false, lt: false, qr: form.qr },
    });

    setReportData(reportData);
    const key = "recent_print_" + unit;
    sessionStorage.setItem(key, JSON.stringify(reportData));
    window.open("/reportSASB?unit=" + unit, "_blank");
  }

  return (
    <>
      <div className="theme-card rounded-xl p-6 shadow-lg">
        <div
          className="theme-border flex items-center justify-between rounded-xl border-b p-4"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <h2 className="theme-text-primary text-xl font-semibold">
            ข้อมูลการผลิตและการตั้งค่า ({unit})
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
            <div>
              <label className="theme-text-primary mb-1 block text-sm font-medium">
                Lot
              </label>
              <input
                ref={lotRef}
                id="lot"
                inputMode="text"
                placeholder="3 หลักแรกจะถูกใส่ให้, พิมพ์ 7 หลักที่เหลือ"
                value={form.lot}
                maxLength={meta.validation.lotLength}
                onChange={(e) => handleLotChange(e.target.value)}
                className="theme-input w-full rounded-lg border p-2.5 font-mono shadow-sm"
              />
              {errors.lot && (
                <span className="text-sm font-medium text-red-500">
                  {errors.lot}
                </span>
              )}
            </div>
            <div>
              <label className="theme-text-primary mb-1 block text-sm font-medium">
                Grade
              </label>
              <input
                id="grade"
                value={form.grade}
                readOnly
                placeholder="เลือกจากตาราง"
                className="theme-input w-full cursor-not-allowed rounded-lg border p-2.5 shadow-sm"
              />
            </div>
            <div>
              <label className="theme-text-primary mb-1 block text-sm font-medium">
                Net Weight
              </label>
              <input
                id="netweight"
                value={form.netweight}
                readOnly
                placeholder="Net Weight"
                className="theme-input w-full cursor-not-allowed rounded-lg border p-2.5 shadow-sm"
              />
            </div>
            <div>
              <label className="theme-text-primary mb-1 block text-sm font-medium">
                Plant
              </label>
              <input
                id="plantname"
                value={form.plantName}
                readOnly
                placeholder="Plant"
                className="theme-input w-full cursor-not-allowed rounded-lg border p-2.5 shadow-sm"
              />
            </div>
          </div>

          <p className="theme-text-primary theme-border mb-4 border-b pb-2 font-bold">
            2. การตั้งค่าการพิมพ์
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="theme-text-primary mb-1 block text-sm font-medium">
                จากหน้า
              </label>
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
            </div>
            <div>
              <label className="theme-text-primary mb-1 block text-sm font-medium">
                ถึงหน้า
              </label>
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
            </div>
          </div>

          <p className="theme-text-primary theme-border mb-4 border-b pb-2 font-bold">
            3. ตัวเลือกการพิมพ์
          </p>
          <div className="mb-6 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                id="qr-checkbox"
                type="checkbox"
                checked={form.qr}
                onChange={(e) => setForm({ qr: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="theme-text-primary text-sm font-medium">
                พิมพ์ QR Code (มุมซ้ายบน)
              </span>
            </label>
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
