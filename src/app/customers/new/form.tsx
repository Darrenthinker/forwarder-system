"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";
import { createCustomer, type FormState } from "../actions";

const initial: FormState = {};

export function CustomerForm() {
  const [state, action] = useFormState(createCustomer, initial);
  const [customerType, setCustomerType] = useState<"COMPANY" | "INDIVIDUAL">("COMPANY");
  const [sourceType, setSourceType] = useState<"DIRECT" | "PEER">("DIRECT");

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* 客户类型 & 来源 */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">基础分类</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="label">客户类型 <span className="text-red-500">*</span></label>
            <div className="flex gap-6 pt-1.5">
              {[{ v: "COMPANY", l: "公司" }, { v: "INDIVIDUAL", l: "个人" }].map(({ v, l }) => (
                <label key={v} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio" name="customerType" value={v}
                    checked={customerType === v}
                    onChange={() => setCustomerType(v as "COMPANY" | "INDIVIDUAL")}
                    className="accent-brand"
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">客户来源 <span className="text-red-500">*</span></label>
            <div className="flex gap-6 pt-1.5">
              {[{ v: "DIRECT", l: "直客" }, { v: "PEER", l: "同行" }].map(({ v, l }) => (
                <label key={v} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio" name="sourceType" value={v}
                    checked={sourceType === v}
                    onChange={() => setSourceType(v as "DIRECT" | "PEER")}
                    className="accent-brand"
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">基本信息</h3>

        <Field label="客户名称" required>
          <input
            name="name" className="input" required
            placeholder={customerType === "COMPANY" ? "如：深圳市某某贸易有限公司" : "如：张三"}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="联系人">
            <input name="contact" className="input" placeholder="联系人姓名" />
          </Field>
          <Field label="联系电话">
            <input name="phone" className="input" placeholder="13800000000" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="邮箱">
            <input name="email" type="email" className="input" placeholder="abc@example.com" />
          </Field>
          <Field label="信用额度（元）">
            <input name="creditLimit" type="number" step="0.01" min="0" className="input" placeholder="0.00" />
          </Field>
        </div>

        {/* 公司专属：税号 */}
        {customerType === "COMPANY" && (
          <Field label="统一社会信用代码">
            <input name="taxCode" className="input" placeholder="18位统一社会信用代码" maxLength={18} />
          </Field>
        )}

        {/* 个人专属：身份证 */}
        {customerType === "INDIVIDUAL" && (
          <Field label="身份证号">
            <input name="idNumber" className="input" placeholder="18位身份证号" maxLength={18} />
          </Field>
        )}

        {/* 直客：加价率 */}
        {sourceType === "DIRECT" && (
          <Field label="加价率" required>
            <div className="flex items-center gap-2">
              <input
                name="priceRate" type="number" step="0.01" min="1" max="5"
                className="input w-32" defaultValue="1.00"
              />
              <span className="text-xs text-slate-500">× 成本价 = 报价（如 1.15 表示加价15%）</span>
            </div>
          </Field>
        )}
        {sourceType === "PEER" && (
          <input type="hidden" name="priceRate" value="1.00" />
        )}

        <Field label="备注">
          <textarea name="remark" className="input min-h-20 py-2" placeholder="可选" />
        </Field>
      </div>

      {/* 默认收货地址（可选） */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">
          收货地址（可选，后续可补充）
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="省份">
            <input name="addr_province" className="input" placeholder="广东省" />
          </Field>
          <Field label="城市">
            <input name="addr_city" className="input" placeholder="深圳市" />
          </Field>
          <Field label="地址联系人">
            <input name="addr_contact" className="input" placeholder="收货人姓名" />
          </Field>
        </div>
        <Field label="详细地址">
          <input name="addr_address" className="input" placeholder="街道/楼栋/门牌号" />
        </Field>
        <Field label="收货电话">
          <input name="addr_phone" className="input" placeholder="13800000000" />
        </Field>
      </div>

      <div className="flex items-center gap-2 pb-6">
        <Submit />
        <Link href="/customers" className="btn-secondary">取消</Link>
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
      {pending ? "保存中..." : "保存客户"}
    </button>
  );
}
