# Alta Disponibilidad (HA) - RNF-03

## 📋 Descripción

Este documento describe la implementación del **Requerimiento No Funcional 03 (RNF-03)**: Alta Disponibilidad por Servicio.

**Objetivo**: Ejecutar ≥ 2 réplicas por servicio crítico, con balanceo de carga y failover automático.

## 🎯 Servicios con Alta Disponibilidad

Todos los servicios críticos de la plataforma cuentan con **2 réplicas activas**:

| Servicio | Réplicas | Puerto Interno | Health Check |
|----------|----------|----------------|--------------|
| **Next.js Frontend** | 2 | 3000 | `/health` |
| **Checkout Service** | 2 | 3001 | `/health` |
| **Events Service** | 2 | 3002 | `/health` |
| **Producers Service** | 2 | 3003 | `/health` |
| **Users Service** | 2 | 3004 | `/health` |
| **NGINX Load Balancer** | 1 | 80/443 | `/health` |

**Total de réplicas**: 11 contenedores (10 réplicas de servicios + 1 load balancer)

## 🏗️ Arquitectura

```
                        ┌─────────────────┐
                        │  NGINX (80/443) │
                        │  Load Balancer  │
                        └────────┬────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼───────┐ ┌─────▼─────┐  ┌──────▼──────┐
        │  Frontend     │ │  API       │  │  API        │
        │  Replicas     │ │  Services  │  │  Services   │
        │               │ │  Replicas  │  │  Replicas   │
        │ ┌───────────┐ │ │ ┌────────┐ │  │ ┌────────┐  │
        │ │ Next.js-1 │ │ │ │Checkout│ │  │ │Events-1│  │
        │ └───────────┘ │ │ │  -1    │ │  │ └────────┘  │
        │ ┌───────────┐ │ │ └────────┘ │  │ ┌────────┐  │
        │ │ Next.js-2 │ │ │ ┌────────┐ │  │ │Events-2│  │
        │ └───────────┘ │ │ │Checkout│ │  │ └────────┘  │
        └───────────────┘ │ │  -2    │ │  └─────────────┘
                          │ └────────┘ │
                          └────────────┘
```

## 🔧 Componentes de HA

### 1. Docker Compose con Réplicas

El archivo `docker-compose.yml` define:

- **2 réplicas por servicio crítico**
- **Health checks automáticos** (cada 15 segundos)
- **Restart policy**: `unless-stopped`
- **Límites de recursos**: CPU y memoria
- **Red dedicada**: `ticketeate-network`

### 2. NGINX Load Balancer

Configuración en `apps/nginx/default.conf`:

- **Algoritmo de balanceo**: `least_conn` (menor número de conexiones)
- **Health checks**: Verifica disponibilidad cada 30 segundos
- **Failover automático**: `max_fails=3`, `fail_timeout=30s`
- **Retry logic**: Intenta hasta 2 réplicas antes de fallar
- **Keepalive connections**: Pool de 32 conexiones reutilizables

#### Upstreams Configurados

```nginx
upstream next_frontend {
    least_conn;
    server next-frontend-1:3000 max_fails=3 fail_timeout=30s;
    server next-frontend-2:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

Se replica para cada servicio: `svc_checkout`, `svc_events`, `svc_producers`, `svc_users`.

### 3. Health Checks en Dockerfiles

Cada Dockerfile incluye:

```dockerfile
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:PORT/health || exit 1
```

**Parámetros**:
- `interval`: Verifica cada 15 segundos
- `timeout`: 5 segundos para responder
- `start_period`: 20-30 segundos de gracia al inicio
- `retries`: 3 intentos antes de marcar como unhealthy

## 🚀 Inicio Rápido

### 1. Iniciar el sistema completo

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f next-frontend-1
```

### 2. Verificar estado de salud

```bash
# Opción 1: Script de monitoreo
./scripts/monitor-ha.sh

# Opción 2: Monitoreo en tiempo real (actualiza cada 2 segundos)
watch -n 2 ./scripts/monitor-ha.sh

# Opción 3: Verificar estado de Docker
docker ps --filter "name=ticketeate-"

# Opción 4: Verificar health checks
docker inspect --format='{{.State.Health.Status}}' ticketeate-next-frontend-1
```

### 3. Detener el sistema

```bash
# Detener todos los contenedores
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Detener y eliminar imágenes
docker-compose down --rmi all
```

## 🧪 Pruebas de Alta Disponibilidad

### Prueba Automática Completa

Ejecuta todas las pruebas de HA simulando caídas de réplicas:

```bash
./scripts/test-ha.sh
```

**¿Qué hace?**
1. Verifica estado inicial del sistema
2. Simula caída de réplica del Frontend mientras se hacen requests
3. Simula caída de réplica de Checkout Service
4. Simula caída de réplica de Events Service
5. Verifica que el sistema mantiene disponibilidad
6. Restaura todas las réplicas
7. Genera reporte de disponibilidad

### Prueba Rápida Manual

Para probar un servicio específico:

```bash
# Sintaxis
./scripts/test-ha-quick.sh <contenedor> <url>

# Ejemplos
./scripts/test-ha-quick.sh ticketeate-next-frontend-1 http://localhost/
./scripts/test-ha-quick.sh ticketeate-svc-checkout-2 http://localhost/api/checkout/health
./scripts/test-ha-quick.sh ticketeate-svc-events-1 http://localhost/api/events/health
```

### Prueba Manual Paso a Paso

1. **Abrir 3 terminales**

   Terminal 1 - Monitoreo:
   ```bash
   watch -n 1 ./scripts/monitor-ha.sh
   ```

   Terminal 2 - Requests continuos:
   ```bash
   while true; do 
     curl -s http://localhost/health | jq .
     sleep 1
   done
   ```

   Terminal 3 - Simular fallas:
   ```bash
   # Detener réplica 1 del frontend
   docker stop ticketeate-next-frontend-1
   
   # Esperar 30 segundos observando los requests
   sleep 30
   
   # Restaurar
   docker start ticketeate-next-frontend-1
   ```

2. **Observar**:
   - Los requests deben continuar sin interrupción
   - NGINX redirige automáticamente a la réplica saludable
   - La disponibilidad debe mantenerse cerca del 100%

## 📊 Métricas de Éxito

### Criterios de Aceptación (RNF-03)

✅ **≥ 2 réplicas activas** por servicio crítico  
✅ **Failover automático** en < 5 segundos  
✅ **Disponibilidad ≥ 99.9%** durante fallas de réplica única  
✅ **Zero downtime** durante actualizaciones rolling  
✅ **Health checks** funcionando correctamente  

### KPIs Monitoreados

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| Uptime por servicio | ≥ 99.9% | Docker health checks |
| Tiempo de failover | < 5s | Scripts de prueba |
| Requests exitosos durante fallo | ≥ 99% | test-ha.sh |
| Tiempo de recuperación | < 10s | Docker restart |

## 🔍 Endpoints de Monitoreo

### Health Check Endpoints

```bash
# NGINX Load Balancer
curl http://localhost/health
# Respuesta: "healthy"

# Status completo del sistema
curl http://localhost/health/status
# Respuesta: {"status": "ok", "services": [...], "replicas_per_service": 2}

# Health de servicios individuales (a través de NGINX)
curl http://localhost/api/checkout/health
curl http://localhost/api/events/health
curl http://localhost/api/producers/health
curl http://localhost/api/users/health
```

### Docker Health Status

```bash
# Ver salud de todos los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}"

# Ver detalles de health check de un contenedor
docker inspect --format='{{json .State.Health}}' ticketeate-next-frontend-1 | jq .
```

## 🛠️ Troubleshooting

### Problema: Réplica marcada como unhealthy

```bash
# Ver logs del contenedor
docker logs ticketeate-svc-checkout-1

# Ver health check details
docker inspect --format='{{json .State.Health}}' ticketeate-svc-checkout-1 | jq .

# Reiniciar réplica específica
docker restart ticketeate-svc-checkout-1
```

### Problema: NGINX no balancea correctamente

```bash
# Ver logs de NGINX
docker logs ticketeate-nginx

# Verificar upstreams
docker exec ticketeate-nginx cat /etc/nginx/conf.d/default.conf

# Recargar configuración de NGINX
docker exec ticketeate-nginx nginx -s reload
```

### Problema: Todas las réplicas de un servicio caen

```bash
# Identificar el problema
docker-compose logs svc-checkout-1 svc-checkout-2

# Reiniciar el servicio completo
docker-compose restart svc-checkout-1 svc-checkout-2

# Si persiste, reconstruir
docker-compose up -d --build svc-checkout-1 svc-checkout-2
```

## 📈 Escalado de Réplicas

### Aumentar número de réplicas

Para escalar de 2 a 3 réplicas por servicio:

1. **Agregar réplica en docker-compose.yml**:
   ```yaml
   svc-checkout-3:
     # ... misma configuración que svc-checkout-1 y -2
   ```

2. **Actualizar upstream en nginx/default.conf**:
   ```nginx
   upstream svc_checkout {
       least_conn;
       server svc-checkout-1:3001 max_fails=3 fail_timeout=30s;
       server svc-checkout-2:3001 max_fails=3 fail_timeout=30s;
       server svc-checkout-3:3001 max_fails=3 fail_timeout=30s;
       keepalive 32;
   }
   ```

3. **Recrear servicios**:
   ```bash
   docker-compose up -d --build
   ```

## 🔐 Consideraciones de Seguridad

- ✅ Health checks no exponen información sensible
- ✅ Red interna aislada (`ticketeate-network`)
- ✅ Solo NGINX expone puertos al host
- ✅ Variables de entorno con secrets
- ✅ Límites de recursos previenen DoS

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NGINX Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

## ✅ Checklist de Implementación

- [x] Docker Compose con 2 réplicas por servicio
- [x] NGINX Load Balancer configurado
- [x] Health checks en todos los Dockerfiles
- [x] Scripts de prueba automatizados
- [x] Script de monitoreo en tiempo real
- [x] Documentación completa
- [x] Políticas de restart configuradas
- [x] Límites de recursos definidos
- [x] Failover automático implementado
- [x] Red dedicada para servicios

---

**Última actualización**: 31 de octubre de 2025  
**Versión**: 1.0  
**Estado**: ✅ Implementado y probado
