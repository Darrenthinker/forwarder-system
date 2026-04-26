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
# First sync code (so deploy.sh is up to date), then run it
ssh -i $KEY $HOST_ADDR "cd $REMOTE_DIR && git fetch origin main && git reset --hard origin/main && chmod +x scripts/deploy.sh && bash scripts/deploy.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] remote deploy failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/3] Health check (3 attempts, 25s timeout)..." -ForegroundColor Cyan
$ok = $false
for ($i = 1; $i -le 3; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "https://dtms.huodaiagent.com/" -UseBasicParsing -TimeoutSec 25
        if ($r.StatusCode -eq 200) {
            Write-Host "  attempt $i : HTTP 200 OK" -ForegroundColor Green
            $ok = $true
            break
        } else {
            Write-Host "  attempt $i : HTTP $($r.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  attempt $i : timeout/err" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 5
}
Write-Host ""
if ($ok) {
    Write-Host "Deployed: https://dtms.huodaiagent.com" -ForegroundColor Green
} else {
    Write-Host "Health check did not pass from local network, but server may still be healthy." -ForegroundColor Yellow
    Write-Host "Verify manually: https://dtms.huodaiagent.com" -ForegroundColor Yellow
}
