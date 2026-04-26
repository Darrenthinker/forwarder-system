// 左侧菜单 — 完整对齐参考后台（by56）
// 已实装功能 href 指向真实路由；未实装统一指向 /coming-soon?f=xxx

import type { LucideIcon } from "lucide-react";
import {
  FilePlus,
  ClipboardList,
  Users,
  BarChart3,
  Receipt,
  Truck,
  PackageSearch,
  Landmark,
} from "lucide-react";

export type MenuLeaf = {
  label: string;
  href: string;
  done?: boolean; // 已实装功能
};

export type MenuSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: MenuLeaf[];
};

export const MENU: MenuSection[] = [
  // ============ 下单 ============
  {
    id: "place-order",
    label: "下单",
    icon: FilePlus,
    defaultOpen: true,
    children: [
      { label: "中文版快递下单-新版", href: "/orders/new?channel=EXPRESS&v=2", done: true },
      { label: "中文版快递下单", href: "/orders/new?channel=EXPRESS", done: true },
      { label: "中文版专线下单", href: "/orders/new?channel=LINE", done: true },
      { label: "空运价格查询-下单", href: "/orders/new?channel=AIR", done: true },
      { label: "快递专线排仓航班时效", href: "/coming-soon?f=schedule" },
      { label: "英文版空运下单", href: "/coming-soon?f=air-en" },
      { label: "询盘下单", href: "/coming-soon?f=inquiry" },
      { label: "中文版FBA下单-新版", href: "/orders/new?channel=FBA&v=2", done: true },
      { label: "中文版FBA下单", href: "/orders/new?channel=FBA", done: true },
      { label: "取件下单", href: "/coming-soon?f=pickup" },
      { label: "海运散货下单", href: "/orders/new?channel=SEA", done: true },
      { label: "海运整柜下单", href: "/coming-soon?f=fcl" },
      { label: "英文版快递下单", href: "/coming-soon?f=express-en" },
      { label: "快递批量下单", href: "/coming-soon?f=batch" },
      { label: "快递批量下单-新版", href: "/coming-soon?f=batch-v2" },
      { label: "专线上传订单", href: "/coming-soon?f=line-upload" },
      { label: "快递批量下单记录", href: "/coming-soon?f=batch-log" },
      { label: "集运下单", href: "/coming-soon?f=consol" },
      { label: "专线小包下单", href: "/coming-soon?f=line-parcel" },
      { label: "陆运下单", href: "/coming-soon?f=land" },
      { label: "新建拖车-新版", href: "/coming-soon?f=trailer-new" },
    ],
  },

  // ============ 订单 ============
  {
    id: "orders",
    label: "订单",
    icon: ClipboardList,
    defaultOpen: true,
    children: [
      { label: "快递订单列表", href: "/orders?channel=EXPRESS", done: true },
      { label: "空运订单列表", href: "/orders?channel=AIR", done: true },
      { label: "询盘订单列表", href: "/coming-soon?f=order-inquiry" },
      { label: "FBA订单列表", href: "/orders?channel=FBA", done: true },
      { label: "取件订单列表", href: "/coming-soon?f=order-pickup" },
      { label: "海运散货订单列表-新", href: "/orders?channel=SEA&v=2", done: true },
      { label: "海运整柜订单列表", href: "/coming-soon?f=order-fcl" },
      { label: "新增空运询盘", href: "/coming-soon?f=new-air-inquiry" },
      { label: "问题件列表", href: "/coming-soon?f=problem" },
      { label: "疑难问题件列表", href: "/coming-soon?f=hard-problem" },
      { label: "订单收货材积查询列表", href: "/coming-soon?f=cubage" },
      { label: "海运散货订单列表", href: "/orders?channel=SEA", done: true },
      { label: "仓库货物认领", href: "/coming-soon?f=claim" },
      { label: "修改运费审批列表", href: "/coming-soon?f=fee-approval" },
      { label: "集运订单列表", href: "/coming-soon?f=order-consol" },
      { label: "小包订单列表", href: "/coming-soon?f=order-parcel" },
      { label: "拖车订单列表", href: "/coming-soon?f=order-trailer" },
      { label: "负利润订单管理", href: "/coming-soon?f=neg-profit" },
      { label: "陆运订单列表", href: "/coming-soon?f=order-land" },
    ],
  },

  // ============ 客户 ============
  {
    id: "customers",
    label: "客户",
    icon: Users,
    defaultOpen: true,
    children: [
      { label: "线索管理", href: "/coming-soon?f=lead" },
      { label: "客户信息列表", href: "/customers", done: true },
      { label: "客户账户管理", href: "/coming-soon?f=customer-account" },
      { label: "客户入账申请", href: "/coming-soon?f=customer-deposit" },
      { label: "客户充值记录", href: "/coming-soon?f=recharge" },
      { label: "额度调额与合同", href: "/coming-soon?f=credit-contract" },
      { label: "额度申请与审核", href: "/coming-soon?f=credit-approval" },
      { label: "优惠券查询", href: "/coming-soon?f=coupon" },
      { label: "客户开票管理", href: "/coming-soon?f=invoice-mgmt" },
      { label: "重复客户查询", href: "/coming-soon?f=duplicate" },
      { label: "客户查询行为记录", href: "/coming-soon?f=quote-log" },
      { label: "客户提现信息管理", href: "/coming-soon?f=withdraw" },
      { label: "大货审核列表", href: "/coming-soon?f=heavy-approval" },
      { label: "客户公海池", href: "/coming-soon?f=public-pool" },
      { label: "客户逾期风险记录列表", href: "/coming-soon?f=overdue-risk" },
      { label: "客户额度逾期黑名单", href: "/coming-soon?f=blacklist" },
    ],
  },

  // ============ 报表 ============
  {
    id: "reports",
    label: "报表",
    icon: BarChart3,
    children: [
      { label: "新增合作客户报表", href: "/coming-soon?f=new-customers-report" },
      { label: "客户应收款统计表", href: "/coming-soon?f=ar-stat" },
      { label: "利润明细报表-Plus", href: "/coming-soon?f=profit-detail" },
      { label: "业务员利润报表-Seller", href: "/coming-soon?f=seller-profit" },
      { label: "空运资源地图", href: "/coming-soon?f=air-map" },
      { label: "客户利润报表-Seller", href: "/coming-soon?f=customer-profit" },
      { label: "流失客户预警视图", href: "/coming-soon?f=churn" },
      { label: "应收款逾期视图", href: "/coming-soon?f=ar-overdue" },
    ],
  },

  // ============ 账单 ============
  {
    id: "bills",
    label: "账单",
    icon: Receipt,
    children: [
      { label: "客户账单查询", href: "/coming-soon?f=customer-bill" },
      { label: "汇率查询", href: "/coming-soon?f=fx" },
      { label: "制作账单(新)", href: "/coming-soon?f=make-bill" },
      { label: "制作账单(小包)", href: "/coming-soon?f=make-bill-parcel" },
    ],
  },

  // ============ 进口物流 ============
  {
    id: "import",
    label: "进口物流",
    icon: PackageSearch,
    defaultOpen: false,
    children: [
      { label: "进口下单登记", href: "/import/new", done: true },
      { label: "进口订单列表", href: "/import/orders", done: true },
    ],
  },

  // ============ 财务结算 ============
  {
    id: "finance",
    label: "财务结算",
    icon: Landmark,
    defaultOpen: false,
    children: [
      { label: "结算单管理", href: "/finance/settlements", done: true },
      { label: "新建结算单", href: "/finance/settlements/new", done: true },
    ],
  },

  // ============ 产品 ============
  {
    id: "channels",
    label: "产品",
    icon: Truck,
    defaultOpen: false,
    children: [
      { label: "产品管理", href: "/settings/channels", done: true },
    ],
  },
];

// 根据 pathname + search 找到当前激活的菜单项
export function findActiveLeaf(pathname: string, search: string): MenuLeaf | null {
  const fullPath = search ? `${pathname}${search}` : pathname;
  for (const sec of MENU) {
    for (const leaf of sec.children) {
      if (leaf.href === fullPath) return leaf;
    }
  }
  // 退化：只匹配 pathname
  for (const sec of MENU) {
    for (const leaf of sec.children) {
      const [p] = leaf.href.split("?");
      if (p === pathname) return leaf;
    }
  }
  return null;
}
