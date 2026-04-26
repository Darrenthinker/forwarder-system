"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addTrackingEvent } from "./tracking-actions";

type FormState = { error?: string } | Record<string, never>;
const initial: FormState = {};

const STATUSES = [
  { v: "RECEIVED",   l: "已收货" },
  { v: "IN_TRANSIT", l: "运输中" },
  { v: "CUSTOMS",    l: "清关中" },
  { v: "ARRIVED",    l: "已到港" },
  { v: "DELIVERED",  l: "已签收" },
  { v: "EXCEPTION",  l: "异常"   },
];

export function AddTrackingForm({ orderId }: { orderId: string }) {
  const [state, action] = useFormState(addTrackingEvent, initial);
  const errMsg = "error" in state ? state.error : undefined;

  return (
    <form action={action} className="border-t border-slate-100 pt-4 space-y-3">
      <h3 className="text-sm font-medium text-slate-600">录入轨迹</h3>
      <input type="hidden" name="orderId" value={orderId} />

      {errMsg && (
        <p className="text-xs text-red-500">{errMsg}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">轨迹时间</label>
          <input
            type="datetime-local"
            name="eventTime"
            defaultValue={new Date().toISOString().slice(0, 16)}
            className="form-input"
          />
        </div>
        <div>
          <label className="label text-xs">节点状态</label>
          <select name="status" className="form-select">
            {STATUSES.map(({ v, l }) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label text-xs">位置（可选）</label>
        <input name="location" className="form-input" placeholder="如：香港机场 / 上海海关" />
      </div>

      <div>
        <label className="label text-xs">轨迹描述 *</label>
        <input name="description" className="form-input" required placeholder="如：货物已从美国洛杉矶发出，预计3天到港" />
      </div>

      <div>
        <label className="label text-xs">录入人</label>
        <input name="operator" className="form-input" placeholder="如：小王" />
      </div>

      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary btn-sm" disabled={pending}>
      {pending ? "提交中..." : "+ 添加轨迹"}
    </button>
  );
}
