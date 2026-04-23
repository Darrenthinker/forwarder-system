"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ImportOrderSchema = z.object({
  customerId: z.string().min(1, "请选择客户"),
  sourceType: z.enum(["DIRECT", "PEER"]).default("DIRECT"),
  channel: z.string().default("IMPORT"),
  origin: z.string().min(1, "请填写起运地"),
  destination: z.string().min(1, "请填写目的地"),
  weight: z.coerce.number().min(0).default(0),
  volume: z.coerce.number().min(0).default(0),
  pieces: z.coerce.number().int().min(1).default(1),
  trackingNo: z.string().optional().nullable(),
  goodsName: z.string().optional().nullable(),
  customsType: z.string().default("GENERAL"),   // GENERAL(一般贸易) / MAIL / BONDED
  transportMode: z.string().default("AIR"),      // AIR / SEA / EXPRESS / LAND
  remark: z.string().optional().nullable(),
});

export type ImportFormState = { error?: string };

export async function createImportOrder(
  _prev: ImportFormState,
  formData: FormData
): Promise<ImportFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ImportOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "校验失败" };
  }
  const d = parsed.data;

  // 生成进口单号 IMP-YYYYMMDD-XXXX
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const last = await prisma.order.findFirst({
    where: { orderNo: { startsWith: `IMP-${date}` } },
    orderBy: { orderNo: "desc" },
  });
  const seq = last
    ? String(Number(last.orderNo.slice(-4)) + 1).padStart(4, "0")
    : "0001";
  const orderNo = `IMP-${date}-${seq}`;

  await prisma.order.create({
    data: {
      orderNo,
      customerId: d.customerId,
      direction: "IMPORT",
      sourceType: d.sourceType,
      channel: d.transportMode,   // 用 channel 字段存运输方式
      origin: d.origin,
      destination: d.destination,
      weight: d.weight,
      volume: d.volume,
      pieces: d.pieces,
      trackingNo: d.trackingNo || null,
      status: "SUBMITTED",
      remark: [
        d.goodsName ? `货物：${d.goodsName}` : null,
        `报关方式：${
          d.customsType === "GENERAL" ? "一般贸易" :
          d.customsType === "MAIL" ? "邮件方式" : "保税"
        }`,
        d.remark || null,
      ].filter(Boolean).join(" | "),
    },
  });

  revalidatePath("/import/orders");
  redirect("/import/orders");
}
