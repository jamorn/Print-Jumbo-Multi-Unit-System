import { create } from "zustand";
import type { AllDataResponse, GradeOption, ReportData, UnitId } from "@/type";

export type ThemeName = "green" | "purple" | "blue" | "pink" | "dark";
export interface FormState {
  grade: string;
  netweight: string;
  lot: string;
  fromPage: string;
  toPage: string;
  shift: string;
  idate: string;
  template: string;
  ft: boolean;
  lt: boolean;
  qr: boolean;
  plantName: string;
  specialGrade: string;
  plantCode: string;
  shiftManuallySet: boolean;
}

interface AppState {
  // ---- alldata (จาก GAS) ----
  alldata: AllDataResponse | null;
  alldataLoading: boolean;
  alldataError: string | null;
  alldataTime: string | null;
  setAlldata: (data: AllDataResponse, time: string) => void;
  setAlldataLoading: (v: boolean) => void;
  setAlldataError: (e: string | null) => void;

  // ---- unit ที่เลือก ----
  unit: UnitId;
  setUnit: (u: UnitId) => void;

  // ---- grade ที่เลือก ----
  selectedGrade: GradeOption | null;
  setSelectedGrade: (g: GradeOption | null) => void;

  // ---- form state ----
  form: FormState;
  setForm: (partial: Partial<FormState>) => void;
  resetForm: () => void;

  // ---- report data (ส่งไปหน้า report) ----
  reportData: ReportData | null;
  setReportData: (d: ReportData | null) => void;

  // ---- theme ----
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;

  // ---- helper: reset เมื่อเปลี่ยน unit ----
  resetForUnitChange: (u: UnitId) => void;
}

function makeEmptyForm(): FormState {
  return {
    grade: "",
    netweight: "",
    lot: "",
    fromPage: "1",
    toPage: "1",
    shift: "M",
    idate: String(new Date().getDate()),
    template: "",
    ft: false,
    lt: false,
    qr: true,
    plantName: "",
    specialGrade: "N",
    plantCode: "",
    shiftManuallySet: false,
  };
}

export const useAppStore = create<AppState>((set) => ({
  alldata: null,
  alldataLoading: false,
  alldataError: null,
  alldataTime: null,
  setAlldata: (data, time) =>
    set({ alldata: data, alldataTime: time, alldataError: null }),
  setAlldataLoading: (v) => set({ alldataLoading: v }),
  setAlldataError: (e) => set({ alldataError: e }),

  unit: "HDPE",
  setUnit: (u) => set({ unit: u }),

  selectedGrade: null,
  setSelectedGrade: (g) => set({ selectedGrade: g }),

  form: makeEmptyForm(),
  setForm: (partial) => set((s) => ({ form: { ...s.form, ...partial } })),
  resetForm: () => set({ form: makeEmptyForm() }),

  reportData: null,
  setReportData: (d) => set({ reportData: d }),

  theme: "green",
  setTheme: (t) => set({ theme: t }),

  resetForUnitChange: (u) =>
    set((s) => ({
      unit: u,
      selectedGrade: null,
      reportData: null,
      form: {
        ...makeEmptyForm(),
        // คง กะ/วันที่/flag ไว้ — user ตั้งใจเลือกแล้ว ไม่ควรหายตอนสลับ unit
        shift: s.form.shift,
        idate: s.form.idate,
        shiftManuallySet: s.form.shiftManuallySet,
      },
    })),
}));
