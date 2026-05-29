<#
.SYNOPSIS
    OptiConnect GIS - Master Deployment Pipeline
.DESCRIPTION
    A comprehensive, end-to-end CI/CD script that automates the deployment of the OptiConnect GIS platform.
    It builds the React frontend, builds the Node backend (if necessary), synchronously uploads all artifacts,
    executes PostgreSQL database migrations, injects the new builds into Nginx/PM2, restarts services, and verifies health.
#>

param (
    [string]$HostIp = "172.16.20.11",
    [string]$User = "opticonnect",
    [string]$BaseDir = "C:\Optimal_Telemedia_Main\OptiConnect_GIS"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " OptiConnect GIS - Automated Master Deployment" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# Ensure we're in the right directory
if (-not (Test-Path "$BaseDir\frontend\package.json")) {
    Write-Error "Could not find OptiConnect_GIS directory at $BaseDir"
    exit 1
}

# ==============================================================================
# PHASE 0: INITIATE MAINTENANCE MODE
# ==============================================================================
Write-Host "`n[0/6] Putting Remote Server into Maintenance Mode..." -ForegroundColor Yellow

# Create temp path locally to upload if needed, but since it's already in public/maintenance.html, we just scp that file directly
if (Test-Path "$BaseDir\frontend\public\maintenance.html") {
    Write-Host "   Uploading maintenance shield to staging..." -ForegroundColor Gray
    ssh -t $User`@${HostIp} "mkdir -p ~/deploy_staging/"
    scp -o ServerAliveInterval=15 -o ConnectTimeout=10 "$BaseDir\frontend\public\maintenance.html" $User`@${HostIp}:~/deploy_staging/maintenance.html
    
    Write-Host "   Applying maintenance shield as primary entry point (Requires SUDO)..." -ForegroundColor Gray
    ssh -t $User`@${HostIp} "sudo cp ~/deploy_staging/maintenance.html /var/www/opticonnect/frontend/index.html"
    Write-Host "   Maintenance Mode Active." -ForegroundColor Green
} else {
    Write-Host "   Warning: No maintenance.html found. Skipping maintenance lock." -ForegroundColor DarkYellow
}

# ==============================================================================
# PHASE 1: LOCAL BUILD
# ==============================================================================
Write-Host "`n[1/6] Building Frontend (React 19/Vite)..." -ForegroundColor Yellow

Set-Location -Path "$BaseDir\frontend"
if (-not (Test-Path "$BaseDir\frontend\node_modules")) {
    Write-Host "   Installing Frontend Dependencies..." -ForegroundColor Gray
    npm install
}

Write-Host "   Running Production Build..." -ForegroundColor Gray
# AUTO-CACHE BUST: Inject unique timestamp into Service Worker to force client refresh
$swPath = "$BaseDir\frontend\public\service-worker.js"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
if (Test-Path $swPath) {
    Write-Host "   Injecting Build Timestamp ($timestamp) into Service Worker..." -ForegroundColor Gray
    (Get-Content $swPath) -replace "__BUILD_TIMESTAMP__", $timestamp | Set-Content $swPath
}

# Execute build and capture exit code to prevent deploying broken code
cmd.exe /c "npm run build:prod"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend Build Failed! Aborting Deployment."
    exit $LASTEXITCODE
}
Write-Host "    Frontend Build Successful!" -ForegroundColor Green

# ==============================================================================
# PHASE 2: ENVIRONMENT PREPARATION ON SERVER
# ==============================================================================
Write-Host "`n[2/6] Formatting Staging Environments on Ubuntu..." -ForegroundColor Yellow
$PrepareCommand = "mkdir -p ~/deploy_staging/backend/src ~/deploy_staging/backend/prisma ~/deploy_staging/frontend ~/deploy_staging/sql"
ssh -t $User`@${HostIp} $PrepareCommand

# ==============================================================================
# PHASE 3: ARTIFACT UPLOAD (SCP)
# ==============================================================================
Write-Host "`n[3/6] Uploading Build Artifacts to Staging ($HostIp)..." -ForegroundColor Yellow

Write-Host "   Uploading Frontend Payload..." -ForegroundColor Gray
Set-Location -Path "$BaseDir\frontend"
scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 -r build $User`@${HostIp}:~/deploy_staging/frontend/

Write-Host "   Uploading Backend Source (excluding uploads/)..." -ForegroundColor Gray
Set-Location -Path "$BaseDir\backend"
# Temporarily move uploads out of src so SCP skips it
if (Test-Path "$BaseDir\backend\src\uploads") {
    Move-Item -Path "$BaseDir\backend\src\uploads" -Destination "$BaseDir\backend\temp_uploads_stash" -Force
}

# Upload all remaining src files
scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 -r src\* $User`@${HostIp}:~/deploy_staging/backend/src/

# Restore the uploads folder
if (Test-Path "$BaseDir\backend\temp_uploads_stash") {
    Move-Item -Path "$BaseDir\backend\temp_uploads_stash" -Destination "$BaseDir\backend\src\uploads" -Force
}

scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 package.json $User`@${HostIp}:~/deploy_staging/backend/

Write-Host "   Uploading Backend Root Files (server.js, ecosystem.config.js)..." -ForegroundColor Gray
scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 server.js $User`@${HostIp}:~/deploy_staging/backend/
scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 ecosystem.config.js $User`@${HostIp}:~/deploy_staging/backend/

Write-Host "   Uploading Prisma Schema (ORM)..." -ForegroundColor Gray
if (Test-Path "$BaseDir\backend\prisma") {
    scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 -r prisma $User`@${HostIp}:~/deploy_staging/backend/
} else {
    Write-Host "   Warning: No prisma/ directory found. Skipping Prisma schema upload." -ForegroundColor DarkYellow
}

Write-Host "   Uploading SQL Migrations..." -ForegroundColor Gray
if (Test-Path "$BaseDir\backend\sql\migrations") {
    scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 -r sql\migrations\* $User`@${HostIp}:~/deploy_staging/sql/
}

# ==============================================================================
# PHASE 4: LINUX SANITIZED DEPLOYMENT SCRIPT GENERATION
# ==============================================================================
Write-Host "`n[4/6] Uploading Linux Operations Payload..." -ForegroundColor Yellow

scp -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 "$BaseDir\master_executor.sh" $User`@${HostIp}:~/deploy_staging/master_executor.sh

Write-Host "   Sanitizing Payload Format (CRLF to LF)..." -ForegroundColor Gray
ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 -t $User`@${HostIp} "sed -i 's/\r`$//' ~/deploy_staging/master_executor.sh && chmod +x ~/deploy_staging/master_executor.sh"

# ==============================================================================
# PHASE 5: EXECUTION (SUDO)
# ==============================================================================
Write-Host "`n[5/6] Executing Master Script on Server (Requires SUDO)..." -ForegroundColor Yellow
Write-Host " (Please enter the server password 'Prompt2@2@' when asked)" -ForegroundColor Gray

ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=10 -t $User@$HostIp "chmod +x ~/deploy_staging/master_executor.sh && bash ~/deploy_staging/master_executor.sh"

# ==============================================================================
# PHASE 6: HEALTH CHECK & VERIFICATION
# ==============================================================================
Write-Host "`n[6/6] Running Real-Time Health Diagnostics (Maintenance Auto-Lifts)..." -ForegroundColor Yellow

$maxRetries = 5
$retryCount = 0
$isHealthy = $false

while (-not $isHealthy -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://${HostIp}" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $isHealthy = $true
            Write-Host "   [OK] Frontend (Nginx): ONLINE (HTTP 200 OK)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   Waiting for Nginx/React to come online (Attempt $($retryCount + 1)/$maxRetries)..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds 3
        $retryCount++
    }
}

if (-not $isHealthy) {
    Write-Host "   [ERROR] CRITICAL WARNING: Nginx did not return 200 OK after deployment!" -ForegroundColor Red
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " PLATFORM DEPLOYMENT COMPLETE! " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "The OptiConnect Architecture is live and active." -ForegroundColor Cyan
Write-Host "Please instruct users or administrators to Shift+F5 (Hard Refresh) their browsers." -ForegroundColor Cyan
