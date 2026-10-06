"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { ReportData } from "@/type";
import { generatePlTagPage } from "@/lib/reportPl";
import { ReportHelpModal } from "@/components/ReportHelpModal";
import "./report.css";

const FALLBACK: ReportData = {
  unit: "HDPE",
  grade: "P901BK/750",
  netweight: "750",
  lot: "7257896524",
  fromPage: "1",
  toPage: "2",
  shift: "E",
  idate: "8",
  template: "template3",
  controlprint: { ft: false, lt: false, qr: true },
  title1: "HDPE",
  title2: "HIGH DENSITY POLYETHYLENE",
  sirim_title1: "Certified to MS1058 : PART 1 : 2005",
  sirim_title2: "Certified No. : PC004152",
  sirim_title3: "Designation : PE100",
  qrCodeUrl: "https://appdb.tisi.go.th/Q/i.php?d=1351525040",
};

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // load data from sessionStorage
  //  1) อ่าน ?unit= จาก URL (form ส่งมา) → key "recent_print_<unit>"
  //  2) ถ้าไม่มี ?unit= ค่อย fallback key เก่า "recent_hd_print"
  //     (ห้าม fallback ข้าม unit เพราะจะหยิบข้อมูลผิดหน่วย เช่น PPC → HDPE)
  useEffect(() => {
    const qUnit = (
      new URLSearchParams(window.location.search).get("unit") || ""
    ).toUpperCase();

    let src: string | null = null;
    if (qUnit) {
      src = sessionStorage.getItem("recent_print_" + qUnit);
    } else {
      src = sessionStorage.getItem("recent_hd_print");
    }

    if (src) {
      try {
        setData(JSON.parse(src));
        return;
      } catch {
        /* ignore */
      }
    }
    setData(FALLBACK);
  }, []);

  // generate pages — inject .sheet เป็น sibling ตรง ๆ ใต้ <main>
  // (ไม่ห่อ <div> เพื่อให้ .sheet:not(:last-child)::after / :last-child ทำงานถูก)
  useEffect(() => {
    if (!data) return;
    const tryRender = () => {
      const QR = (window as unknown as { QRCode?: unknown }).QRCode;
      if (typeof QR === "undefined") {
        setTimeout(tryRender, 100);
        return;
      }
      const main = mainRef.current;
      if (!main) return;
      const fromPage = parseInt(data.fromPage, 10) || 1;
      const toPage = parseInt(data.toPage, 10) || 1;
      let out = "";
      for (let page = fromPage; page <= toPage; page++) {
        out += generatePlTagPage(page, data);
      }
      main.innerHTML = out;
    };
    tryRender();
  }, [data]);

  return (
    <div className="report-body A4 landscape">
      <Script src="/js/qrcode.min.js" strategy="afterInteractive" />

      {/* Control Panel */}
      <div className="report-control-panel no-print">
        <button
          className="report-btn report-btn-primary"
          onClick={() => window.print()}
        >
          🖨️ Print (Ctrl+P)
        </button>
        <button className="report-btn" onClick={() => window.close()}>
          ❌ Close
        </button>
        <button
          type="button"
          className="report-help-btn"
          title="คู่มือการใช้งาน"
          onClick={() => setHelpOpen(true)}
        >
          📘
        </button>
      </div>

      <main id="report-main" ref={mainRef} />

      <ReportHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        data={data}
        variant="pl"
      />
    </div>
  );
}

