"use client";

import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import { useAppStore } from "@/store/useAppStore";
import { getGradeList, loadGradeHistory } from "@/lib/gradeHistory";
import type { UnitId } from "@/type";

/**
 * HistoryModal — animate replicate formComponent.openHistoryModal
 */
export function HistoryModal({
  open,
  onClose,
  unit,
}: {
  open: boolean;
  onClose: () => void;
  unit: UnitId;
}) {
  const setForm = useAppStore((s) => s.setForm);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const grades = getGradeList(unit);
    const list = grades.map((g) => ({
      grade: g,
      entry: loadGradeHistory(unit, g)!,
    }));
    list.sort((a, b) => {
      const ta = new Date(a.entry?.timestamp || 0).getTime();
      const tb = new Date(b.entry?.timestamp || 0).getTime();
      return tb - ta;
    });
    const term = search.trim().toUpperCase();
    return term
      ? list.filter((r) => r.grade.toUpperCase().includes(term))
      : list;
  }, [unit, search]);

  function load(grade: string) {
    const h = loadGradeHistory(unit, grade);
    if (!h) return;
    setForm({
      grade: h.grade,
      netweight: String(h.netweight || ""),
      lot: String(h.lot || ""),
      fromPage: String(h.fromPage || "1"),
      toPage: String(h.toPage || "1"),
      shift: h.shift || "M",
      idate: String(h.idate || new Date().getDate()),
      template: h.template || "template1",
      ft: h.controlprint?.ft ?? false,
      lt: h.controlprint?.lt ?? false,
      qr: h.controlprint?.qr ?? true,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidthClass="max-w-5xl"
      id="history-modal"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="theme-text-primary text-2xl font-bold">
            ประวัติ Grade - {unit}
          </h2>
          <p className="theme-text-secondary text-sm">
            เลือกประวัติเพื่อโหลดข้อมูลลงฟอร์ม
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          title="ปิด"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value.replace(/[^a-zA-Z0-9/]/g, "").toUpperCase(),
            )
          }
          placeholder="ค้นหา Grade..."
          className="theme-input w-full rounded-lg border py-2 pl-4 pr-4 shadow-sm"
        />
      </div>

      <div className="max-h-96 overflow-y-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead
            className="theme-border sticky top-0 border-b"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <tr>
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3 text-left">GRADE</th>
              <th className="px-4 py-3 text-center">LOT</th>
              <th className="px-4 py-3 text-center">น้ำหนัก</th>
              <th className="px-4 py-3 text-center">วันที่บันทึก</th>
              <th className="px-4 py-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="theme-text-primary">
            {rows.map((r, i) => {
              const ts = r.entry?.timestamp
                ? new Date(r.entry.timestamp)
                : new Date();
              const dateStr = ts.toLocaleString("th-TH", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <tr
                  key={r.grade}
                  className="history-row theme-border cursor-pointer border-b"
                  onClick={() => load(r.grade)}
                >
                  <td className="px-4 py-3 text-center">{i + 1}</td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    {r.grade}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.entry?.lot || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {parseInt(String(r.entry?.netweight || 0)).toLocaleString()}{" "}
                    KG
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{dateStr}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        load(r.grade);
                      }}
                      className="rounded-lg px-4 py-2 font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "var(--primary-color)" }}
                    >
                      โหลด
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="theme-text-secondary px-4 py-8 text-center"
                >
                  ไม่มีประวัติการใช้งาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="theme-text-secondary mt-4 text-center text-sm">
        💡 คลิกที่แถวหรือปุ่ม "โหลด" เพื่อนำข้อมูลไปใส่ในฟอร์ม
      </div>
    </Modal>
  );
}
