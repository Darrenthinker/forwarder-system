"use client";

import { useTransition } from "react";
import { deleteCustomer } from "./actions";

export function DeleteCustomerButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
      disabled={pending || disabled}
      title={disabled ? "该客户有订单，不能删除" : "删除"}
      onClick={() => {
        if (!confirm("确定删除该客户？")) return;
        start(async () => {
          try {
            await deleteCustomer(id);
          } catch (e) {
            alert((e as Error).message);
          }
        });
      }}
    >
      {pending ? "删除中..." : "删除"}
    </button>
  );
}
