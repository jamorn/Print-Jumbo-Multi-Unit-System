"use client";

import { Modal } from "./Modal";
import { useAppStore, type ThemeName } from "@/store/useAppStore";

const THEMES: { id: ThemeName; label: string; gradient: string }[] = [
  { id: "purple", label: "Purple", gradient: "theme-gradient-purple" },
  { id: "blue", label: "Blue", gradient: "theme-gradient-blue" },
  { id: "green", label: "Green", gradient: "theme-gradient-green" },
  { id: "pink", label: "Pink", gradient: "theme-gradient-pink" },
  { id: "dark", label: "Dark", gradient: "theme-gradient-dark" },
];

export function ThemeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      id="theme-modal"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="theme-text-primary text-2xl font-bold">🎨 เลือกธีม</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          title="ปิด"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTheme(t.id);
              setTimeout(onClose, 300);
            }}
            className="theme-option-btn rounded-lg border-2 border-transparent p-4 transition-all hover:border-slate-400"
          >
            <div className={`mb-3 h-20 w-full rounded-md ${t.gradient}`} />
            <p className="text-center font-semibold">{t.label}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
