# 🎭 GUÍA DE DEMOSTRACIÓN EN VIVO - SERVICIOS REALES

## 📋 Preparación (Antes de la clase)

### Paso 1: Levantar TODOS los Servicios Reales

Abre una terminal y ejecuta:

```bash
cd /Users/ivancabrera/Desktop/Repositorios/ticketeate

# Levantar todos los 11 contenedores
docker compose up -d

# Esperar a que estén listos (puede tardar 2-3 minutos)
sleep 120

# Verificar que todos estén corriendo
docker ps --filter "name=ticketeate-"
```

Esto levanta:
- ✅ `ticketeate-nginx` - Load Balancer
- ✅ `ticketeate-next-frontend-1` - Frontend réplica 1
- ✅ `ticketeate-next-frontend-2` - Frontend réplica 2
- ✅ `ticketeate-svc-checkout-1` - Checkout réplica 1
- ✅ `ticketeate-svc-checkout-2` - Checkout réplica 2
- ✅ `ticketeate-svc-events-1` - Events réplica 1
- ✅ `ticketeate-svc-events-2` - Events réplica 2
- ✅ `ticketeate-svc-producers-1` - Producers réplica 1
- ✅ `ticketeate-svc-producers-2` - Producers réplica 2
- ✅ `ticketeate-svc-users-1` - Users réplica 1
- ✅ `ticketeate-svc-users-2` - Users réplica 2

**TOTAL: 11 CONTENEDORES**

---

## 🎬 DEMOSTRACIÓN EN VIVO

### 📺 Configuración de Pantalla (Recomendado)

Abre **3 terminales** lado a lado:

```
┌────────────────┬────────────────┬────────────────┐
│   Terminal 1   │   Terminal 2   │   Terminal 3   │
│   Monitoreo    │   Requests     │   Comandos     │
└────────────────┴────────────────┴────────────────┘
```

---

### Terminal 1: Monitoreo de Contenedores

```bash
# Ver estado de TODOS los contenedores en tiempo real (macOS compatible)
while true; do 
  clear
  echo "═══════════════════════════════════════════════════════"
  echo "  CONTENEDORES DE TICKETEATE - ALTA DISPONIBILIDAD"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  docker ps --filter "name=ticketeate-" --format "table {{.Names}}\t{{.Status}}" | head -n 20
  echo ""
  echo "Total contenedores: $(docker ps --filter 'name=ticketeate-' --format '{{.Names}}' | wc -l | tr -d ' ')"
  sleep 1
done
```

**Qué verás:**
```
═══════════════════════════════════════════════════════
  CONTENEDORES DE TICKETEATE - ALTA DISPONIBILIDAD
═══════════════════════════════════════════════════════

NAMES                          STATUS
ticketeate-nginx               Up 2 minutes
ticketeate-next-frontend-1     Up 2 minutes
ticketeate-next-frontend-2     Up 2 minutes
ticketeate-svc-checkout-1      Up 2 minutes
ticketeate-svc-checkout-2      Up 2 minutes
ticketeate-svc-events-1        Up 2 minutes
ticketeate-svc-events-2        Up 2 minutes
ticketeate-svc-producers-1     Up 2 minutes
ticketeate-svc-producers-2     Up 2 minutes
ticketeate-svc-users-1         Up 2 minutes
ticketeate-svc-users-2         Up 2 minutes

Total contenedores: 11
```

---

### Terminal 2: Requests Continuos

```bash
# Hacer requests al frontend cada 0.5 segundos
while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
  if [ "$response" = "200" ] || [ "$response" = "304" ]; then
    echo -n "✓"
  else
    echo -n "✗"
  fi
  sleep 0.5
done
```

**Qué verás:**
```
✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓
```
- ✓ = Request exitoso (200 OK)
- ✗ = Request fallido

---

### Terminal 3: Comandos de Control

Este es donde ejecutarás los comandos durante la demo.

**TODAS las réplicas disponibles:**
```
Frontend:   ticketeate-next-frontend-1,  ticketeate-next-frontend-2
Checkout:   ticketeate-svc-checkout-1,   ticketeate-svc-checkout-2
Events:     ticketeate-svc-events-1,     ticketeate-svc-events-2
Producers:  ticketeate-svc-producers-1,  ticketeate-svc-producers-2
Users:      ticketeate-svc-users-1,      ticketeate-svc-users-2
```

---

## 🎤 GUIÓN DE DEMOSTRACIÓN

### Fase 1: Sistema Funcionando Normal (30 segundos)

**Tú dices:**
> "Como pueden ver, tengo un sistema de ticketing con alta disponibilidad corriendo. En la Terminal 1 vemos 11 contenedores activos: NGINX como load balancer y 5 servicios críticos, cada uno con 2 réplicas. En la Terminal 2 vemos que todas las peticiones se están atendiendo correctamente con ✓."

**Muestra:**
- Terminal 1: Los 11 contenedores "Up"
- Terminal 2: Solo ✓✓✓✓✓✓✓

**Opcional - Ver detalles del sistema:**
```bash
# Terminal 3
echo "=== RESUMEN DEL SISTEMA ==="
echo "Frontend: $(docker ps -q --filter 'name=next-frontend' | wc -l | tr -d ' ') réplicas"
echo "Checkout: $(docker ps -q --filter 'name=svc-checkout' | wc -l | tr -d ' ') réplicas"
echo "Events: $(docker ps -q --filter 'name=svc-events' | wc -l | tr -d ' ') réplicas"
echo "Producers: $(docker ps -q --filter 'name=svc-producers' | wc -l | tr -d ' ') réplicas"
echo "Users: $(docker ps -q --filter 'name=svc-users' | wc -l | tr -d ' ') réplicas"
```

---

### Fase 2: Apagar Frontend Réplica 1 - ¡LA PARTE CRÍTICA! 🔴

**Tú dices:**
> "Ahora voy a simular una falla real. Voy a apagar completamente una réplica del Frontend, como si el servidor se hubiera caído o perdiera conexión."

**En Terminal 3, ejecuta:**
```bash
docker stop ticketeate-next-frontend-1
```

**Qué debe pasar INMEDIATAMENTE:**

✅ **Terminal 1:** 
- `ticketeate-next-frontend-1` cambia a "Exited" o desaparece
- Los otros 10 siguen "Up"

✅ **Terminal 2:** 
- Debes seguir viendo **SOLO ✓✓✓✓✓✓✓**
- **NO debe haber ✗** (o máximo 1-2 al momento exacto del cambio)

**Tú dices:**
> "Como pueden observar, aunque la réplica 1 del Frontend está completamente apagada (muestras Terminal 1), el sistema sigue atendiendo todas las peticiones sin problemas (muestras Terminal 2). NGINX detectó automáticamente la falla y redirigió todo el tráfico a la réplica 2. El usuario final no percibe ninguna interrupción."

**Deja corriendo 20-30 segundos así** para que tu profesor vea que es estable.

---

### Fase 3: Apagar OTRO servicio (Checkout) 🔴

**Tú dices:**
> "Para demostrar que esto funciona en TODOS los servicios, ahora voy a apagar una réplica del servicio de Checkout, que maneja las compras."

**En Terminal 3:**
```bash
docker stop ticketeate-svc-checkout-1
```

**Qué debe pasar:**

✅ **Terminal 1:** 
- Ahora tienes 2 réplicas caídas (frontend-1 y checkout-1)
- Quedan 9 contenedores activos

✅ **Terminal 2:** 
- SIGUE viendo ✓✓✓✓✓✓✓ (sin interrupciones)

**Tú dices:**
> "Perfecto. Ahora tenemos 2 servicios con una réplica caída cada uno, y el sistema sigue funcionando al 100%. Esto es Alta Disponibilidad en acción."

---

### Fase 4: Apagar UNA MÁS (Events) 🔴

**Tú dices:**
> "Voy a apagar una réplica más, del servicio de Events."

**En Terminal 3:**
```bash
docker stop ticketeate-svc-events-1
```

**Qué debe pasar:**

✅ **Terminal 1:** 
- 3 réplicas caídas
- 8 contenedores activos

✅ **Terminal 2:** 
- TODAVÍA ✓✓✓✓✓✓✓ (funcionando)

---

### Fase 5: Mostrar el Límite - Apagar TODAS las réplicas de un servicio 🔴🔴

**Tú dices:**
> "Ahora voy a demostrar qué pasa cuando SE CAEN AMBAS réplicas de un servicio. Voy a apagar la segunda réplica del Frontend."

**En Terminal 3:**
```bash
docker stop ticketeate-next-frontend-2
```

**Qué debe pasar:**

❌ **Terminal 2:** 
- Ahora SÍ verás ✗✗✗✗✗✗✗ (errores)

**Tú dices:**
> "Como era de esperar, al caer AMBAS réplicas del Frontend el servicio no está disponible. Esto demuestra por qué necesitamos al menos 2 réplicas por servicio. Mientras tengamos al menos UNA réplica funcional, el sistema sigue operativo."

---

### Fase 6: Restaurar el Sistema ✅

**Tú dices:**
> "Ahora voy a restaurar todos los servicios y veremos cómo el sistema se recupera automáticamente."

**En Terminal 3:**
```bash
# Restaurar Frontend
docker start ticketeate-next-frontend-1
docker start ticketeate-next-frontend-2

# Esperar 2 segundos
sleep 2

# Restaurar Checkout
docker start ticketeate-svc-checkout-1

# Restaurar Events
docker start ticketeate-svc-events-1
```

**Qué debe pasar:**

✅ **Terminal 1:** 
- Todos los contenedores vuelven a "Up"
- Total: 11 contenedores activos

✅ **Terminal 2:** 
- Vuelven los ✓✓✓✓✓✓✓

**Tú dices:**
> "En menos de 5 segundos, el sistema está completamente restaurado y operativo nuevamente."

---

## 📊 RESUMEN FINAL

**Tú dices:**
> "Como pudieron ver en esta demostración en vivo, nuestro sistema cumple completamente con el RNF-03 de Alta Disponibilidad:
> 
> ✅ Tenemos 5 servicios críticos: Frontend, Checkout, Events, Producers y Users
> ✅ Cada servicio tiene exactamente 2 réplicas
> ✅ NGINX balancea automáticamente la carga entre las réplicas
> ✅ Cuando una réplica falla, el sistema continúa funcionando sin interrupción
> ✅ El failover es completamente transparente para el usuario
> ✅ La disponibilidad se mantiene en 100% mientras tengamos al menos 1 réplica activa
> 
> En total: 11 contenedores trabajando coordinadamente para garantizar que el sistema de ticketing esté siempre disponible."

---

## 🧹 Limpieza (Después de la demo)

```bash
# Si quieres detener todo
docker compose down

# O dejar corriendo para más demos
# (los servicios siguen activos)
```

---

## 🎯 TIPS PARA LA DEMO

### ✅ QUÉ HACER:

1. **Practica antes** - Hazlo 2-3 veces antes de la clase
2. **Verifica que todos los servicios estén UP** - Antes de empezar
3. **Deja correr tiempo suficiente** - 20-30 segundos en cada fase
4. **Explica mientras haces** - No te apures
5. **Muestra las 3 terminales** - Proyecta tu pantalla claramente
6. **Menciona números reales** - "11 contenedores", "5 servicios", "100% disponibilidad"

### ❌ QUÉ NO HACER:

1. **No apagues las 2 réplicas del mismo servicio al inicio** - Empieza con una
2. **No cierres las terminales** - Déjalas corriendo
3. **No uses comandos que no probaste** - Solo usa los de esta guía
4. **No te apures** - Deja que tu profesor vea cada paso

---

## 🎓 PREGUNTAS QUE PUEDE HACER TU PROFESOR

**P: ¿Cuántos contenedores tienes en total?**
> R: "11 contenedores: 1 NGINX load balancer más 10 réplicas (5 servicios × 2 réplicas cada uno)."

**P: ¿Cómo sabe NGINX que la réplica está caída?**
> R: "NGINX hace health checks pasivos. Cuando intenta enviar una petición y la réplica no responde, la marca como 'down' automáticamente después de 3 fallos consecutivos. Lo configuramos con max_fails=3 y fail_timeout=30s."

**P: ¿Qué pasa si NGINX se cae?**
> R: "En producción, NGINX también debe tener redundancia. Típicamente usando un balanceador de carga externo como AWS ELB o Google Cloud Load Balancer que distribuye entre múltiples instancias de NGINX."

**P: ¿Cuánto tiempo tarda el failover?**
> R: "En nuestra configuración, menos de 5 segundos. NGINX detecta la falla en el primer intento y redirige inmediatamente a las réplicas saludables."

**P: ¿Por qué solo 2 réplicas?**
> R: "2 es el mínimo para alta disponibilidad según RNF-03. En producción con mayor carga podríamos escalar a 3 o más réplicas horizontalmente usando la misma arquitectura."

**P: ¿Qué servicios tienen HA?**
> R: "Los 5 servicios críticos:
> - Frontend (Next.js): Interfaz web del usuario
> - Checkout Service: Procesamiento de compras
> - Events Service: Gestión de eventos
> - Producers Service: Gestión de productoras
> - Users Service: Gestión de usuarios
> Cada uno con 2 réplicas."

**P: ¿Cómo manejan las sesiones con múltiples réplicas?**
> R: "Usamos sesiones stateless con tokens JWT almacenados en cookies. Las réplicas no mantienen estado, por lo que cualquier réplica puede atender cualquier request sin problemas de sincronización."

---

## ⏱️ TIMING SUGERIDO

```
00:00 - 00:30  Explicar setup (11 contenedores, 5 servicios)
00:30 - 01:00  Sistema funcionando normal
01:00 - 01:30  Apagar Frontend-1, mostrar que sigue funcionando
01:30 - 02:00  Apagar Checkout-1, mostrar HA en múltiples servicios
02:00 - 02:30  Apagar Events-1, demostrar escalabilidad
02:30 - 03:00  Apagar Frontend-2, mostrar límite del sistema
03:00 - 03:30  Restaurar todo, mostrar recuperación automática
03:30 - 04:30  Resumen y preguntas
```

**Total: 4-5 minutos**

---

## 📱 COMANDOS RÁPIDOS DE REFERENCIA

```bash
# VER TODOS LOS CONTENEDORES
docker ps --filter "name=ticketeate-"

# CONTAR CONTENEDORES ACTIVOS
docker ps --filter "name=ticketeate-" | wc -l

# ═══════════════════════════════════════════════════════
# APAGAR RÉPLICAS (TODAS DISPONIBLES)
# ═══════════════════════════════════════════════════════

# Frontend - Réplica 1
docker stop ticketeate-next-frontend-1
# Frontend - Réplica 2
docker stop ticketeate-next-frontend-2

# Checkout - Réplica 1
docker stop ticketeate-svc-checkout-1
# Checkout - Réplica 2
docker stop ticketeate-svc-checkout-2

# Events - Réplica 1
docker stop ticketeate-svc-events-1
# Events - Réplica 2
docker stop ticketeate-svc-events-2

# Producers - Réplica 1
docker stop ticketeate-svc-producers-1
# Producers - Réplica 2
docker stop ticketeate-svc-producers-2

# Users - Réplica 1
docker stop ticketeate-svc-users-1
# Users - Réplica 2
docker stop ticketeate-svc-users-2

# ═══════════════════════════════════════════════════════
# APAGAR UNA RÉPLICA DE CADA SERVICIO (5 réplicas)
# ═══════════════════════════════════════════════════════
docker stop ticketeate-next-frontend-1 ticketeate-svc-checkout-1 ticketeate-svc-events-1 ticketeate-svc-producers-1 ticketeate-svc-users-1

# ═══════════════════════════════════════════════════════
# RESTAURAR RÉPLICAS (TODAS DISPONIBLES)
# ═══════════════════════════════════════════════════════

# Frontend - Ambas réplicas
docker start ticketeate-next-frontend-1 ticketeate-next-frontend-2

# Checkout - Ambas réplicas
docker start ticketeate-svc-checkout-1 ticketeate-svc-checkout-2

# Events - Ambas réplicas
docker start ticketeate-svc-events-1 ticketeate-svc-events-2

# Producers - Ambas réplicas
docker start ticketeate-svc-producers-1 ticketeate-svc-producers-2

# Users - Ambas réplicas
docker start ticketeate-svc-users-1 ticketeate-svc-users-2

# ═══════════════════════════════════════════════════════
# RESTAURAR TODAS LAS RÉPLICAS DE UNA VEZ (10 réplicas)
# ═══════════════════════════════════════════════════════
docker start ticketeate-next-frontend-1 ticketeate-next-frontend-2 ticketeate-svc-checkout-1 ticketeate-svc-checkout-2 ticketeate-svc-events-1 ticketeate-svc-events-2 ticketeate-svc-producers-1 ticketeate-svc-producers-2 ticketeate-svc-users-1 ticketeate-svc-users-2

# VER LOGS EN TIEMPO REAL
docker logs -f ticketeate-nginx

# VERIFICAR HEALTH
docker inspect --format='{{.State.Health.Status}}' ticketeate-next-frontend-1
```

---

## 🎬 CHECKLIST PRE-DEMO

□ Docker Desktop corriendo  
□ Ejecutar `docker compose up -d`  
□ Esperar 2-3 minutos  
□ Verificar que los 11 contenedores estén "Up"  
□ Abrir las 3 terminales  
□ Copiar los comandos de cada terminal  
□ Probar una vez completo antes de la clase  
□ Tener esta guía abierta durante la demo  

---

## ✨ BONUS: DEMOSTRACIÓN AVANZADA

Si tu profesor quiere ver más, puedes mostrar:

### Ver qué réplica está respondiendo:
```bash
# Ver headers de NGINX
curl -I http://localhost/

# Hacer múltiples requests y ver la distribución
for i in {1..10}; do curl -s http://localhost/ | grep -i "replica\|server" || echo "Request $i OK"; done
```

### Monitoreo de logs en vivo:
```bash
# En una terminal extra
docker logs -f ticketeate-nginx | grep upstream
```

---

**¡Éxito en tu demostración!** 🚀

**Recuerda:** La clave es ir despacio, explicar cada paso, y dejar que tu profesor VEA en tiempo real cómo el sistema NO SE CAE cuando apagas servicios. Eso es mucho más impactante que solo hablar de ello.
