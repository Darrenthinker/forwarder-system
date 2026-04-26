import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";

export const metadata: Metadata = {
  title: "仰度科技 · 货代管理系统",
  description: "仰度科技 — 小型货代公司业务管理系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Suspense fallback={<header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30" />}>
          <Header />
        </Suspense>
        <div className="flex">
          <Suspense fallback={<aside className="w-60 shrink-0 border-r border-slate-200 bg-white" />}>
            <Sidebar />
          </Suspense>
          <div className="flex-1 min-w-0 flex flex-col">
            <Suspense fallback={<div className="h-10 border-b border-slate-200 bg-white" />}>
              <TabBar />
            </Suspense>
            <main className="flex-1 p-6 bg-slate-50 min-h-[calc(100vh-3.5rem-2.5rem)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
