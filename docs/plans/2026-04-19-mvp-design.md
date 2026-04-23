# MVP 设计文档（2026-04-19）

> 适用阶段：M0 MVP。目标：能下单 + 后台记录订单费用。

## 1. 业务流程（最小闭环）

```
[新增客户] → [给客户下一个订单] → [订单详情里加运费/燃油/附加费] → [订单列表看到合计金额]
```

不做：报价表、状态流、轨迹、对账、报表、权限。

## 2. 数据模型

### Customer
| 字段 | 类型 | 说明 |
|---|---|---|
| id | String (cuid) | 主键 |
| name | String | 客户名称（必填） |
| contact | String? | 联系人 |
| phone | String? | 电话 |
| email | String? | 邮箱 |
| creditLimit | Decimal? | 信用额度（人民币元） |
| remark | String? | 备注 |
| createdAt | DateTime | 创建时间 |

### Order
| 字段 | 类型 | 说明 |
|---|---|---|
| id | String (cuid) | 主键 |
| orderNo | String (unique) | 订单号，自动生成 `BY+yyyyMMdd+4位序号` |
| customerId | String (FK) | 客户 |
| channel | Enum | EXPRESS / LINE / AIR / SEA / FBA |
| origin | String | 起运地（默认 SZX 深圳） |
| destination | String | 目的地（国家/城市） |
| weight | Decimal | 重量 KG |
| volume | Decimal? | 体积 CBM |
| pieces | Int? | 件数 |
| status | Enum | DRAFT / SUBMITTED / IN_TRANSIT / DELIVERED / CANCELED |
| remark | String? | 备注 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### OrderFee
| 字段 | 类型 | 说明 |
|---|---|---|
| id | String (cuid) | 主键 |
| orderId | String (FK) | 订单 |
| feeType | Enum | FREIGHT / FUEL / SURCHARGE / CUSTOMS / OTHER |
| amount | Decimal | 金额（正数=收入，负数=折扣） |
| currency | String | 币种，默认 CNY |
| remark | String? | 备注 |
| createdAt | DateTime | |

## 3. 页面/路由

| 路由 | 说明 |
|---|---|
| `/` | 仪表盘：今日订单数、总金额、最近 5 单 |
| `/customers` | 客户列表（搜索 + 新增） |
| `/customers/new` | 新增客户表单 |
| `/orders` | 订单列表（状态过滤、客户过滤、合计列） |
| `/orders/new` | 下单表单（关联客户、渠道、目的地、重量等） |
| `/orders/[id]` | 订单详情：基本信息 + 费用列表 + 加费用按钮 |

## 4. API（Route Handlers）

```
GET    /api/customers
POST   /api/customers
GET    /api/customers/[id]
PATCH  /api/customers/[id]
DELETE /api/customers/[id]

GET    /api/orders
POST   /api/orders
GET    /api/orders/[id]
PATCH  /api/orders/[id]
DELETE /api/orders/[id]

POST   /api/orders/[id]/fees
PATCH  /api/orders/[id]/fees/[feeId]
DELETE /api/orders/[id]/fees/[feeId]
```

## 5. UI 设计原则

- 顶部 Header：项目 Logo（"百运货代"） + 导航（仪表盘 / 客户 / 订单）+ 用户菜单
- 左侧不做侧栏，顶部 Tab 即可（小公司菜单少）
- 表单：单列布局，必填项打 `*`，提交后 toast 提示
- 列表：表格 + 分页 + 行内"查看 / 删除"操作
- 主色：参考 by56 的蓝色 `#1677ff`

## 6. 非功能需求

- 单端口 6419（package.json `dev` 脚本固定）
- 中文界面
- 无登录（MVP 跳过权限，后续 M7 再加）
- SQLite 开发，PostgreSQL 生产，环境变量切换
- 数据每天手动备份（脚本 `pnpm backup` 复制 db 文件）

## 7. 不在 MVP 范围内（明确 OUT）

- ❌ 用户登录、角色权限
- ❌ 渠道运价表、自动算价
- ❌ 轨迹查询（17Track 等）
- ❌ 对账单、PDF 导出
- ❌ 业务报表、利润分析
- ❌ FBA/海运/空运 专门表单（先用通用 Order 表 + channel 字段）
- ❌ 多公司/多组织

## 8. 验收

启动 `pnpm dev` 后访问 `http://localhost:6419`：
1. 能新增 1 个客户
2. 能给该客户下 1 个订单
3. 能在订单详情里加 3 笔费用
4. 订单列表里能看到该订单的合计金额
5. 刷新页面后数据仍在
