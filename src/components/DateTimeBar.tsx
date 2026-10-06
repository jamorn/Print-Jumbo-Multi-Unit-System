"use client";

import { useEffect, useState } from "react";
import { getShiftStatusText, shiftTable } from "@/lib/shiftLogic";
import { useAppStore } from "@/store/useAppStore";

/**
 * DateTimeBar — แสดงวันที่/เวลา + สถานะกะ (อัปเดตทุกวินาที)
 */
export function DateTimeBar() {
  const [now, setNow] = useState<Date | null>(null);
  const unit = useAppStore((s) => s.unit);
  const meta: Record<string, string> = {
    HDPE: "HDPE",
    PP: "PP",
    PPC: "PPC",
    CCM: "CCM",
    ABS: "ABS",
    ABS3: "ABS3",
    SAN12: "SAN1-2",
    SAN3: "SAN3",
  };

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateText = now
    ? now.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  const shiftText = now ? getShiftStatusText(shiftTable(now)) : "";

  return (
    <div className="mb-8 text-center">
      <h1 className="header-title mb-3 text-3xl font-bold">
        {meta[unit] || unit} Print Tag Jumbo
      </h1>
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <p className="current-datetime inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-bold shadow-sm">
          {dateText}
        </p>
        <span className="shift-status inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-bold shadow-sm">
          {shiftText}
        </span>
      </div>
    </div>
  );
}
