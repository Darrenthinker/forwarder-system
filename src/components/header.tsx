import Link from "next/link";

export function Header() {
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
