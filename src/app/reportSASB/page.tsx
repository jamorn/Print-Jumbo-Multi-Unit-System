"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { ReportData } from "@/type";
import { generateSasbTagPage, resolveSasbReportData } from "@/lib/reportSasb";
import { ReportHelpModal } from "@/components/ReportHelpModal";
import "../report/report.css";

const FALLBACK: ReportData = {
  unit: "CCM",
  grade: "GA800 5229/900",
  netweight: "900",
  lot: "9261234567",
  fromPage: "1",
  toPage: "2",
  template: "template4",
  controlprint: { ft: false, lt: false, qr: true },
  titles: [
    { text: "HIPS", size: 70, bold: true },
    { text: "HIGH IMPACT POLYSTYRENE", size: 30, bold: false },
  ],
  specialGrade: "Y",
  plantCode: "1377",
  plantName: "CCM",
  backgroundImage: "/images/polimaxx.jpg",
  nsfImage: "/images/nsf_logo.svg",
};

export default function ReportSasbPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const resolved = resolveSasbReportData();
    setData(resolved || FALLBACK);
  }, []);

  // generate pages — inject .sheet เป็น sibling ตรง ๆ ใต้ <main>
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
        out += generateSasbTagPage(page, data);
      }
      main.innerHTML = out;
    };
    tryRender();
  }, [data]);

  // dynamic background
  const bg = data?.backgroundImage;

  return (
    <div className="report-body A4 landscape">
      <Script src="/js/qrcode.min.js" strategy="afterInteractive" />
      {bg && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@media screen { .sheet { background-image: url(${bg}) !important; } }`,
          }}
        />
      )}

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
        variant="sasb"
      />
    </div>
  );
}

