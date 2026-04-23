import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ChannelForm } from "../channel-form";

export default async function EditChannelPage({ params }: { params: { id: string } }) {
  const [channel, labels] = await Promise.all([
    prisma.channel.findUnique({
      where: { id: params.id },
      include: {
        fees: true,
        labels: { include: { label: true } },
      },
    }),
    prisma.channelLabel.findMany({ orderBy: { labelName: "asc" } }),
  ]);

  if (!channel) notFound();

  const defaultValues = {
    id: channel.id,
    channelName: channel.channelName,
    channelCode: channel.channelCode ?? "",
    supplierName: channel.supplierName ?? "",
    modeCode: channel.modeCode,
    channelTypeCode: channel.channelTypeCode,
    currency: channel.currency,
    startCityName: channel.startCityName ?? "深圳市",
    countryCode: channel.countryCode ?? "",
    countryName: channel.countryName ?? "",
    workDays: channel.workDays,
    cargoTypeInfo: channel.cargoTypeInfo ?? "",
    volumnBase: channel.volumnBase,
    isTax: channel.isTax,
    serviceType: channel.serviceType ?? "",
    pricePerKg: Number(channel.pricePerKg),
    minWeight: Number(channel.minWeight),
    channelDescription: channel.channelDescription ?? "",
    riskWarning: channel.riskWarning ?? "",
    batteryNotice: channel.batteryNotice ?? "",
    wareFlightDesc: channel.wareFlightDesc ?? "",
    flightDesc: channel.flightDesc ?? "",
    wareShortCode: channel.wareShortCode ?? "",
    isActive: channel.isActive,
    labelIds: channel.labels.map((r) => r.labelId),
    fees: channel.fees.map((f) => ({
      feeName: f.feeName,
      feeUnit: f.feeUnit,
      price: Number(f.price),
      isAddFreight: f.isAddFreight,
    })),
  };

  return <ChannelForm labels={labels} defaultValues={defaultValues} />;
}
