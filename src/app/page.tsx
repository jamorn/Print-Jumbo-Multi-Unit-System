"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAlldata } from "@/hooks/useAlldata";
import { NavHeader } from "@/components/NavHeader";
import { DateTimeBar } from "@/components/DateTimeBar";
import { TablePl } from "@/components/TablePl";
import { TableSasb } from "@/components/TableSasb";
import { FormPl } from "@/components/FormPl";
import { FormSasb } from "@/components/FormSasb";
import { applyTheme } from "@/lib/applyTheme";
import { isSasbUnit } from "@/lib/unitMapping";

export default function HomePage() {
  const { alldataLoading, alldataError } = useAlldata();
  const unit = useAppStore((s) => s.unit);
  const theme = useAppStore((s) => s.theme);

  // apply theme CSS vars
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const sasb = isSasbUnit(unit);

  return (
    <div className="pl-app">
      <NavHeader />
      <div className="container mx-auto mt-20 max-w-7xl px-4 py-6">
        <DateTimeBar />

        {alldataError && (
          <div className="mx-4 mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">
            ⚠️ {alldataError}
          </div>
        )}

        {alldataLoading && !alldataError && (
          <div className="theme-text-primary mb-4 text-center text-sm">
            กำลังโหลดข้อมูล...
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div id="tableContainer">{sasb ? <TableSasb /> : <TablePl />}</div>
          <div id="formContainer">{sasb ? <FormSasb /> : <FormPl />}</div>
        </div>
      </div>
    </div>
  );
}
