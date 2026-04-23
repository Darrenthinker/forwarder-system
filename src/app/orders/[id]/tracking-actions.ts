"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTrackingEvent(_prev: object, formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const description = (formData.get("description") as string ?? "").trim();
  if (!description) return { error: "轨迹描述必填" };

  const eventTimeRaw = formData.get("eventTime") as string;
  const eventTime = eventTimeRaw ? new Date(eventTimeRaw) : new Date();
  const status = (formData.get("status") as string) || "IN_TRANSIT";
  const location = (formData.get("location") as string ?? "").trim() || null;
  const operator = (formData.get("operator") as string ?? "").trim() || null;

  await prisma.trackingEvent.create({
    data: { orderId, eventTime, status, location, description, operator },
  });

  // 同步更新订单状态
  const statusMap: Record<string, string> = {
    RECEIVED: "SUBMITTED",
    IN_TRANSIT: "IN_TRANSIT",
    CUSTOMS: "CUSTOMS",
    ARRIVED: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    EXCEPTION: "IN_TRANSIT",
  };
  const newStatus = statusMap[status];
  if (newStatus) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  revalidatePath(`/orders/${orderId}`);
  return {};
}
