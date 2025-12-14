import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP财务系统 - 供应商对账",
  description: "企业资源计划财务管理系统 - 供应商对账模块",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
