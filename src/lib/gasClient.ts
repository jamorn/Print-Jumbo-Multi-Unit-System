import type { AllDataResponse } from "@/type";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL || "";
const STORAGE_KEY = "gas_alldata";
const STORAGE_TIME_KEY = "gas_alldata_time";

/**
 * fetchAlldata — ดึงข้อมูลทั้งหมดจาก GAS API
 * (ไม่แตะ cache — ใช้ตอน manual refresh หรือ init ครั้งแรก)
 */
export async function fetchAlldata(): Promise<AllDataResponse> {
  const res = await fetch(GAS_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GAS API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as AllDataResponse;
  if (!json || !json.alldata) {
    throw new Error("GAS API: invalid response (missing 'alldata')");
  }
  return json;
}

/**
 * getCachedAlldata — อ่านจาก localStorage
 */
export function getCachedAlldata(): AllDataResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AllDataResponse;
  } catch {
    return null;
  }
}

/**
 * getCachedTime — เวลาที่ cache ล่าสุด (ISO string)
 */
export function getCachedTime(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_TIME_KEY);
}

/**
 * saveAlldata — เขียนลง localStorage
 */
export function saveAlldata(data: AllDataResponse): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIME_KEY, new Date().toISOString());
  } catch (e) {
    console.error("saveAlldata failed:", e);
  }
}

/**
 * loadOrFetchAlldata — โหลดจาก cache ก่อน ถ้าไม่มีค่อย fetch
 * ใช้ตอนเปิดแอป: เอาครั้งแรกเร็ว ๆ / มี cache แล้วไม่ดึงซ้ำ
 */
export async function loadOrFetchAlldata(): Promise<{
  data: AllDataResponse;
  fromCache: boolean;
}> {
  const cached = getCachedAlldata();
  if (cached) {
    return { data: cached, fromCache: true };
  }
  const fresh = await fetchAlldata();
  saveAlldata(fresh);
  return { data: fresh, fromCache: false };
}

/**
 * refreshAlldata — บังคับ fetch ใหม่ (ปุ่ม refresh)
 */
export async function refreshAlldata(): Promise<AllDataResponse> {
  const fresh = await fetchAlldata();
  saveAlldata(fresh);
  return fresh;
}

/**
 * clearAlldata — ล้าง cache
 */
export function clearAlldata(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_TIME_KEY);
}
