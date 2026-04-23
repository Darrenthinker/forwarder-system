import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    customerCount,
    orderCount,
    todayOrderCount,
    monthOrderCount,
    monthFees,
    totalFees,
    submittedCount,
    inTransitCount,
    deliveredCount,
    topCustomers,
    recentCustomers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.orderFee.aggregate({
      _sum: { amount: true },
      where: { order: { createdAt: { gte: monthStart } } },
    }),
    prisma.orderFee.aggregate({ _sum: { amount: true } }),
    prisma.order.count({ where: { status: "SUBMITTED" } }),
    prisma.order.count({ where: { status: "IN_TRANSIT" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.customer.findMany({
      take: 8,
      orderBy: { orders: { _count: "desc" } },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.customer.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  const monthRevenue = Number(monthFees._sum.amount ?? 0);
  const totalRevenue = Number(totalFees._sum.amount ?? 0);
  const profit = monthRevenue * 0.18; // MVP 阶段：暂用 18% 估算毛利率
  const todoTotal = submittedCount + inTransitCount + deliveredCount;
  const maxOrderCount = Math.max(1, ...topCustomers.map((c) => c._count.orders));

  return (
    <div className="space-y-4">
      {/* ==================== 今日待办 ==================== */}
      <section className="card">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">今日待办</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
              {todoTotal}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-100">
          <TodoGroup title="客户回访 · 待回访" items={[
            { label: "线索回访", value: 0 },
            { label: "线索 7 日", value: 0 },
            { label: "客户回访", value: customerCount },
            { label: "查价回访", value: 0 },
            { label: "流失预警", value: 0, danger: true },
          ]} />
          <TodoGroup title="问题件" items={[
            { label: "未处理", value: submittedCount, danger: submittedCount > 0 },
            { label: "处理中", value: inTransitCount },
            { label: "欠费", value: 0 },
            { label: "仓库", value: 0 },
            { label: "我的关注", value: 0 },
          ]} />
          <TodoGroup title="未下单理货" items={[
            { label: "未关联", value: 0 },
            { label: "快递", value: 0 },
            { label: "FBA", value: 0 },
            { label: "空运", value: 0 },
          ]} />
          <TodoGroup title="入库差异 · 材积" items={[
            { label: "未关联", value: 0 },
            { label: "差异", value: 0 },
          ]} />
          <TodoGroup title="整票更新" items={[
            { label: "收货", value: 0 },
            { label: "已揽收", value: 0 },
          ]} />
          <TodoGroup title="合同到期 / 客户经营" items={[
            { label: "有效期 ≤ 15 天", value: 0 },
            { label: "待跟进", value: 0 },
          ]} />
        </div>
      </section>

      {/* ==================== 中部：账单应收款 + 本月业绩 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 账单 - 应收款 */}
        <section className="card">
          <SectionHeader title="账单 - 应收款" sub="每天更新，数据统计于昨日" right={<TabSwitch active="个人" />} />
          <div className="grid grid-cols-4 gap-2 px-5 pt-4">
            <BigStat
              value={formatMoneyShort(totalRevenue)}
              label="总应收款"
              accent
            />
            <BigStat value={2} label="即将还款客户" />
            <BigStat value={0} label="逾期还款客户" />
            <BigStat value={0} label="额度超支客户" />
          </div>
          <div className="px-5 pt-4 pb-5">
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-100">
                  <th className="text-left font-normal py-2">客户名称</th>
                  <th className="text-left font-normal">还款日</th>
                  <th className="text-right font-normal">信用额度</th>
                  <th className="text-right font-normal">总应收款</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      暂无应收款数据
                    </td>
                  </tr>
                ) : (
                  recentCustomers.map((c, i) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 text-brand">
                        <span className="text-slate-400 mr-2">{i + 1}</span>
                        {c.name}
                      </td>
                      <td className="text-slate-500">每月 15 日</td>
                      <td className="text-right text-slate-500">—</td>
                      <td className="text-right font-medium text-slate-700">{formatMoneyShort(0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 本月业绩 */}
        <section className="card">
          <SectionHeader title="本月业绩" sub="每天更新，数据统计于昨日" right={<TabSwitch active="个人" />} />
          <div className="grid grid-cols-3 gap-2 px-5 pt-4">
            <BigStat value={monthOrderCount} label="订单量" accent />
            <BigStat value={formatMoneyShort(monthRevenue)} label="收款额" />
            <BigStat value={formatMoneyShort(profit)} label="利润额" />
          </div>
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-700 font-medium">订单量排行（客户）</span>
              <span className="text-slate-400 text-xs">订单量（票）</span>
            </div>
            {topCustomers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">暂无订单数据</div>
            ) : (
              <ul className="space-y-2">
                {topCustomers.map((c, i) => {
                  const pct = (c._count.orders / maxOrderCount) * 100;
                  return (
                    <li key={c.id} className="flex items-center text-xs gap-3">
                      <span className="w-4 text-slate-400 text-right">{i + 1}</span>
                      <span className="w-40 truncate text-slate-700" title={c.name}>{c.name}</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded">
                        <div
                          className="h-full bg-brand/80 rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-slate-700">{c._count.orders}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ==================== 底部：今日活跃 + 内部公告 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card">
          <SectionHeader
            title="今日活跃"
            right={
              <div className="flex gap-2 text-xs">
                <Link href="/orders" className="px-2 py-0.5 rounded border border-slate-200 hover:border-brand hover:text-brand">查价</Link>
                <Link href="/orders/new" className="px-2 py-0.5 rounded bg-brand text-white hover:bg-brand-600">下单</Link>
              </div>
            }
          />
          <div className="px-5 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span>客户名称</span>
              <span>今日下单</span>
            </div>
            {topCustomers.slice(0, 5).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">暂无活跃客户</div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {topCustomers.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                    <Link href={`/customers`} className="text-brand hover:underline truncate max-w-xs" title={c.name}>
                      {c.name}
                    </Link>
                    <span className="text-slate-700 font-medium">{c._count.orders}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card">
          <SectionHeader title="内部公告" right={<Link href="#" className="text-xs text-slate-400 hover:text-brand">全部公告 →</Link>} />
          <div className="px-5 py-4 space-y-3 text-sm">
            {ANNOUNCEMENTS.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={`mt-1 px-1.5 py-0.5 text-[10px] rounded ${a.tagColor}`}
                >
                  {a.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 truncate">{a.title}</div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{a.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ==================== 底部快捷入口 ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="客户总数" value={`${customerCount} 家`} href="/customers" />
        <QuickStat label="订单总数" value={`${orderCount} 单`} href="/orders" />
        <QuickStat label="今日新单" value={`${todayOrderCount} 单`} href="/orders" />
        <QuickStat label="累计应收" value={formatMoney(totalRevenue)} />
      </div>
    </div>
  );
}

/* ==================== 子组件 ==================== */

function SectionHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

function TabSwitch({ active }: { active: "个人" | "团队" }) {
  return (
    <div className="inline-flex text-xs rounded border border-slate-200 overflow-hidden">
      {(["个人", "团队"] as const).map((k) => (
        <span
          key={k}
          className={`px-3 py-1 ${
            k === active ? "bg-brand text-white" : "bg-white text-slate-500"
          }`}
        >
          {k}
        </span>
      ))}
    </div>
  );
}

function TodoGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number; danger?: boolean }[];
}) {
  return (
    <div className="px-4 py-3">
      <div className="text-xs text-slate-500 mb-2">{title}</div>
      <div className="grid grid-cols-3 gap-y-2 gap-x-1">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div
              className={`text-lg font-semibold ${
                it.danger && it.value > 0 ? "text-red-500" : "text-slate-800"
              }`}
            >
              {it.value}
            </div>
            <div className="text-[11px] text-slate-400 truncate" title={it.label}>
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BigStat({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded p-3 text-center ${
        accent ? "bg-brand/5 ring-1 ring-brand/20" : "bg-slate-50"
      }`}
    >
      <div className={`text-xl font-bold ${accent ? "text-brand" : "text-slate-800"}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="card px-4 py-3 hover:shadow-md hover:border-brand/30 transition-all">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* ==================== 静态数据 ==================== */

const ANNOUNCEMENTS = [
  { tag: "上线通知", tagColor: "bg-blue-50 text-blue-600", title: "2026 年 1 月上线版本：新增订单批量导出、客户标签管理。", date: "2026-02-01" },
  { tag: "价格调整", tagColor: "bg-amber-50 text-amber-600", title: "3 月起部分美西渠道燃油费调整，详见运价表。", date: "2026-01-04" },
  { tag: "系统维护", tagColor: "bg-slate-100 text-slate-600", title: "每周日 02:00–04:00 进行例行数据备份，期间可能短暂卡顿。", date: "2026-01-01" },
  { tag: "公告", tagColor: "bg-green-50 text-green-600", title: "欢迎使用 仰度科技 货代管理系统 MVP 版本，功能持续完善中。", date: "2025-12-20" },
];

/* ==================== 工具函数 ==================== */

function formatMoneyShort(n: number): string {
  if (!n || n === 0) return "¥0";
  if (Math.abs(n) >= 10000) {
    return `¥${(n / 10000).toFixed(2)}万`;
  }
  return `¥${n.toFixed(2)}`;
}
