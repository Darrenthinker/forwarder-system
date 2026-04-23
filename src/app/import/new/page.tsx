import Link from "next/link";
import { prisma } from "@/lib/db";
import { ImportOrderForm } from "./form";

export const dynamic = "force-dynamic";

export default async function ImportNewPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, sourceType: true },
  });

  if (customers.length === 0) {
    return (
      <div className="card p-6 text-sm text-slate-600">
        还没有客户，请先去 <Link href="/customers/new" className="text-brand">新增客户</Link>。
      </div>
    );
  }

  return <ImportOrderForm customers={customers} />;
}
