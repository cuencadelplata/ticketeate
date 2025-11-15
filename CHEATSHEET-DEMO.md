# 📄 CHEATSHEET: Demo Manual de Alta Disponibilidad

## 🎯 Setup Rápido

```bash
# 1. Ver instrucciones completas
make demo-manual

# 2. Verificar que los contenedores están corriendo
docker ps --filter "name=ticketeate-demo-"
```

---

## 📺 Comandos para cada Terminal

### Terminal 1 - Monitor (Copiar completo)
```bash
watch -n 1 'docker ps --filter "name=ticketeate-demo-" --format "table {{.Names}}\t{{.Status}}" | sort'
```

### Terminal 2 - Peticiones HTTP (Copiar completo)
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

> **⚠️ Nota:** El `--max-time 1` es importante para ver los FAIL cuando apagas servicios.

### Terminal 3 - Control (Ejecutar uno por uno)

#### Escenario 1: Un servicio
```bash
docker stop ticketeate-demo-frontend-1
# Esperar 5 segundos, observar Terminal 2
docker start ticketeate-demo-frontend-1
```

#### Escenario 2: Tres servicios
```bash
docker stop ticketeate-demo-frontend-1 ticketeate-demo-checkout-1 ticketeate-demo-events-1
# Esperar 5 segundos, observar Terminal 2
docker start ticketeate-demo-frontend-1 ticketeate-demo-checkout-1 ticketeate-demo-events-1
```

#### Escenario 3: Todas las réplicas 1
```bash
docker stop ticketeate-demo-frontend-1 ticketeate-demo-checkout-1 ticketeate-demo-events-1 ticketeate-demo-producers-1 ticketeate-demo-users-1
# Esperar 5 segundos, observar Terminal 2
docker start ticketeate-demo-frontend-1 ticketeate-demo-checkout-1 ticketeate-demo-events-1 ticketeate-demo-producers-1 ticketeate-demo-users-1
```

---

## 💬 Guión para Explicar

### Introducción (1 min)
> "Hemos implementado RNF-03: Alta Disponibilidad para Ticketeate.
> Tenemos 5 servicios críticos, cada uno con 2 réplicas.
> Esto garantiza que si una réplica falla, la otra toma el tráfico automáticamente."

### Mostrar Terminales (30 seg)
> "En Terminal 1 ven los 11 contenedores corriendo.
> En Terminal 2 ven peticiones HTTP en tiempo real.
> En Terminal 3 voy a simular fallas de servicios."

### Demo Escenario 1 (1 min)
```bash
docker stop ticketeate-demo-frontend-1
```
> "Acabé de apagar el Frontend réplica 1.
> Observen Terminal 1: el contenedor está caído.
> Pero Terminal 2: el sistema sigue respondiendo al 100%.
> NGINX detectó la falla y redirigió a la réplica 2."

```bash
docker start ticketeate-demo-frontend-1
```
> "Y puedo restaurarlo cuando quiera."

### Demo Escenario 2 (1 min)
```bash
docker stop ticketeate-demo-frontend-1 ticketeate-demo-checkout-1 ticketeate-demo-events-1
```
> "Ahora apago 3 servicios simultáneamente.
> El sistema aún funciona al 100%.
> Esto es alta disponibilidad real."

### Conclusión (30 seg)
> "Cumplimos RNF-03:
> - ✓ 2 réplicas por servicio crítico
> - ✓ Failover automático
> - ✓ Zero downtime
> - ✓ Sistema resiliente a fallos"

---

## 🧹 Limpieza

```bash
# Detener comandos en Terminal 1 y 2
Ctrl+C

# Limpiar contenedores
docker stop $(docker ps -q --filter "name=ticketeate-demo-")
docker rm $(docker ps -aq --filter "name=ticketeate-demo-")
docker network rm ticketeate-demo-network
```

---

## ⚡ Comandos Extra (Si el profesor pregunta)

### Ver configuración NGINX
```bash
docker exec ticketeate-demo-nginx cat /etc/nginx/conf.d/default.conf | grep -A 3 "upstream"
```

### Ver logs de balanceo
```bash
docker logs ticketeate-demo-nginx --tail 20
```

### Ver estadísticas
```bash
docker stats --filter "name=ticketeate-demo-" --no-stream
```

---

## 📊 Datos Clave para Mencionar

| Métrica | Valor |
|---------|-------|
| Servicios críticos | 5 |
| Réplicas por servicio | 2 |
| Total contenedores | 11 |
| Algoritmo balanceo | least_conn |
| Disponibilidad | 100% |
| Tiempo de failover | < 1 segundo |

---

## ✅ Checklist Pre-Demo

- [ ] Contenedores corriendo: `docker ps --filter "name=ticketeate-demo-"`
- [ ] Puerto responde: `curl http://localhost:8080`
- [ ] 3 terminales abiertas
- [ ] Esta cheatsheet impresa o en pantalla secundaria

---

**¡Éxito en tu presentación! 🎉**
