import Link from "next/link";
import { Hammer } from "lucide-react";

const FEATURES: Record<string, { title: string; desc: string; section?: string }> = {
  "schedule": { title: "快递专线排仓航班时效", desc: "查询各渠道航班/班次的排仓时效信息", section: "我要下单" },
  "air-en": { title: "英文版空运下单", desc: "面向海外客户的英文空运下单页面", section: "我要下单" },
  "inquiry": { title: "询盘下单", desc: "客户询价与报价转换工作流", section: "我要下单" },
  "pickup": { title: "取件下单", desc: "上门取件下单与司机派单", section: "我要下单" },
  "fcl": { title: "海运整柜下单", desc: "整柜（FCL）专属下单表单", section: "我要下单" },
  "express-en": { title: "英文版快递下单", desc: "英文界面快递下单", section: "我要下单" },
  "batch": { title: "快递批量下单", desc: "Excel 批量导入下单", section: "我要下单" },
  "batch-v2": { title: "快递批量下单-新版", desc: "Excel 批量导入下单（新版）", section: "我要下单" },
  "line-upload": { title: "专线上传订单", desc: "通过专用模板上传专线订单", section: "我要下单" },
  "batch-log": { title: "快递批量下单记录", desc: "批量下单的历史记录与状态", section: "我要下单" },
  "consol": { title: "集运下单", desc: "多客户/多包裹集运下单", section: "我要下单" },
  "line-parcel": { title: "专线小包下单", desc: "专线小包专属下单入口", section: "我要下单" },
  "land": { title: "陆运下单", desc: "陆运（中欧/中亚卡车）下单", section: "我要下单" },
  "trailer-new": { title: "新建拖车-新版", desc: "新版拖车订单创建", section: "我要下单" },

  "order-inquiry": { title: "询盘订单列表", desc: "管理已转换为订单的询盘记录", section: "订单" },
  "order-pickup": { title: "取件订单列表", desc: "管理上门取件订单", section: "订单" },
  "order-fcl": { title: "海运整柜订单列表", desc: "海运整柜（FCL）订单管理", section: "订单" },
  "new-air-inquiry": { title: "新增空运询盘", desc: "录入新的空运询盘", section: "订单" },
  "problem": { title: "问题件列表", desc: "异常件登记与处理流程", section: "订单" },
  "hard-problem": { title: "疑难问题件列表", desc: "复杂异常件升级处理", section: "订单" },
  "cubage": { title: "订单收货材积查询", desc: "实测材积与申报材积对比", section: "订单" },
  "claim": { title: "仓库货物认领", desc: "无主件认领与归属确认", section: "订单" },
  "fee-approval": { title: "修改运费审批列表", desc: "运费调整工单审批", section: "订单" },
  "order-consol": { title: "集运订单列表", desc: "多单合并集运管理", section: "订单" },
  "order-parcel": { title: "小包订单列表", desc: "国际小包订单管理", section: "订单" },
  "order-trailer": { title: "拖车订单列表", desc: "拖车订单调度", section: "订单" },
  "neg-profit": { title: "负利润订单管理", desc: "亏损订单识别与归因", section: "订单" },
  "order-land": { title: "陆运订单列表", desc: "陆运订单查询与管理", section: "订单" },

  "lead": { title: "线索管理", desc: "潜在客户线索池与转化跟进", section: "客户" },
  "customer-account": { title: "客户账户管理", desc: "客户账户信息与余额", section: "客户" },
  "customer-deposit": { title: "客户入账申请", desc: "客户充值入账审批", section: "客户" },
  "recharge": { title: "客户充值记录", desc: "客户充值流水", section: "客户" },
  "credit-contract": { title: "额度调额与合同", desc: "信用额度调额与合同管理", section: "客户" },
  "credit-approval": { title: "额度申请与审核", desc: "信用额度申请审批流", section: "客户" },
  "coupon": { title: "优惠券查询", desc: "客户优惠券发放与使用", section: "客户" },
  "invoice-mgmt": { title: "客户开票管理", desc: "发票申请、开具、寄送", section: "客户" },
  "duplicate": { title: "重复客户查询", desc: "公司名/电话/邮箱去重", section: "客户" },
  "quote-log": { title: "客户查询行为记录", desc: "客户查价/询价行为日志", section: "客户" },
  "withdraw": { title: "客户提现信息管理", desc: "客户余额提现与银行信息", section: "客户" },
  "heavy-approval": { title: "大货审核列表", desc: "大件/重货特殊审核", section: "客户" },
  "public-pool": { title: "客户公海池", desc: "无业务员归属的客户池", section: "客户" },
  "overdue-risk": { title: "客户逾期风险记录", desc: "应收逾期风险打标", section: "客户" },
  "blacklist": { title: "客户额度逾期黑名单", desc: "黑名单客户管控", section: "客户" },

  "new-customers-report": { title: "新增合作客户报表", desc: "周期内新增成交客户统计", section: "报表" },
  "ar-stat": { title: "客户应收款统计表", desc: "客户应收账款明细与汇总", section: "报表" },
  "profit-detail": { title: "利润明细报表-Plus", desc: "订单维度利润明细分析", section: "报表" },
  "seller-profit": { title: "业务员利润报表-Seller", desc: "按业务员维度的利润排行", section: "报表" },
  "air-map": { title: "空运资源地图", desc: "空运渠道/航线资源可视化", section: "报表" },
  "customer-profit": { title: "客户利润报表-Seller", desc: "客户维度利润分析（业务员视角）", section: "报表" },
  "churn": { title: "流失客户预警视图", desc: "客户流失风险预警面板", section: "报表" },
  "ar-overdue": { title: "应收款逾期视图", desc: "应收逾期可视化看板", section: "报表" },

  "customer-bill": { title: "客户账单查询", desc: "按客户/周期查询账单", section: "账单" },
  "fx": { title: "汇率查询", desc: "多币种汇率查询与维护", section: "账单" },
  "make-bill": { title: "制作账单(新)", desc: "新版账单制作向导", section: "账单" },
  "make-bill-parcel": { title: "制作账单(小包)", desc: "小包专属账单制作", section: "账单" },

  // 顶部导航占位模块
  "system": {
    title: "系统",
    desc: "组织架构、账号权限、操作日志、参数设置等系统级管理功能。当前还在 MVP 阶段，等业务流程稳定后再做。",
    section: "顶部模块",
  },
  "content": {
    title: "内容",
    desc: "公告、Banner、官网文章、产品介绍页、客户公告板等内容管理。",
    section: "顶部模块",
  },
  "marketing": {
    title: "营销",
    desc: "优惠券、节日活动、新客首单优惠、客户分群推送等营销工具。",
    section: "顶部模块",
  },
  "reports": {
    title: "报表中心",
    desc: "经营看板：客户应收、订单利润、业务员业绩、流失预警 — 数据从订单/费用/客户表自动汇总。",
    section: "顶部模块",
  },
};

export default function ComingSoonPage({ searchParams }: { searchParams: { f?: string } }) {
  const key = searchParams.f ?? "";
  const meta = FEATURES[key];
  const title = meta?.title ?? "功能开发中";
  const desc = meta?.desc ?? "该模块正在规划/开发中，敬请期待。";

  return (
    <div>
      <div className="card p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <Hammer className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-700 mb-2">该功能正在开发中</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {desc}
          <br />
          需要优先开发该模块？告诉 Agent："请优先实现「{title}」"。
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/" className="btn-secondary">返回首页</Link>
          <Link href="/orders" className="btn-primary">查看订单</Link>
        </div>
      </div>
    </div>
  );
}
