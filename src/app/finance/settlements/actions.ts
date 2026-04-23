"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmSettlement(id: string) {
  await prisma.settlement.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/finance/settlements");
}

export async function markPaid(id: string) {
  await prisma.settlement.update({
    where: { id },
    data: { status: "PAID" },
  });
  revalidatePath("/finance/settlements");
}

export async function createSettlement(_prev: object, formData: FormData) {
  const title = (formData.get("title") as string ?? "").trim();
  const period = (formData.get("period") as string ?? "").trim();
  const currency = (formData.get("currency") as string) || "CNY";
  const notes = (formData.get("notes") as string ?? "").trim() || null;

  if (!title) return { error: "请填写结算单标题" };
  if (!period) return { error: "请填写账期" };

  // 从选择的订单费用中汇总
  const selectedFeeIds = formData.getAll("feeIds") as string[];

  let totalAmount = 0;
  const items: { orderId: string; orderFeeId: string; description: string; amount: number; currency: string }[] = [];

  if (selectedFeeIds.length > 0) {
    const fees = await prisma.orderFee.findMany({
      where: { id: { in: selectedFeeIds }, settlementStatus: "PENDING" },
      include: { order: true },
    });

    for (const fee of fees) {
      totalAmount += Number(fee.amount);
      items.push({
        orderId: fee.orderId,
        orderFeeId: fee.id,
        description: `${fee.order.orderNo} - ${fee.feeType}`,
        amount: Number(fee.amount),
        currency: fee.currency,
      });
    }

    // 标记费用为已结算
    await prisma.orderFee.updateMany({
      where: { id: { in: selectedFeeIds } },
      data: {
        settlementStatus: "SETTLED",
        settledAt: new Date(),
      },
    });
  }

  await prisma.settlement.create({
    data: {
      title,
      period,
      currency,
      notes,
      totalAmount,
      status: "DRAFT",
      items: { create: items },
    },
  });

  revalidatePath("/finance/settlements");
  redirect("/finance/settlements");
}
