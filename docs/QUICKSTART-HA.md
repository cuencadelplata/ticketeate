# Guía Rápida de Inicio - Alta Disponibilidad

## 🚀 Inicio Rápido en 5 Pasos

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar y configurar las variables
nano .env
```

Asegúrate de configurar:
- `DATABASE_URL`: Tu conexión a PostgreSQL
- `BETTER_AUTH_SECRET`: Clave secreta (min 32 caracteres)
- `RESEND_API_KEY`: API key de Resend para emails

### 2. Construir e Iniciar Todos los Servicios

```bash
# Construir las imágenes y levantar los contenedores
docker-compose up -d --build

# Ver el progreso
docker-compose logs -f
```

**Tiempo estimado**: 5-10 minutos en primera ejecución

### 3. Verificar que Todo Está Funcionando

```bash
# Ejecutar el script de monitoreo
./scripts/monitor-ha.sh
```

Deberías ver:
- ✓ 11 contenedores corriendo
- ✓ Todos los servicios con estado "healthy"
- ✓ 2 réplicas por cada servicio crítico

### 4. Probar la Alta Disponibilidad

```bash
# Ejecutar prueba automatizada completa (toma ~3 minutos)
./scripts/test-ha.sh

# O hacer una prueba rápida manual (toma ~20 segundos)
./scripts/test-ha-quick.sh ticketeate-next-frontend-1 http://localhost/
```

### 5. Acceder a la Aplicación

```bash
# Frontend
http://localhost

# Health check
http://localhost/health

# Status de servicios
http://localhost/health/status
```

## 🎯 Comandos Útiles

### Monitoreo

```bash
# Ver estado actual (una vez)
./scripts/monitor-ha.sh

# Monitoreo en tiempo real (actualiza cada 2 segundos)
watch -n 2 ./scripts/monitor-ha.sh

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f svc-checkout-1
```

### Gestión de Servicios

```bash
# Detener todo
docker-compose down

# Reiniciar un servicio específico
docker-compose restart svc-checkout-1

# Escalar réplicas (si usas docker-compose v2)
docker-compose up -d --scale svc-checkout=3

# Ver estado de contenedores
docker ps --filter "name=ticketeate-"
```

### Pruebas de Failover

```bash
# Prueba automática completa
./scripts/test-ha.sh

# Prueba rápida de un servicio
./scripts/test-ha-quick.sh ticketeate-svc-events-1 http://localhost/api/events/health

# Detener manualmente una réplica y observar
docker stop ticketeate-next-frontend-1
# ... hacer requests a http://localhost/ ...
docker start ticketeate-next-frontend-1
```

## 📊 Verificación de Requisitos

El sistema cumple con **RNF-03** si:

✅ Tienes 2+ réplicas corriendo por cada servicio  
✅ Al detener una réplica, los requests siguen funcionando  
✅ La disponibilidad se mantiene ≥ 99%  
✅ NGINX balancea automáticamente entre réplicas  
✅ Health checks funcionan correctamente  

## 🆘 Solución Rápida de Problemas

### Error: "No se puede conectar a la base de datos"

```bash
# Verificar que DATABASE_URL está configurado en .env
cat .env | grep DATABASE_URL

# Verificar conectividad
docker exec ticketeate-next-frontend-1 env | grep DATABASE_URL
```

### Error: "Puerto 80 ya está en uso"

```bash
# Ver qué está usando el puerto
lsof -i :80

# Cambiar puerto en docker-compose.yml
# ports:
#   - "8080:80"  # En lugar de "80:80"
```

### Error: "Contenedor unhealthy"

```bash
# Ver logs del contenedor
docker logs ticketeate-svc-checkout-1

# Ver detalles del health check
docker inspect --format='{{json .State.Health}}' ticketeate-svc-checkout-1 | jq .

# Reiniciar
docker restart ticketeate-svc-checkout-1
```

### Error: "Scripts no ejecutables"

```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh
```

## 📖 Documentación Completa

Para más detalles, consulta:
- [docs/HA-ALTA-DISPONIBILIDAD.md](./HA-ALTA-DISPONIBILIDAD.md) - Documentación completa de HA

## 🎓 Arquitectura Resumida

```
Internet/Usuario
       ↓
  NGINX (80/443) ← Load Balancer
       ↓
   ┌───┴───────────────┐
   ↓                   ↓
Frontend (2×)      API Services (4 servicios × 2 réplicas)
   ↓                   ↓
Database (PostgreSQL)
```

**Total**: 11 contenedores
- 1 NGINX Load Balancer
- 2 Next.js Frontend
- 8 API Services (4 servicios × 2 réplicas cada uno)

---

**¿Necesitas ayuda?** Revisa los logs con `docker-compose logs -f` o consulta la documentación completa.
