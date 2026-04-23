import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteChannelButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: { q?: string; mode?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const mode = searchParams.mode?.trim() ?? "";

  const channels = await prisma.channel.findMany({
    where: {
      isActive: true,
      ...(q ? { channelName: { contains: q } } : {}),
      ...(mode ? { modeCode: { contains: mode } } : {}),
    },
    include: {
      fees: true,
      labels: { include: { label: true } },
    },
    orderBy: [{ modeCode: "asc" }, { pricePerKg: "asc" }],
  });

  const allModeCodes = await prisma.channel.findMany({
    where: { isActive: true },
    select: { modeCode: true },
    distinct: ["modeCode"],
    orderBy: { modeCode: "asc" },
  });

  return (
    <div>
      {/* 搜索栏 */}
      <form method="GET" className="card p-3 flex items-center gap-3 mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="搜索渠道名称…"
          className="form-input w-52"
        />
        <select name="mode" defaultValue={mode} className="form-select w-36">
          <option value="">全部运输方式</option>
          {allModeCodes.map((m) => (
            <option key={m.modeCode} value={m.modeCode}>{m.modeCode}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-1.5 rounded bg-brand text-white text-xs">搜索</button>
        <Link href="/settings/channels" className="text-xs text-slate-500 hover:text-brand">清空</Link>
        <span className="ml-auto text-xs text-slate-400">共 {channels.length} 条</span>
        <Link href="/settings/channels/new" className="btn-primary btn-sm">+ 新增渠道</Link>
      </form>

      {/* 列表 */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>渠道名称</th>
              <th>运输方式</th>
              <th>供应商</th>
              <th>目的地</th>
              <th>时效(天)</th>
              <th>参考价(元/KG)</th>
              <th>特色标签</th>
              <th>附加费</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  暂无渠道，
                  <Link href="/settings/channels/new" className="text-brand ml-1">点击新增</Link>
                </td>
              </tr>
            ) : (
              channels.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50">
                  <td>
                    <div className="font-medium text-slate-800 max-w-[220px] truncate" title={ch.channelName}>
                      {ch.channelName}
                    </div>
                    <div className="text-[11px] text-slate-400">{ch.channelCode ?? "-"}</div>
                  </td>
                  <td>
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {ch.modeCode}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600 max-w-[140px] truncate">{ch.supplierName ?? "-"}</td>
                  <td className="text-xs">
                    <span>{ch.countryName ?? "-"}</span>
                    {ch.countryCode && (
                      <span className="text-slate-400 ml-1">({ch.countryCode})</span>
                    )}
                  </td>
                  <td className="text-orange-600 font-medium">{ch.workDays}</td>
                  <td className="tabular-nums font-semibold text-orange-600">
                    {Number(ch.pricePerKg).toFixed(2)}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {ch.labels.filter(r => r.label.isPublic).map((r) => (
                        <span
                          key={r.labelId}
                          className="px-1 py-0 rounded text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200"
                        >
                          {r.label.labelName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-xs text-slate-500">
                    {ch.fees.length === 0
                      ? "无"
                      : ch.fees
                          .map((f) => `${f.feeName}¥${Number(f.price).toFixed(0)}${f.feeUnit === 2 ? "/KG" : "/票"}`)
                          .join("，")}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/settings/channels/${ch.id}`}
                        className="text-xs text-brand hover:underline"
                      >
                        编辑
                      </Link>
                      <DeleteChannelButton id={ch.id} name={ch.channelName} />
                    </div>
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
