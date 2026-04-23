import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  channelLabel,
  formatDate,
  formatMoney,
  statusLabel,
  STATUS_OPTIONS,
  CHANNEL_OPTIONS,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHANNEL_TITLE: Record<string, string> = {
  EXPRESS: "快递订单列表",
  LINE: "专线订单列表",
  AIR: "空运订单列表",
  SEA: "海运散货订单列表",
  FBA: "FBA订单列表",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { customerId?: string; status?: string; channel?: string };
}) {
  const where: { customerId?: string; status?: string; channel?: string } = {};
  if (searchParams.customerId) where.customerId = searchParams.customerId;
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.channel) where.channel = searchParams.channel;

  const [orders, customer] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { customer: true, fees: true },
    }),
    searchParams.customerId
      ? prisma.customer.findUnique({ where: { id: searchParams.customerId }, select: { name: true } })
      : Promise.resolve(null),
  ]);

  const grandTotal = orders.reduce(
    (s, o) => s + o.fees.reduce((x, f) => x + Number(f.amount), 0),
    0
  );

  const title = searchParams.channel
    ? (CHANNEL_TITLE[searchParams.channel] ?? "订单列表")
    : "全部订单";

  const desc = [
    `共 ${orders.length} 单`,
    `合计 ${formatMoney(grandTotal)}`,
    customer ? `客户：${customer.name}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <div className="card p-3 mb-4 flex items-center gap-3 flex-wrap text-sm">
        <span className="text-slate-500">渠道：</span>
        <ChannelLink current={searchParams.channel} value="">全部</ChannelLink>
        {CHANNEL_OPTIONS.map((c) => (
          <ChannelLink key={c.value} current={searchParams.channel} value={c.value}>
            {c.label}
          </ChannelLink>
        ))}

        <span className="ml-4 text-slate-500">状态：</span>
        <StatusLink current={searchParams.status} channel={searchParams.channel} value="">全部</StatusLink>
        {STATUS_OPTIONS.map((s) => (
          <StatusLink key={s.value} current={searchParams.status} channel={searchParams.channel} value={s.value}>
            {s.label}
          </StatusLink>
        ))}

        <span className="ml-auto text-xs text-slate-400">{desc}</span>
        <Link href="/orders/new" className="btn-primary btn-sm">+ 新增订单</Link>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>渠道</th>
              <th>目的地</th>
              <th className="text-right">重量(KG)</th>
              <th>状态</th>
              <th className="text-right">费用合计</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                  暂无订单，<Link href="/orders/new" className="text-brand">去下单 →</Link>
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const total = o.fees.reduce((s, f) => s + Number(f.amount), 0);
                const st = statusLabel(o.status);
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td>
                      <Link href={`/orders/${o.id}`} className="text-brand font-medium">
                        {o.orderNo}
                      </Link>
                    </td>
                    <td>{o.customer.name}</td>
                    <td>{channelLabel(o.channel)}</td>
                    <td>{o.destination}</td>
                    <td className="text-right">{Number(o.weight).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="text-right font-medium">{formatMoney(total)}</td>
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

function buildQuery(obj: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v && sp.set(k, v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function ChannelLink({
  current,
  value,
  children,
}: {
  current?: string;
  value: string;
  children: React.ReactNode;
}) {
  const active = (current ?? "") === value;
  const href = `/orders${buildQuery({ channel: value || undefined })}`;
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 rounded text-xs ${
        active ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}

function StatusLink({
  current,
  channel,
  value,
  children,
}: {
  current?: string;
  channel?: string;
  value: string;
  children: React.ReactNode;
}) {
  const active = (current ?? "") === value;
  const href = `/orders${buildQuery({ channel, status: value || undefined })}`;
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 rounded text-xs ${
        active ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}
