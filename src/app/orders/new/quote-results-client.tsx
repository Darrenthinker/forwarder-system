"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MODE_OPTIONS,
  currencyLabel,
  type QuoteResultItem,
} from "@/lib/quote-channels";

type LabelOption = { id: number; name: string };

type QueryInfo = {
  startCityName: string;
  countryName: string;
  weight: number;
  quantity: number;
  cbm: number;
  goodName: string;
  total: number;
  backHref: string;
  customerId: string;
};

export function QuoteResultsClient({
  items,
  info,
}: {
  items: QuoteResultItem[];
  info: QueryInfo;
}) {
  const [activeMode, setActiveMode] = useState("ALL");
  const [activeLabel, setActiveLabel] = useState<number | "ALL">("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const labelOptions = useMemo<LabelOption[]>(() => {
    const map = new Map<number, string>();
    for (const c of items) {
      for (const l of c.ChannelLabel ?? []) {
        if (l.IsPublic && !map.has(l.LabelID)) map.set(l.LabelID, l.LabelName);
      }
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (activeMode !== "ALL") {
        const fam = c.ModeCode.toUpperCase();
        if (!fam.startsWith(activeMode)) return false;
      }
      if (activeLabel !== "ALL") {
        const pubLabels = (c.ChannelLabel ?? []).filter((l) => l.IsPublic);
        if (!pubLabels.some((l) => l.LabelID === activeLabel)) return false;
      }
      return true;
    });
  }, [items, activeMode, activeLabel]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      {/* ============ 查价概要行（非吸顶，可点修改） ============ */}
      <div className="flex items-center gap-3 mb-0 px-1">
        <span className="text-sm text-slate-700">
          <span className="font-medium">{info.startCityName}</span>
          <span className="text-slate-400 mx-1">到</span>
          <span className="font-medium">{info.countryName}</span>
          <span className="text-slate-400 mx-1.5">·</span>
          <span>{info.goodName}</span>
          <span className="text-slate-400 ml-1.5">
            {info.quantity}件 / {info.weight}KG
            {info.cbm > 0 ? ` / ${info.cbm}CBM` : ""}
          </span>
          <span className="ml-2 text-slate-400">共 {info.total} 条</span>
        </span>
        <Link
          href={info.backHref}
          className="ml-auto text-xs text-brand hover:underline"
        >
          修改查询 →
        </Link>
      </div>

      {/* ============ 吸顶筛选栏 ============ */}
      <div
        className="sticky z-10 bg-white border-b border-slate-200 -mx-6 mt-2"
        style={{ top: "calc(3.5rem + 2.5rem)" }}
      >
        {/* Row 1: 运输方式 + 渠道类型 */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
          <span className="text-xs text-slate-500 shrink-0 mr-1">运输方式：</span>
          <FilterChip
            active={activeMode === "ALL"}
            onClick={() => setActiveMode("ALL")}
            color="bg-brand text-white"
            inactiveColor="bg-slate-100 text-slate-600"
          >
            全部
          </FilterChip>
          {MODE_OPTIONS.map((m) => {
            const cnt = items.filter((c) =>
              c.ModeCode.toUpperCase().startsWith(m.code)
            ).length;
            if (cnt === 0) return null;
            return (
              <FilterChip
                key={m.code}
                active={activeMode === m.code}
                onClick={() => setActiveMode(m.code)}
                color={m.color.split(" ")[0] + " " + m.color.split(" ")[1]}
                inactiveColor="bg-slate-100 text-slate-600"
              >
                {m.label}
              </FilterChip>
            );
          })}
        </div>

        {/* Row 2: 渠道特色标签 */}
        {labelOptions.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-slate-100 flex-wrap">
            <span className="text-xs text-slate-500 shrink-0 mr-1">渠道特色：</span>
            <FilterChip
              active={activeLabel === "ALL"}
              onClick={() => setActiveLabel("ALL")}
              color="bg-brand text-white"
              inactiveColor="bg-slate-100 text-slate-600"
            >
              全部
            </FilterChip>
            {labelOptions.map((l) => (
              <FilterChip
                key={l.id}
                active={activeLabel === l.id}
                onClick={() => setActiveLabel(l.id)}
                color="bg-emerald-500 text-white"
                inactiveColor="bg-emerald-50 text-emerald-700"
              >
                {l.name}
              </FilterChip>
            ))}
          </div>
        )}

        {/* Row 3: 列表头 */}
        <div className="grid text-[11px] font-medium text-slate-500 bg-slate-50 px-4 py-1.5"
          style={{ gridTemplateColumns: "1fr 88px 64px 72px 100px 110px 80px" }}
        >
          <span>渠道名称</span>
          <span>运输方式</span>
          <span>时效(天)</span>
          <span>计费重</span>
          <span>总费用</span>
          <span>运费单价</span>
          <span className="text-right">操作</span>
        </div>
      </div>

      {/* ============ 结果列表 ============ */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-white -mx-6 border-b border-slate-100">
          当前筛选条件下无匹配渠道
        </div>
      ) : (
        <div className="bg-white -mx-6 divide-y divide-slate-100">
          {filtered.map((c) => (
            <ChannelRow
              key={c.ChannelKey}
              channel={c}
              customerId={info.customerId}
              weight={info.weight}
              quantity={info.quantity}
              cbm={info.cbm}
              expanded={expanded.has(c.ChannelKey)}
              onToggle={() => toggleExpand(c.ChannelKey)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== FilterChip =================== */
function FilterChip({
  active,
  onClick,
  color,
  inactiveColor,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  inactiveColor: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded text-[11px] border transition-colors cursor-pointer
        ${active ? `${color} border-transparent` : `${inactiveColor} border-slate-200 hover:border-slate-300`}
      `}
    >
      {children}
    </button>
  );
}

/* =================== ChannelRow =================== */
function ChannelRow({
  channel: c,
  customerId,
  weight,
  quantity,
  cbm,
  expanded,
  onToggle,
}: {
  channel: QuoteResultItem;
  customerId: string;
  weight: number;
  quantity: number;
  cbm: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const family = c.ModeCode.toUpperCase().split("-")[0];
  const modeMeta = MODE_OPTIONS.find((m) => m.code === family);
  const publicLabels = (c.ChannelLabel ?? []).filter((l) => l.IsPublic);

  const orderHref = `/orders/new?channel=EXPRESS&customerId=${encodeURIComponent(
    customerId
  )}&channelKey=${encodeURIComponent(c.ChannelKey)}&channelName=${encodeURIComponent(
    c.ChannelName
  )}&weight=${weight}&quantity=${quantity}&cbm=${cbm}&trafficAmount=${c.ScaledTraffic}&totalAmount=${c.ScaledAmount}`;

  const currLabel = currencyLabel(c.Currency);

  return (
    <div>
      {/* 主行 */}
      <div
        className="grid items-center px-4 py-2.5 hover:bg-slate-50/70 transition-colors"
        style={{ gridTemplateColumns: "1fr 88px 64px 72px 100px 110px 80px" }}
      >
        {/* 渠道名称 */}
        <div className="min-w-0 pr-3">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium text-slate-900 truncate max-w-[240px]" title={c.ChannelName}>
              {c.ChannelName}
            </span>
            {c.IsTax === false && (
              <span className="px-1 py-0 rounded text-[10px] bg-orange-50 text-orange-500 border border-orange-200">
                不含税
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">供应商：{c.SupplierName}</span>
            {publicLabels.map((l, i) => (
              <span
                key={`${l.LabelID}-${i}`}
                className="px-1 py-0 rounded text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200"
              >
                {l.LabelName}
              </span>
            ))}
          </div>
        </div>

        {/* 运输方式 */}
        <div>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] border ${
              modeMeta?.color ?? "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            {c.ModeCode}
          </span>
        </div>

        {/* 时效 */}
        <div className="text-sm text-orange-600 font-medium">
          {c.WorkDays}
        </div>

        {/* 计费重 */}
        <div className="text-sm text-slate-700">
          {c.ChargeWeight} KG
        </div>

        {/* 总费用 */}
        <div>
          <div className="text-sm font-semibold text-orange-600 tabular-nums">
            {c.ScaledAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">{currLabel}</div>
        </div>

        {/* 运费单价 */}
        <div>
          <div className="text-sm font-medium text-orange-600 tabular-nums">
            {c.ScaledPrice.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">{currLabel}/KG</div>
        </div>

        {/* 操作 */}
        <div className="flex flex-col items-end gap-1">
          <Link
            href={orderHref}
            className="px-2.5 py-1 rounded bg-brand text-white text-[11px] hover:opacity-90 whitespace-nowrap"
          >
            立即下单
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="text-[11px] text-slate-400 hover:text-brand"
          >
            {expanded ? "收起 ▲" : "详情 ▼"}
          </button>
        </div>
      </div>

      {/* 展开详情行 */}
      {expanded && (
        <div className="bg-slate-50/80 border-t border-slate-100 px-4 pt-2 pb-3">
          <div className="grid grid-cols-5 gap-x-6 gap-y-1 text-[11.5px]">
            <DetailCol label="可接货物" value={c.CargoTypeInfo} />
            <DetailCol label="排仓说明" value={c.WareFlightDesc || "-"} />
            <DetailCol label="航班说明" value={c.FlightDesc || "-"} />
            <DetailCol
              label="附加费"
              value={
                (c.FeeInfo ?? []).length === 0
                  ? "无"
                  : c.FeeInfo
                      .map(
                        (f) =>
                          `${f.FeeName} ¥${f.Price.toFixed(2)}${
                            f.FeeUnit === 2 ? "/KG" : "/票"
                          }`
                      )
                      .join("，")
              }
            />
            <DetailCol
              label="体积除数"
              value={c.VolumnBase ? `除 ${c.VolumnBase}` : "-"}
            />
          </div>

          {(c.ChannelDescription || c.RiskWarning || c.BatteryNotice) && (
            <div className="mt-2 space-y-1 text-[11px]">
              {c.ChannelDescription && (
                <p className="text-slate-500">
                  <span className="text-slate-400 mr-1">渠道说明：</span>
                  {c.ChannelDescription}
                </p>
              )}
              {c.RiskWarning && (
                <p className="text-amber-600">
                  <span className="font-medium mr-1">⚠ 风险：</span>
                  {c.RiskWarning}
                </p>
              )}
              {c.BatteryNotice && (
                <p className="text-slate-500">
                  <span className="text-slate-400 mr-1">带电要求：</span>
                  {c.BatteryNotice}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-slate-400 mb-0.5">{label}</div>
      <div className="text-slate-700 leading-relaxed" title={value}>
        {value}
      </div>
    </div>
  );
}
