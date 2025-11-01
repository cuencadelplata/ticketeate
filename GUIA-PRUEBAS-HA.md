# 🧪 Guía Completa de Pruebas - Alta Disponibilidad

## Paso 0: Prerequisitos

Antes de empezar, asegúrate de tener:
- ✅ Docker y Docker Compose instalados
- ✅ Archivo `.env` configurado (copia de `.env.example`)
- ✅ Puerto 80 disponible en tu máquina

## 📋 Método 1: Prueba Rápida (5 minutos)

### Paso 1: Iniciar el Sistema

```bash
# Opción A: Con make
make start

# Opción B: Con docker-compose
docker-compose up -d --build
```

**Salida esperada:**
```
✓ Container ticketeate-nginx          Started
✓ Container ticketeate-next-frontend-1 Started
✓ Container ticketeate-next-frontend-2 Started
✓ Container ticketeate-svc-checkout-1  Started
✓ Container ticketeate-svc-checkout-2  Started
... (total 11 contenedores)
```

### Paso 2: Verificar que Todo Está Corriendo

```bash
# Opción A: Con make
make status

# Opción B: Con script
./scripts/monitor-ha.sh

# Opción C: Manualmente
docker ps --filter "name=ticketeate-"
```

**Salida esperada:**
```
NAME                          STATUS
ticketeate-nginx              Up (healthy)
ticketeate-next-frontend-1    Up (healthy)
ticketeate-next-frontend-2    Up (healthy)
... (11 contenedores total)
```

✅ **Si ves 11 contenedores corriendo, continúa al siguiente paso**

### Paso 3: Verificar Health Checks

```bash
# Verificar NGINX
curl http://localhost/health
# Esperado: "healthy"

# Verificar status page
curl http://localhost/health/status
# Esperado: {"status": "ok", "services": [...], "replicas_per_service": 2}

# Verificar frontend
curl http://localhost/
# Esperado: HTML de la página
```

### Paso 4: Ejecutar Prueba Automatizada

```bash
# Ejecutar prueba completa (toma ~3 minutos)
make test-ha

# O directamente:
./scripts/test-ha.sh
```

**Qué hace este script:**
1. ✅ Verifica estado inicial
2. 🔴 Detiene réplica 1 del Frontend
3. 📊 Hace 30 requests durante 30 segundos
4. ✅ Verifica que todos los requests son exitosos
5. 🔄 Restaura la réplica
6. 🔁 Repite con otros servicios
7. 📈 Genera reporte de disponibilidad

**Salida esperada:**
```
[PRUEBA 2] Prueba de HA - Frontend (Next.js)
Iniciando requests continuos...
..............................
Resultados:
  Exitosos: 30
  Fallidos:  0
  Disponibilidad: 100.00%

✓ PRUEBA 2 EXITOSA: Sistema mantuvo disponibilidad
```

---

## 📋 Método 2: Prueba Manual Paso a Paso (10 minutos)

### Paso 1: Abrir 3 Terminales

**Terminal 1 - Monitoreo:**
```bash
# Monitoreo en tiempo real (actualiza cada 2 segundos)
watch -n 2 './scripts/monitor-ha.sh'
```

**Terminal 2 - Requests Continuos:**
```bash
# Hacer requests cada 0.5 segundos
while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
  if [ "$response" = "200" ]; then
    echo -n "."
  else
    echo -n "x"
  fi
  sleep 0.5
done
```

**Terminal 3 - Simular Fallas:**
```bash
# Esperar 10 segundos para ver que todo funciona
sleep 10

# Detener una réplica del frontend
echo "🔴 Deteniendo réplica 1 del frontend..."
docker stop ticketeate-next-frontend-1

# Observar por 30 segundos en Terminal 2
# Deberías seguir viendo solo puntos (.)
sleep 30

# Restaurar
echo "✅ Restaurando réplica..."
docker start ticketeate-next-frontend-1
```

### ✅ Resultado Esperado:
- **Terminal 1**: Verás que `ticketeate-next-frontend-1` cambia a estado "Exited"
- **Terminal 2**: Deberías ver SOLO puntos (`.`), sin `x` (sin errores)
- **Terminal 3**: Comandos se ejecutan correctamente

### Paso 2: Probar Otros Servicios

Repite el proceso con otros servicios:

```bash
# Checkout Service
docker stop ticketeate-svc-checkout-2
sleep 30
docker start ticketeate-svc-checkout-2

# Events Service
docker stop ticketeate-svc-events-1
sleep 30
docker start ticketeate-svc-events-1

# Producers Service
docker stop ticketeate-svc-producers-2
sleep 30
docker start ticketeate-svc-producers-2
```

---

## 📋 Método 3: Prueba Rápida de un Servicio (20 segundos)

```bash
# Probar Frontend
./scripts/test-ha-quick.sh ticketeate-next-frontend-1 http://localhost/

# Probar Checkout API
./scripts/test-ha-quick.sh ticketeate-svc-checkout-2 http://localhost/api/checkout/health

# Probar Events API
./scripts/test-ha-quick.sh ticketeate-svc-events-1 http://localhost/api/events/health
```

**Salida esperada:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRUEBA RÁPIDA DE HA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contenedor a detener: ticketeate-next-frontend-1
URL de prueba: http://localhost/

Iniciando requests continuos...
........................................

Resultados:
  Exitosos: 40
  Fallidos:  0
  Disponibilidad: 100.00%

✓ PRUEBA EXITOSA: 100% de disponibilidad mantenida
```

---

## 📋 Método 4: Prueba de Estrés con Carga (1 minuto)

Esta prueba simula múltiples usuarios haciendo requests simultáneos:

```bash
# Ejecutar prueba de estrés
make test-ha-stress

# O directamente:
./scripts/test-ha-stress.sh
```

**Qué hace:**
- Simula 10 usuarios concurrentes
- 20 requests por usuario (200 total)
- Compara baseline vs. con réplica caída

**Salida esperada:**
```
Fase 1: Baseline - Sistema normal
Resultados Baseline:
  Exitosos: 200
  Fallidos: 0
  Tasa de éxito: 100.00%

Fase 2: Prueba con Caída de Réplica
⚠ Deteniendo réplica: ticketeate-next-frontend-1

Resultados con Réplica Caída:
  Exitosos: 198
  Fallidos: 2
  Tasa de éxito: 99.00%

✓ PRUEBA EXITOSA
  Alta Disponibilidad funcionando correctamente
  Degradación: 1.00%
```

---

## 📊 Verificación de Resultados

### ✅ Criterios de Éxito:

1. **Disponibilidad ≥ 95%** durante fallos
   - ✅ Objetivo: 99%+
   - ❌ Si es < 95%, revisar logs

2. **Requests exitosos durante fallo**
   - ✅ La mayoría deben ser exitosos (puntos `.`)
   - ❌ Si hay muchos errores (`x`), hay un problema

3. **Failover automático**
   - ✅ El sistema sigue respondiendo
   - ✅ No se requiere intervención manual
   - ❌ Si el servicio cae completamente, revisar configuración

4. **Restauración de réplica**
   - ✅ La réplica vuelve a estado "healthy"
   - ✅ NGINX vuelve a usar ambas réplicas
   - ❌ Si no vuelve a healthy, revisar logs del contenedor

---

## 🔍 Comandos de Diagnóstico

Si algo no funciona como esperado:

### Ver logs de todos los servicios:
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico:
```bash
docker logs -f ticketeate-next-frontend-1
docker logs -f ticketeate-nginx
```

### Ver health check de un contenedor:
```bash
docker inspect --format='{{json .State.Health}}' ticketeate-next-frontend-1 | jq .
```

### Ver estado detallado:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Verificar NGINX está balanceando:
```bash
# Hacer múltiples requests y ver qué réplica responde
for i in {1..10}; do
  curl -s http://localhost/ | grep -o "container-[0-9]" || echo "Request $i"
done
```

---

## 🆘 Troubleshooting

### Problema: "Puerto 80 ya en uso"

```bash
# Ver qué está usando el puerto
lsof -i :80

# Cambiar puerto en docker-compose.yml
# Cambiar "80:80" por "8080:80"
# Luego usar http://localhost:8080
```

### Problema: "Contenedor unhealthy"

```bash
# Ver por qué está unhealthy
docker inspect --format='{{json .State.Health}}' ticketeate-svc-checkout-1 | jq .

# Ver logs del contenedor
docker logs ticketeate-svc-checkout-1

# Reiniciar el contenedor
docker restart ticketeate-svc-checkout-1
```

### Problema: "No puedo conectar a la base de datos"

```bash
# Verificar que DATABASE_URL está en .env
cat .env | grep DATABASE_URL

# Si no existe, crear .env desde .env.example
cp .env.example .env
# Editar .env con tus credenciales
```

### Problema: "Scripts no ejecutables"

```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh
```

---

## 📈 Métricas de Éxito Esperadas

| Métrica | Objetivo | Cómo Verificar |
|---------|----------|----------------|
| Contenedores running | 11/11 | `docker ps --filter "name=ticketeate-"` |
| Health checks OK | 100% | `./scripts/monitor-ha.sh` |
| Disponibilidad con fallo | ≥ 99% | `./scripts/test-ha.sh` |
| Tiempo de failover | < 5s | Observar durante prueba manual |
| Requests exitosos | ≥ 95% | Terminal 2 en prueba manual |

---

## 🎓 Demostración Completa (5 minutos)

Si quieres hacer una demostración completa en una sola ejecución:

```bash
# Este comando ejecuta todo automáticamente
make demo
```

Esto hará:
1. ✅ Iniciar todos los servicios
2. ✅ Verificar estado
3. ✅ Ejecutar monitoreo
4. ✅ Ejecutar pruebas de HA
5. ✅ Generar reporte final

---

## 📝 Checklist de Verificación

Usa este checklist para asegurarte de que todo funciona:

- [ ] Los 11 contenedores están corriendo
- [ ] Todos los health checks están "healthy"
- [ ] `curl http://localhost/health` responde "healthy"
- [ ] Al detener una réplica, el sistema sigue funcionando
- [ ] La disponibilidad es ≥ 99% durante fallos
- [ ] Las réplicas se restauran automáticamente
- [ ] NGINX balancea entre réplicas
- [ ] Los scripts de prueba reportan éxito

---

## 🚀 Comandos Quick Reference

```bash
# Iniciar
make start                          # Iniciar todos los servicios
make status                         # Ver estado actual
make monitor                        # Verificar salud

# Probar
make test-ha                        # Prueba completa (~3 min)
make test-ha-stress                 # Prueba de estrés (~1 min)
./scripts/test-ha-quick.sh ...     # Prueba rápida (~20 seg)

# Monitorear
make monitor-watch                  # Monitoreo en tiempo real
make logs                           # Ver logs de todos

# Limpiar
make stop                           # Detener servicios
make clean                          # Limpiar todo
```

---

**¿Listo para empezar?** Ejecuta: `make start` y luego `make test-ha`

**¿Necesitas ayuda?** Revisa los logs con `make logs` o consulta `docs/HA-ALTA-DISPONIBILIDAD.md`
