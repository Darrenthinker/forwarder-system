"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createImportOrder, type ImportFormState } from "./actions";

const initial: ImportFormState = {};

const TRANSPORT_MODES = [
  { v: "AIR", l: "空运" },
  { v: "SEA", l: "海运" },
  { v: "EXPRESS", l: "快递" },
  { v: "LAND", l: "陆运" },
];

const CUSTOMS_TYPES = [
  { v: "GENERAL", l: "一般贸易" },
  { v: "MAIL", l: "邮件方式" },
  { v: "BONDED", l: "保税" },
];

type Customer = { id: string; name: string; sourceType: string };

export function ImportOrderForm({ customers }: { customers: Customer[] }) {
  const [state, action] = useFormState(createImportOrder, initial);

  return (
    <form action={action} className="space-y-4 max-w-3xl">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">客户信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="客户" required>
            <select name="customerId" required className="input">
              <option value="">— 请选择客户 —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{c.sourceType === "PEER" ? "同行" : "直客"}）
                </option>
              ))}
            </select>
          </Field>
          <Field label="客户类型" required>
            <div className="flex gap-6 pt-1.5">
              {[{ v: "DIRECT", l: "直客" }, { v: "PEER", l: "同行" }].map(({ v, l }) => (
                <label key={v} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="sourceType" value={v} defaultChecked={v === "DIRECT"} className="accent-brand" />
                  {l}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">货物信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="货物名称">
            <input name="goodsName" className="input" placeholder="如：电子产品、服装等" />
          </Field>
          <Field label="运单/提单号">
            <input name="trackingNo" className="input" placeholder="主单号或快递单号" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="件数">
            <input name="pieces" type="number" min="1" defaultValue="1" className="input" />
          </Field>
          <Field label="重量（KG）">
            <input name="weight" type="number" step="0.01" min="0" defaultValue="0" className="input" />
          </Field>
          <Field label="体积（CBM）">
            <input name="volume" type="number" step="0.0001" min="0" defaultValue="0" className="input" />
          </Field>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">物流信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="起运地（境外）" required>
            <input name="origin" className="input" placeholder="如：美国洛杉矶 / 德国法兰克福" required />
          </Field>
          <Field label="目的地（境内）" required>
            <input name="destination" className="input" placeholder="如：深圳市福田区" required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="运输方式" required>
            <div className="flex flex-wrap gap-4 pt-1.5">
              {TRANSPORT_MODES.map(({ v, l }) => (
                <label key={v} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="transportMode" value={v} defaultChecked={v === "AIR"} className="accent-brand" />
                  {l}
                </label>
              ))}
            </div>
          </Field>
          <Field label="报关方式" required>
            <div className="flex flex-wrap gap-4 pt-1.5">
              {CUSTOMS_TYPES.map(({ v, l }) => (
                <label key={v} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="customsType" value={v} defaultChecked={v === "GENERAL"} className="accent-brand" />
                  {l}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div className="card p-5">
        <Field label="备注">
          <textarea name="remark" className="input min-h-20 py-2" placeholder="可选（特殊要求、货值申报等）" />
        </Field>
      </div>

      <div className="flex items-center gap-2 pb-6">
        <Submit />
        <Link href="/import/orders" className="btn-secondary">取消</Link>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "提交中..." : "登记进口单"}
    </button>
  );
}
