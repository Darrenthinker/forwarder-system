"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder, updateOrderStatus } from "../actions";
import { STATUS_OPTIONS } from "@/lib/utils";

export function OrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        className="input w-32"
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          start(async () => {
            await updateOrderStatus(id, next);
            router.refresh();
          });
        }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        className="btn-secondary text-red-600 hover:bg-red-50"
        disabled={pending}
        onClick={() => {
          if (!confirm("确定删除该订单？相关费用将一起删除")) return;
          start(async () => {
            await deleteOrder(id);
          });
        }}
      >
        删除订单
      </button>
    </div>
  );
}
