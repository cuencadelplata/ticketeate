# Admin Dashboard - GitHub Integration

Este dashboard administra y monitorea los deploys de GitHub Actions.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (`apps/admin/.env.local`) con las siguientes variables:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_OWNER=Santserrano
GITHUB_REPO=test-aws-ec2
```

**Importante**:

- `GITHUB_TOKEN` debe ser tu token personal real de GitHub
- `GITHUB_OWNER` es tu usuario de GitHub (Santserrano)
- `GITHUB_REPO` es el nombre del repositorio (test-aws-ec2)

Las variables `NEXT_PUBLIC_GITHUB_OWNER` y `NEXT_PUBLIC_GITHUB_REPO` se configuran automáticamente en `next.config.mjs`.

### 2. GitHub Personal Access Token

Para obtener un token de GitHub:

1. Ve a GitHub Settings > Developer settings > Personal access tokens
2. Genera un nuevo token con los siguientes permisos:
   - `repo` (para repositorios privados)
   - `workflow` (para acceder a GitHub Actions)
   - `read:org` (si necesitas acceder a repositorios de organizaciones)

### 3. Configuración del Repositorio

Asegúrate de que el repositorio tenga:

- GitHub Actions habilitado
- Workflows configurados para deployment
- Permisos de lectura para el token

## Funcionalidades

- **Lista de Deploys**: Muestra todos los workflow runs de GitHub Actions
- **Filtrado por Environment**: Filtra deploys por ambiente (Production, Staging, Development)
- **Paginación**: Navega entre páginas de deploys
- **Actualización Automática**: Los datos se actualizan cada 30 segundos
- **Estado en Tiempo Real**: Muestra el estado actual de cada deploy

## API Endpoints

- `GET /api/github/deploys` - Obtiene la lista de deploys
- `GET /api/github/workflows` - Obtiene información de workflows

## Estructura de Datos

Cada deploy incluye:

- ID único del workflow run
- Estado (ready, error, building)
- Duración del deployment
- Información del commit (mensaje, autor, branch)
- Timestamps de creación y actualización
- URL del workflow run en GitHub

## Desarrollo

Para ejecutar en modo desarrollo:

```bash
npm run dev
# o
pnpm dev
```

El dashboard estará disponible en `http://localhost:3000`

## Troubleshooting

### Error "your-username" o "your-repo"

Si ves "your-username" o "your-repo" en la interfaz:

1. **Verifica que el archivo `.env.local` esté en la ubicación correcta**: `apps/admin/.env.local`
2. **Reinicia el servidor de desarrollo** después de crear/modificar el archivo `.env.local`
3. **Verifica que las variables estén escritas exactamente como se muestra arriba**
4. **Asegúrate de que no haya espacios extra** en las variables

### Error de GitHub API

Si recibes errores de la API de GitHub:

1. **Verifica que el token tenga los permisos correctos** (`repo`, `workflow`)
2. **Confirma que el repositorio existe** y sea accesible
3. **Verifica que GitHub Actions esté habilitado** en el repositorio
4. **Revisa los logs del servidor** para más detalles del error
