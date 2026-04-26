# One-click deploy: git push -> remote pull/build/restart -> health check
# Usage: pnpm run deploy   (or .\scripts\push-deploy.ps1 "commit message")
# NOTE: Pure-ASCII script. Chinese paths built from char codes to dodge PowerShell encoding bugs.

param(
    [string]$Message = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"

# E:\keys\YangDu(2chars)System(2chars)\YangDu(2chars)System(2chars).pem
$dirName = -join @([char]0x4ef0,[char]0x5ea6,[char]0x7cfb,[char]0x7edf)
$KEY = "E:\keys\$dirName\$dirName.pem"
$HOST_ADDR = "root@114.55.12.15"
$REMOTE_DIR = "/www/forwarder-system"

if (-not (Test-Path $KEY)) {
    Write-Host "[X] SSH key not found: $KEY" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/3] Push to GitHub..." -ForegroundColor Cyan
git add -A
$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "  (no changes, skip commit)" -ForegroundColor Yellow
} else {
    git commit -m $Message
}
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] git push failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/3] Remote deploy (pull / build / restart)..." -ForegroundColor Cyan
ssh -i $KEY $HOST_ADDR "cd $REMOTE_DIR && bash scripts/deploy.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] remote deploy failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/3] Health check..." -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "https://dtms.huodaiagent.com/" -UseBasicParsing -TimeoutSec 20
    if ($r.StatusCode -eq 200) {
        Write-Host "  HTTP $($r.StatusCode) OK" -ForegroundColor Green
        Write-Host ""
        Write-Host "Deployed: https://dtms.huodaiagent.com" -ForegroundColor Green
    } else {
        Write-Host "  HTTP $($r.StatusCode) FAIL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  Health check error: $_" -ForegroundColor Red
    exit 1
}
