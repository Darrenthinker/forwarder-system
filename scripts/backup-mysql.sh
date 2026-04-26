#!/bin/bash
# 阿里云 RDS MySQL 自动备份脚本
# 安装: bash scripts/backup-mysql.sh install   (设置cron)
# 手动: bash scripts/backup-mysql.sh           (立即备份一次)

set -e

# === 配置 ===
DB_HOST="rm-bp19c413117y10tq0.mysql.rds.aliyuncs.com"
DB_PORT=3306
DB_USER="forwarder"
DB_PASS="Forwarder2026+"
DB_NAME="forwarder"
BACKUP_DIR="/www/backups/forwarder"
KEEP_DAYS=7

if [ "$1" = "install" ]; then
    apt-get install -y mysql-client 2>&1 | tail -2
    mkdir -p $BACKUP_DIR
    SCRIPT_PATH=$(realpath "$0")
    chmod +x "$SCRIPT_PATH"
    (crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH"; echo "0 3 * * * $SCRIPT_PATH >> /var/log/forwarder-backup.log 2>&1") | crontab -
    echo "✅ Cron 已设置：每天凌晨 3:00 自动备份"
    crontab -l | grep forwarder
    exit 0
fi

mkdir -p $BACKUP_DIR
TS=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/forwarder_${TS}.sql.gz"

echo "[$(date)] 开始备份 -> $FILE"
mysqldump -h$DB_HOST -P$DB_PORT -u$DB_USER -p"$DB_PASS" \
    --single-transaction --routines --events --triggers \
    --set-gtid-purged=OFF \
    $DB_NAME 2>/dev/null | gzip > "$FILE"

SIZE=$(du -h "$FILE" | cut -f1)
echo "[$(date)] ✅ 备份完成: $FILE ($SIZE)"

# 清理 N 天前的旧备份
DELETED=$(find $BACKUP_DIR -name "forwarder_*.sql.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
echo "[$(date)] 🗑️  清理 $DELETED 个旧备份"
echo "[$(date)] 当前备份列表:"
ls -lh $BACKUP_DIR | tail -10
