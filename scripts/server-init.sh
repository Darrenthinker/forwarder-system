#!/bin/bash
# ================================================
# 宝塔服务器首次初始化脚本
# 在服务器上执行一次即可
# 使用方法：bash scripts/server-init.sh
# ================================================

set -e

echo "▶ 检查 Node.js..."
node -v || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)

echo "▶ 安装 pnpm..."
corepack enable && corepack prepare pnpm@latest --activate

echo "▶ 安装 PM2（进程管理）..."
npm install -g pm2

echo "▶ 安装 PostgreSQL（如果本机部署数据库）..."
# 如果用外部数据库（推荐阿里云 RDS）则跳过此步
# apt-get install -y postgresql postgresql-contrib

echo "▶ 创建项目目录..."
mkdir -p /www/wwwroot/forwarder-system
cd /www/wwwroot/forwarder-system

echo "▶ 克隆代码（替换为你的仓库地址）..."
# git clone https://github.com/YOUR_USER/YOUR_REPO.git .

echo "▶ 安装依赖..."
pnpm install --frozen-lockfile

echo "▶ 配置环境变量..."
cat > .env << 'EOF'
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/forwarder?sslmode=disable
NODE_ENV=production
PORT=6419
EOF
echo "⚠️  请编辑 .env 文件，填入真实的数据库连接地址！"

echo "▶ 执行数据库迁移..."
pnpm prisma migrate deploy

echo "▶ 构建项目..."
pnpm build

echo "▶ 启动 PM2..."
pm2 start .next/standalone/server.js --name forwarder-system --env production
pm2 save
pm2 startup

echo "✅ 初始化完成！访问：http://$(hostname -I | awk '{print $1}'):6419"
echo ""
echo "常用命令："
echo "  查看日志：pm2 logs forwarder-system"
echo "  重启：    pm2 restart forwarder-system"
echo "  状态：    pm2 status"
