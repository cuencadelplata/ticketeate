# Migración de Tabla usuarios a user

## Problema Identificado

El sistema tenía dos tablas de usuarios que causaban confusión:

1. **`usuarios`** - Tabla original del sistema con campo `rol` como String
2. **`user`** - Tabla de Better Auth con campo `role` como enum `Role`

Esto causaba que los roles no se sincronizaran correctamente entre las tablas, resultando en el error "Solo los organizadores pueden crear eventos" incluso cuando el usuario tenía el rol correcto.

## Solución Implementada

### 1. Eliminación de la tabla `usuarios`
- Se eliminó completamente la tabla `usuarios` del schema de Prisma
- Se actualizaron todas las referencias para usar la tabla `user`

### 2. Actualización del schema
- Se actualizó la tabla `user` para incluir todas las relaciones necesarias
- Se cambiaron todas las referencias de `usuarios` a `user` en el schema

### 3. Migración de datos
- Se creó un script de migración (`migrate-usuarios-to-user.ts`) para transferir datos
- Se mapean los roles de la tabla antigua a la nueva:
  - `organizador` → `ORGANIZADOR`
  - `colaborador` → `COLABORADOR`
  - `cliente` → `USUARIO`

## Pasos para Aplicar la Migración

### 1. Backup de la Base de Datos
```bash
# Crear backup antes de la migración
pg_dump your_database > backup_before_migration.sql
```

### 2. Ejecutar la Migración de Datos
```bash
cd packages/db
npx tsx scripts/migrate-usuarios.ts
```

### 3. Generar el Cliente de Prisma
```bash
cd packages/db
npx prisma generate
```

### 4. Aplicar la Migración de Base de Datos
```bash
cd packages/db
npx prisma db push
```

### 5. Verificar la Migración
- Verificar que los usuarios existentes tienen sus roles correctos
- Probar la creación de eventos con usuarios organizadores
- Verificar que no hay referencias rotas en el código

## Archivos Modificados

### Schema de Prisma
- `packages/db/prisma/schema.prisma` - Eliminada tabla `usuarios`, actualizadas referencias

### Servicios
- `apps/svc-users/src/services/wallet-service.ts` - Actualizado para usar tabla `user`

### Base de Datos
- `packages/db/src/index.ts` - Eliminada exportación de tipo `usuarios`

### Scripts de Migración
- `packages/db/src/migrate-usuarios-to-user.ts` - Script principal de migración
- `packages/db/scripts/migrate-usuarios.ts` - Script ejecutable

## Verificación Post-Migración

1. **Verificar roles de usuarios:**
   ```sql
   SELECT id, name, email, role FROM "user" WHERE role = 'ORGANIZADOR';
   ```

2. **Probar creación de eventos:**
   - Iniciar sesión con un usuario organizador
   - Intentar crear un evento en `/crear`
   - Verificar que no aparece el error de permisos

3. **Verificar relaciones:**
   ```sql
   SELECT COUNT(*) FROM eventos e JOIN "user" u ON e.creadorid = u.id;
   ```

## Rollback (Si es Necesario)

Si necesitas hacer rollback:

1. Restaurar el backup de la base de datos
2. Revertir los cambios en el código
3. Regenerar el cliente de Prisma

```bash
# Restaurar backup
psql your_database < backup_before_migration.sql

# Revertir cambios en git
git revert <commit-hash>
```
