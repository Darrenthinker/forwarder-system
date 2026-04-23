import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TRANSPORT_LABEL: Record<string, string> = {
  AIR: "空运", SEA: "海运", EXPRESS: "快递", LAND: "陆运", IMPORT: "进口",
};

export default async function ImportOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; sourceType?: string };
}) {
  const where: Record<string, unknown> = { direction: "IMPORT" };
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.sourceType) where.sourceType = searchParams.sourceType;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      fees: true,
      trackingEvents: { orderBy: { eventTime: "desc" }, take: 1 },
    },
  });

  const total = orders.reduce((s, o) => s + o.fees.reduce((x, f) => x + Number(f.amount), 0), 0);

  return (
    <div>
      <div className="card p-3 mb-4 flex items-center gap-3 flex-wrap text-sm">
        <FilterLink href="/import/orders" active={!searchParams.sourceType} label="全部" />
        <FilterLink href="/import/orders?sourceType=DIRECT" active={searchParams.sourceType === "DIRECT"} label="直客" />
        <FilterLink href="/import/orders?sourceType=PEER" active={searchParams.sourceType === "PEER"} label="同行" />
        <span className="mx-2 text-slate-300">|</span>
        <FilterLink href="/import/orders" active={!searchParams.status} label="全部状态" />
        {["SUBMITTED", "IN_TRANSIT", "CUSTOMS", "DELIVERED", "CANCELED"].map((s) => {
          const st = statusLabel(s);
          return (
            <FilterLink
              key={s}
              href={`/import/orders?status=${s}${searchParams.sourceType ? `&sourceType=${searchParams.sourceType}` : ""}`}
              active={searchParams.status === s}
              label={st.label}
            />
          );
        })}
        <span className="ml-auto text-xs text-slate-400">共 {orders.length} 单 · {formatMoney(total)}</span>
        <Link href="/import/new" className="btn-primary btn-sm">+ 新建进口单</Link>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>单号</th>
              <th>客户</th>
              <th>来源</th>
              <th>起运地</th>
              <th>目的地</th>
              <th>运输方式</th>
              <th>运单号</th>
              <th>最新轨迹</th>
              <th>状态</th>
              <th className="text-right">费用</th>
              <th>登记时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-sm text-slate-500">
                  暂无进口订单，<Link href="/import/new" className="text-brand">去登记 →</Link>
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const feeTotal = o.fees.reduce((s, f) => s + Number(f.amount), 0);
                const st = statusLabel(o.status);
                const latestEvent = o.trackingEvents[0];
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td>
                      <Link href={`/orders/${o.id}`} className="text-brand font-medium">
                        {o.orderNo}
                      </Link>
                    </td>
                    <td className="font-medium text-slate-800">{o.customer.name}</td>
                    <td>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${o.sourceType === "PEER" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {o.sourceType === "PEER" ? "同行" : "直客"}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{o.origin}</td>
                    <td className="text-xs text-slate-600">{o.destination}</td>
                    <td>
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                        {TRANSPORT_LABEL[o.channel] ?? o.channel}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{o.trackingNo ?? "-"}</td>
                    <td className="text-xs max-w-[150px]">
                      {latestEvent ? (
                        <span className="text-slate-600 truncate block" title={latestEvent.description}>
                          {latestEvent.description}
                        </span>
                      ) : (
                        <span className="text-slate-300">暂无轨迹</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="text-right font-medium">{feeTotal > 0 ? formatMoney(feeTotal) : "-"}</td>
                    <td className="text-slate-500">{formatDate(o.createdAt)}</td>
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

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 rounded text-xs ${active ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );
}
