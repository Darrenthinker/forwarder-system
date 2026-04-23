# 仰度科技 · 货代管理系统（Forwarder System）

小型货代公司业务管理系统 — MVP v0.1

> **端口**：固定 `6419`（前端 + API 同端口）
> **隔离**：本项目目录 `E:\cursor-projects\Forwarder System`，与 `localhost:3000` 的"智能货运报价系统"完全隔离，互不影响。

## 当前能做什么（M0 MVP）

✅ 客户管理：新增、列表、删除（无订单时）
✅ 订单管理：下单、列表（按状态筛选）、详情、修改状态、删除
✅ 费用管理：在订单详情里添加/删除运费、燃油费、附加费、清关费、其他
✅ 仪表盘：客户数、订单数、累计应收、最近 5 单

## 技术栈

- Next.js 14 (App Router) + TypeScript（严格）
- Tailwind CSS（自带 shadcn/ui 风格组件）
- Prisma ORM + SQLite（开发） / PostgreSQL（生产）
- React Server Components + Server Actions（无独立 API 层）
- 包管理：pnpm

## 启动

```bash
# 1. 安装依赖（首次）
pnpm install

# 2. 初始化数据库（首次或 schema 变更后）
pnpm prisma db push
pnpm db:seed              # 可选：插入示例客户

# 3. 启动开发
pnpm dev                  # 访问 http://localhost:6419
```

## 验证 MVP

1. 浏览器打开 `http://localhost:6419`
2. 进入"客户" → 新增 1 个客户
3. 进入"订单" → 新增订单（选刚才的客户）
4. 进入订单详情 → 添加 3 笔费用（运费 1000 / 燃油 100 / 附加费 50）
5. 回到订单列表 → 该订单合计列应显示 ¥1,150.00
6. 仪表盘 → 累计应收应显示 ¥1,150.00

## 数据备份

### 开发期（SQLite 本地）

```bash
pnpm backup
# 会把 prisma/dev.db 复制一份到 backups/dev-YYYY-MM-DD-HH-mm-ss.db
```

建议把 Windows 计划任务加一条：每天凌晨 2 点运行
```
node E:\cursor-projects\Forwarder System\scripts\backup.mjs
```

### 生产期（阿里云推荐方案）

| 用途 | 阿里云产品 | 备注 |
|---|---|---|
| 数据库 | **RDS PostgreSQL** | 自带每日全量 + binlog，可回滚 7-30 天 |
| 应用主机 | **ECS** | 装 Node 22 + pnpm + Docker |
| 文件附件 | **OSS** | 提单、发票、报关单 PDF 存这里 |
| 异地备份 | OSS 跨区域复制 | 防止单地域故障 |

切换到 PostgreSQL 只需要改两处：
1. `prisma/schema.prisma` 里 `provider = "postgresql"`
2. `.env.production` 里 `DATABASE_URL="postgresql://user:pwd@rds-host:5432/forwarder?schema=public"`

然后 `pnpm prisma migrate deploy` 即可。

## 目录结构

```
.
├── AGENTS.md              # ⭐ Agent 项目记忆，新对话先读
├── README.md              # 本文件
├── .cursor/rules/         # Cursor 规则（自动应用）
├── docs/plans/            # 设计文档、迭代计划
├── prisma/
│   ├── schema.prisma      # 数据模型
│   ├── seed.ts            # 种子数据
│   └── dev.db             # SQLite（不入库）
├── scripts/
│   └── backup.mjs         # 数据库备份脚本
└── src/
    ├── app/
    │   ├── layout.tsx           # 根布局 + 顶部导航
    │   ├── page.tsx             # 仪表盘
    │   ├── globals.css          # Tailwind + 自定义类
    │   ├── customers/           # 客户模块
    │   │   ├── page.tsx
    │   │   ├── actions.ts
    │   │   ├── delete-button.tsx
    │   │   └── new/
    │   │       ├── page.tsx
    │   │       └── form.tsx
    │   └── orders/              # 订单模块
    │       ├── page.tsx
    │       ├── actions.ts
    │       ├── new/
    │       │   ├── page.tsx
    │       │   └── form.tsx
    │       └── [id]/
    │           ├── page.tsx
    │           ├── actions-client.tsx
    │           ├── fee-form.tsx
    │           └── delete-fee-button.tsx
    └── lib/
        ├── db.ts          # Prisma client 单例
        └── utils.ts       # 通用工具、字典
```

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 开发模式，端口 6419 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 生产启动，端口 6419 |
| `pnpm db:push` | 同步 schema 到数据库（开发期） |
| `pnpm db:studio` | 启动 Prisma Studio 可视化数据 |
| `pnpm db:seed` | 插入种子数据 |
| `pnpm backup` | 备份 SQLite 数据库 |

## 渐进式路线（先跑通，慢慢加）

- ✅ M0 — 客户 + 下单 + 费用记录（当前）
- ⏳ M1 — 渠道运价表 + 报价计算
- ⏳ M2 — 状态流 + 简单轨迹（手动录）
- ⏳ M3 — 账单/对账单 PDF 导出
- ⏳ M4 — 业务员业绩、客户利润报表
- ⏳ M5 — 17Track API 自动轨迹
- ⏳ M6 — FBA 头程、海运散货专属下单
- ⏳ M7 — 用户/角色/权限
- ⏳ M8 — 消息通知、待办面板

## 给后续 Agent / 协作者

- 任何修改前 **先读 `AGENTS.md`**
- 设计文档放 `docs/plans/YYYY-MM-DD-<topic>.md`
- 不改 `localhost:3000` 那个项目的任何东西
- 端口固定 6419，不要换
