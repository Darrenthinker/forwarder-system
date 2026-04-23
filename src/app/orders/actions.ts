"use server";

import { prisma } from "@/lib/db";
import { generateOrderNo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const OrderSchema = z.object({
  customerId: z.string().min(1, "请选择客户"),
  channel: z.enum(["EXPRESS", "LINE", "AIR", "SEA", "FBA"]),
  origin: z.string().default("SZX 深圳"),
  destination: z.string().min(1, "目的地必填"),
  weight: z.coerce.number().min(0).default(0),
  volume: z.coerce.number().min(0).optional().default(0),
  pieces: z.coerce.number().int().min(1).optional().default(1),
  status: z.string().default("DRAFT"),
  remark: z.string().optional().nullable(),
});

export type OrderFormState = { error?: string };

export async function createOrder(_prev: OrderFormState, fd: FormData): Promise<OrderFormState> {
  const raw = Object.fromEntries(fd.entries());
  const parsed = OrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "校验失败" };
  }
  const data = parsed.data;
  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      customerId: data.customerId,
      channel: data.channel,
      origin: data.origin,
      destination: data.destination,
      weight: data.weight,
      volume: data.volume,
      pieces: data.pieces,
      status: data.status,
      remark: data.remark || null,
    },
  });
  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

export async function updateOrderStatus(id: string, status: string) {
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } });
  revalidatePath("/orders");
  redirect("/orders");
}

const FeeSchema = z.object({
  feeType: z.enum(["FREIGHT", "FUEL", "SURCHARGE", "CUSTOMS", "OTHER"]),
  amount: z.coerce.number(),
  currency: z.string().default("CNY"),
  remark: z.string().optional().nullable(),
});

export async function addFee(orderId: string, fd: FormData): Promise<{ error?: string }> {
  const parsed = FeeSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "校验失败" };
  await prisma.orderFee.create({
    data: {
      orderId,
      feeType: parsed.data.feeType,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      remark: parsed.data.remark || null,
    },
  });
  revalidatePath(`/orders/${orderId}`);
  return {};
}

export async function deleteFee(feeId: string, orderId: string) {
  await prisma.orderFee.delete({ where: { id: feeId } });
  revalidatePath(`/orders/${orderId}`);
}
