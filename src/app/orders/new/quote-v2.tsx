import Link from "next/link";
import {
  CARGO_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  MODE_OPTIONS,
  PACKET_TYPE_OPTIONS,
  QUERY_TYPE_OPTIONS,
  START_CITY_OPTIONS,
  searchChannels,
  type QuoteParams,
} from "@/lib/quote-channels";
import { QuoteResultsClient } from "./quote-results-client";

type Customer = { id: string; name: string };

type Multi = string | string[] | undefined;

export type V2SearchParams = {
  customerId?: string;
  packetType?: string;
  queryType?: string;
  startCityKey?: string;
  countryKey?: string;
  goodName?: string;
  cargoTypeIds?: Multi;
  quantity?: string;
  weight?: string;
  cbm?: string;
  modeCodes?: Multi;
  channelName?: string;
  go?: string;
};

function toArr(v: Multi): string[] {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v.flatMap((x) => x.split(",")).map((s) => s.trim()).filter(Boolean);
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function ExpressQuoteV2({
  customers,
  searchParams,
}: {
  customers: Customer[];
  searchParams: V2SearchParams;
}) {
  const customerId = searchParams.customerId ?? customers[0]?.id ?? "";
  const packetType = searchParams.packetType ?? "1";
  const queryType = searchParams.queryType ?? "1";
  const startCityKey = searchParams.startCityKey ?? START_CITY_OPTIONS[0].key;
  const countryKey = searchParams.countryKey ?? COUNTRY_OPTIONS[0].key;
  const goodName = searchParams.goodName ?? "普货";
  const cargoTypeIdsRaw = toArr(searchParams.cargoTypeIds);
  const cargoTypeIds = cargoTypeIdsRaw.length > 0 ? cargoTypeIdsRaw : ["139"];
  const quantity = Math.max(1, Number(searchParams.quantity ?? "1"));
  const weight = Math.max(0.5, Number(searchParams.weight ?? "15"));
  const cbm = Math.max(0, Number(searchParams.cbm ?? "0"));
  const modeCodes = toArr(searchParams.modeCodes);
  const channelName = searchParams.channelName ?? "";

  const hasQueried = searchParams.go === "1";

  const country = COUNTRY_OPTIONS.find((c) => c.key === countryKey);
  const startCity = START_CITY_OPTIONS.find((c) => c.key === startCityKey);

  /* ===== 查价结果（有 go=1 时计算） ===== */
  let results = { total: 0, items: [] as ReturnType<typeof searchChannels>["items"] };
  if (hasQueried) {
    const params: QuoteParams = {
      startCityKey,
      countryKey,
      weight,
      cbm,
      quantity,
      cargoTypeIds,
      modeCodes,
      channelName,
      packetType,
    };
    results = searchChannels(params);
  }

  /* ===== 回到表单的链接（清 go=1） ===== */
  const backToFormHref = `/orders/new?channel=EXPRESS&v=2&customerId=${customerId}&packetType=${packetType}&queryType=${queryType}&startCityKey=${startCityKey}&countryKey=${countryKey}&goodName=${encodeURIComponent(goodName)}&cargoTypeIds=${cargoTypeIds.join(",")}&weight=${weight}&quantity=${quantity}&cbm=${cbm}&modeCodes=${modeCodes.join(",")}`;

  /* ===== 有结果时：隐藏大表单，展示吸顶结果页 ===== */
  if (hasQueried) {
    return (
      <div className="space-y-3 -mt-2">
        <QuoteResultsClient
          items={results.items}
          info={{
            startCityName: startCity?.name ?? "深圳市",
            countryName: country?.name ?? "目的地",
            weight,
            quantity,
            cbm,
            goodName,
            total: results.total,
            backHref: backToFormHref,
            customerId,
          }}
        />
      </div>
    );
  }

  /* ===== 无结果时：展示查价表单 ===== */
  return (
    <div className="space-y-3">
      <form method="GET" action="/orders/new" className="card p-0 overflow-hidden">
        <input type="hidden" name="channel" value="EXPRESS" />
        <input type="hidden" name="v" value="2" />
        <input type="hidden" name="go" value="1" />

        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-3">
          <FormItem label="客户名称" required>
            <select name="customerId" defaultValue={customerId} className="form-select">
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormItem>

          <FormItem label="业务类型" required>
            <div className="flex gap-4 pt-1.5">
              {PACKET_TYPE_OPTIONS.map((o) => (
                <label key={o.value} className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                  <input type="radio" name="packetType" value={o.value} defaultChecked={packetType === o.value} className="accent-brand" />
                  {o.label}
                </label>
              ))}
            </div>
          </FormItem>

          <FormItem label="货物所在地" required>
            <select name="startCityKey" defaultValue={startCityKey} className="form-select">
              {START_CITY_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </FormItem>

          <FormItem label="目的国家" required>
            <select name="countryKey" defaultValue={countryKey} className="form-select">
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.name} ({c.code})</option>
              ))}
            </select>
          </FormItem>

          <FormItem label="货物品名" required>
            <input type="text" name="goodName" defaultValue={goodName} placeholder="请输入中文货物名称" className="form-input" />
          </FormItem>

          <FormItem label="货物类型" required className="md:col-span-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5">
              {CARGO_TYPE_OPTIONS.map((o) => (
                <label key={o.id} className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                  <input type="checkbox" name="cargoTypeIds" value={o.id} defaultChecked={cargoTypeIds.includes(o.id)} className="accent-brand" />
                  {o.label}
                </label>
              ))}
            </div>
          </FormItem>

          <FormItem label="计费方式" required>
            <div className="flex gap-4 pt-1.5">
              {QUERY_TYPE_OPTIONS.map((o) => (
                <label key={o.value} className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                  <input type="radio" name="queryType" value={o.value} defaultChecked={queryType === o.value} className="accent-brand" />
                  {o.label}
                </label>
              ))}
            </div>
          </FormItem>
        </div>

        {/* 重量/件数行 */}
        <div className="px-5 pb-4 grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-3 border-t border-dashed border-slate-100 pt-3">
          <FormItem label="总数量" required>
            <div className="flex items-center gap-1">
              <input type="number" name="quantity" min={1} defaultValue={quantity} className="form-input flex-1" />
              <span className="text-xs text-slate-400">件</span>
            </div>
          </FormItem>
          <FormItem label="总重量" required>
            <div className="flex items-center gap-1">
              <input type="number" name="weight" step="0.01" min={0.5} defaultValue={weight} className="form-input flex-1" />
              <span className="text-xs text-slate-400">KG</span>
            </div>
          </FormItem>
          <FormItem label="总体积">
            <div className="flex items-center gap-1">
              <input type="number" name="cbm" step="0.001" min={0} defaultValue={cbm} className="form-input flex-1" />
              <span className="text-xs text-slate-400">CBM</span>
            </div>
          </FormItem>
          <FormItem label="渠道关键字" className="md:col-span-2">
            <input type="text" name="channelName" defaultValue={channelName} placeholder="渠道名/代码模糊匹配（可留空）" className="form-input" />
          </FormItem>
        </div>

        {/* 承运方式行 */}
        <div className="px-5 pb-4 border-t border-dashed border-slate-100 pt-3">
          <div className="flex items-start gap-3">
            <label className="w-20 shrink-0 text-right text-xs text-slate-600 pt-1.5">承运方式</label>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1.5">
              {MODE_OPTIONS.map((m) => (
                <label key={m.code} className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                  <input type="checkbox" name="modeCodes" value={m.code} defaultChecked={modeCodes.includes(m.code)} className="accent-brand" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 按钮行 */}
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-t border-slate-100">
          <button type="submit" className="px-8 py-1.5 rounded bg-brand text-white text-sm font-medium hover:opacity-90">
            查 价
          </button>
          <Link href="/orders/new?channel=EXPRESS&v=2" className="px-5 py-1.5 rounded border border-slate-200 text-sm text-slate-600 hover:bg-white">
            清空条件
          </Link>
          <span className="ml-auto text-xs text-slate-400">
            价格基于真实接口数据，按查价重量等比换算，仅供参考
          </span>
        </div>
      </form>
    </div>
  );
}

/* ===== 局部工具组件 ===== */
function FormItem({
  label,
  children,
  required,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <label className="w-20 shrink-0 text-right text-xs text-slate-600 pt-2">
        {required && <span className="text-red-500 mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
