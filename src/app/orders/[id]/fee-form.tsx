"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFee } from "../actions";
import { FEE_TYPE_OPTIONS } from "@/lib/utils";

export function AddFeeForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      className="border-t border-slate-100 pt-4 grid grid-cols-12 gap-2 items-end"
      action={(fd) => {
        setError(null);
        start(async () => {
          const res = await addFee(orderId, fd);
          if (res.error) {
            setError(res.error);
            return;
          }
          formRef.current?.reset();
          router.refresh();
        });
      }}
    >
      <div className="col-span-2">
        <label className="label">费用类型</label>
        <select name="feeType" className="input" defaultValue="FREIGHT">
          {FEE_TYPE_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="label">金额</label>
        <input name="amount" type="number" step="0.01" className="input" placeholder="0.00" required />
      </div>
      <div className="col-span-1">
        <label className="label">币种</label>
        <select name="currency" className="input" defaultValue="CNY">
          <option value="CNY">CNY</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="HKD">HKD</option>
        </select>
      </div>
      <div className="col-span-5">
        <label className="label">备注</label>
        <input name="remark" className="input" placeholder="可选" />
      </div>
      <div className="col-span-2">
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "添加中..." : "+ 添加费用"}
        </button>
      </div>
      {error && (
        <div className="col-span-12 text-sm text-red-600">{error}</div>
      )}
    </form>
  );
}
