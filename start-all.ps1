# Start all Docker services on the same network
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   ShearchDeep - Start All Services" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Create shared network if it doesn't exist
docker network create app-network 2>$null | Out-Null

Write-Host "[1/5] Starting Keycloak (Auth Server on port 8080)..." -ForegroundColor Cyan
docker compose -f Keyclock/docker-compose.yaml up -d
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[2/5] Starting Backend (Spring App on port 8082, PostgreSQL on port 5433)..." -ForegroundColor Cyan
docker compose -f backend/docker-compose.yml up -d
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[3/5] Starting Ollama (LLM on port 11434)..." -ForegroundColor Cyan
docker compose -f ollama/docker-compose.yml up -d
docker network connect app-network ollama 2>$null | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[4/5] Starting Mayan (Document Management on port 80)..." -ForegroundColor Cyan
docker compose -f mayan/docker-compose.yml -p mayan up -d
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[5/5] Connecting Mayan services to app-network..." -ForegroundColor Cyan
@('mayan-app-1', 'mayan-postgresql-1', 'mayan-rabbitmq-1', 'mayan-redis-1') | ForEach-Object {
  docker network connect app-network $_ 2>$null | Out-Null
}
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   All Services Running!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "   - Keycloak:       http://localhost:8080"
Write-Host "   - Backend:        http://localhost:8082"
Write-Host "   - Ollama:         http://localhost:11434"
Write-Host "   - Mayan:          http://localhost:80"
Write-Host ""
Write-Host "Databases:" -ForegroundColor Yellow
Write-Host "   - Keycloak DB:    localhost:5432 (user: kc / password: kc_password)"
Write-Host "   - Backend DB:     localhost:5433 (user: admin / password: 123456)"
Write-Host "   - Mayan DB:       Inside container (postgresql service)"
Write-Host ""
Write-Host "Network:" -ForegroundColor Yellow
Write-Host "   - All services communicate on: app-network"
Write-Host ""
Write-Host "Services Status:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""
Write-Host "Setup complete! Start using your services." -ForegroundColor Green
Write-Host ""
