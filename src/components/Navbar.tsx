"use client";

import { useAlldata } from "@/hooks/useAlldata";

/**
 * Navbar — แสดงชื่อแอป + ปุ่ม refresh ข้อมูล (manual)
 */
export function Navbar() {
  const { refresh, alldataLoading, alldataTime } = useAlldata();

  const timeText = alldataTime
    ? new Date(alldataTime).toLocaleString("th-TH", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-slate-800">
            Print Tag Jumbo
          </span>
          <span className="hidden rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 sm:inline">
            Online
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline">
            ข้อมูลล่าสุด: {timeText}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={alldataLoading}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {alldataLoading ? "กำลังโหลด..." : "🔄 Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
}
