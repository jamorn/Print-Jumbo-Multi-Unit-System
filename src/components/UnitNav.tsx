"use client";

import { useAppStore } from "@/store/useAppStore";
import { UNIT_META } from "@/lib/unitMeta";
import { UNIT_ORDER_PL, UNIT_ORDER_SASB } from "@/lib/unitMapping";
import type { UnitId } from "@/type";

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
      className={
        "rounded-md px-3 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-orange-500 text-white shadow"
          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200")
      }
    >
      {meta.displayName}
    </button>
  );
}

/**
 * UnitNav — ปุ่มเลือก unit (PL + SASB)
 */
export function UnitNav() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <span className="mr-1 text-xs font-semibold uppercase text-slate-400">
        PL
      </span>
      {UNIT_ORDER_PL.map((u) => (
        <UnitButton key={u} unit={u} />
      ))}

      <span className="mx-2 h-5 w-px bg-slate-300" />

      <span className="mr-1 text-xs font-semibold uppercase text-slate-400">
        SASB
      </span>
      {UNIT_ORDER_SASB.map((u) => (
        <UnitButton key={u} unit={u} />
      ))}
    </div>
  );
}
