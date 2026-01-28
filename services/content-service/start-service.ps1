# Start Content Service
Write-Host "=== Starting Content Service ===" -ForegroundColor Green
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Cyan

# Set environment
$env:NODE_ENV = "development"

# Change to script directory
Set-Location $PSScriptRoot
Write-Host "Changed to: $(Get-Location)" -ForegroundColor Cyan

# Start service
Write-Host "`nStarting Node.js..." -ForegroundColor Yellow
node dist/main.js
