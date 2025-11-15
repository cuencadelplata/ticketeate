# 🎭 Guía de Demostración Completa - Alta Disponibilidad Ticketeate

## 📋 Descripción General

Esta demo simula la **arquitectura real de Ticketeate** con **5 servicios críticos**, cada uno con **2 réplicas**, totalizando **11 contenedores** (10 servicios + 1 NGINX load balancer).

### ✅ Servicios Simulados

| Servicio | Puerto Real | Réplicas | Descripción |
|----------|-------------|----------|-------------|
| **Frontend** | 3000 | 2 | Aplicación Next.js |
| **Checkout** | 3001 | 2 | API de compras (Hono) |
| **Events** | 3002 | 2 | API de eventos (Hono) |
| **Producers** | 3003 | 2 | API de productores (Hono) |
| **Users** | 3004 | 2 | API de usuarios (Hono) |
| **NGINX** | 8080 | 1 | Load Balancer |

**Total: 11 contenedores**

---

## 🎯 Objetivo de la Demo

Demostrar el cumplimiento del **RNF-03: Alta Disponibilidad**

> **RNF-03**: Ejecutar ≥ 2 réplicas por servicio crítico para garantizar disponibilidad continua ante fallos.

---

## 🚀 Opción A: Demo Automática (Recomendada)

### Paso 1: Ejecutar el Script

```bash
cd /Users/ivancabrera/Desktop/Repositorios/ticketeate
./scripts/demo-ha-completo.sh
```

### Paso 2: Observar

El script automáticamente:

1. ✅ Limpia contenedores previos
2. ✅ Crea red de Docker
3. ✅ Inicia 10 réplicas (5 servicios × 2)
4. ✅ Configura NGINX load balancer
5. ✅ Ejecuta pruebas de failover automáticas
6. ✅ Muestra disponibilidad 100%

### Resultado Esperado

```
✅ PRUEBA EXITOSA: 100.0% disponibilidad con Frontend-1 caído
✅ PRUEBA EXITOSA: 100.0% disponibilidad con 3 réplicas caídas
```

---

## 🎬 Opción B: Demo Manual con 3 Terminales (Para Presentación)

Esta opción es **ideal para mostrar en vivo al profesor** cómo funciona la alta disponibilidad.

### 📺 Terminal 1: Monitor de Contenedores

```bash
watch -n 1 'docker ps --filter "name=ticketeate-demo-" --format "table {{.Names}}\t{{.Status}}" | sort'
```

**Verás en tiempo real:**
```
NAMES                           STATUS
ticketeate-demo-checkout-1      Up 2 minutes
ticketeate-demo-checkout-2      Up 2 minutes
ticketeate-demo-events-1        Up 2 minutes
ticketeate-demo-events-2        Up 2 minutes
ticketeate-demo-frontend-1      Up 2 minutes
ticketeate-demo-frontend-2      Up 2 minutes
ticketeate-demo-nginx           Up 2 minutes
ticketeate-demo-producers-1     Up 2 minutes
ticketeate-demo-producers-2     Up 2 minutes
ticketeate-demo-users-1         Up 2 minutes
ticketeate-demo-users-2         Up 2 minutes
```

---

### 🌐 Terminal 2: Peticiones Continuas

```bash
while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 1 http://localhost:8080 2>/dev/null || echo "FAIL")
  
  if [ "$response" = "200" ]; then
    echo "$(date +%H:%M:%S) ✓ OK (200)"
  else
    echo "$(date +%H:%M:%S) ✗ FAIL ($response)"
  fi
  
  sleep 0.3
done
```

> **💡 IMPORTANTE:** El `--max-time 1` (1 segundo) es clave para ver los FAIL. Debe ser menor que el timeout de NGINX para que detectes cuando una petición falla antes del retry.

**Verás:**
```
14:23:45 ✓ OK (200)
14:23:46 ✓ OK (200)
14:23:47 ✓ OK (200)
```

---

### ⚡ Terminal 3: Control de Réplicas (TÚ DEMUESTRAS AQUÍ)

**Iniciar el sistema:**
```bash
./scripts/demo-ha-completo.sh
```

**Escenario 1: Apagar Frontend Réplica 1**

```bash
docker stop ticketeate-demo-frontend-1
```

**Observa:**
- Terminal 1: El contenedor desaparece o muestra "Exited"
- Terminal 2: Verás 1-2 `✗ FAIL` y luego **✓ OK (200)** - Failover en ~1 segundo!

> **⚠️ NOTA:** Los 1-2 FAIL son **NORMALES y ESPERADOS**. Es el tiempo que tarda NGINX en detectar el fallo y hacer el failover (~1-2 segundos). Sin HA, verías FAIL todo el tiempo. Con HA, solo 2-5% de fallos durante la transición. Ver `EXPLICACION-FAIL.md` para más detalles.

**Restaurar:**
```bash
docker start ticketeate-demo-frontend-1
```

---

**Escenario 2: Apagar múltiples réplicas simultáneamente**

```bash
docker stop ticketeate-demo-frontend-1
docker stop ticketeate-demo-checkout-1
docker stop ticketeate-demo-events-1
```

**Observa:**
- 3 servicios caídos
- Terminal 2: **Aún funciona al 100%**

**Restaurar:**
```bash
docker start ticketeate-demo-frontend-1
docker start ticketeate-demo-checkout-1
docker start ticketeate-demo-events-1
```

---

**Escenario 3: Probar cada servicio**

```bash
# Checkout Service
docker stop ticketeate-demo-checkout-1
sleep 3
docker start ticketeate-demo-checkout-1

# Events Service
docker stop ticketeate-demo-events-1
sleep 3
docker start ticketeate-demo-events-1

# Producers Service
docker stop ticketeate-demo-producers-1
sleep 3
docker start ticketeate-demo-producers-1

# Users Service
docker stop ticketeate-demo-users-1
sleep 3
docker start ticketeate-demo-users-1
```

---

## 📊 Comandos Útiles para la Demo

### Ver todos los contenedores
```bash
docker ps --filter "name=ticketeate-demo-"
```

### Ver logs de NGINX (muestra el load balancing)
```bash
docker logs -f ticketeate-demo-nginx
```

### Estadísticas de recursos
```bash
docker stats --filter "name=ticketeate-demo-"
```

### Inspeccionar configuración de NGINX
```bash
docker exec ticketeate-demo-nginx cat /etc/nginx/conf.d/default.conf
```

---

## 🧹 Limpieza después de la Demo

```bash
# Parar todos los contenedores
docker stop $(docker ps -q --filter "name=ticketeate-demo-")

# Eliminar todos los contenedores
docker rm $(docker ps -aq --filter "name=ticketeate-demo-")

# Eliminar la red
docker network rm ticketeate-demo-network

# Limpiar archivo temporal de configuración
rm /tmp/nginx-ticketeate-demo.conf
```

O usar el comando rápido:
```bash
docker stop $(docker ps -q --filter "name=ticketeate-demo-") && \
docker rm $(docker ps -aq --filter "name=ticketeate-demo-") && \
docker network rm ticketeate-demo-network
```

---

## 💡 Puntos Clave para Explicar al Profesor

1. **Arquitectura Real Simulada**
   - "Estos 5 servicios representan nuestra arquitectura real de Ticketeate"
   - "Frontend (Next.js) + 4 APIs backend (Hono)"

2. **Alta Disponibilidad**
   - "Cada servicio tiene 2 réplicas"
   - "Si una réplica falla, NGINX automáticamente redirecciona a la otra"

3. **Algoritmo de Load Balancing**
   - "Usamos `least_conn` (least connections)"
   - "Las peticiones van al servidor con menos conexiones activas"

4. **Failover Automático**
   - "Cuando apago una réplica, verán 1-2 FAIL durante ~1 segundo"
   - "Ese es el tiempo que tarda NGINX en detectar el fallo y redirigir"
   - "Después de eso, el sistema funciona al 100% con la réplica restante"
   - "El RTO (Recovery Time Objective) es de 1-2 segundos"
   - "Sin HA, el sistema estaría 100% caído hasta intervención manual"

5. **Cumplimiento del RNF-03**
   - "RNF-03 requiere ≥ 2 réplicas por servicio crítico"
   - "Tenemos exactamente 2 réplicas de cada servicio"

6. **Sin Single Point of Failure**
   - "Puedo apagar cualquier réplica sin afectar la disponibilidad"
   - "Solo NGINX es punto único (en producción también se replicaría con Keepalived/HAProxy)"

---

## 📈 Métricas Clave

| Métrica | Valor |
|---------|-------|
| **Servicios críticos** | 5 |
| **Réplicas por servicio** | 2 |
| **Total contenedores** | 11 |
| **Disponibilidad objetivo** | 99.9% |
| **Disponibilidad medida** | 97-99% (durante failover manual) |
| **Disponibilidad en operación normal** | 100% |
| **Tiempo de failover** | 1-2 segundos |
| **RTO (Recovery Time)** | Automático |
| **RPO (Recovery Point)** | Sin pérdida de datos |

---

## ⚠️ Troubleshooting

### Veo FAIL cuando apago un servicio (NORMAL)

**Esto es esperado y correcto!** 

Cuando apagas un servicio manualmente, verás 1-2 `✗ FAIL` antes de que NGINX haga el failover. Esto demuestra:

- ✅ RTO (Recovery Time) de 1-2 segundos
- ✅ Failover automático funcionando
- ✅ 97-99% disponibilidad (vs 0% sin HA)

**Para explicar al profesor:**
> "Estos FAIL transitorios son normales. Es el tiempo que tarda NGINX en detectar el fallo y redirigir. Sin Alta Disponibilidad, veríamos FAIL todo el tiempo. Con HA, solo durante 1-2 segundos."

Ver `EXPLICACION-FAIL.md` para detalles completos.

---

### Error: "port is already allocated"
```bash
# Ver qué está usando el puerto 8080
lsof -i :8080

# Matar el proceso
kill -9 <PID>
```

### Error: "network already exists"
```bash
docker network rm ticketeate-demo-network
```

### Los contenedores no responden
```bash
# Verificar logs
docker logs ticketeate-demo-nginx

# Reiniciar todo
./scripts/demo-ha-completo.sh
```

---

## 🎓 Para la Presentación

### Orden Recomendado:

1. **Explicar la arquitectura** (2 min)
   - Mostrar el diagrama de 5 servicios × 2 réplicas
   
2. **Ejecutar el script automático** (1 min)
   - `./scripts/demo-ha-completo.sh`
   - Mostrar que pasa todas las pruebas
   
3. **Demo manual con 3 terminales** (3 min)
   - Abrir las 3 terminales
   - Apagar réplicas en vivo
   - Mostrar que no hay downtime
   
4. **Explicar beneficios** (1 min)
   - Zero downtime
   - Failover automático
   - Escalabilidad horizontal

**Total: ~7 minutos**

---

## ✅ Checklist de Preparación

Antes de la presentación:

- [ ] Docker instalado y corriendo
- [ ] Script ejecutable: `chmod +x scripts/demo-ha-completo.sh`
- [ ] Puerto 8080 libre
- [ ] Internet disponible (para descargar imágenes si es necesario)
- [ ] 3 terminales abiertas
- [ ] Comandos de demo copiados en un lado

¡Listo para demostrar! 🎉
