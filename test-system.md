# 🧪 Guía de Pruebas del Sistema Ticketeate

## 📋 **Checklist de Pruebas**

### **1. Verificar Servicios en Ejecución**

```bash
# Verificar que los servicios estén corriendo
ps aux | grep -E "(tsx|next)" | grep -v grep

# Deberías ver:
# - next-server (frontend en puerto 3000)
# - tsx watch src/index.ts (backend en puerto 3001)
```

### **2. Probar Endpoints del Backend (Servicio de Eventos)**

#### **Health Check**
```bash
curl http://localhost:3001/health
# Respuesta esperada: {"status":"ok","service":"svc-events"}
```

#### **Obtener Todos los Eventos Públicos**
```bash
curl http://localhost:3001/api/events/all
# Respuesta esperada: Lista de eventos públicos
```

#### **Obtener Evento por ID**
```bash
curl http://localhost:3001/api/events/public/{EVENT_ID}
# Reemplaza {EVENT_ID} con un ID real de evento
```

### **3. Probar Frontend (Next.js)**

#### **Acceso a la Aplicación**
1. Abrir navegador en: `http://localhost:3000`
2. Verificar que la página principal cargue correctamente
3. Verificar que la navegación funcione

#### **Probar Historial de Compras**
1. Ir a: `http://localhost:3000/mis-compras`
2. Verificar que la página cargue sin errores
3. Verificar que muestre el estado vacío si no hay compras
4. Verificar que las estadísticas se muestren correctamente

#### **Probar Navegación**
1. Hacer clic en "Mis Compras" en la barra de navegación
2. Verificar que la navegación funcione correctamente
3. Probar otros enlaces de navegación

### **4. Probar API del Frontend**

#### **Historial de Compras**
```bash
# Nota: Necesitarás estar autenticado
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/purchases/history
```

#### **Estadísticas de Compras**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/purchases/history?includeStats=true
```

### **5. Pruebas de Base de Datos**

#### **Verificar Conexión a la Base de Datos**
```bash
cd packages/db
pnpm prisma studio
# Abrirá Prisma Studio en el navegador para ver los datos
```

#### **Verificar Esquema**
```bash
cd packages/db
pnpm prisma db push
# Verificar que no haya errores de esquema
```

### **6. Pruebas de Componentes React**

#### **Componente de Historial de Compras**
- Verificar que el componente `PurchaseHistory` se renderice correctamente
- Probar estados de carga (skeleton)
- Probar estado de error
- Probar estado vacío

#### **Componente de Resumen de Compras**
- Verificar que el componente `PurchaseSummary` se renderice correctamente
- Probar estadísticas
- Probar lista de compras recientes

### **7. Pruebas de Responsividad**

1. **Desktop**: Verificar en resolución 1920x1080
2. **Tablet**: Verificar en resolución 768x1024
3. **Mobile**: Verificar en resolución 375x667

### **8. Pruebas de Rendimiento**

#### **Tiempo de Carga**
```bash
# Medir tiempo de carga del frontend
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000

# Crear archivo curl-format.txt:
cat > curl-format.txt << EOF
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

### **9. Pruebas de Errores**

#### **Endpoints Inexistentes**
```bash
curl http://localhost:3001/api/events/nonexistent
# Respuesta esperada: 404 Not Found
```

#### **Datos Inválidos**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
# Respuesta esperada: Error de validación
```

### **10. Pruebas de Integración**

#### **Flujo Completo de Usuario**
1. Usuario accede al sitio
2. Navega a "Mis Compras"
3. Ve su historial (vacío o con datos)
4. Ve estadísticas de compras
5. Navega de vuelta al inicio

## 🐛 **Solución de Problemas Comunes**

### **Error: Cannot find module '@repo/db'**
```bash
cd packages/db
pnpm install
pnpm prisma generate
```

### **Error: Cannot find module '@prisma/client'**
```bash
pnpm install @prisma/client
pnpm prisma generate
```

### **Error: Database connection failed**
- Verificar variables de entorno en `.env`
- Verificar que la base de datos esté accesible
- Verificar credenciales de conexión

### **Error: Port already in use**
```bash
# Encontrar proceso usando el puerto
lsof -ti:3000
lsof -ti:3001

# Matar proceso
kill -9 PID
```

## ✅ **Checklist Final**

- [ ] Backend ejecutándose en puerto 3001
- [ ] Frontend ejecutándose en puerto 3000
- [ ] Base de datos conectada
- [ ] Health check funcionando
- [ ] API de eventos funcionando
- [ ] Página de historial de compras cargando
- [ ] Navegación funcionando
- [ ] Componentes renderizando correctamente
- [ ] Responsive design funcionando
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs del servidor

## 🚀 **Comandos Rápidos para Iniciar Todo**

```bash
# Terminal 1: Backend
cd apps/svc-events && pnpm dev

# Terminal 2: Frontend  
cd apps/next-frontend && pnpm dev

# Terminal 3: Base de datos (opcional)
cd packages/db && pnpm prisma studio
```
