import Link from "next/link";
import { prisma } from "@/lib/db";
import { OrderForm } from "./form";
import { channelLabel } from "@/lib/utils";
import ExpressQuoteV2, { type V2SearchParams } from "./quote-v2";

export const dynamic = "force-dynamic";

const CHANNEL_TITLE: Record<string, string> = {
  EXPRESS: "中文版快递下单",
  LINE: "中文版专线下单",
  AIR: "空运价格查询-下单",
  SEA: "海运散货下单",
  FBA: "中文版FBA下单",
};

type RawSearchParams = V2SearchParams & {
  channel?: string;
  v?: string;
  channelKey?: string;
};

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const ch = (searchParams.channel ?? "EXPRESS").toUpperCase();

  if (ch === "EXPRESS" && searchParams.v === "2" && !searchParams.channelKey) {
    if (customers.length === 0) {
      return (
        <div className="card p-6 text-sm text-slate-600">
          还没有客户，请先去 <Link href="/customers/new" className="text-brand">新增客户</Link>。
        </div>
      );
    }
    return <ExpressQuoteV2 customers={customers} searchParams={searchParams} />;
  }

  const baseTitle = CHANNEL_TITLE[ch] ?? "新增订单";
  const title = searchParams.v === "2" ? `${baseTitle}-新版` : baseTitle;

  const prefilledChannel = searchParams.channelKey
    ? {
        channelKey: searchParams.channelKey,
        channelName: searchParams.channelName ?? "",
        weight: Number(searchParams.weight ?? 0),
        quantity: Number(searchParams.quantity ?? 1),
        cbm: Number(searchParams.cbm ?? 0),
        customerId: searchParams.customerId ?? "",
        trafficAmount: Number((searchParams as Record<string, string | undefined>).trafficAmount ?? 0),
        totalAmount: Number((searchParams as Record<string, string | undefined>).totalAmount ?? 0),
      }
    : undefined;

  return (
    <div className="max-w-4xl">
      {prefilledChannel && (
        <div className="card p-4 mb-4 text-xs bg-blue-50/40 border-blue-200">
          <div className="text-slate-600 mb-1">来自查价的渠道：</div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-800">{prefilledChannel.channelName}</span>
            <span className="text-orange-600 font-semibold">
              ¥ {prefilledChannel.totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="text-slate-500 mt-1">
            重量 {prefilledChannel.weight}KG · {prefilledChannel.quantity}件
            {prefilledChannel.cbm > 0 ? ` · ${prefilledChannel.cbm}CBM` : ""}
          </div>
        </div>
      )}
      {customers.length === 0 ? (
        <div className="card p-6 text-sm text-slate-600">
          还没有客户，请先去 <Link href="/customers/new" className="text-brand">新增客户</Link>。
        </div>
      ) : (
        <OrderForm
          customers={customers}
          defaultChannel={ch}
          prefilled={prefilledChannel}
        />
      )}
    </div>
  );
}
