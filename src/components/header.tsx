"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TOP_NAV: { href: string; label: string; matchPrefix?: string; matchFeature?: string }[] = [
  { href: "/", label: "首页" },
  { href: "/coming-soon?f=system", label: "系统", matchFeature: "system" },
  { href: "/orders", label: "订单", matchPrefix: "/orders" },
  { href: "/coming-soon?f=content", label: "内容", matchFeature: "content" },
  { href: "/coming-soon?f=marketing", label: "营销", matchFeature: "marketing" },
  { href: "/coming-soon?f=reports", label: "报表", matchFeature: "reports" },
  { href: "/", label: "业务" },
];

export function Header() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const f = sp.get("f");

  // 原版 by56 默认"业务"高亮（=当前工作区）；只有访问占位模块时才切换激活
  const activeIndex = (() => {
    for (let i = 0; i < TOP_NAV.length; i++) {
      const item = TOP_NAV[i];
      if (item.matchFeature && pathname === "/coming-soon" && f === item.matchFeature) return i;
      if (item.matchPrefix && pathname.startsWith(item.matchPrefix)) return i;
    }
    return TOP_NAV.length - 1; // 业务
  })();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-14">
      <div className="flex items-center h-full">
        <Link
          href="/"
          className="w-60 shrink-0 flex items-center gap-2 px-4 border-r border-slate-200 h-full"
          title="返回首页"
        >
          <span className="inline-flex w-8 h-8 rounded bg-brand text-white text-sm items-center justify-center">
            仰
          </span>
          <span className="font-semibold text-brand">仰度科技</span>
          <span className="ml-2 text-[11px] text-slate-400 font-normal hidden lg:inline">
            数字货代 TMS
          </span>
        </Link>

        <nav className="flex items-center h-full px-2">
          {TOP_NAV.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  "px-4 h-full inline-flex items-center text-sm transition-colors " +
                  (isActive
                    ? "text-brand border-b-2 border-brand font-medium"
                    : "text-slate-600 hover:text-brand")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4 px-4 text-sm text-slate-500">
          <span className="hidden md:inline text-xs text-slate-400">
            v0.1 MVP · 端口 6419
          </span>
          <div
            className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs"
            title="管理员"
          >
            管
          </div>
        </div>
      </div>
    </header>
  );
}
