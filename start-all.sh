#!/bin/bash

# Start all Docker services on the same network
cd "$(dirname "$0")"

echo ""
echo "========================================="
echo "   ShearchDeep - Start All Services"
echo "========================================="
echo ""

# Create shared network if it doesn't exist
docker network create app-network 2>/dev/null || true

echo "[1/5] Starting Keycloak (Auth Server on port 8080)..."
docker compose -f Keyclock/docker-compose.yaml up -d
sleep 2

echo ""
echo "[2/5] Starting Backend (Spring App on port 8082, PostgreSQL on port 5433)..."
docker compose -f backend/docker-compose.yml up -d
sleep 2

echo ""
echo "[3/5] Starting Ollama (LLM on port 11434)..."
docker compose -f ollama/docker-compose.yml up -d
docker network connect app-network ollama 2>/dev/null || true
sleep 2

echo ""
echo "[4/5] Starting Mayan (Document Management on port 80)..."
docker compose -f mayan/docker-compose.yml -p mayan up -d
sleep 3

echo ""
echo "[5/5] Connecting Mayan services to app-network..."
for container in mayan-app-1 mayan-postgresql-1 mayan-rabbitmq-1 mayan-redis-1; do
  docker network connect app-network "$container" 2>/dev/null || true
done
sleep 1

echo ""
echo "========================================="
echo "   All Services Running!"
echo "========================================="
echo ""
echo "📍 Service URLs:"
echo "   - Keycloak:       http://localhost:8080"
echo "   - Backend:        http://localhost:8082"
echo "   - Ollama:         http://localhost:11434"
echo "   - Mayan:          http://localhost:80"
echo ""
echo "🗄️  Databases:"
echo "   - Keycloak DB:    localhost:5432 (user: kc / password: kc_password)"
echo "   - Backend DB:     localhost:5433 (user: admin / password: 123456)"
echo "   - Mayan DB:       Inside container (postgresql service)"
echo ""
echo "🌐 All services communicate on: app-network"
echo ""
echo "Services Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "✅ Setup complete! Start using your services."
echo ""
