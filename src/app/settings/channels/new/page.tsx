import { prisma } from "@/lib/db";
import { ChannelForm } from "../channel-form";

export default async function NewChannelPage() {
  const labels = await prisma.channelLabel.findMany({ orderBy: { labelName: "asc" } });
  return <ChannelForm labels={labels} />;
}
