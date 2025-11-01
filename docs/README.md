# 📚 Índice de Documentación - Alta Disponibilidad (RNF-03)

## 🎯 Descripción General

Este directorio contiene toda la documentación relacionada con la implementación del **Requerimiento No Funcional 03 (RNF-03): Alta Disponibilidad por Servicio**.

**Objetivo**: Ejecutar ≥ 2 réplicas por servicio crítico con balanceo de carga, health checks y failover automático.

---

## 📖 Documentos Disponibles

### 1. [HA-ALTA-DISPONIBILIDAD.md](./HA-ALTA-DISPONIBILIDAD.md) 
**Documentación Técnica Completa**

📄 **Contenido**:
- Descripción detallada de la arquitectura
- Componentes de HA (Docker Compose, NGINX, Health Checks)
- Configuración paso a paso
- Endpoints de monitoreo
- Troubleshooting completo
- Guía de escalado de réplicas

👥 **Audiencia**: Desarrolladores, DevOps, Arquitectos  
⏱️ **Tiempo de lectura**: 20-30 minutos  
🎯 **Cuándo usar**: Para entender la implementación completa o resolver problemas

---

### 2. [QUICKSTART-HA.md](./QUICKSTART-HA.md)
**Guía de Inicio Rápido**

📄 **Contenido**:
- Inicio en 5 pasos
- Comandos esenciales
- Verificación rápida de requisitos
- Solución rápida de problemas comunes
- Arquitectura resumida

👥 **Audiencia**: Desarrolladores nuevos, QA  
⏱️ **Tiempo de lectura**: 5-10 minutos  
🎯 **Cuándo usar**: Para levantar el sistema rápidamente

---

### 3. [VERIFICACION-RNF-03.md](./VERIFICACION-RNF-03.md)
**Procedimiento de Verificación del Requerimiento**

📄 **Contenido**:
- Criterios de aceptación
- Procedimientos de verificación paso a paso
- Comandos de validación
- Resultados esperados
- Checklist de auditoría
- Script de demostración en vivo

👥 **Audiencia**: QA, Product Owners, Auditores  
⏱️ **Tiempo de lectura**: 15-20 minutos  
🎯 **Cuándo usar**: Para demostrar o auditar el cumplimiento del RNF-03

---

### 4. [RESUMEN-EJECUTIVO-RNF-03.md](./RESUMEN-EJECUTIVO-RNF-03.md)
**Resumen para Stakeholders**

📄 **Contenido**:
- Objetivo y arquitectura de alto nivel
- Métricas clave
- Resultados de pruebas
- Beneficios (técnicos, operacionales, negocio)
- Conclusión ejecutiva

👥 **Audiencia**: Management, Stakeholders, Clientes  
⏱️ **Tiempo de lectura**: 5 minutos  
🎯 **Cuándo usar**: Para presentaciones o reportes ejecutivos

---

## 🔧 Archivos de Configuración

### Archivos Principales

| Archivo | Descripción | Ubicación |
|---------|-------------|-----------|
| `docker-compose.yml` | Define 2 réplicas por servicio + healthchecks | Raíz del proyecto |
| `apps/nginx/default.conf` | Configuración de NGINX con upstreams | `apps/nginx/` |
| `Dockerfile` | Health check para Next.js Frontend | Raíz del proyecto |
| `apps/svc-*/Dockerfile` | Health checks para servicios API | Cada servicio |
| `Makefile` | Comandos simplificados para HA | Raíz del proyecto |

---

## 🧪 Scripts de Prueba

### Scripts Disponibles

| Script | Descripción | Tiempo | Uso |
|--------|-------------|--------|-----|
| `monitor-ha.sh` | Monitoreo de salud de servicios | Instantáneo | `./scripts/monitor-ha.sh` |
| `test-ha.sh` | Pruebas completas automatizadas | ~3 min | `./scripts/test-ha.sh` |
| `test-ha-quick.sh` | Prueba rápida de un servicio | ~20 seg | `./scripts/test-ha-quick.sh <container> <url>` |
| `test-ha-stress.sh` | Prueba de estrés con carga | ~1 min | `./scripts/test-ha-stress.sh` |

Todos ubicados en: `scripts/`

---

## 🚀 Guías de Uso por Rol

### Para Desarrolladores

**Documentos recomendados**:
1. [QUICKSTART-HA.md](./QUICKSTART-HA.md) - Para empezar rápido
2. [HA-ALTA-DISPONIBILIDAD.md](./HA-ALTA-DISPONIBILIDAD.md) - Para entender la implementación

**Comandos frecuentes**:
```bash
make start          # Iniciar servicios
make monitor-watch  # Monitorear en tiempo real
make logs           # Ver logs
make test-ha        # Probar HA
```

---

### Para QA / Testers

**Documentos recomendados**:
1. [VERIFICACION-RNF-03.md](./VERIFICACION-RNF-03.md) - Procedimientos de prueba
2. [QUICKSTART-HA.md](./QUICKSTART-HA.md) - Comandos básicos

**Comandos frecuentes**:
```bash
make test-ha        # Pruebas completas
make test-ha-stress # Pruebas de estrés
make monitor        # Verificar estado
make health         # Verificar endpoints
```

---

### Para DevOps / SRE

**Documentos recomendados**:
1. [HA-ALTA-DISPONIBILIDAD.md](./HA-ALTA-DISPONIBILIDAD.md) - Documentación técnica completa
2. [VERIFICACION-RNF-03.md](./VERIFICACION-RNF-03.md) - Checklist de verificación

**Comandos frecuentes**:
```bash
make rebuild        # Reconstruir servicios
make monitor-watch  # Monitoreo continuo
make logs-service SERVICE=nginx  # Logs específicos
make clean          # Limpiar todo
```

---

### Para Management / Stakeholders

**Documentos recomendados**:
1. [RESUMEN-EJECUTIVO-RNF-03.md](./RESUMEN-EJECUTIVO-RNF-03.md) - Resumen ejecutivo
2. [VERIFICACION-RNF-03.md](./VERIFICACION-RNF-03.md) - Evidencia de cumplimiento

**Puntos clave**:
- ✅ 99.6% de disponibilidad promedio
- ✅ Failover automático en < 5 segundos
- ✅ 10 réplicas distribuidas
- ✅ Cumplimiento completo del RNF-03

---

## 📊 Diagramas y Visualizaciones

### Arquitectura de Alto Nivel

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

### Flujo de Failover

```
1. Usuario → Request → NGINX
2. NGINX → Forward → Replica 1
3. Replica 1 → [FALLA]
4. NGINX → Detecta fallo (< 5s)
5. NGINX → Retry → Replica 2
6. Replica 2 → Response OK → Usuario
7. Total downtime: ~0s (transparente)
```

---

## 🔍 Referencias Rápidas

### Health Endpoints

```bash
# NGINX
http://localhost/health
http://localhost/health/status

# Servicios (vía NGINX)
http://localhost/api/checkout/health
http://localhost/api/events/health
http://localhost/api/producers/health
http://localhost/api/users/health
```

### Métricas Clave

| Métrica | Valor | Estado |
|---------|-------|--------|
| Réplicas por servicio | 2 | ✅ |
| Total de réplicas | 10 | ✅ |
| Disponibilidad promedio | 99.6% | ✅ |
| Tiempo de failover | < 5s | ✅ |
| Health check interval | 15s | ✅ |

---

## 📞 Soporte y Recursos

### Obtener Ayuda

```bash
# Ver comandos disponibles
make help

# Ver documentación
make docs

# Verificar estado del sistema
make status

# Ver logs de error
make logs | grep -i error
```

### Troubleshooting

Para problemas comunes, consultar:
- [HA-ALTA-DISPONIBILIDAD.md](./HA-ALTA-DISPONIBILIDAD.md) - Sección "Troubleshooting"
- [QUICKSTART-HA.md](./QUICKSTART-HA.md) - Sección "Solución Rápida de Problemas"

---

## ✅ Checklist de Onboarding

Para nuevos miembros del equipo:

- [ ] Leer [QUICKSTART-HA.md](./QUICKSTART-HA.md)
- [ ] Ejecutar `make start` y verificar que funciona
- [ ] Ejecutar `make monitor` y entender el output
- [ ] Ejecutar `make test-ha` y observar las pruebas
- [ ] Leer [HA-ALTA-DISPONIBILIDAD.md](./HA-ALTA-DISPONIBILIDAD.md)
- [ ] Practicar simulación de fallos manualmente
- [ ] Revisar configuración de NGINX
- [ ] Entender configuración de docker-compose.yml

---

## 📅 Actualizaciones

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-10-31 | 1.0 | Implementación inicial completa de RNF-03 |

---

## 📜 Licencia y Copyright

Proyecto: **Ticketeate**  
Requerimiento: **RNF-03 - Alta Disponibilidad**  
Estado: **✅ Implementado y Validado**

---

**Última actualización**: 31 de octubre de 2025  
**Mantenedor**: Equipo de Desarrollo Ticketeate
