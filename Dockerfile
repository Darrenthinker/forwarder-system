# ============================
# 阶段1：安装依赖
# ============================
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ============================
# 阶段2：构建
# ============================
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建时用 PostgreSQL 模式
ENV DATABASE_PROVIDER=postgresql
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

RUN pnpm prisma generate
RUN pnpm build

# ============================
# 阶段3：生产镜像（最小化）
# ============================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma 相关（迁移用）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

USER nextjs

EXPOSE 3000

# 启动前先执行数据库迁移
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
