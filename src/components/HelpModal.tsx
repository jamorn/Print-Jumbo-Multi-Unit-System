"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useAppStore } from "@/store/useAppStore";

type TabName = "usage" | "templates" | "specs" | "data";

const TABS: { id: TabName; label: string }[] = [
  { id: "usage", label: "การใช้งาน" },
  { id: "templates", label: "Templates" },
  { id: "specs", label: "รายละเอียด" },
  { id: "data", label: "จัดการข้อมูล" },
];

export function HelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabName>("usage");
  const form = useAppStore((s) => s.form);
  const unit = useAppStore((s) => s.unit);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="modal-icon">📘</div>
          <div>
            <h2 className="theme-text-primary text-2xl font-bold">
              คู่มือการใช้งาน
            </h2>
            <p className="theme-text-secondary text-sm">
              Tag Printing System Guide
            </p>
          </div>
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

      <div className="tab-border mb-4 flex gap-2 border-b pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              "help-tab rounded-lg px-4 py-2 text-sm font-semibold transition-all " +
              (tab === t.id ? "active" : "theme-text-primary")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "usage" && (
        <div className="usage-box mb-4 rounded-xl p-5">
          <h3 className="theme-text-primary mb-4 text-lg font-semibold">
            🎯 ขั้นตอนการใช้งาน
          </h3>
          <ol className="space-y-3">
            {[
              ["เลือก Unit", "- คลิกปุ่ม Unit ที่ navbar ด้านบน"],
              ["เลือก Grade", "- คลิกที่ตารางเพื่อเลือก Grade"],
              ["กรอกข้อมูล", "- Lot, หน้า, กะ, วันที่"],
              ["Generate", '- คลิกปุ่ม "ยืนยันและแสดงตัวอย่างหน้าพิมพ์"'],
              [
                "Print",
                "- กด Ctrl+P และตั้งค่า: Margins = None, Scale = 100%, Background graphics = เปิด",
              ],
            ].map(([bold, rest], i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="step-number flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="theme-text-primary">
                  <strong>{bold}</strong> {rest}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tab === "templates" && (
        <div className="space-y-3">
          {[
            ["📄 Template 1: ไม่มี QR Code + มาตร.", "แสดงเฉพาะข้อมูลพื้นฐาน (สำหรับ SUB grades)"],
            ["📄 Template 2: มี QR Code + Logo", "พร้อมโลโก้ MFG + QR Code (PP/PPC)"],
            ["📄 Template 3: มี QR Code + มาตร. + SIRIM", "ครบทุกรายละเอียด รวม Sirim Certification (HDPE)"],
          ].map(([title, desc], i) => (
            <div key={i} className="usage-box rounded-xl p-4">
              <h4 className="spec-title mb-2 font-semibold">{title}</h4>
              <p className="theme-text-secondary text-sm">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "specs" && (
        <div className="grid grid-cols-2 gap-4">
          <SpecCard title="📄 Grade" size="60px / 45pt" value={form.grade || "-"} />
          <SpecCard title="⚖️ Net Weight" size="50px / 38pt" value={form.netweight || "-"} />
          <SpecCard title="🔖 Lot Number" size="50px / 38pt" value={form.lot || "-"} />
          <SpecCard title="🔢 Running Number" size="30px / 23pt" value="001-10-M" />
          <div className="spec-card-bg rounded-xl p-4">
            <h4 className="spec-title mb-3 font-semibold">🏷️ Print Controls</h4>
            <div className="theme-text-primary space-y-1 text-sm">
              <div>
                <strong>F/T:</strong> หน้าแรก
              </div>
              <div>
                <strong>L/T:</strong> หน้าสุดท้าย
              </div>
            </div>
          </div>
          <div className="spec-card-bg rounded-xl p-4">
            <h4 className="spec-title mb-3 font-semibold">📋 Description</h4>
            <div className="theme-text-primary space-y-1 text-sm">
              <div>
                <strong>Current Unit:</strong> {unit}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "data" && (
        <div className="usage-box rounded-xl p-4">
          <h3 className="theme-text-primary mb-4 text-lg font-semibold">
            📊 สถานะข้อมูล Grade History
          </h3>
          <p className="theme-text-secondary text-sm">
            ข้อมูลประวัติถูกเก็บใน localStorage ของเบราว์เซอร์ แยกตาม Unit
          </p>
        </div>
      )}
    </Modal>
  );
}

function SpecCard({
  title,
  size,
  value,
}: {
  title: string;
  size: string;
  value: string;
}) {
  return (
    <div className="spec-card-bg rounded-xl p-4">
      <h4 className="spec-title mb-3 font-semibold">{title}</h4>
      <div className="theme-text-primary space-y-1 text-sm">
        <div>
          <strong>Font:</strong> Arial
        </div>
        <div>
          <strong>Size:</strong>{" "}
          <span className="spec-size-badge rounded px-2 py-1 font-bold">
            {size}
          </span>
        </div>
        <div>
          <strong>Current:</strong>{" "}
          <span className="spec-value font-bold">{value}</span>
        </div>
      </div>
    </div>
  );
}
