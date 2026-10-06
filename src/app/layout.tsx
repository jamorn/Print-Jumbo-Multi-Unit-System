import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Print Tag Jumbo - Multi-Unit System",
  description: "Print Tag Jumbo (PL + SASB) — Online version",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

