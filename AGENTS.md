# Forwarder System — Agent 项目记忆

> 任何新对话/新 Agent 进来，**先读完本文件**，再决定如何工作。

## 1. 项目简介

小型货代公司内部使用的**货代业务系统**。参考 `https://www.by56.com/` 的功能盘，最终目标是覆盖：客户 CRM、报价、下单（快递/专线/空运/海运/FBA）、操作、轨迹、账单、报表。

**当前阶段：MVP**。先打通"下单 + 后台记录订单费用"，其他功能逐步迭代。

## 2. 项目隔离 / 端口约束（重要规则）

- **本项目根目录**：`E:\cursor-projects\Forwarder System`
- **本项目对外端口**：`6419`（前端 + API 同端口）
- 不同项目必须用**不同端口** + **不同文件夹物理隔离**，不能互相影响
- 同机器另一个项目 `localhost:3000` 是"智能货运报价系统"，**与本项目无关，UI 不能改动**

## 3. 技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| 前端框架 | **Next.js 14（App Router）** | 单端口部署，TS 全栈 |
| UI 组件 | **shadcn/ui + Tailwind CSS** | 现代化、可定制 |
| 后端 | Next.js Route Handlers / Server Actions | 不另起 Node 服务 |
| 数据库（开发） | **SQLite**（`prisma/dev.db`） | 零依赖，clone 即用 |
| 数据库（生产） | **PostgreSQL**（阿里云 RDS） | 通过 `DATABASE_URL` 切换 |
| ORM | **Prisma** | 迁移 + 类型生成 |
| 包管理器 | **pnpm** | 比 npm 快，磁盘省 |
| 语言 | **TypeScript** | 严格模式 |
| 部署 | Docker → 阿里云 ECS | OSS 存附件，RDS 自动备份 |

## 4. 启动 & 常用命令

```bash
pnpm install
pnpm prisma db push        # 创建/同步数据库
pnpm dev                   # 启动开发服务，访问 http://localhost:6419
pnpm build && pnpm start   # 生产构建
pnpm clean                 # 清 .next 缓存
pnpm fresh                 # clean + dev（解决奇怪的缓存问题）
```

**⚠️ 重要**：不要在 `pnpm dev` 仍在运行时去跑 `pnpm build`，会污染 `.next/`，
导致下次启动报 `Cannot find module './xxx.js'`。如果遇到，跑 `pnpm fresh` 即可。

## 5. 目录结构

```
Forwarder System/
├── AGENTS.md                  # 本文件（项目记忆，必读）
├── README.md                  # 启动/备份/部署
├── .cursor/rules/             # Cursor 规则（自动应用）
├── docs/
│   └── plans/                 # 设计文档、迭代计划
├── prisma/
│   ├── schema.prisma          # 数据模型（单一数据源）
│   └── dev.db                 # SQLite 文件（不入库）
├── src/
│   ├── app/                   # Next.js App Router 路由
│   │   ├── (dashboard)/       # 业务页面
│   │   └── api/               # Route Handlers
│   ├── components/            # 通用组件
│   │   └── ui/                # shadcn/ui 组件
│   ├── lib/                   # 工具：db.ts, utils.ts
│   └── types/                 # TS 类型
└── package.json
```

## 6. 数据模型（MVP）

- **Customer**：客户（id, name, contact, phone, email, creditLimit, createdAt）
- **Order**：订单（id, orderNo, customerId, channel, destination, weight, volume, status, remark, createdAt）
- **OrderFee**：订单费用（id, orderId, feeType, amount, currency, remark）

订单状态枚举：`DRAFT / SUBMITTED / IN_TRANSIT / DELIVERED / CANCELED`

费用类型枚举：`FREIGHT / FUEL / SURCHARGE / CUSTOMS / OTHER`

## 7. 编码约定

- 所有金额用 `Decimal`（Prisma） / `string`（前端展示），不要用 `number` 防精度丢失
- 所有时间统一 UTC 存储，前端按需格式化
- 路由 / API 命名使用 RESTful 风格：`/customers`, `/customers/[id]`, `/orders`, `/orders/[id]/fees`
- 服务端校验用 `zod`，组件用 `react-hook-form` + `zod`
- **不要修改 `localhost:3000` 那个项目的任何文件**

## 8. 数据备份策略

- 开发期：每次 `prisma migrate dev` 自动备份；手动 `cp prisma/dev.db prisma/dev.db.bak`
- 生产期（阿里云）：
  - RDS PostgreSQL 自带每日全量 + binlog 增量，保留 7 天
  - OSS 存订单附件（提单、报关单、发票截图）
  - 每周 `pg_dump` 异地副本到 OSS Cold Bucket

## 9. 渐进式功能路线（不要一次做完）

- ✅ M0：客户 + 下单 + 费用记录（MVP，本周）
- M1：渠道运价表 + 报价计算
- M2：订单状态流 + 简单轨迹（手动录）
- M3：账单/对账单导出 PDF
- M4：业务员业绩、客户利润报表
- M5：17Track API 自动轨迹
- M6：FBA 头程、海运散货专属下单
- M7：权限/角色/多组织
- M8：消息通知、待办面板

## 10. 给 Agent 的工作原则

1. 修改前先读 `docs/plans/` 里相关设计文档
2. 任何新功能先写最小骨架跑起来，再补细节（YAGNI）
3. 改动后必须能 `pnpm build` 通过
4. 不要乱加依赖；新增依赖先看 `package.json` 是否已有
5. 遇到产品/业务不清楚的问题，先问用户，不要猜
