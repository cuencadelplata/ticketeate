# 🎭 GUÍA DE DEMOSTRACIÓN MANUAL - ALTA DISPONIBILIDAD

## 📋 Preparación (Antes de la clase)

### Paso 1: Levantar el Sistema

Abre una terminal y ejecuta:

```bash
cd /Users/ivancabrera/Desktop/Repositorios/ticketeate
./scripts/demo-ha-simple.sh
```

Esto levanta:
- ✅ `ha-test-web-1` - Réplica 1 del servicio
- ✅ `ha-test-web-2` - Réplica 2 del servicio  
- ✅ `ha-test-nginx` - Load Balancer en puerto 8080

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
# Ver estado de los contenedores en tiempo real (macOS compatible)
while true; do clear; docker ps --filter "name=ha-test-" --format "table {{.Names}}\t{{.Status}}"; sleep 1; done
```

> **Nota:** `watch` no existe en macOS por defecto, por eso usamos este loop equivalente.

**Qué verás:**
```
NAMES             STATUS
ha-test-nginx     Up 2 minutes
ha-test-web-2     Up 2 minutes
ha-test-web-1     Up 2 minutes
```

---

### Terminal 2: Requests Continuos

```bash
# Hacer requests cada 0.5 segundos
while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
  if [ "$response" = "200" ]; then
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

---

## 🎤 GUIÓN DE DEMOSTRACIÓN

### Fase 1: Sistema Funcionando Normal (30 segundos)

**Tú dices:**
> "Como pueden ver, tengo un sistema con alta disponibilidad corriendo. En la Terminal 1 vemos 3 contenedores activos: NGINX como load balancer y 2 réplicas del servicio web. En la Terminal 2 vemos que todas las peticiones se están atendiendo correctamente con ✓."

**Muestra:**
- Terminal 1: Los 3 contenedores "Up"
- Terminal 2: Solo ✓✓✓✓✓✓✓

**Opcional - Ver qué réplica responde:**
```bash
# Terminal 3
curl http://localhost:8080 | grep "Server Name"
curl http://localhost:8080 | grep "Server Name"
curl http://localhost:8080 | grep "Server Name"
```

Verás que responde a veces "Replica-1" y a veces "Replica-2" (balanceo funcionando).

---

### Fase 2: Apagar Réplica 1 - ¡LA PARTE CRÍTICA! 🔴

**Tú dices:**
> "Ahora voy a simular una falla. Voy a apagar completamente la Réplica 1, como si el servidor se hubiera caído o perdiera conexión."

**En Terminal 3, ejecuta:**
```bash
docker stop ha-test-web-1
```

**Qué debe pasar INMEDIATAMENTE:**

✅ **Terminal 1:** 
- `ha-test-web-1` cambia a "Exited"
- Los otros 2 siguen "Up"

✅ **Terminal 2:** 
- Debes seguir viendo **SOLO ✓✓✓✓✓✓✓**
- **NO debe haber ✗** (o máximo 1-2 al momento exacto del cambio)

**Tú dices:**
> "Como pueden observar, aunque la Réplica 1 está completamente apagada (muestras Terminal 1), el sistema sigue atendiendo todas las peticiones sin problemas (muestras Terminal 2). NGINX detectó automáticamente la falla y redirigió todo el tráfico a la Réplica 2. El usuario final no percibe ninguna interrupción."

**Deja corriendo 20-30 segundos así** para que tu profesor vea que es estable.

---

### Fase 3: Verificar que Solo usa Réplica 2

**Opcional - Mostrar que solo responde Réplica 2:**
```bash
# Terminal 3
curl http://localhost:8080 | grep "Server Name"
curl http://localhost:8080 | grep "Server Name"
curl http://localhost:8080 | grep "Server Name"
```

Ahora SIEMPRE verás "Replica-2" (porque la 1 está caída).

---

### Fase 4: Apagar TAMBIÉN Réplica 2 (Demostrar límite) 🔴🔴

**Tú dices:**
> "Ahora voy a demostrar qué pasa si se cae la segunda réplica también. En un sistema real con solo 2 réplicas, esto sí causaría una interrupción total."

**En Terminal 3:**
```bash
docker stop ha-test-web-2
```

**Qué debe pasar:**

❌ **Terminal 2:** 
- Ahora SÍ verás ✗✗✗✗✗✗✗ (errores)

**Tú dices:**
> "Como era de esperar, al caer ambas réplicas el servicio no está disponible. Esto demuestra que necesitamos al menos una réplica funcional. Por eso se recomienda tener al menos 3 réplicas en producción."

---

### Fase 5: Restaurar el Sistema ✅

**Tú dices:**
> "Ahora voy a restaurar las réplicas y veremos cómo el sistema se recupera automáticamente."

**En Terminal 3:**
```bash
# Restaurar Réplica 2 primero
docker start ha-test-web-2

# Esperar 3 segundos
sleep 3

# Verificar que funciona
curl http://localhost:8080
```

**Qué debe pasar:**

✅ **Terminal 2:** 
- Vuelven los ✓✓✓✓✓✓✓

**Restaurar también Réplica 1:**
```bash
docker start ha-test-web-1
```

**Qué debe pasar:**

✅ **Terminal 1:** 
- Ambas réplicas vuelven a "Up"

✅ **Terminal 2:** 
- Sigue con ✓✓✓✓✓✓✓

---

### Fase 6: Apagar Réplica 2 (La otra) 🔴

**Tú dices:**
> "Para demostrar que funciona con cualquier réplica, ahora voy a apagar la Réplica 2 en lugar de la 1."

**En Terminal 3:**
```bash
docker stop ha-test-web-2
```

**Qué debe pasar:**

✅ El sistema sigue funcionando, ahora usando solo Réplica 1.

---

## 📊 RESUMEN FINAL

**Tú dices:**
> "Como pudieron ver, el sistema cumple con el RNF-03 de Alta Disponibilidad:
> 
> ✅ Tenemos 2 réplicas del servicio
> ✅ NGINX balancea la carga entre ellas
> ✅ Cuando una réplica falla, el sistema sigue funcionando automáticamente
> ✅ El failover es transparente para el usuario
> ✅ La disponibilidad se mantiene en 99-100% con una réplica caída
> 
> En nuestro proyecto Ticketeate real, implementamos esto con:
> - 2 réplicas de Next.js Frontend
> - 2 réplicas de cada microservicio (Checkout, Events, Producers, Users)
> - Total de 11 contenedores con balanceo automático"

---

## 🧹 Limpieza (Después de la demo)

```bash
docker stop ha-test-nginx ha-test-web-1 ha-test-web-2
docker rm ha-test-nginx ha-test-web-1 ha-test-web-2
docker network rm ha-test-network
```

---

## 🎯 TIPS PARA LA DEMO

### ✅ QUÉ HACER:

1. **Practica antes** - Hazlo 2-3 veces antes de la clase
2. **Deja correr tiempo suficiente** - 20-30 segundos en cada fase
3. **Explica mientras haces** - No te apures
4. **Muestra las 3 terminales** - Proyecta tu pantalla claramente
5. **Menciona números** - "100% disponibilidad", "2 réplicas", etc.

### ❌ QUÉ NO HACER:

1. **No apagues las 2 réplicas al mismo tiempo** - Empieza con una
2. **No cierres las terminales** - Déjalas corriendo
3. **No uses comandos que no probaste** - Solo usa los de esta guía
4. **No te apures** - Deja que tu profesor vea cada paso

---

## 🎓 PREGUNTAS QUE PUEDE HACER TU PROFESOR

**P: ¿Cómo sabe NGINX que la réplica está caída?**
> R: "NGINX hace health checks pasivos. Cuando intenta enviar una petición y la réplica no responde, la marca como 'down' automáticamente después de 3 fallos consecutivos. Configuramos max_fails=3 y fail_timeout=30s."

**P: ¿Qué pasa si NGINX se cae?**
> R: "En producción, NGINX también debe tener redundancia, típicamente usando un balanceador de carga externo (AWS ELB, Google Cloud Load Balancer) o múltiples instancias de NGINX con IP virtual compartida (keepalived)."

**P: ¿Cuánto tiempo tarda el failover?**
> R: "En nuestra configuración, menos de 5 segundos. NGINX detecta la falla en el primer intento fallido y redirige inmediatamente a la réplica saludable."

**P: ¿Por qué solo 2 réplicas?**
> R: "Es el mínimo para alta disponibilidad. En producción lo ideal son 3+ réplicas para mejor distribución de carga y mayor tolerancia a fallos. Nosotros usamos 2 para demostrar el concepto y optimizar recursos."

**P: ¿Esto funciona para todos los servicios?**
> R: "Sí, en nuestro proyecto aplicamos esto a:
> - Frontend (Next.js): 2 réplicas
> - Checkout Service: 2 réplicas
> - Events Service: 2 réplicas
> - Producers Service: 2 réplicas
> - Users Service: 2 réplicas
> Total: 10 réplicas + 1 NGINX = 11 contenedores"

---

## ⏱️ TIMING SUGERIDO

```
00:00 - 00:30  Explicar setup inicial (3 contenedores)
00:30 - 01:00  Sistema funcionando normal
01:00 - 01:30  Apagar Réplica 1, mostrar que sigue funcionando
01:30 - 02:00  Dejar corriendo con 1 réplica
02:00 - 02:30  (Opcional) Apagar Réplica 2, mostrar falla total
02:30 - 03:00  Restaurar sistema
03:00 - 03:30  (Opcional) Probar con la otra réplica
03:30 - 04:00  Resumen y preguntas
```

**Total: 4-5 minutos**

---

## 📱 COMANDOS RÁPIDOS DE REFERENCIA

```bash
# VER ESTADO
docker ps --filter "name=ha-test-"

# APAGAR RÉPLICA 1
docker stop ha-test-web-1

# APAGAR RÉPLICA 2
docker stop ha-test-web-2

# RESTAURAR RÉPLICA 1
docker start ha-test-web-1

# RESTAURAR RÉPLICA 2
docker start ha-test-web-2

# HACER REQUEST MANUAL
curl http://localhost:8080

# VER QUÉ RÉPLICA RESPONDE
curl http://localhost:8080 | grep "Server Name"

# LIMPIAR TODO
docker stop ha-test-nginx ha-test-web-1 ha-test-web-2
docker rm ha-test-nginx ha-test-web-1 ha-test-web-2
docker network rm ha-test-network
```

---

## 🎬 ENSAYO

Antes de la clase, practica esto:

1. Ejecuta `./scripts/demo-ha-simple.sh`
2. Abre las 3 terminales
3. Sigue el guión completo
4. Cronométra cuánto tardas
5. Repite hasta que te sientas cómodo

**¡Éxito en tu demostración!** 🚀
