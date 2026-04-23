import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  channelLabel,
  feeTypeLabel,
  formatDate,
  formatMoney,
  statusLabel,
} from "@/lib/utils";
import { OrderActions } from "./actions-client";
import { AddFeeForm } from "./fee-form";
import { DeleteFeeButton } from "./delete-fee-button";
import { AddTrackingForm } from "./tracking-form";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      fees: { orderBy: { createdAt: "asc" } },
      trackingEvents: { orderBy: { eventTime: "asc" } },
    },
  });
  if (!order) return notFound();

  const total = order.fees.reduce((s, f) => s + Number(f.amount), 0);
  const st = statusLabel(order.status);

  return (
    <div>
      <section className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-slate-800">{order.orderNo}</h2>
            <span className={`badge ${st.color}`}>{st.label}</span>
            <span className="text-xs text-slate-500">{order.customer.name} · {channelLabel(order.channel)} → {order.destination}</span>
          </div>
          <OrderActions id={order.id} status={order.status} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <Info label="客户" value={order.customer.name} />
          <Info label="渠道" value={channelLabel(order.channel)} />
          <Info label="起运地" value={order.origin} />
          <Info label="目的地" value={order.destination} />
          <Info label="重量" value={`${Number(order.weight).toFixed(2)} KG`} />
          <Info label="体积" value={`${Number(order.volume ?? 0).toFixed(4)} CBM`} />
          <Info label="件数" value={String(order.pieces ?? 1)} />
          <Info label="创建时间" value={formatDate(order.createdAt)} />
          <Info label="更新时间" value={formatDate(order.updatedAt)} />
        </div>
        {order.remark && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
            <span className="text-slate-500">备注：</span>{order.remark}
          </div>
        )}
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">费用明细</h2>
          <div className="text-base font-semibold text-brand">
            合计：{formatMoney(total)}
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="table">
            <thead>
              <tr>
                <th>费用类型</th>
                <th className="text-right">金额</th>
                <th>币种</th>
                <th>备注</th>
                <th>录入时间</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {order.fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    还没有费用，下方添加 ↓
                  </td>
                </tr>
              ) : (
                order.fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td>{feeTypeLabel(f.feeType)}</td>
                    <td className="text-right font-medium">{formatMoney(f.amount, f.currency)}</td>
                    <td>{f.currency}</td>
                    <td className="text-slate-600">{f.remark ?? "-"}</td>
                    <td className="text-slate-500">{formatDate(f.createdAt)}</td>
                    <td className="text-right">
                      <DeleteFeeButton feeId={f.id} orderId={order.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddFeeForm orderId={order.id} />
      </section>

      {/* 货物跟踪时间轴 */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">货物跟踪</h2>

        {order.trackingEvents.length === 0 ? (
          <p className="text-sm text-slate-400 mb-4">暂无轨迹记录</p>
        ) : (
          <ol className="relative border-l-2 border-slate-200 ml-3 mb-6 space-y-0">
            {order.trackingEvents.map((ev, idx) => {
              const isLast = idx === order.trackingEvents.length - 1;
              const dotColor = isLast
                ? "bg-brand border-brand"
                : ev.status === "EXCEPTION"
                ? "bg-red-400 border-red-400"
                : "bg-slate-300 border-slate-300";
              return (
                <li key={ev.id} className="ml-4 pb-5">
                  <span className={`absolute -left-[9px] mt-1 w-4 h-4 rounded-full border-2 ${dotColor}`} />
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(ev.eventTime).toLocaleString("zh-CN", { hour12: false })}
                    </span>
                    {ev.location && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded">{ev.location}</span>
                    )}
                    <span className={`text-xs px-1.5 rounded ${
                      ev.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                      ev.status === "EXCEPTION" ? "bg-red-50 text-red-600" :
                      ev.status === "CUSTOMS" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {TRACKING_STATUS[ev.status] ?? ev.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5">{ev.description}</p>
                  {ev.operator && (
                    <p className="text-xs text-slate-400 mt-0.5">录入：{ev.operator}</p>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <AddTrackingForm orderId={order.id} />
      </section>
    </div>
  );
}

const TRACKING_STATUS: Record<string, string> = {
  RECEIVED: "已收货",
  IN_TRANSIT: "运输中",
  CUSTOMS: "清关中",
  ARRIVED: "已到港",
  DELIVERED: "已签收",
  EXCEPTION: "异常",
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="text-slate-800">{value}</div>
    </div>
  );
}
