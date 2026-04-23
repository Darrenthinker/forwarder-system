import Link from "next/link";

const TOP_NAV = [
  { href: "/", label: "首页" },
  { href: "/system", label: "系统" },
  { href: "/orders", label: "订单" },
  { href: "/content", label: "内容" },
  { href: "/marketing", label: "营销" },
  { href: "/reports", label: "报表" },
  { href: "/business", label: "业务", active: true },
];

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-14">
      <div className="flex items-center h-full">
        <Link
          href="/"
          className="w-60 shrink-0 flex items-center gap-2 px-4 border-r border-slate-200 h-full"
        >
          <span className="inline-flex w-8 h-8 rounded bg-brand text-white text-sm items-center justify-center">
            仰
          </span>
          <span className="font-semibold text-brand">仰度科技</span>
        </Link>

        <nav className="flex items-center h-full px-2">
          {TOP_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 h-full inline-flex items-center text-sm transition-colors ${
                item.active
                  ? "text-brand border-b-2 border-brand"
                  : "text-slate-600 hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 px-4 text-sm text-slate-500">
          <span className="hidden md:inline text-xs text-slate-400">v0.1 MVP · :6419</span>
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs">
            管
          </div>
        </div>
      </div>
    </header>
  );
}
