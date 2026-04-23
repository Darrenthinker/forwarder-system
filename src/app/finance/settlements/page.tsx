import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";
import { ConfirmSettlementButton } from "./confirm-button";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "草稿",   color: "badge-gray" },
  CONFIRMED: { label: "已确认", color: "badge-blue" },
  PAID:      { label: "已收款", color: "badge-green" },
};

export default async function SettlementsPage({
  searchParams,
}: {
  searchParams: { status?: string; period?: string };
}) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.period) where.period = { contains: searchParams.period };

  const settlements = await prisma.settlement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      _count: { select: { items: true } },
    },
  });

  // 统计
  const totalConfirmed = settlements
    .filter((s) => s.status !== "DRAFT")
    .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  return (
    <div>
      {/* 财务权限提示条 */}
      <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
        <span className="text-amber-500">⚠</span>
        财务结算页面 — 登录系统完成后将限制为财务角色可见。当前为开发模式，所有人可访问。
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <SummaryCard
          label="结算单总数"
          value={String(settlements.length)}
          sub="条"
        />
        <SummaryCard
          label="待确认金额"
          value={formatMoney(settlements.filter(s => s.status === "DRAFT").reduce((s, x) => s + Number(x.totalAmount), 0))}
          sub="草稿状态"
        />
        <SummaryCard
          label="已确认应收"
          value={formatMoney(totalConfirmed)}
          sub="已确认/已收款"
        />
      </div>

      {/* 筛选栏 */}
      <div className="card p-3 mb-4 flex items-center gap-3 flex-wrap text-sm">
        {["", "DRAFT", "CONFIRMED", "PAID"].map((s) => {
          const meta = s ? STATUS_MAP[s] : { label: "全部", color: "" };
          return (
            <Link
              key={s}
              href={`/finance/settlements${s ? `?status=${s}` : ""}`}
              className={`px-2.5 py-1 rounded text-xs ${searchParams.status === s || (!searchParams.status && !s) ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {meta.label}
            </Link>
          );
        })}
        <span className="ml-auto" />
        <Link href="/finance/settlements/new" className="btn-primary btn-sm">+ 新建结算单</Link>
      </div>

      {/* 列表 */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>结算单标题</th>
              <th>账期</th>
              <th>客户</th>
              <th className="text-center">明细数</th>
              <th className="text-right">金额</th>
              <th>币种</th>
              <th>状态</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {settlements.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                  暂无结算单，<Link href="/finance/settlements/new" className="text-brand">去创建 →</Link>
                </td>
              </tr>
            ) : (
              settlements.map((s) => {
                const st = STATUS_MAP[s.status] ?? { label: s.status, color: "badge-gray" };
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-800">{s.title}</td>
                    <td className="text-xs text-slate-600">{s.period}</td>
                    <td className="text-xs text-slate-600">-</td>
                    <td className="text-center text-xs">{s._count.items}</td>
                    <td className="text-right font-semibold text-orange-600">
                      {formatMoney(s.totalAmount, s.currency)}
                    </td>
                    <td className="text-xs text-slate-500">{s.currency}</td>
                    <td><span className={`badge ${st.color}`}>{st.label}</span></td>
                    <td className="text-slate-500">{formatDate(s.createdAt)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/finance/settlements/${s.id}`} className="text-xs text-brand hover:underline">查看</Link>
                        {s.status === "DRAFT" && (
                          <ConfirmSettlementButton id={s.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}
