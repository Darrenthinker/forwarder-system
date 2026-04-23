"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MENU } from "@/lib/menu";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fs-sidebar-open";

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = `${pathname}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;

  // 默认展开状态
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MENU.map((m) => [m.id, m.defaultOpen ?? false]))
  );

  // 客户端挂载后从 localStorage 恢复
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOpen({ ...open, ...JSON.parse(saved) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {}
  }, [open]);

  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const isActive = (href: string) => {
    if (href === fullPath) return true;
    // 订单详情页 /orders/[id] 时，"全部订单" 高亮
    if (pathname.startsWith("/orders/") && href === "/orders") return true;
    return false;
  };

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="py-2">
        {MENU.map((section) => {
          const Icon = section.icon;
          const isOpen = open[section.id];
          return (
            <div key={section.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{section.label}</span>
              </button>

              {isOpen && (
                <ul className="pb-1">
                  {section.children.map((leaf) => {
                    const active = isActive(leaf.href);
                    return (
                      <li key={leaf.href}>
                        <Link
                          href={leaf.href}
                          className={cn(
                            "flex items-center gap-2 pl-10 pr-3 py-1.5 text-[13px] transition-colors group",
                            active
                              ? "bg-brand-50 text-brand border-r-2 border-brand font-medium"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <span className="flex-1 truncate">{leaf.label}</span>
                          {!leaf.done && (
                            <span
                              className="text-[10px] px-1 rounded bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                              title="该功能尚未实现"
                            >
                              开发中
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
