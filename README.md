# Print Tag Jumbo — Online (Next.js)

ระบบพิมพ์ป้าย (Tag) สำหรับงานบรรจุภัณฑ์ **Jumbo Bag** — เวอร์ชันออนไลน์
เป็น rewrite ของระบบ offline เดิม (HTML/JS) ให้เป็น **Next.js 14 (App Router) + TypeScript + Tailwind CSS**

รองรับ 2 ระบบงาน (profile):

| Profile | หน่วยผลิต (Unit) | ลักษณะป้าย |
| ------- | ---------------- | ---------- |
| **PL**  | `HDPE`, `PP`, `PPC` | ป้าย Bagging ทั่วไป (Grade/Lot/NetWeight + โลโก้ + QR + SIRIM) |
| **SASB** | `CCM`, `ABS`, `ABS3`, `SAN12`, `SAN3` | ป้าย SASB (Material/Lot/NetWeight/Plant + Titles ฝั่งซ้าย + NSF) |

---

## ✨ ฟีเจอร์หลัก

- **เลือก Unit** (8 หน่วย) — สลับตาราง Grade และฟอร์มตาม profile อัตโนมัติ
- **ตาราง Grade** ดึงจาก **GAS API** (Google Apps Script) พร้อม cache ใน `localStorage`
- **ฟอร์มกรอกข้อมูล** (Lot / กะ / วันที่ / ช่วงหน้า / Template / ตัวเลือกพิมพ์)
  - Validate Lot ตาม unit (ความยาว + pattern)
  - Auto-set กะ (Morning / Evening / Night) ตามเวลา
  - ปุ่ม Submit disable จนกว่าข้อมูลจะครบและถูกต้อง
- **หน้าพิมพ์ (Report)** แยก 2 หน้า:
  - `/report?unit=HDPE` → PL
  - `/reportSASB?unit=CCM` → SASB
  - สร้างจากข้อมูลที่ส่งผ่าน `sessionStorage` (key: `recent_print_<UNIT>`)
  - มีปุ่ม 📘 **คู่มือการใช้งาน** (Help Modal) — การใช้งาน / Templates / รายละเอียด (spec)
- **ประวัติการพิมพ์** (Grade History) — บันทึก/เรียกดู grade ที่เคยใช้
- **ธีม** (green / purple / blue / pink / dark) ผ่าน `next-themes` + CSS variables
- **QR Code** สร้างฝั่ง client (`qrcode.min.js`)
- **Auth** ผ่าน Google (NextAuth)

---

## 🛠 เทคโนโลยีที่ใช้

| หมวด | เทคโนโลยี |
| ---- | --------- |
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| UI | React 18 + Tailwind CSS 3 |
| State | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Icons | lucide-react |
| Auth | NextAuth (Google Provider) |
| QR | qrcode.min.js (public) / qrcode.react |
| Theme | next-themes |

---

## 📋 ความต้องการของระบบ

- **Node.js** ≥ 18.17
- **npm** (หรือ pnpm / yarn)
- บัญชี **Google** (สำหรับ OAuth) — ถ้าใช้ฟีเจอร์ login

---

## 🚀 เริ่มต้นใช้งาน

### 1) ติดตั้ง dependencies

```bash
cd online
npm install
```

### 2) ตั้งค่า environment variables

สร้างไฟล์ `.env.local` ที่ root ของ `online/`:

```env
# GAS API (Google Apps Script) — URL ที่คืนค่า { alldata: {...} }
NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/XXXXX/exec

# NextAuth
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-random-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> **หมายเหตุ:** ถ้าไม่ใช้ login สามารถละเว้น `GOOGLE_*` / `NEXTAUTH_*` ได้ แต่หน้า `/api/auth` อาจ error

### 3) รัน development

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ **http://localhost:3003** (แก้ไข: port 3003 — ดู `package.json`)

### 4) Build สำหรับ production

```bash
npm run build
npm run start
```

---

## 📜 Scripts

| คำสั่ง | คำอธิบาย |
| ------ | -------- |
| `npm run dev` | รัน dev server (port **3003**) |
| `npm run build` | build production |
| `npm run start` | รัน production server (port **3003**) |
| `npm run lint` | ตรวจ lint (Next.js ESLint) |

---

## 📁 โครงสร้างโปรเจกต์

```
online/
├─ public/
│  ├─ images/               # โลโก้ (mfg, sirim, nsf, polimaxx ฯลฯ)
│  └─ js/qrcode.min.js      # QR library (client-side)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx           # หน้าหลัก (ตาราง + ฟอร์ม)
│  │  ├─ layout.tsx         # root layout
│  │  ├─ globals.css        # Tailwind + global styles
│  │  ├─ theme.css          # CSS variables ของแต่ละธีม
│  │  ├─ api/auth/[...nextauth]/route.ts  # NextAuth handler
│  │  ├─ report/            # หน้าพิมพ์ PL   (+ report.css)
│  │  └─ reportSASB/        # หน้าพิมพ์ SASB
│  ├─ components/
│  │  ├─ NavHeader.tsx / Navbar.tsx / UnitNav.tsx
│  │  ├─ DateTimeBar.tsx
│  │  ├─ TablePl.tsx / TableSasb.tsx        # ตาราง Grade
│  │  ├─ FormPl.tsx / FormSasb.tsx          # ฟอร์มกรอกข้อมูล
│  │  ├─ HistoryModal.tsx                   # ประวัติการพิมพ์
│  │  ├─ HelpModal.tsx                      # คู่มือ (หน้าแรก)
│  │  ├─ ReportHelpModal.tsx                # คู่มือ (หน้าพิมพ์)
│  │  ├─ ThemeModal.tsx
│  │  └─ Modal.tsx / providers.tsx
│  ├─ hooks/
│  │  └─ useAlldata.ts       # โหลด/cache/refresh alldata
│  ├─ lib/
│  │  ├─ unitMeta.ts         # metadata ของ 8 หน่วย (hardcode)
│  │  ├─ unitMapping.ts      # ช่วยแยก PL / SASB
│  │  ├─ gasClient.ts        # fetch GAS + localStorage cache
│  │  ├─ gradeOptions.ts     # สร้าง option จาก gradeData
│  │  ├─ gradeTransform.ts   # จัดรูป grade จาก GAS
│  │  ├─ gradeHistory.ts     # ประวัติการพิมพ์
│  │  ├─ lotValidation.ts    # validate Lot (PL + SASB, prefix ตาม package)
│  │  ├─ plantLogic.ts       # plant code / plant name
│  │  ├─ reportPl.ts         # render ป้าย PL
│  │  ├─ reportSasb.ts       # render ป้าย SASB
│  │  ├─ shiftLogic.ts       # คำนวณกะตามเวลา
│  │  ├─ formHelpers.ts      # helper ฟอร์ม (lot prefix ฯลฯ)
│  │  ├─ auth.ts             # NextAuth options
│  │  ├─ applyTheme.ts       # apply ธีม
│  │  └─ autoFit.ts          # ปรับ font size อัตโนมัติ
│  ├─ store/
│  │  └─ useAppStore.ts      # Zustand store (unit/form/reportData/theme)
│  └─ type/
│     └─ index.ts            # Type กลาง (ReportData, UnitId, GradeItem ฯลฯ)
├─ next.config.mjs
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
└─ package.json
```

---

## 🧭 วิธีใช้งาน

### ขั้นตอนการพิมพ์

1. **เลือก Unit** ที่แถบด้านบน (HDPE / PP / PPC / CCM / ABS / …)
2. **เลือก Grade** จากตารางด้านซ้าย
   - ระบบจะ auto-fill `Grade`, `Net Weight`, `เครื่องหมาย มอก.` และ (SASB) `Plant`
3. **กรอกข้อมูล**
   - **Lot** — ตามความยาวที่กำหนดของแต่ละ unit
     - SASB: 3 หลักแรกเป็น prefix อัตโนมัติ (`[prefix][ปี YY]`)
     - ตัวอย่าง Lot (SASB): `T260703316` (grade `320PC`, netweight `1000` → ตัน → prefix `T`)
   - **กะ / วันที่**
   - **จากหน้า / ถึงหน้า** (ต้อง `from ≤ to`)
   - **Template** (PL) — ดูตารางด้านล่าง
   - **ตัวเลือกพิมพ์**: F/T, L/T, พิมพ์ QR Code
4. กด **ยืนยันและแสดงตัวอย่างหน้าพิมพ์** → เปิด tab ใหม่ที่หน้า Report
5. กด **🖨️ Print (Ctrl+P)**

> **ตั้งค่าเครื่องพิมพ์:** Margins = **None**, Scale = **100%**, เปิด **Background Graphics**

### Template (เฉพาะ PL)

| Template | องค์ประกอบ |
| -------- | ---------- |
| `template1` | ไม่มีโลโก้ ไม่มีตรา |
| `template2` | QR Code + มอก. |
| `template3` | QR + มอก. + SIRIM (ใช้กับ HDPE) |

> SASB ใช้ **QR only** (ไม่มี template1/2/3)

### Lot Prefix (SASB)

โครงสร้าง: `[prefix 1 หลัก][ปี YY 2 หลัก][เลขรัน 7 หลัก]`

| netweight | ความหมาย | prefix |
| --------- | -------- | ------ |
| `< 1000` | kg | หลักแรกของ netweight (เช่น `900` → `9`) |
| `1000` – `15999` | ตัน (01T..15T) | `T` |
| `≥ 16000` | Seabulk (ตัน > 10) | `3` |

**ตัวอย่าง (ปี 2026 → YY = `26`):**

| Grade | Lot 3 หลักแรก |
| ----- | ------------- |
| `GA800/900` | `926` |
| `320PC/1000` | `T26` |
| `GA800/20000` | `326` |

---

## 🔌 GAS API

ข้อมูล Grade ดึงจาก Google Apps Script ที่คืนค่า:

```json
{
  "alldata": {
    "gradeData1301": [
      {
        "grade": "P901BK",
        "netweightArray": [750, 800, 900, 16500, 18000],
        "description": "Black Pipe Grade",
        "status": true,
        "sub": false,
        "plantName": "HDPE",
        "plantCode": "1301",
        "specialGrade": "N"
      }
    ],
    "gradeData1372": [ /* ... ABS ... */ ]
  }
}
```

- key ของ `alldata` = `gradeData<plantCode>` (dynamic ตาม plantCode)
- cache ใน `localStorage` — key `gas_alldata` (+ `gas_alldata_time`)
- ปุ่ม **Refresh** ดึงข้อมูลใหม่

---

## 🧩 สถาปัตยกรรม (ภาพรวม)

```
GAS API ──fetch──▶ gasClient ──▶ localStorage cache
                                    │
                                    ▼
                    useAlldata ──▶ useAppStore (alldata)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
   TablePl/TableSasb          FormPl/FormSasb           reportData
   (เลือก grade)              (กรอกข้อมูล)                    │
                                                               ▼
                          sessionStorage[recent_print_<UNIT>]
                                                               │
                                                               ▼
                          /report (PL)  ──or──  /reportSASB (SASB)
                          render ป้าย → Print
```

- **Unit** เดียวขับทั้งตาราง + ฟอร์ม (สลับ PL/SASB ตาม `profile`)
- **reportData** ส่งข้ามหน้าผ่าน `sessionStorage` (ไม่ใช่ store — เปิด tab ใหม่ได้)
- การ render ป้ายเป็น **pure function คืน HTML string** (`reportPl.ts` / `reportSasb.ts`)

---

## 🔐 Auth (Google OAuth)

- ใช้ **NextAuth** + **Google Provider**
- ตั้งค่า `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Route: `/api/auth/[...nextauth]`

---

## 🐛 การแก้ปัญหาเบื้องต้น

| อาการ | สาเหตุ/วิธีแก้ |
| ----- | -------------- |
| ข้อมูล Grade ไม่ขึ้น | ตรวจ `NEXT_PUBLIC_GAS_API_URL` และสิทธิ์การเข้าถึง GAS (ต้อง deploy เป็น "Anyone") |
| ต้องล้าง cache ข้อมูล | กด **Refresh** หรือลบ `localStorage` key `gas_alldata` |
| ป้ายพิมพ์เพี้ยน / โลโก้ไม่ขึ้น | เปิด **Background Graphics** ใน print dialog + Margins = None |
| `Cannot find module 'X'` ทั้งที่ไฟล์มี | รีสตาร์ท TS server / ลบ `.next` แล้ว `npm run build` ใหม่ |
| พอร์ตชน | แก้ `-p 3003` ใน `package.json` scripts |

---

## 📝 หมายเหตุการพัฒนา

- เพิ่ม/แก้ **Unit** → แก้ `src/lib/unitMeta.ts` (เพิ่ม entry ใน `UNIT_META`)
- เพิ่ม/แก้ **การ render ป้าย** → `src/lib/reportPl.ts` (PL) หรือ `src/lib/reportSasb.ts` (SASB)
- เพิ่ม/แก้ **กติกา Lot** → `src/lib/lotValidation.ts`
- ไฟล์ CSS ของหน้าพิมพ์ใช้ prefix `.report-body` เพื่อชนะ Tailwind Preflight

---

## 📄 License

Internal project — IRPC Tag Printing System.
