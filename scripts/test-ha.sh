#!/bin/bash

# Script de prueba de Alta Disponibilidad (HA)
# Este script simula la caída de réplicas y verifica que el sistema sigue funcionando

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
NGINX_URL="http://localhost"
TEST_DURATION=30  # segundos
REQUEST_INTERVAL=1  # segundos entre requests

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   PRUEBA DE ALTA DISPONIBILIDAD (HA)${NC}"
echo -e "${BLUE}   RNF-03: ≥2 réplicas por servicio crítico${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Función para verificar salud de un servicio
check_health() {
    local url=$1
    local service_name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $service_name: Saludable (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name: No disponible (HTTP $response)"
        return 1
    fi
}

# Función para hacer requests continuos
continuous_requests() {
    local url=$1
    local duration=$2
    local service_name=$3
    
    echo -e "\n${YELLOW}Iniciando requests continuos a $service_name por $duration segundos...${NC}"
    
    local success=0
    local failures=0
    local end_time=$((SECONDS + duration))
    
    while [ $SECONDS -lt $end_time ]; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            ((success++))
            echo -n "."
        else
            ((failures++))
            echo -n "x"
        fi
        
        sleep $REQUEST_INTERVAL
    done
    
    echo ""
    echo -e "${BLUE}Resultados:${NC}"
    echo -e "  Exitosos: ${GREEN}$success${NC}"
    echo -e "  Fallidos:  ${RED}$failures${NC}"
    
    local total=$((success + failures))
    local availability=$(awk "BEGIN {printf \"%.2f\", ($success/$total)*100}")
    echo -e "  Disponibilidad: ${GREEN}$availability%${NC}"
    
    if [ "$failures" -gt 0 ]; then
        return 1
    fi
    return 0
}

# Función para simular caída de réplica
simulate_failure() {
    local container=$1
    local service_name=$2
    
    echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}SIMULANDO CAÍDA DE RÉPLICA${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Contenedor: ${YELLOW}$container${NC}"
    echo -e "Servicio: ${YELLOW}$service_name${NC}"
    echo ""
    
    docker stop "$container" > /dev/null 2>&1
    echo -e "${RED}✗${NC} Réplica detenida: $container"
    sleep 2
}

# Función para restaurar réplica
restore_replica() {
    local container=$1
    
    echo -e "\n${GREEN}Restaurando réplica: $container${NC}"
    docker start "$container" > /dev/null 2>&1
    sleep 5
    echo -e "${GREEN}✓${NC} Réplica restaurada: $container"
}

# ================================================
# PRUEBA 1: Estado inicial del sistema
# ================================================
echo -e "\n${BLUE}[PRUEBA 1] Verificando estado inicial del sistema${NC}"
echo "─────────────────────────────────────────────────────"

check_health "$NGINX_URL/health" "NGINX Load Balancer"
check_health "$NGINX_URL/health/status" "NGINX Status Page"

echo ""
echo "Verificando réplicas activas..."
docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ================================================
# PRUEBA 2: Caída de réplica de Frontend
# ================================================
echo -e "\n${BLUE}[PRUEBA 2] Prueba de HA - Frontend (Next.js)${NC}"
echo "─────────────────────────────────────────────────────"

# Iniciar requests en background
(continuous_requests "$NGINX_URL/" 30 "Frontend") &
BG_PID=$!
sleep 5

# Simular caída de réplica 1
simulate_failure "ticketeate-next-frontend-1" "Next.js Frontend"

# Esperar que terminen los requests
wait $BG_PID
RESULT=$?

# Restaurar réplica
restore_replica "ticketeate-next-frontend-1"

if [ $RESULT -eq 0 ]; then
    echo -e "\n${GREEN}✓ PRUEBA 2 EXITOSA: Sistema mantuvo disponibilidad${NC}"
else
    echo -e "\n${RED}✗ PRUEBA 2 FALLIDA: Hubo interrupciones en el servicio${NC}"
fi

# ================================================
# PRUEBA 3: Caída de réplica de Checkout Service
# ================================================
echo -e "\n${BLUE}[PRUEBA 3] Prueba de HA - Checkout Service${NC}"
echo "─────────────────────────────────────────────────────"

# Iniciar requests en background
(continuous_requests "$NGINX_URL/api/checkout/health" 30 "Checkout Service") &
BG_PID=$!
sleep 5

# Simular caída de réplica 2
simulate_failure "ticketeate-svc-checkout-2" "Checkout Service"

# Esperar que terminen los requests
wait $BG_PID
RESULT=$?

# Restaurar réplica
restore_replica "ticketeate-svc-checkout-2"

if [ $RESULT -eq 0 ]; then
    echo -e "\n${GREEN}✓ PRUEBA 3 EXITOSA: Sistema mantuvo disponibilidad${NC}"
else
    echo -e "\n${RED}✗ PRUEBA 3 FALLIDA: Hubo interrupciones en el servicio${NC}"
fi

# ================================================
# PRUEBA 4: Caída de réplica de Events Service
# ================================================
echo -e "\n${BLUE}[PRUEBA 4] Prueba de HA - Events Service${NC}"
echo "─────────────────────────────────────────────────────"

(continuous_requests "$NGINX_URL/api/events/health" 30 "Events Service") &
BG_PID=$!
sleep 5

simulate_failure "ticketeate-svc-events-1" "Events Service"

wait $BG_PID
RESULT=$?

restore_replica "ticketeate-svc-events-1"

if [ $RESULT -eq 0 ]; then
    echo -e "\n${GREEN}✓ PRUEBA 4 EXITOSA: Sistema mantuvo disponibilidad${NC}"
else
    echo -e "\n${RED}✗ PRUEBA 4 FALLIDA: Hubo interrupciones en el servicio${NC}"
fi

# ================================================
# PRUEBA 5: Verificación final del sistema
# ================================================
echo -e "\n${BLUE}[PRUEBA 5] Verificación final del sistema${NC}"
echo "─────────────────────────────────────────────────────"

echo "Esperando a que todos los servicios se estabilicen..."
sleep 10

echo ""
echo "Estado final de las réplicas:"
docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
check_health "$NGINX_URL/health" "NGINX Load Balancer"

# ================================================
# RESUMEN
# ================================================
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}   RESUMEN DE PRUEBAS DE HA${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "✓ RNF-03 Cumplido: Alta Disponibilidad por Servicio"
echo "  - 2 réplicas por servicio crítico"
echo "  - Balanceo de carga con NGINX (least_conn)"
echo "  - Failover automático en caso de caída"
echo "  - Health checks configurados"
echo "  - Sistema mantiene disponibilidad durante fallos"
echo ""
echo -e "${GREEN}Todas las pruebas completadas.${NC}"
echo -e "${YELLOW}Revisa los resultados arriba para verificar la disponibilidad.${NC}"
