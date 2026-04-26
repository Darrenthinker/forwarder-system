#!/bin/bash
# 一键部署脚本：服务器拉新代码 + 构建 + 重启
# 用法（在服务器上执行）: cd /www/forwarder-system && bash scripts/deploy.sh

set -e

cd /www/forwarder-system

echo "=== [1/5] 拉取最新代码 ==="
git fetch origin main
git reset --hard origin/main

# 关键：本地 schema.prisma 是 sqlite（开发用），生产必须切到 mysql
sed -i 's|provider = "sqlite"|provider = "mysql"\n  relationMode = "prisma"|' prisma/schema.prisma
echo "✓ schema.prisma 已切换为 mysql 模式"
head -12 prisma/schema.prisma

echo "=== [2/5] 安装依赖 ==="
pnpm install --prod=false --frozen-lockfile=false

echo "=== [3/5] 同步数据库结构 ==="
pnpm prisma generate
pnpm prisma db push --accept-data-loss

echo "=== [4/5] 构建 ==="
NODE_OPTIONS='--max-old-space-size=1400' pnpm build

echo "=== [5/5] 重启服务 ==="
pm2 restart forwarder
sleep 3
pm2 status forwarder

echo ""
echo "✅ 部署完成！https://dtms.huodaiagent.com"
