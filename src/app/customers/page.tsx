import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";
import { DeleteCustomerButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400">共 {customers.length} 家客户</span>
        <Link href="/customers/new" className="btn-primary btn-sm">+ 新增客户</Link>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>客户名称</th>
              <th>类型</th>
              <th>来源</th>
              <th>联系人</th>
              <th>电话</th>
              <th className="text-right">信用额度</th>
              <th className="text-center">订单数</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                  暂无客户，<Link href="/customers/new" className="text-brand">去新增 →</Link>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td>
                    <div className="font-medium text-slate-800">{c.name}</div>
                    {c.taxCode && <div className="text-[11px] text-slate-400">{c.taxCode}</div>}
                    {c.idNumber && <div className="text-[11px] text-slate-400">{c.idNumber}</div>}
                  </td>
                  <td>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${c.customerType === "INDIVIDUAL" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                      {c.customerType === "INDIVIDUAL" ? "个人" : "公司"}
                    </span>
                  </td>
                  <td>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${c.sourceType === "PEER" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {c.sourceType === "PEER" ? "同行" : "直客"}
                    </span>
                  </td>
                  <td>{c.contact ?? "-"}</td>
                  <td>{c.phone ?? "-"}</td>
                  <td className="text-right">{formatMoney(c.creditLimit ?? 0)}</td>
                  <td className="text-center">
                    <Link href={`/orders?customerId=${c.id}`} className="text-brand hover:underline">
                      {c._count.orders}
                    </Link>
                  </td>
                  <td className="text-slate-500">{formatDate(c.createdAt)}</td>
                  <td className="text-right">
                    <DeleteCustomerButton id={c.id} disabled={c._count.orders > 0} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
