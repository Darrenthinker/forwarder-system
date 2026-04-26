"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, MouseEvent, WheelEvent } from "react";
import { Home, X } from "lucide-react";
import { MENU } from "@/lib/menu";
import { cn } from "@/lib/utils";

type Tab = { key: string; title: string; href: string; closable: boolean };

const HOME_TAB: Tab = { key: "/", title: "首页", href: "/", closable: false };
const STORAGE_KEY = "fs-open-tabs";
const MAX_TABS = 20;

function findTitle(href: string): string {
  for (const sec of MENU) {
    for (const leaf of sec.children) {
      if (leaf.href === href) return leaf.label;
    }
  }
  const pathname = href.split("?")[0];
  if (pathname.startsWith("/orders/") && pathname !== "/orders/new") return "订单详情";
  if (pathname === "/customers/new") return "新增客户";
  if (pathname === "/customers") return "客户信息列表";
  if (pathname === "/orders/new") return "中文版快递下单";
  if (pathname === "/orders") return "全部订单";
  if (pathname === "/coming-soon") return "功能开发中";
  if (pathname === "/") return "首页";
  return pathname;
}

export function TabBar() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();
  const fullPath = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;

  const [tabs, setTabs] = useState<Tab[]>([HOME_TAB]);
  const [hydrated, setHydrated] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Tab[] = JSON.parse(saved);
        const filtered = parsed.filter((t) => t.key !== "/");
        setTabs([HOME_TAB, ...filtered]);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (fullPath === "/") return;
    setTabs((prev) => {
      if (prev.find((t) => t.key === fullPath)) return prev;
      const newTab: Tab = {
        key: fullPath,
        title: findTitle(fullPath),
        href: fullPath,
        closable: true,
      };
      const next = [...prev, newTab];
      if (next.length > MAX_TABS) {
        return [HOME_TAB, ...next.slice(-(MAX_TABS - 1))];
      }
      return next;
    });
  }, [fullPath, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch {}
  }, [tabs, hydrated]);

  // 切换路由时把激活的 tab 滚入视野
  useEffect(() => {
    if (!hydrated) return;
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [fullPath, hydrated, tabs.length]);

  // 鼠标滚轮 → 横向滚动 Tab 栏
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (e.deltaY === 0) return;
    el.scrollLeft += e.deltaY;
  };

  const closeTab = (key: string, e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.key === key);
      if (idx === -1) return prev;
      const next = prev.filter((t) => t.key !== key);
      if (key === fullPath) {
        const neighbor = next[idx - 1] ?? next[idx] ?? HOME_TAB;
        router.push(neighbor.href);
      }
      return next;
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 flex items-stretch sticky top-14 z-20">
      {/* Tab 列表（鼠标滚轮可横向滚动） */}
      <div
        ref={scrollerRef}
        onWheel={onWheel}
        className="flex-1 flex items-stretch overflow-x-auto no-scrollbar min-w-0 relative"
      >
        {tabs.map((tab) => {
          const active = tab.key === fullPath;
          return (
            <div
              key={tab.key}
              ref={active ? activeTabRef : null}
              className="relative flex items-stretch border-r border-slate-100 group shrink-0"
            >
              <Link
                href={tab.href}
                title={tab.closable ? tab.title : "返回首页"}
                className={cn(
                  "flex items-center text-xs whitespace-nowrap select-none transition-colors h-full",
                  tab.closable ? "px-3 py-2" : "px-3",
                  tab.closable && "pr-7",
                  active
                    ? "bg-brand-50 text-brand border-b-2 border-b-brand"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {!tab.closable ? (
                  <Home className="w-3.5 h-3.5" />
                ) : (
                  <span className="max-w-[200px] truncate">{tab.title}</span>
                )}
              </Link>
              {tab.closable && (
                <button
                  type="button"
                  onClick={(e) => closeTab(tab.key, e)}
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  title="关闭"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
