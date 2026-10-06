"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getCleanGradeItems } from "@/lib/gradeTransform";
import { generateSasbGradeOptions } from "@/lib/gradeOptions";
import { updateSasbFormWithSelection } from "@/lib/formHelpers";
import type { GradeOption } from "@/type";

/**
 * TableSasb — ตารางรายการ Grade (SASB)
 * replicate table_SASB_Component.js
 */
export function TableSasb() {
  const alldata = useAppStore((s) => s.alldata);
  const unit = useAppStore((s) => s.unit);
  const selectedGrade = useAppStore((s) => s.selectedGrade);
  const [search, setSearch] = useState("");

  const options = useMemo(
    () => generateSasbGradeOptions(getCleanGradeItems(alldata, unit)),
    [alldata, unit],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return options;
    return options.filter((o) => o.displayText.toUpperCase().includes(term));
  }, [options, search]);

  const isSelected = (o: GradeOption) =>
    selectedGrade?.grade === o.grade &&
    selectedGrade?.netweight === o.netweight &&
    selectedGrade?.isSub === o.isSub;

  function onSearch(val: string) {
    setSearch(val.replace(/[^a-zA-Z0-9/ ]/g, "").toUpperCase());
  }

  return (
    <div className="theme-card overflow-hidden rounded-xl shadow-lg">
      <div
        className="theme-border flex items-center justify-between border-b p-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <h2 className="theme-text-primary text-xl font-semibold">
          รายการเม็ดพลาสติก ({unit})
        </h2>
      </div>

      <div className="theme-border border-b p-5">
        <label className="theme-text-primary mb-3 block text-sm font-semibold">
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="theme-text-secondary h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="theme-input w-full rounded-lg border py-3 pl-12 pr-4 shadow-sm"
            placeholder="ค้นหา Grade..."
          />
        </div>
      </div>

      <div
        className="relative overflow-y-auto overflow-x-auto"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <table className="w-full text-left text-sm">
          <thead
            className="theme-border sticky top-0 border-b"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <tr>
              <th className="theme-text-primary px-6 py-4 text-base font-bold uppercase tracking-wider">
                Product name
              </th>
              <th className="theme-text-primary px-6 py-4 text-center text-base font-bold uppercase tracking-wider">
                Grade Type
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const isSpecial = o.specialGrade === "Y";
              return (
                <tr
                  key={`${o.grade}-${o.netweight}-${o.isSub}-${i}`}
                  onClick={() => updateSasbFormWithSelection(o)}
                  className={
                    "grade-row theme-border cursor-pointer border-b transition-colors " +
                    (isSelected(o) ? "selected-row" : "")
                  }
                >
                  <td
                    className={
                      "px-6 py-4 font-semibold " +
                      (o.isSub ? "sub-grade" : "theme-text-primary")
                    }
                  >
                    <span className="inline-flex items-center align-middle">
                      {o.displayText}
                      {isSpecial && (
                        <span className="ml-2 inline-flex items-center justify-center rounded-md bg-white px-1 py-0.5 align-middle leading-none">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/nsf_logo.svg"
                            alt="NSF"
                            style={{ height: 20, width: "auto" }}
                          />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="theme-text-primary px-6 py-4 text-center">
                    {o.isSub ? (
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        SUB-STAND
                      </span>
                    ) : (
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: "#22c55e" }}
                      >
                        PREMIUM
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="theme-text-secondary px-6 py-8 text-center">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className="theme-border theme-text-secondary border-t p-4 text-center text-sm"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        ทั้งหมด {options.length} รายการ
      </div>
    </div>
  );
}
