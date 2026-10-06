"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { UNIT_META } from "@/lib/unitMeta";
import { UNIT_ORDER_ALL } from "@/lib/unitMapping";
import type { UnitId } from "@/type";
import { HelpModal } from "./HelpModal";
import { ThemeModal } from "./ThemeModal";
import { useAlldata } from "@/hooks/useAlldata";

function UnitButton({ unit }: { unit: UnitId }) {
  const currentUnit = useAppStore((s) => s.unit);
  const resetForUnitChange = useAppStore((s) => s.resetForUnitChange);
  const meta = UNIT_META[unit];
  const active = currentUnit === unit;

  return (
    <button
      type="button"
      data-unit={unit}
      onClick={() => resetForUnitChange(unit)}
      className={"unit-btn" + (active ? " active" : "")}
    >
      {meta.displayName}
    </button>
  );
}

/**
 * NavHeader — navbar ด้านบน (unit pills + specs + theme)
 */
export function NavHeader() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { refresh, alldataLoading } = useAlldata();

  return (
    <>
      <nav className="modern-navbar fixed left-0 right-0 top-0 z-40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {UNIT_ORDER_ALL.map((u) => (
                <UnitButton key={u} unit={u} />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="icon-btn"
                title="Refresh ข้อมูล"
                onClick={refresh}
                disabled={alldataLoading}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className={alldataLoading ? "animate-spin" : ""}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                type="button"
                id="specs-btn"
                className="icon-btn"
                title="คู่มือและรายละเอียด"
                onClick={() => setHelpOpen(true)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                id="theme-switcher-btn"
                className="icon-btn"
                title="เปลี่ยนธีม"
                onClick={() => setThemeOpen(true)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ThemeModal open={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  );
}
