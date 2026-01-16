import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ระบบจัดการการยืม-คืน",
  description: "ระบบจัดการการยืมเอกสารสำหรับมูลนิธิและสมาคม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={`${sarabun.variable} font-sans antialiased bg-gray-50`}>
        <div className="min-h-screen pb-20">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
