"use client";
import { deleteChannel } from "./actions";

export function DeleteChannelButton({ id, name }: { id: string; name: string }) {
  return (
    <button
      type="button"
      className="text-xs text-red-500 hover:underline"
      onClick={async () => {
        if (confirm(`确认删除渠道「${name}」？`)) {
          await deleteChannel(id);
        }
      }}
    >
      删除
    </button>
  );
}
