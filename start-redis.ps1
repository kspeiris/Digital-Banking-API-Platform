# start-redis.ps1
# Ensures Redis is running on port 6379 before starting services.
# Safe to call multiple times — exits immediately if Redis is already up.

$redisDir = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\taizod1024.redis-windows-fork_Microsoft.Winget.Source_8wekyb3d8bbwe\Redis-8.8.0-Windows-x64-msys2"
$redisExe = "$redisDir\redis-server.exe"
$redisCliExe = "$redisDir\redis-cli.exe"

if (-not (Test-Path $redisExe)) {
    Write-Host "Redis not found. Installing via winget..." -ForegroundColor Yellow
    winget install --id taizod1024.redis-windows-fork -e --accept-source-agreements --accept-package-agreements
    Start-Sleep -Seconds 3
}

# Check if Redis is already running
try {
    $pong = & $redisCliExe ping 2>$null
    if ($pong -eq "PONG") {
        Write-Host "[Redis] Already running on port 6379" -ForegroundColor Green
        exit 0
    }
} catch {}

Write-Host "[Redis] Starting server on port 6379..." -ForegroundColor Cyan
Start-Process -FilePath $redisExe -WindowStyle Minimized
Start-Sleep -Seconds 2

try {
    $pong = & $redisCliExe ping 2>$null
    if ($pong -eq "PONG") {
        Write-Host "[Redis] Started successfully!" -ForegroundColor Green
        exit 0
    }
} catch {}

Write-Host "[Redis] WARNING: Could not verify Redis is running. Services will retry automatically." -ForegroundColor Yellow
exit 0  # Don't block service startup even if Redis check fails
