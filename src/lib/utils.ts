import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: unknown, currency = "CNY"): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "string" ? Number(value) : Number(value);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function generateOrderNo(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");
  const rnd = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `BY${ymd}${rnd}`;
}

export const CHANNEL_OPTIONS = [
  { value: "EXPRESS", label: "国际快递" },
  { value: "LINE", label: "国际专线" },
  { value: "AIR", label: "国际空运" },
  { value: "SEA", label: "海运散货" },
  { value: "FBA", label: "FBA 头程" },
] as const;

export const STATUS_OPTIONS = [
  { value: "DRAFT",      label: "草稿",   color: "bg-slate-100 text-slate-700" },
  { value: "SUBMITTED",  label: "已下单", color: "bg-blue-100 text-blue-700" },
  { value: "IN_TRANSIT", label: "运输中", color: "bg-amber-100 text-amber-700" },
  { value: "CUSTOMS",    label: "清关中", color: "bg-purple-100 text-purple-700" },
  { value: "DELIVERED",  label: "已送达", color: "bg-green-100 text-green-700" },
  { value: "CANCELED",   label: "已取消", color: "bg-red-100 text-red-700" },
] as const;

export const FEE_TYPE_OPTIONS = [
  { value: "FREIGHT", label: "运费" },
  { value: "FUEL", label: "燃油费" },
  { value: "SURCHARGE", label: "附加费" },
  { value: "CUSTOMS", label: "清关费" },
  { value: "OTHER", label: "其他" },
] as const;

export function channelLabel(v: string): string {
  return CHANNEL_OPTIONS.find((x) => x.value === v)?.label ?? v;
}
export function statusLabel(v: string) {
  return STATUS_OPTIONS.find((x) => x.value === v) ?? { label: v, color: "bg-slate-100 text-slate-700" };
}
export function feeTypeLabel(v: string): string {
  return FEE_TYPE_OPTIONS.find((x) => x.value === v)?.label ?? v;
}
