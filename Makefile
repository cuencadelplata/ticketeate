.PHONY: help start stop restart status logs monitor test-ha test-ha-quick test-ha-stress clean build rebuild

# Variables
COMPOSE=docker-compose
SCRIPTS_DIR=./scripts

# Colores para output
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

## help: Muestra esta ayuda
help:
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)   Ticketeate - Alta Disponibilidad (HA)$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "Comandos disponibles:"
	@echo ""
	@echo "  $(GREEN)make start$(NC)           - Iniciar todos los servicios con HA"
	@echo "  $(GREEN)make stop$(NC)            - Detener todos los servicios"
	@echo "  $(GREEN)make restart$(NC)         - Reiniciar todos los servicios"
	@echo "  $(GREEN)make rebuild$(NC)         - Reconstruir y reiniciar servicios"
	@echo "  $(GREEN)make status$(NC)          - Ver estado de los contenedores"
	@echo "  $(GREEN)make logs$(NC)            - Ver logs de todos los servicios"
	@echo "  $(GREEN)make monitor$(NC)         - Monitorear salud de servicios"
	@echo "  $(GREEN)make monitor-watch$(NC)   - Monitoreo en tiempo real (actualiza cada 2s)"
	@echo "  $(GREEN)make test-ha$(NC)         - Ejecutar pruebas completas de HA (~3 min)"
	@echo "  $(GREEN)make demo-ha$(NC)         - Demo simple con 3 servicios (QUICK)"
	@echo "  $(GREEN)make demo-completo$(NC)   - Demo completa con 5 servicios × 2 réplicas"
	@echo "  $(GREEN)make demo-manual$(NC)     - Instrucciones para demo manual (3 terminales)"
	@echo "  $(GREEN)make test-ha-real$(NC)    - Probar HA de TODOS los servicios reales"
	@echo "  $(GREEN)make test-ha-quick$(NC)   - Ejecutar prueba rápida de HA (~20 seg)"
	@echo "  $(GREEN)make test-ha-stress$(NC)  - Ejecutar prueba de estrés (~1 min)"
	@echo "  $(GREEN)make clean$(NC)           - Limpiar contenedores y volúmenes"
	@echo "  $(GREEN)make health$(NC)          - Verificar health endpoints vía HTTP"
	@echo ""

## start: Iniciar todos los servicios
start:
	@echo "$(BLUE)Iniciando servicios con Alta Disponibilidad...$(NC)"
	$(COMPOSE) up -d
	@echo "$(GREEN)✓ Servicios iniciados$(NC)"
	@echo ""
	@echo "Esperando que los servicios estén listos (30 segundos)..."
	@sleep 30
	@$(MAKE) status

## stop: Detener todos los servicios
stop:
	@echo "$(YELLOW)Deteniendo todos los servicios...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)✓ Servicios detenidos$(NC)"

## restart: Reiniciar todos los servicios
restart:
	@echo "$(YELLOW)Reiniciando servicios...$(NC)"
	$(COMPOSE) restart
	@echo "$(GREEN)✓ Servicios reiniciados$(NC)"

## rebuild: Reconstruir imágenes y reiniciar
rebuild:
	@echo "$(BLUE)Reconstruyendo imágenes...$(NC)"
	$(COMPOSE) up -d --build
	@echo "$(GREEN)✓ Servicios reconstruidos y reiniciados$(NC)"

## status: Ver estado de contenedores
status:
	@echo "$(BLUE)Estado de contenedores:$(NC)"
	@echo ""
	@$(COMPOSE) ps
	@echo ""
	@echo "$(BLUE)Resumen:$(NC)"
	@echo "  Total: $$(docker ps --filter 'name=ticketeate-' --format '{{.Names}}' | wc -l | tr -d ' ') contenedores"
	@echo "  Running: $$(docker ps --filter 'name=ticketeate-' --filter 'status=running' --format '{{.Names}}' | wc -l | tr -d ' ') contenedores"

## logs: Ver logs de todos los servicios
logs:
	$(COMPOSE) logs -f

## logs-service: Ver logs de un servicio específico (usar: make logs-service SERVICE=nginx)
logs-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)Uso: make logs-service SERVICE=<nombre>$(NC)"; \
		echo "Servicios disponibles:"; \
		docker ps --filter "name=ticketeate-" --format "  - {{.Names}}"; \
	else \
		docker logs -f ticketeate-$(SERVICE); \
	fi

## monitor: Monitorear salud de servicios (una vez)
monitor:
	@$(SCRIPTS_DIR)/monitor-ha.sh

## monitor-watch: Monitoreo en tiempo real (actualiza cada 2 segundos)
monitor-watch:
	@echo "$(BLUE)Monitoreo en tiempo real (Ctrl+C para salir)$(NC)"
	@watch -n 2 $(SCRIPTS_DIR)/monitor-ha.sh

## test-ha: Ejecutar pruebas completas de HA
test-ha:
	@echo "$(BLUE)Ejecutando pruebas completas de Alta Disponibilidad...$(NC)"
	@$(SCRIPTS_DIR)/test-ha.sh

## test-ha-real: Probar HA de TODOS los servicios reales de Ticketeate
test-ha-real:
	@echo "$(BLUE)Probando Alta Disponibilidad en servicios reales...$(NC)"
	@$(SCRIPTS_DIR)/test-ha-real.sh

## test-ha-quick: Ejecutar prueba rápida (requiere CONTAINER y URL)
test-ha-quick:
	@if [ -z "$(CONTAINER)" ] || [ -z "$(URL)" ]; then \
		echo "$(YELLOW)Uso: make test-ha-quick CONTAINER=<nombre> URL=<url>$(NC)"; \
		echo ""; \
		echo "Ejemplo:"; \
		echo "  make test-ha-quick CONTAINER=next-frontend-1 URL=http://localhost/"; \
		echo ""; \
		echo "Contenedores disponibles:"; \
		docker ps --filter "name=ticketeate-" --format "  - {{.Names}}" | sed 's/ticketeate-//g'; \
	else \
		$(SCRIPTS_DIR)/test-ha-quick.sh ticketeate-$(CONTAINER) $(URL); \
	fi

## test-ha-stress: Ejecutar prueba de estrés con carga
test-ha-stress:
	@echo "$(BLUE)Ejecutando prueba de estrés con Alta Disponibilidad...$(NC)"
	@$(SCRIPTS_DIR)/test-ha-stress.sh

## health: Verificar health endpoints vía HTTP
health:
	@echo "$(BLUE)Verificando health endpoints:$(NC)"
	@echo ""
	@echo -n "NGINX Load Balancer: "
	@curl -s http://localhost/health > /dev/null && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAIL$(NC)"
	@echo -n "NGINX Status Page:   "
	@curl -s http://localhost/health/status > /dev/null && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAIL$(NC)"
	@echo -n "Frontend:            "
	@curl -s http://localhost/ > /dev/null && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAIL$(NC)"

## clean: Limpiar contenedores, redes y volúmenes
clean:
	@echo "$(YELLOW)Limpiando contenedores, redes y volúmenes...$(NC)"
	$(COMPOSE) down -v
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

## clean-all: Limpiar todo incluyendo imágenes
clean-all:
	@echo "$(RED)Limpiando TODO (contenedores, redes, volúmenes e imágenes)...$(NC)"
	$(COMPOSE) down -v --rmi all
	@echo "$(GREEN)✓ Limpieza completa realizada$(NC)"

## build: Construir imágenes sin iniciar
build:
	@echo "$(BLUE)Construyendo imágenes...$(NC)"
	$(COMPOSE) build
	@echo "$(GREEN)✓ Imágenes construidas$(NC)"

## ps: Listar todos los contenedores de Ticketeate
ps:
	@docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

## exec: Ejecutar comando en un contenedor (usar: make exec SERVICE=nginx CMD="ls -la")
exec:
	@if [ -z "$(SERVICE)" ] || [ -z "$(CMD)" ]; then \
		echo "$(YELLOW)Uso: make exec SERVICE=<nombre> CMD=\"<comando>\"$(NC)"; \
		echo ""; \
		echo "Ejemplo:"; \
		echo "  make exec SERVICE=nginx CMD=\"nginx -t\""; \
		echo "  make exec SERVICE=next-frontend-1 CMD=\"ls -la\""; \
	else \
		docker exec -it ticketeate-$(SERVICE) $(CMD); \
	fi

## shell: Abrir shell en un contenedor (usar: make shell SERVICE=nginx)
shell:
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)Uso: make shell SERVICE=<nombre>$(NC)"; \
		echo ""; \
		echo "Servicios disponibles:"; \
		docker ps --filter "name=ticketeate-" --format "  - {{.Names}}" | sed 's/ticketeate-//g'; \
	else \
		docker exec -it ticketeate-$(SERVICE) /bin/sh; \
	fi

## demo: Demostración rápida de HA (5 minutos)
demo:
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)   DEMOSTRACIÓN DE ALTA DISPONIBILIDAD$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(GREEN)1. Iniciando sistema...$(NC)"
	@$(MAKE) start
	@echo ""
	@echo "$(GREEN)2. Estado inicial:$(NC)"
	@$(MAKE) status
	@echo ""
	@echo "$(GREEN)3. Salud de servicios:$(NC)"
	@$(MAKE) monitor
	@echo ""
	@echo "$(GREEN)4. Ejecutando prueba de HA...$(NC)"
	@$(MAKE) test-ha
	@echo ""
	@echo "$(GREEN)✓ Demostración completada$(NC)"

## demo-ha: Demo simple con 3 servicios (versión original)
demo-ha:
	@echo "$(BLUE)Iniciando demo simple de HA...$(NC)"
	@bash $(SCRIPTS_DIR)/demo-ha-simple.sh

## demo-completo: Demo completa con 5 servicios × 2 réplicas (RECOMENDADO)
demo-completo:
	@echo "$(BLUE)Iniciando demo completa de HA (5 servicios)...$(NC)"
	@bash $(SCRIPTS_DIR)/demo-ha-completo.sh

## demo-manual: Instrucciones para demo manual con 3 terminales
demo-manual:
	@bash $(SCRIPTS_DIR)/demo-manual-setup.sh

## docs: Abrir documentación
docs:
	@echo "$(BLUE)Documentación disponible:$(NC)"
	@echo ""
	@echo "  📖 Guía Completa:        docs/HA-ALTA-DISPONIBILIDAD.md"
	@echo "  🚀 Quick Start:          docs/QUICKSTART-HA.md"
	@echo "  ✅ Verificación RNF-03:  docs/VERIFICACION-RNF-03.md"
	@echo "  📊 Resumen Ejecutivo:    docs/RESUMEN-EJECUTIVO-RNF-03.md"
	@echo ""

# Default target
.DEFAULT_GOAL := help
