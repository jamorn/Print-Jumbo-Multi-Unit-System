"use client";

import { useEffect, useState } from "react";
import type { ReportData } from "@/type";
import { UNIT_META } from "@/lib/unitMeta";

type TabName = "usage" | "templates" | "specs";

/**
 * ReportHelpModal — Help modal ของหน้า report (PL + SASB)
 * replica 100% จาก offline report.html / reportSASB.html
 *   - ปุ่ม 📘 ลอย (ดู report-help-btn ใน report.css)
 *   - 3 tabs: การใช้งาน / Templates / รายละเอียด (spec cards)
 *   - spec values ดึงจาก ReportData ที่อ่านจาก sessionStorage
 *
 * NOTE: class ทั้งหมดขึ้นต้นด้วย report- และอยู่ใน scope .report-body
 *       (report.css) เพื่อชนะ Tailwind Preflight
 */
export function ReportHelpModal({
  open,
  onClose,
  data,
  variant = "pl",
}: {
  open: boolean;
  onClose: () => void;
  data: ReportData | null;
  /** pl = PL (title1/title2) ; sasb = SASB (titles/plant) */
  variant?: "pl" | "sasb";
}) {
  const [tab, setTab] = useState<TabName>("usage");

  // SASB ไม่มี template1/2/3 (ใช้ template4 = QR only) -> ซ่อน tab Templates
  const tabs: [TabName, string][] =
    variant === "sasb"
      ? [
          ["usage", "การใช้งาน"],
          ["specs", "รายละเอียด"],
        ]
      : [
          ["usage", "การใช้งาน"],
          ["templates", "Templates"],
          ["specs", "รายละเอียด"],
        ];

  // ปิดด้วย Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="report-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="report-modal-content">
        <div className="report-modal-header">
          <div className="report-modal-icon-wrapper">
            <div className="report-modal-icon">📘</div>
            <div>
              <h2 className="report-modal-title">คู่มือการใช้งาน</h2>
              <p className="report-modal-subtitle">Tag Printing System Guide</p>
            </div>
          </div>
          <button
            type="button"
            className="report-modal-close"
            onClick={onClose}
            title="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="report-tab-nav">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={"report-tab-btn" + (tab === id ? " active" : "")}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "usage" && (
          <>
            <div className="report-usage-container">
              <h3 className="report-usage-title">🎯 ขั้นตอนการพิมพ์</h3>
              <ol className="report-usage-list">
                {[
                  ["ตรวจสอบข้อมูล", "- ตรวจสอบ Grade, Lot, Net Weight"],
                  ["ตั้งค่าเครื่องพิมพ์", "- Margins = None, Scale = 100%"],
                  ["เปิด Background Graphics", "- สำคัญมาก!"],
                  ["Print", "- กด 🖨️ หรือ Ctrl+P"],
                ].map(([bold, rest], i) => (
                  <li key={i} className="report-usage-item">
                    <span className="report-usage-number">{i + 1}</span>
                    <span className="report-usage-text">
                      <strong>{bold}</strong> {rest}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="report-shortcuts-box">
              <strong>⚡ Shortcuts:</strong> Ctrl+P = พิมพ์ | Esc = ปิดคู่มือ
            </div>
          </>
        )}

        {tab === "templates" && (
          <div className="report-template-grid">
            {[
              [
                "📄 Template 1: ไม่มี QR Code + มาตร.",
                "แสดงเฉพาะข้อมูลพื้นฐาน (สำหรับ SUB grades)",
              ],
              [
                "📄 Template 2: มี QR Code + Logo",
                "พร้อมโลโก้ MFG + QR Code (PP/PPC)",
              ],
              [
                "📄 Template 3: มี QR Code + มาตร. + SIRIM",
                "ครบทุกรายละเอียด รวม Sirim Certification (HDPE)",
              ],
            ].map(([title, desc], i) => (
              <div key={i} className="report-spec-card">
                <h4>{title}</h4>
                <p className="report-template-description">{desc}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "specs" &&
          (variant === "sasb" ? (
            <SasbSpecs data={data} />
          ) : (
            <PlSpecs data={data} />
          ))}
      </div>
    </div>
  );
}

/** card ย่อย — Font / Size / Weight / Current Value */
function SpecCard({
  title,
  size,
  weight,
  value,
  valueSuffix,
}: {
  title: string;
  size: string;
  weight?: "Bold" | "Normal";
  value: string;
  valueSuffix?: string;
}) {
  return (
    <div className="report-spec-card">
      <h4>{title}</h4>
      <div>
        <strong>Font:</strong> Arial (MS: Arial)
        <br />
        <strong>Size:</strong>{" "}
        <span className="report-spec-size-badge">{size}</span>
        {weight && (
          <>
            <br />
            <strong>Weight:</strong>{" "}
            <span className="report-spec-value">{weight}</span>
          </>
        )}
        <br />
        <strong>Current Value:</strong>{" "}
        <span className="report-spec-value">{value}</span>
        {valueSuffix ? ` ${valueSuffix}` : ""}
      </div>
    </div>
  );
}

/** ============ SASB specs — ค่าจริงจากตอน print (dynamic) ============ */
function SasbSpecs({ data }: { data: ReportData | null }) {
  if (!data) {
    return (
      <p className="report-template-description">
        ไม่มีข้อมูล (ยังไม่ได้ submit จากฟอร์ม)
      </p>
    );
  }

  const grade = String(data.grade || "").trim() || "-";
  const netweight = data.netweight
    ? String(data.netweight).replace(/,/g, "")
    : "-";
  const lot = String(data.lot || "").trim() || "-";
  const running = String(data.fromPage || "").padStart(3, "0");

  return (
    <div className="report-spec-grid">
      <SpecCard
        title="📄 Material (Grade)"
        size="24–55px / auto"
        weight="Bold"
        value={grade}
      />
      <SpecCard
        title="🔖 Lot Number"
        size="40px / 30pt"
        weight="Bold"
        value={lot}
      />
      <SpecCard
        title="⚖️ Net Weight"
        size="40px / 30pt"
        weight="Normal"
        value={netweight}
        valueSuffix="KG"
      />
      <SpecCard
        title="🔢 Running Number"
        size="40px / 30pt"
        weight="Normal"
        value={running}
        valueSuffix="(เลขหน้าล้วน)"
      />
      <DescriptionCard data={data} />
    </div>
  );
}

/** 📋 Description (SASB) — titles จาก config N:[] / Y:[]
 *  highlight ชุดที่ตรงกับ specialGrade (ค่าจริง) */
function DescriptionCard({ data }: { data: ReportData }) {
  const active: "N" | "Y" =
    String(data.specialGrade || "").toUpperCase() === "Y" ? "Y" : "N";
  const titles = UNIT_META[data.unit]?.titles;

  const renderSet = (key: "N" | "Y") => {
    const list = titles?.[key] || [];
    const isActive = key === active;
    return (
      <div
        key={key}
        className="report-spec-set"
        style={
          isActive
            ? {
                border: "1px solid #7c3aed",
                borderRadius: 8,
                padding: "6px 8px",
                background: "#f5f3ff",
                marginTop: 6,
              }
            : { padding: "6px 8px", marginTop: 6, opacity: 0.6 }
        }
      >
        <strong>
          {key}
          {isActive ? " (ใช้จริง)" : ""}
        </strong>
        {list.length === 0 ? (
          <div className="report-template-description">- ไม่มี -</div>
        ) : (
          <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
            {list.map((t, i) => (
              <li key={i} className="report-spec-value">
                {t.text} — {t.size}px / {t.bold ? "Bold" : "Normal"}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="report-spec-card" style={{ gridColumn: "1 / -1" }}>
      <h4>📋 Description</h4>
      <div>
        <strong>Font:</strong> Arial (MS: Arial)
        <br />
        <strong>Special Grade:</strong>{" "}
        <span className="report-spec-value">{active}</span>
        {renderSet("N")}
        {renderSet("Y")}
      </div>
    </div>
  );
}

/** ============ PL specs (ไม่แก้ไข) ============ */
function PlSpecs({ data }: { data: ReportData | null }) {
  if (!data) {
    return (
      <p className="report-template-description">
        ไม่มีข้อมูล (ยังไม่ได้ submit จากฟอร์ม)
      </p>
    );
  }

  const combinedGrade =
    data.grade && data.netweight
      ? data.grade.includes("/")
        ? data.grade
        : `${data.grade}/${String(data.netweight).replace(/,/g, "")}`
      : data.grade || "-";

  const netweightFmt = data.netweight
    ? Number(String(data.netweight).replace(/,/g, "")).toLocaleString("en-US") +
      " KG"
    : "-";

  const running =
    data.fromPage && data.idate && data.shift
      ? `${String(data.fromPage).padStart(3, "0")}-${String(data.idate).padStart(2, "0")}-${data.shift}`
      : "001-10-M";

  return (
    <div className="report-spec-grid">
      <div className="report-spec-card">
        <h4>📄 Grade</h4>
        <div>
          <strong>Font:</strong> Arial (MS: Arial)
          <br />
          <strong>Size:</strong>{" "}
          <span className="report-spec-size-badge">60px / 45pt</span>
          <br />
          <strong>Current Value:</strong>{" "}
          <span className="report-spec-value">{combinedGrade}</span>
        </div>
      </div>

      <div className="report-spec-card">
        <h4>⚖️ Net Weight</h4>
        <div>
          <strong>Font:</strong> Arial (MS: Arial)
          <br />
          <strong>Size:</strong>{" "}
          <span className="report-spec-size-badge">50px / 38pt</span>
          <br />
          <strong>Current Value:</strong>{" "}
          <span className="report-spec-value">{netweightFmt}</span>
        </div>
      </div>

      <div className="report-spec-card">
        <h4>🔖 Lot Number</h4>
        <div>
          <strong>Font:</strong> Arial (MS: Arial)
          <br />
          <strong>Size:</strong>{" "}
          <span className="report-spec-size-badge">50px / 38pt</span>
          <br />
          <strong>Current Value:</strong>{" "}
          <span className="report-spec-value">{data.lot || "-"}</span>
        </div>
      </div>

      <div className="report-spec-card">
        <h4>🔢 Running Number</h4>
        <div>
          <strong>Font:</strong> Arial (MS: Arial)
          <br />
          <strong>Size:</strong>{" "}
          <span className="report-spec-size-badge">30px / 23pt</span>
          <br />
          <strong>Current:</strong>{" "}
          <span className="report-spec-value">{running}</span> (Page-Date-Shift)
        </div>
      </div>

      <div className="report-spec-card">
        <h4>🏷️ Print Controls</h4>
        <div>
          <strong>Font:</strong> Arial (MS: Arial)
          <br />
          <strong>Size:</strong>{" "}
          <span className="report-spec-size-badge">50px / 38pt</span>
          <br />
          <strong>F/T:</strong>{" "}
          <span className="report-spec-marker">(F/T)</span> หน้าแรก
          <br />
          <strong>L/T:</strong>{" "}
          <span className="report-spec-marker">(L/T)</span> หน้าสุดท้าย
        </div>
      </div>

      <div className="report-spec-card">
        <h4>📋 Description</h4>
        <div>
          <strong>Title1:</strong>{" "}
          <span className="report-spec-size-badge">60px / 45pt</span>
          <br />
          <strong>Title2:</strong>{" "}
          <span className="report-spec-size-badge">30px / 23pt</span>
          <br />
          <strong>Current Unit:</strong>{" "}
          <span className="report-spec-value">{data.unit || "-"}</span>
        </div>
      </div>
    </div>
  );
}
