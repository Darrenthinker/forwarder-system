"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveChannel } from "./actions";

type Label = { id: number; labelName: string };
type Fee = { feeName: string; feeUnit: number; price: number; isAddFreight: boolean };

type ChannelData = {
  id?: string;
  channelName?: string;
  channelCode?: string;
  supplierName?: string;
  modeCode?: string;
  channelTypeCode?: number;
  currency?: number;
  startCityName?: string;
  countryCode?: string;
  countryName?: string;
  workDays?: number;
  cargoTypeInfo?: string;
  volumnBase?: number;
  isTax?: boolean;
  serviceType?: string;
  pricePerKg?: number;
  minWeight?: number;
  channelDescription?: string;
  riskWarning?: string;
  batteryNotice?: string;
  wareFlightDesc?: string;
  flightDesc?: string;
  wareShortCode?: string;
  isActive?: boolean;
  labelIds?: number[];
  fees?: Fee[];
};

const MODE_OPTIONS = [
  "DHL-CN","DHL-HK","UPS-CN","UPS-HK","FEDEX-CN","FEDEX-HK",
  "ARAMEX","EMS","DPD","SF-CN","3PE",
];

export function ChannelForm({
  labels,
  defaultValues = {},
}: {
  labels: Label[];
  defaultValues?: ChannelData;
}) {
  const [fees, setFees] = useState<Fee[]>(
    defaultValues.fees ?? [{ feeName: "", feeUnit: 1, price: 0, isAddFreight: true }]
  );

  const addFee = () =>
    setFees((prev) => [...prev, { feeName: "", feeUnit: 1, price: 0, isAddFreight: true }]);
  const removeFee = (i: number) =>
    setFees((prev) => prev.filter((_, idx) => idx !== i));

  const selectedLabels = new Set(defaultValues.labelIds ?? []);

  return (
    <form action={saveChannel} className="space-y-4 max-w-3xl">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="feeCount" value={fees.length} />

      <div className="card p-5 space-y-4">
        <SectionTitle>基本信息</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <Field label="渠道名称" required>
            <input name="channelName" defaultValue={defaultValues.channelName} required className="input" placeholder="如：H-59 HKDHL代理价(美洲）" />
          </Field>
          <Field label="渠道代码">
            <input name="channelCode" defaultValue={defaultValues.channelCode ?? ""} className="input" placeholder="如：BSA00002-H-59 HKDHL-US" />
          </Field>
          <Field label="供应商名称">
            <input name="supplierName" defaultValue={defaultValues.supplierName ?? ""} className="input" placeholder="如：中技物流" />
          </Field>
          <Field label="运输方式" required>
            <select name="modeCode" defaultValue={defaultValues.modeCode ?? "DHL-HK"} required className="input">
              {MODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="服务类型">
            <input name="serviceType" defaultValue={defaultValues.serviceType ?? ""} className="input" placeholder="如：红单速快 / UPS特快 / FICP" />
          </Field>
          <Field label="仓库代码">
            <input name="wareShortCode" defaultValue={defaultValues.wareShortCode ?? ""} className="input" placeholder="如：SZX1" />
          </Field>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <SectionTitle>线路信息</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <Field label="起运城市">
            <input name="startCityName" defaultValue={defaultValues.startCityName ?? "深圳市"} className="input" />
          </Field>
          <Field label="目的国代码">
            <input name="countryCode" defaultValue={defaultValues.countryCode ?? ""} className="input" placeholder="US / GB / DE…" />
          </Field>
          <Field label="目的国名称">
            <input name="countryName" defaultValue={defaultValues.countryName ?? ""} className="input" placeholder="美国 / 英国…" />
          </Field>
          <Field label="时效（工作日）" required>
            <input name="workDays" type="number" min={1} defaultValue={defaultValues.workDays ?? 7} required className="input" />
          </Field>
          <Field label="材积除数">
            <input name="volumnBase" type="number" defaultValue={defaultValues.volumnBase ?? 5000} className="input" />
          </Field>
          <Field label="货币">
            <select name="currency" defaultValue={defaultValues.currency ?? 1} className="input">
              <option value={1}>CNY 人民币</option>
              <option value={3}>HKD 港币</option>
            </select>
          </Field>
          <Field label="渠道大类">
            <select name="channelTypeCode" defaultValue={defaultValues.channelTypeCode ?? 1} className="input">
              <option value={1}>直发（出口）</option>
              <option value={6}>小货渠道</option>
            </select>
          </Field>
          <Field label="参考价(元/KG)" required>
            <input name="pricePerKg" type="number" step="0.01" defaultValue={Number(defaultValues.pricePerKg ?? 0)} required className="input" />
          </Field>
          <Field label="最低计费重(KG)">
            <input name="minWeight" type="number" step="0.1" defaultValue={Number(defaultValues.minWeight ?? 0.5)} className="input" />
          </Field>
        </div>
        <div className="flex items-center gap-6 pt-1">
          <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" name="isTax" value="1" defaultChecked={defaultValues.isTax} />
            含税
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" name="isActive" value="1" defaultChecked={defaultValues.isActive !== false} />
            启用
          </label>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <SectionTitle>可接货物与说明</SectionTitle>
        <Field label="可接货物（逗号分隔）">
          <input name="cargoTypeInfo" defaultValue={defaultValues.cargoTypeInfo ?? ""} className="input" placeholder="普货,内置电池,配套电池,纺织品,木箱" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="排仓说明">
            <input name="wareFlightDesc" defaultValue={defaultValues.wareFlightDesc ?? ""} className="input" placeholder="如：当天或次日提取上网" />
          </Field>
          <Field label="航班说明">
            <input name="flightDesc" defaultValue={defaultValues.flightDesc ?? ""} className="input" placeholder="如：美洲排航班1-2天左右" />
          </Field>
        </div>
        <Field label="渠道说明">
          <textarea name="channelDescription" defaultValue={defaultValues.channelDescription ?? ""} rows={2} className="input py-1.5 resize-none" />
        </Field>
        <Field label="风险提示">
          <textarea name="riskWarning" defaultValue={defaultValues.riskWarning ?? ""} rows={2} className="input py-1.5 resize-none" />
        </Field>
        <Field label="带电要求">
          <textarea name="batteryNotice" defaultValue={defaultValues.batteryNotice ?? ""} rows={2} className="input py-1.5 resize-none" />
        </Field>
      </div>

      {/* 附加费 */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle>附加费</SectionTitle>
          <button type="button" onClick={addFee} className="text-xs text-brand hover:underline">+ 添加费用</button>
        </div>
        {fees.length === 0 && (
          <p className="text-xs text-slate-400">无附加费</p>
        )}
        {fees.map((fee, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 rounded p-2">
            <input type="hidden" name={`fee_name_${i}`} value={fee.feeName} onChange={() => {}} />
            <input type="hidden" name={`fee_unit_${i}`} value={fee.feeUnit} />
            <input type="hidden" name={`fee_price_${i}`} value={fee.price} />
            <input type="hidden" name={`fee_add_${i}`} value={fee.isAddFreight ? "1" : "0"} />

            <input
              className="input flex-1"
              placeholder="费用名称（排仓费/预录费…）"
              defaultValue={fee.feeName}
              onChange={(e) =>
                setFees((prev) => prev.map((f, idx) => idx === i ? { ...f, feeName: e.target.value } : f))
              }
            />
            <select
              className="input w-28"
              defaultValue={fee.feeUnit}
              onChange={(e) =>
                setFees((prev) => prev.map((f, idx) => idx === i ? { ...f, feeUnit: Number(e.target.value) } : f))
              }
            >
              <option value={1}>元/票</option>
              <option value={2}>元/KG</option>
            </select>
            <input
              type="number"
              step="0.01"
              className="input w-24"
              placeholder="金额"
              defaultValue={fee.price}
              onChange={(e) =>
                setFees((prev) => prev.map((f, idx) => idx === i ? { ...f, price: Number(e.target.value) } : f))
              }
            />
            <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
              <input
                type="checkbox"
                defaultChecked={fee.isAddFreight}
                onChange={(e) =>
                  setFees((prev) => prev.map((f, idx) => idx === i ? { ...f, isAddFreight: e.target.checked } : f))
                }
              />
              计入运费
            </label>
            <button
              type="button"
              onClick={() => removeFee(i)}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {/* 特色标签 */}
      <div className="card p-5 space-y-3">
        <SectionTitle>特色标签</SectionTitle>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {labels.map((l) => (
            <label key={l.id} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="labelIds"
                value={l.id}
                defaultChecked={selectedLabels.has(l.id)}
              />
              {l.labelName}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pb-6">
        <button type="submit" className="btn-primary">保存渠道</button>
        <Link href="/settings/channels" className="btn-secondary">取消</Link>
      </div>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">{children}</h3>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {required && <span className="text-red-500 mr-0.5">*</span>}{label}
      </label>
      {children}
    </div>
  );
}
