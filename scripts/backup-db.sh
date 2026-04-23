#!/bin/bash
# ================================================
# PostgreSQL 数据库备份脚本
# 可配置宝塔计划任务：每天凌晨2点执行
# ================================================

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/www/backup/forwarder"
BACKUP_FILE="$BACKUP_DIR/db_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

# 从 .env 读取数据库 URL
source /www/wwwroot/forwarder-system/.env

echo "▶ 备份数据库..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

echo "✅ 备份完成：$BACKUP_FILE"

# 删除 30 天前的备份
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +30 -delete
echo "✅ 清理 30 天前的旧备份"

# 可选：同步到阿里云 OSS
# ossutil cp "$BACKUP_FILE" oss://your-bucket/forwarder-backup/
