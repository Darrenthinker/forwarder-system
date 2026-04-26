"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createSettlement } from "../actions";

type FormState = { error?: string } | Record<string, never>;
const initial: FormState = {};

export default function NewSettlementPage() {
  const [state, action] = useFormState(createSettlement, initial);
  const today = new Date().toISOString().slice(0, 7); // YYYY-MM
  const errMsg = "error" in state ? state.error : undefined;

  return (
    <form action={action} className="space-y-4 max-w-2xl">
      {errMsg && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
          {errMsg}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">结算单信息</h3>

        <div>
          <label className="label">结算单标题 <span className="text-red-500">*</span></label>
          <input
            name="title" className="input" required
            placeholder={`如：${today} 客户应收对账单`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">账期 <span className="text-red-500">*</span></label>
            <input name="period" className="input" defaultValue={today} placeholder="如：2026-04" required />
          </div>
          <div>
            <label className="label">币种</label>
            <select name="currency" className="input">
              <option value="CNY">CNY 人民币</option>
              <option value="USD">USD 美元</option>
              <option value="HKD">HKD 港币</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea name="notes" className="input min-h-16 py-2" placeholder="可选" />
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm text-slate-500">
          💡 保存后可在结算单详情中，从订单费用里选择要归入本期的费用明细。
        </p>
      </div>

      <div className="flex items-center gap-2 pb-6">
        <Submit />
        <Link href="/finance/settlements" className="btn-secondary">取消</Link>
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "创建中..." : "创建结算单"}
    </button>
  );
}
