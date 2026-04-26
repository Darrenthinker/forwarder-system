# 一键推送 + 远程部署脚本（本地 PowerShell 用）
# 用法: pnpm deploy  (或者 .\scripts\push-deploy.ps1 "提交说明")

param(
    [string]$Message = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"

$KEY = "E:\keys\仰度系统\仰度系统.pem"
$HOST_ADDR = "root@114.55.12.15"
$REMOTE_DIR = "/www/forwarder-system"

Write-Host "`n[1/3] 提交并推送代码 → GitHub" -ForegroundColor Cyan
git add -A
$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "  没有新改动，跳过 commit" -ForegroundColor Yellow
} else {
    git commit -m $Message
}
git push origin main

Write-Host "`n[2/3] 远程部署 (服务器拉代码、构建、重启)" -ForegroundColor Cyan
ssh -i $KEY $HOST_ADDR "cd $REMOTE_DIR && bash scripts/deploy.sh"

Write-Host "`n[3/3] 健康检查" -ForegroundColor Cyan
$r = Invoke-WebRequest -Uri "https://dtms.huodaiagent.com/" -UseBasicParsing -TimeoutSec 15
if ($r.StatusCode -eq 200) {
    Write-Host "  HTTP $($r.StatusCode) ✅" -ForegroundColor Green
    Write-Host "`n🎉 部署完成: https://dtms.huodaiagent.com" -ForegroundColor Green
} else {
    Write-Host "  HTTP $($r.StatusCode) ❌" -ForegroundColor Red
}
