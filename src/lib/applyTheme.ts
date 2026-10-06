import type { ThemeName } from "@/store/useAppStore";

/** CSS variables ของแต่ละธีม (replicate css/themes/*.css) */
const THEME_VARS: Record<ThemeName, Record<string, string>> = {
  green: {
    "--primary-color": "#4caf50",
    "--secondary-color": "#81c784",
    "--bg-primary": "#d1f7d3",
    "--bg-secondary": "#a5d6a7",
    "--bg-input": "#f1f8e9",
    "--border-color": "#66bb6a",
    "--border-input": "#66bb6a",
    "--text-primary": "#1b5e20",
    "--text-secondary": "#2e7d32",
    "--hover-row": "rgba(76, 175, 80, 0.2)",
    "--selected-row": "rgba(76, 175, 80, 0.3)",
    "--bg-card-header": "linear-gradient(135deg, #166534 0%, #15803d 100%)",
  },
  purple: {
    "--primary-color": "#7e57c2",
    "--secondary-color": "#b39ddb",
    "--bg-primary": "#ede7f6",
    "--bg-secondary": "#d1c4e9",
    "--bg-input": "#f3e5f5",
    "--border-color": "#9575cd",
    "--border-input": "#9575cd",
    "--text-primary": "#311b92",
    "--text-secondary": "#4527a0",
    "--hover-row": "rgba(126, 87, 194, 0.2)",
    "--selected-row": "rgba(126, 87, 194, 0.3)",
    "--bg-card-header": "linear-gradient(135deg, #4527a0 0%, #7e57c2 100%)",
  },
  blue: {
    "--primary-color": "#1e88e5",
    "--secondary-color": "#90caf9",
    "--bg-primary": "#e3f2fd",
    "--bg-secondary": "#bbdefb",
    "--bg-input": "#e1f5fe",
    "--border-color": "#42a5f5",
    "--border-input": "#42a5f5",
    "--text-primary": "#0d47a1",
    "--text-secondary": "#1565c0",
    "--hover-row": "rgba(30, 136, 229, 0.2)",
    "--selected-row": "rgba(30, 136, 229, 0.3)",
    "--bg-card-header": "linear-gradient(135deg, #0d47a1 0%, #1e88e5 100%)",
  },
  pink: {
    "--primary-color": "#d81b60",
    "--secondary-color": "#f48fb1",
    "--bg-primary": "#fce4ec",
    "--bg-secondary": "#f8bbd0",
    "--bg-input": "#fce4ec",
    "--border-color": "#ec407a",
    "--border-input": "#ec407a",
    "--text-primary": "#880e4f",
    "--text-secondary": "#ad1457",
    "--hover-row": "rgba(216, 27, 96, 0.2)",
    "--selected-row": "rgba(216, 27, 96, 0.3)",
    "--bg-card-header": "linear-gradient(135deg, #880e4f 0%, #d81b60 100%)",
  },
  dark: {
    "--primary-color": "#616161",
    "--secondary-color": "#9e9e9e",
    "--bg-primary": "#212121",
    "--bg-secondary": "#424242",
    "--bg-card": "#2b2b2b",
    "--bg-input": "#333333",
    "--border-color": "#616161",
    "--border-input": "#616161",
    "--text-primary": "#f5f5f5",
    "--text-secondary": "#bdbdbd",
    "--hover-row": "rgba(255, 255, 255, 0.1)",
    "--selected-row": "rgba(255, 255, 255, 0.18)",
    "--bg-card-header": "linear-gradient(135deg, #000000 0%, #424242 100%)",
  },
};

export function applyTheme(theme: ThemeName): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = THEME_VARS[theme] || THEME_VARS.green;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
