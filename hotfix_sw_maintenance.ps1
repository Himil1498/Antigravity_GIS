# ============================================================
# OptiConnect GIS - ROBUST Hotfix: Reload Loop Prevention
# Run from: C:\Optimal_Telemedia_Main\OptiConnect_GIS
# ============================================================

$HostIp = "172.16.20.11"
$User = "opticonnect"
$BaseDir = "C:\Optimal_Telemedia_Main\OptiConnect_GIS"

Write-Host "`n=== OptiConnect GIS - Robust Production Hotfix ===" -ForegroundColor Cyan
Write-Host "Target: $User@$HostIp" -ForegroundColor Gray

# --- Step 1: Prepare service-worker.js with current timestamp ---
Write-Host "`n[1/5] Preparing service-worker.js with fresh cache-bust timestamp..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$swSource = "$BaseDir\frontend\public\service-worker.js"
$swTemp = "$BaseDir\frontend\public\service-worker.js.hotfix"

(Get-Content $swSource) -replace "__BUILD_TIMESTAMP__", $timestamp | Set-Content $swTemp
Write-Host "   Cache Name: opticonnect-gis-cache-$timestamp" -ForegroundColor Gray

# --- Step 2: Upload service-worker.js ---
Write-Host "`n[2/5] Uploading fixed service-worker.js..." -ForegroundColor Yellow
scp -o ServerAliveInterval=15 -o ConnectTimeout=10 $swTemp ${User}@${HostIp}:~/service-worker.js.hotfix
ssh -t ${User}@${HostIp} "sudo cp ~/service-worker.js.hotfix /var/www/opticonnect/frontend/service-worker.js && sudo chown opticonnect:opticonnect /var/www/opticonnect/frontend/service-worker.js && rm ~/service-worker.js.hotfix"
Remove-Item $swTemp -Force
Write-Host "   service-worker.js deployed!" -ForegroundColor Green

# --- Step 3: Upload index.html (Reload Loop Guard) ---
Write-Host "`n[3/5] Uploading index.html with Reload Loop Guard..." -ForegroundColor Yellow

# Build the index.html with %PUBLIC_URL% replaced (production uses empty string)
$indexSource = "$BaseDir\frontend\public\index.html"
$indexTemp = "$BaseDir\frontend\public\index.html.hotfix"
(Get-Content $indexSource) -replace "%PUBLIC_URL%", "" | Set-Content $indexTemp

scp -o ServerAliveInterval=15 -o ConnectTimeout=10 $indexTemp ${User}@${HostIp}:~/index.html.hotfix
ssh -t ${User}@${HostIp} "sudo cp ~/index.html.hotfix /var/www/opticonnect/frontend/index.html && sudo chown opticonnect:opticonnect /var/www/opticonnect/frontend/index.html && rm ~/index.html.hotfix"
Remove-Item $indexTemp -Force
Write-Host "   index.html with Reload Guard deployed!" -ForegroundColor Green

# --- Step 4: Upload maintenance.html ---
Write-Host "`n[4/5] Uploading fixed maintenance.html..." -ForegroundColor Yellow
scp -o ServerAliveInterval=15 -o ConnectTimeout=10 "$BaseDir\frontend\public\maintenance.html" ${User}@${HostIp}:~/maintenance.html.hotfix
ssh -t ${User}@${HostIp} "sudo cp ~/maintenance.html.hotfix /var/www/opticonnect/frontend/maintenance.html && sudo chown opticonnect:opticonnect /var/www/opticonnect/frontend/maintenance.html && rm ~/maintenance.html.hotfix"
Write-Host "   maintenance.html deployed!" -ForegroundColor Green

# --- Step 5: Restart Nginx ---
Write-Host "`n[5/5] Restarting Nginx..." -ForegroundColor Yellow
ssh -t ${User}@${HostIp} "sudo systemctl restart nginx"
Write-Host "   Nginx restarted!" -ForegroundColor Green

Write-Host "`n=== Robust Hotfix Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "What was deployed:" -ForegroundColor Cyan
Write-Host "  1. service-worker.js  - Stops caching HTML, fresh cache name" -ForegroundColor White
Write-Host "  2. index.html         - Reload Loop Guard (blocks >3 reloads/60s)" -ForegroundColor White
Write-Host "  3. maintenance.html   - SW cache purge before reload" -ForegroundColor White
Write-Host ""
Write-Host "The client.ts and MaintenanceOverlay.tsx fixes need a full deploy." -ForegroundColor DarkYellow
Write-Host "Run deploy_master.ps1 for those to take effect." -ForegroundColor DarkYellow
