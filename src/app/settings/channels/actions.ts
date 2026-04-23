"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function deleteChannel(id: string) {
  await prisma.channel.delete({ where: { id } });
  revalidatePath("/settings/channels");
}

export async function saveChannel(formData: FormData) {
  const id = formData.get("id") as string | null;

  const labelIds = formData
    .getAll("labelIds")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n) && n > 0);

  const fees: { feeName: string; feeUnit: number; price: number; isAddFreight: boolean }[] = [];
  const feeCount = Number(formData.get("feeCount") ?? "0");
  for (let i = 0; i < feeCount; i++) {
    const feeName = (formData.get(`fee_name_${i}`) as string ?? "").trim();
    const feeUnit = Number(formData.get(`fee_unit_${i}`) ?? "1");
    const price = Number(formData.get(`fee_price_${i}`) ?? "0");
    const isAddFreight = formData.get(`fee_add_${i}`) === "1";
    if (feeName) fees.push({ feeName, feeUnit, price, isAddFreight });
  }

  const data = {
    channelName: (formData.get("channelName") as string).trim(),
    channelCode: (formData.get("channelCode") as string | null)?.trim() || null,
    supplierName: (formData.get("supplierName") as string | null)?.trim() || null,
    modeCode: (formData.get("modeCode") as string).trim(),
    channelTypeCode: Number(formData.get("channelTypeCode") ?? "1"),
    currency: Number(formData.get("currency") ?? "1"),
    startCityName: (formData.get("startCityName") as string | null)?.trim() || "深圳市",
    countryCode: (formData.get("countryCode") as string | null)?.trim() || null,
    countryName: (formData.get("countryName") as string | null)?.trim() || null,
    workDays: Number(formData.get("workDays") ?? "7"),
    cargoTypeInfo: (formData.get("cargoTypeInfo") as string | null)?.trim() || null,
    volumnBase: Number(formData.get("volumnBase") ?? "5000"),
    isTax: formData.get("isTax") === "1",
    serviceType: (formData.get("serviceType") as string | null)?.trim() || null,
    pricePerKg: Number(formData.get("pricePerKg") ?? "0"),
    minWeight: Number(formData.get("minWeight") ?? "0.5"),
    channelDescription: (formData.get("channelDescription") as string | null)?.trim() || null,
    riskWarning: (formData.get("riskWarning") as string | null)?.trim() || null,
    batteryNotice: (formData.get("batteryNotice") as string | null)?.trim() || null,
    wareFlightDesc: (formData.get("wareFlightDesc") as string | null)?.trim() || null,
    flightDesc: (formData.get("flightDesc") as string | null)?.trim() || null,
    wareShortCode: (formData.get("wareShortCode") as string | null)?.trim() || null,
    isActive: formData.get("isActive") !== "0",
  };

  if (id) {
    await prisma.channel.update({
      where: { id },
      data: {
        ...data,
        fees: {
          deleteMany: {},
          create: fees,
        },
        labels: {
          deleteMany: {},
          create: labelIds.map((labelId) => ({ labelId })),
        },
      },
    });
  } else {
    const { nanoid } = await import("nanoid");
    await prisma.channel.create({
      data: {
        ...data,
        channelKey: nanoid(21),
        fees: { create: fees },
        labels: { create: labelIds.map((labelId) => ({ labelId })) },
      },
    });
  }

  revalidatePath("/settings/channels");
  redirect("/settings/channels");
}
