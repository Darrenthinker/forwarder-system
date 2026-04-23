"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFee } from "../actions";

export function DeleteFeeButton({ feeId, orderId }: { feeId: string; orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
      disabled={pending}
      onClick={() => {
        if (!confirm("删除该笔费用？")) return;
        start(async () => {
          await deleteFee(feeId, orderId);
          router.refresh();
        });
      }}
    >
      删除
    </button>
  );
}
