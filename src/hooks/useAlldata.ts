"use client";

import { useCallback, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  getCachedAlldata,
  getCachedTime,
  loadOrFetchAlldata,
  refreshAlldata,
} from "@/lib/gasClient";

/**
 * useAlldata — จัดการ alldata (โหลด + cache + refresh)
 *
 * - ตอน mount: เอา cache ก่อน; ถ้าไม่มีค่อย fetch
 * - refresh(): บังคับ fetch ใหม่ (manual)
 */
export function useAlldata() {
  const {
    alldata,
    alldataTime,
    alldataLoading,
    alldataError,
    setAlldata,
    setAlldataLoading,
    setAlldataError,
  } = useAppStore();

  // โหลดครั้งแรก (cache ก่อน)
  useEffect(() => {
    let cancelled = false;

    // ถ้ามี cache อยู่แล้วใน store → ไม่ต้องทำอะไร
    if (alldata) return;

    // เช็ค cache จาก localStorage ก่อน
    const cached = getCachedAlldata();
    const cachedTime = getCachedTime();
    if (cached) {
      setAlldata(cached, cachedTime || "");
      return;
    }

    // ไม่มี cache → fetch
    setAlldataLoading(true);
    loadOrFetchAlldata()
      .then(({ data, fromCache }) => {
        if (cancelled) return;
        setAlldata(data, fromCache ? getCachedTime() || "" : new Date().toISOString());
      })
      .catch((e) => {
        if (cancelled) return;
        setAlldataError(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      })
      .finally(() => {
        if (!cancelled) setAlldataLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    setAlldataLoading(true);
    setAlldataError(null);
    try {
      const fresh = await refreshAlldata();
      setAlldata(fresh, new Date().toISOString());
    } catch (e: any) {
      setAlldataError(e?.message || "Refresh ไม่สำเร็จ");
    } finally {
      setAlldataLoading(false);
    }
  }, [setAlldata, setAlldataError, setAlldataLoading]);

  return { alldata, alldataTime, alldataLoading, alldataError, refresh };
}
