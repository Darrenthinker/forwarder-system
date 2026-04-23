"use client";
import { confirmSettlement } from "./actions";

export function ConfirmSettlementButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      className="text-xs text-emerald-600 hover:underline"
      onClick={async () => {
        if (confirm("确认该结算单？")) await confirmSettlement(id);
      }}
    >
      确认
    </button>
  );
}
