#!/bin/bash

# Script para monitorear el estado de salud de todas las réplicas

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   MONITOR DE SALUD - ALTA DISPONIBILIDAD${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Función para verificar health de un contenedor
check_container_health() {
    local container=$1
    local port=$2
    
    # Obtener estado del contenedor
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not_found")
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
    
    if [ "$status" = "running" ]; then
        if [ "$health" = "healthy" ] || [ "$health" = "none" ]; then
            echo -e "${GREEN}✓${NC} $container (puerto $port) - ${GREEN}Saludable${NC}"
        else
            echo -e "${YELLOW}⚠${NC} $container (puerto $port) - ${YELLOW}$health${NC}"
        fi
    else
        echo -e "${RED}✗${NC} $container (puerto $port) - ${RED}$status${NC}"
    fi
}

# Función para verificar endpoint de salud via HTTP
check_http_health() {
    local url=$1
    local name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $name - ${GREEN}HTTP 200${NC}"
    else
        echo -e "${RED}✗${NC} $name - ${RED}HTTP $response${NC}"
    fi
}

echo -e "${BLUE}[NGINX Load Balancer]${NC}"
echo "─────────────────────────────────────────────"
check_container_health "ticketeate-nginx" "80"
check_http_health "http://localhost/health" "NGINX Health Endpoint"
check_http_health "http://localhost/health/status" "NGINX Status Page"
echo ""

echo -e "${BLUE}[Next.js Frontend - 2 Réplicas]${NC}"
echo "─────────────────────────────────────────────"
check_container_health "ticketeate-next-frontend-1" "3000"
check_container_health "ticketeate-next-frontend-2" "3000"
echo ""

echo -e "${BLUE}[Checkout Service - 2 Réplicas]${NC}"
echo "─────────────────────────────────────────────"
check_container_health "ticketeate-svc-checkout-1" "3001"
check_container_health "ticketeate-svc-checkout-2" "3001"
echo ""

echo -e "${BLUE}[Events Service - 2 Réplicas]${NC}"
echo "─────────────────────────────────────────────"
check_container_health "ticketeate-svc-events-1" "3002"
check_container_health "ticketeate-svc-events-2" "3002"
echo ""

echo -e "${BLUE}[Producers Service - 2 Réplicas]${NC}"
echo "─────────────────────────────────────────────"
check_container_health "ticketeate-svc-producers-1" "3003"
check_container_health "ticketeate-svc-producers-2" "3003"
echo ""

echo -e "${BLUE}[Users Service - 2 Réplicas]${NC}"
echo "─────────────────────────────────────────────"
check_container_health "ticketeate-svc-users-1" "3004"
check_container_health "ticketeate-svc-users-2" "3004"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   RESUMEN DE CONTENEDORES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -n 1
docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tail -n +2 | sort

echo ""
total=$(docker ps --filter "name=ticketeate-" --format "{{.Names}}" | wc -l)
running=$(docker ps --filter "name=ticketeate-" --filter "status=running" --format "{{.Names}}" | wc -l)

echo -e "Total de contenedores: ${BLUE}$total${NC}"
echo -e "Contenedores corriendo: ${GREEN}$running${NC}"

if [ "$running" -eq "$total" ]; then
    echo -e "\n${GREEN}✓ Todos los servicios están operativos${NC}"
else
    echo -e "\n${RED}⚠ Algunos servicios no están corriendo${NC}"
fi

echo ""
echo -e "${YELLOW}Tip: Ejecuta 'watch -n 2 ./scripts/monitor-ha.sh' para monitoreo en tiempo real${NC}"
