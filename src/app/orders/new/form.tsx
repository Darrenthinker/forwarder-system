"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { createOrder, type OrderFormState } from "../actions";
import { CHANNEL_OPTIONS, STATUS_OPTIONS } from "@/lib/utils";

const initial: OrderFormState = {};

export type OrderFormPrefilled = {
  channelKey: string;
  channelName: string;
  weight: number;
  quantity: number;
  cbm: number;
  customerId: string;
  trafficAmount: number;
  totalAmount: number;
};

export function OrderForm({
  customers,
  defaultChannel = "EXPRESS",
  prefilled,
}: {
  customers: { id: string; name: string }[];
  defaultChannel?: string;
  prefilled?: OrderFormPrefilled;
}) {
  const [state, action] = useFormState(createOrder, initial);

  return (
    <form action={action} className="card p-6 space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {prefilled && (
        <input type="hidden" name="remark" value={`渠道：${prefilled.channelName} / 报价：¥${prefilled.totalAmount.toFixed(2)}`} />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="客户" required>
          <select
            name="customerId"
            className="input"
            required
            defaultValue={prefilled?.customerId ?? ""}
          >
            <option value="" disabled>请选择客户</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="业务渠道" required>
          <select name="channel" className="input" required defaultValue={defaultChannel}>
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="起运地">
          <input name="origin" className="input" defaultValue="SZX 深圳" />
        </Field>
        <Field label="目的地" required>
          <input
            name="destination"
            className="input"
            placeholder="如：US 洛杉矶 / DE 柏林"
            required
            defaultValue={prefilled ? "US 美国" : ""}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="重量 (KG)">
          <input
            name="weight"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={prefilled?.weight ?? 0}
          />
        </Field>
        <Field label="体积 (CBM)">
          <input
            name="volume"
            type="number"
            step="0.0001"
            min="0"
            className="input"
            defaultValue={prefilled?.cbm ?? 0}
          />
        </Field>
        <Field label="件数">
          <input
            name="pieces"
            type="number"
            step="1"
            min="1"
            className="input"
            defaultValue={prefilled?.quantity ?? 1}
          />
        </Field>
      </div>

      <Field label="状态">
        <select name="status" className="input" defaultValue="DRAFT">
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </Field>

      {!prefilled && (
        <Field label="备注">
          <textarea name="remark" className="input min-h-20 py-2" placeholder="可选" />
        </Field>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Submit />
        <Link href="/orders" className="btn-secondary">取消</Link>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "保存中..." : "保存订单"}
    </button>
  );
}
