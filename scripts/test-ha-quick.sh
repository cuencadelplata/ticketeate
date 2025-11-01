#!/bin/bash

# Script simplificado para pruebas rápidas de HA
# Simula la caída de una réplica específica mientras se hacen requests

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $# -lt 2 ]; then
    echo "Uso: $0 <contenedor> <url>"
    echo ""
    echo "Ejemplos:"
    echo "  $0 ticketeate-next-frontend-1 http://localhost/"
    echo "  $0 ticketeate-svc-checkout-2 http://localhost/api/checkout/health"
    echo "  $0 ticketeate-svc-events-1 http://localhost/api/events/health"
    echo ""
    echo "Contenedores disponibles:"
    docker ps --filter "name=ticketeate-" --format "  - {{.Names}}"
    exit 1
fi

CONTAINER=$1
URL=$2
DURATION=20  # segundos

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   PRUEBA RÁPIDA DE HA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Contenedor a detener: $CONTAINER"
echo "URL de prueba: $URL"
echo "Duración: $DURATION segundos"
echo ""

# Verificar que el contenedor existe
if ! docker ps --format "{{.Names}}" | grep -q "^$CONTAINER$"; then
    echo -e "${RED}Error: Contenedor '$CONTAINER' no encontrado o no está corriendo${NC}"
    exit 1
fi

# Función para hacer requests
make_requests() {
    local success=0
    local failures=0
    local end_time=$((SECONDS + DURATION))
    
    echo -e "${YELLOW}Iniciando requests continuos...${NC}"
    
    while [ $SECONDS -lt $end_time ]; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            ((success++))
            echo -n "."
        else
            ((failures++))
            echo -n "${RED}x${NC}"
        fi
        
        sleep 0.5
    done
    
    echo ""
    echo ""
    echo -e "${BLUE}Resultados:${NC}"
    echo -e "  Exitosos: ${GREEN}$success${NC}"
    echo -e "  Fallidos:  ${RED}$failures${NC}"
    
    local total=$((success + failures))
    if [ $total -gt 0 ]; then
        local availability=$(awk "BEGIN {printf \"%.2f\", ($success/$total)*100}")
        echo -e "  Disponibilidad: ${GREEN}$availability%${NC}"
        
        if [ "$failures" -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ PRUEBA EXITOSA: 100% de disponibilidad mantenida${NC}"
        else
            echo ""
            echo -e "${YELLOW}⚠ ADVERTENCIA: Hubo $failures fallos durante la prueba${NC}"
        fi
    fi
}

# Iniciar requests en background
make_requests &
BG_PID=$!

# Esperar un poco antes de simular la falla
sleep 5

# Simular caída
echo ""
echo -e "${RED}⚠ Deteniendo réplica: $CONTAINER${NC}"
docker stop "$CONTAINER" > /dev/null 2>&1
echo -e "${RED}✗ Réplica detenida${NC}"

# Esperar que terminen los requests
wait $BG_PID

# Restaurar
echo ""
echo -e "${GREEN}♻ Restaurando réplica...${NC}"
docker start "$CONTAINER" > /dev/null 2>&1
sleep 3
echo -e "${GREEN}✓ Réplica restaurada${NC}"

# Verificar estado
echo ""
echo "Estado de las réplicas:"
docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}"
