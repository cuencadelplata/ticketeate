#!/bin/bash

# Script de prueba de estrés para verificar HA bajo carga
# Simula múltiples usuarios haciendo requests simultáneos mientras se caen réplicas

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
CONCURRENT_USERS=10  # Número de usuarios simulados
REQUESTS_PER_USER=20  # Requests por usuario
URL="http://localhost/"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   PRUEBA DE ESTRÉS + ALTA DISPONIBILIDAD${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Configuración:"
echo "  - Usuarios concurrentes: $CONCURRENT_USERS"
echo "  - Requests por usuario: $REQUESTS_PER_USER"
echo "  - Total de requests: $((CONCURRENT_USERS * REQUESTS_PER_USER))"
echo "  - URL: $URL"
echo ""

# Función para hacer requests desde un "usuario"
simulate_user() {
    local user_id=$1
    local success=0
    local failures=0
    
    for i in $(seq 1 $REQUESTS_PER_USER); do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            ((success++))
        else
            ((failures++))
        fi
        
        # Pequeño delay aleatorio entre requests
        sleep 0.$((RANDOM % 5))
    done
    
    echo "$user_id,$success,$failures"
}

# Crear directorio temporal para resultados
TMP_DIR=$(mktemp -d)

echo -e "${YELLOW}Fase 1: Baseline - Sistema normal${NC}"
echo "─────────────────────────────────────────────"
echo "Generando carga con $CONCURRENT_USERS usuarios..."

# Ejecutar usuarios en paralelo
for i in $(seq 1 $CONCURRENT_USERS); do
    simulate_user $i > "$TMP_DIR/user_$i.txt" &
done

# Esperar que terminen todos
wait

# Calcular resultados de baseline
baseline_success=0
baseline_failures=0

for i in $(seq 1 $CONCURRENT_USERS); do
    if [ -f "$TMP_DIR/user_$i.txt" ]; then
        IFS=',' read -r user success failures < "$TMP_DIR/user_$i.txt"
        baseline_success=$((baseline_success + success))
        baseline_failures=$((baseline_failures + failures))
    fi
done

baseline_total=$((baseline_success + baseline_failures))
baseline_rate=$(awk "BEGIN {printf \"%.2f\", ($baseline_success/$baseline_total)*100}")

echo ""
echo "Resultados Baseline:"
echo -e "  Exitosos: ${GREEN}$baseline_success${NC}"
echo -e "  Fallidos: ${RED}$baseline_failures${NC}"
echo -e "  Tasa de éxito: ${GREEN}$baseline_rate%${NC}"

# Limpiar resultados anteriores
rm -f "$TMP_DIR/user_"*.txt

sleep 3

echo ""
echo -e "${RED}Fase 2: Prueba con Caída de Réplica${NC}"
echo "─────────────────────────────────────────────"
echo "Iniciando carga + simulando caída de réplica..."

# Ejecutar usuarios en paralelo
for i in $(seq 1 $CONCURRENT_USERS); do
    simulate_user $i > "$TMP_DIR/user_$i.txt" &
done

# Esperar 2 segundos y luego detener una réplica
sleep 2
echo ""
echo -e "${RED}⚠ Deteniendo réplica: ticketeate-next-frontend-1${NC}"
docker stop ticketeate-next-frontend-1 > /dev/null 2>&1

# Esperar que terminen todos los requests
wait

# Calcular resultados con falla
ha_success=0
ha_failures=0

for i in $(seq 1 $CONCURRENT_USERS); do
    if [ -f "$TMP_DIR/user_$i.txt" ]; then
        IFS=',' read -r user success failures < "$TMP_DIR/user_$i.txt"
        ha_success=$((ha_success + success))
        ha_failures=$((ha_failures + failures))
    fi
done

ha_total=$((ha_success + ha_failures))
ha_rate=$(awk "BEGIN {printf \"%.2f\", ($ha_success/$ha_total)*100}")

echo ""
echo "Resultados con Réplica Caída:"
echo -e "  Exitosos: ${GREEN}$ha_success${NC}"
echo -e "  Fallidos: ${RED}$ha_failures${NC}"
echo -e "  Tasa de éxito: ${GREEN}$ha_rate%${NC}"

# Restaurar réplica
echo ""
echo -e "${GREEN}♻ Restaurando réplica...${NC}"
docker start ticketeate-next-frontend-1 > /dev/null 2>&1
sleep 3
echo -e "${GREEN}✓ Réplica restaurada${NC}"

# Limpiar
rm -rf "$TMP_DIR"

# Resumen comparativo
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   RESUMEN COMPARATIVO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
printf "%-25s %-15s %-15s %-15s\n" "Escenario" "Exitosos" "Fallidos" "Tasa Éxito"
printf "%-25s %-15s %-15s %-15s\n" "-------------------------" "---------------" "---------------" "---------------"
printf "%-25s ${GREEN}%-15s${NC} ${RED}%-15s${NC} ${GREEN}%-15s${NC}\n" "Baseline (normal)" "$baseline_success" "$baseline_failures" "$baseline_rate%"
printf "%-25s ${GREEN}%-15s${NC} ${RED}%-15s${NC} ${GREEN}%-15s${NC}\n" "Con réplica caída" "$ha_success" "$ha_failures" "$ha_rate%"

echo ""

# Calcular degradación
degradation=$(awk "BEGIN {printf \"%.2f\", $baseline_rate - $ha_rate}")

if (( $(echo "$ha_rate >= 95" | bc -l) )); then
    echo -e "${GREEN}✓ PRUEBA EXITOSA${NC}"
    echo -e "  Alta Disponibilidad funcionando correctamente"
    echo -e "  Degradación: ${YELLOW}${degradation}%${NC}"
elif (( $(echo "$ha_rate >= 90" | bc -l) )); then
    echo -e "${YELLOW}⚠ PRUEBA ACEPTABLE${NC}"
    echo -e "  Sistema mantiene operatividad con degradación aceptable"
    echo -e "  Degradación: ${YELLOW}${degradation}%${NC}"
else
    echo -e "${RED}✗ PRUEBA FALLIDA${NC}"
    echo -e "  Sistema no mantiene disponibilidad adecuada"
    echo -e "  Degradación: ${RED}${degradation}%${NC}"
fi

echo ""
echo -e "${BLUE}Prueba completada.${NC}"
