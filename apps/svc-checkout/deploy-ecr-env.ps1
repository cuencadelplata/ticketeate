# Script de despliegue a ECR

param(
    [string]$Region = "us-east-2",
    [string]$AccountId = "665352994810",
    [string]$RepositoryName = "hono/ticketeate",
    [string]$ImageTag = "latest"
)

Write-Host "Despliegue de Hono Backend a AWS ECR (Variables de Entorno)" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Configurar variables de entorno AWS de manera segura
# Intentar leer desde archivo .env primero
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Write-Host "Leyendo credenciales desde archivo .env..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            Set-Variable -Name $key -Value $value -Scope Global
        }
    }
    
    # Configurar variables de entorno desde archivo .env
    $env:AWS_ACCESS_KEY_ID = $AWS_ACCESS_KEY_ID
    $env:AWS_SECRET_ACCESS_KEY = $AWS_SECRET_ACCESS_KEY
    $env:AWS_DEFAULT_REGION = if ($AWS_DEFAULT_REGION) { $AWS_DEFAULT_REGION } else { $Region }
    
    # Usar valores del archivo .env si están disponibles
    if ($AWS_ACCOUNT_ID) { $AccountId = $AWS_ACCOUNT_ID }
    if ($ECR_REPOSITORY_NAME) { $RepositoryName = $ECR_REPOSITORY_NAME }
} else {
    Write-Host "Archivo .env no encontrado. Usando parámetros del script..." -ForegroundColor Yellow
    Write-Host "Para mayor seguridad, crea un archivo .env basado en env.example" -ForegroundColor Yellow
    $env:AWS_DEFAULT_REGION = $Region
}

# Variables
$ECR_URI = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$FullImageName = "$ECR_URI/$RepositoryName`:$ImageTag"
$LocalImageName = "hono/ticketeate"

try {
    # Paso 1: Verificar Docker
    Write-Host "Verificando Docker..." -ForegroundColor Yellow
    docker --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está instalado"
    }
    
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Desktop no está ejecutándose"
    }
    Write-Host "Docker está funcionando" -ForegroundColor Green

    # Paso 2: Verificar AWS CLI
    Write-Host "Verificando AWS CLI..." -ForegroundColor Yellow
    aws --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "AWS CLI no está instalado"
    }
    Write-Host "AWS CLI está funcionando" -ForegroundColor Green

    # Paso 3: Verificar permisos ECR
    Write-Host "Verificando permisos ECR..." -ForegroundColor Yellow
    $ecrTest = aws ecr describe-repositories --region $Region 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Sin permisos para ECR: $ecrTest"
    }
    Write-Host "Permisos ECR verificados" -ForegroundColor Green

    # Paso 4: Autenticarse con ECR
    Write-Host "Autenticándose con ECR..." -ForegroundColor Yellow
    $loginToken = aws ecr get-login-password --region $Region
    if ($LASTEXITCODE -ne 0) {
        throw "Error al obtener token de login ECR"
    }
    
    $loginToken | docker login --username AWS --password-stdin $ECR_URI
    if ($LASTEXITCODE -ne 0) {
        throw "Error al autenticarse con ECR"
    }
    Write-Host "Autenticación exitosa con ECR" -ForegroundColor Green

    # Paso 5: Construir imagen Docker
    Write-Host "Construyendo imagen Docker..." -ForegroundColor Yellow
    docker build --platform linux/amd64 --no-cache --progress=plain -f Dockerfile.ecr-compatible -t $LocalImageName .
    if ($LASTEXITCODE -ne 0) {
        throw "Error al construir la imagen Docker"
    }
    Write-Host "Imagen Docker construida exitosamente" -ForegroundColor Green

    # Paso 6: Etiquetar imagen para ECR
    Write-Host "Etiquetando imagen para ECR..." -ForegroundColor Yellow
    docker tag "$LocalImageName`:latest" $FullImageName
    if ($LASTEXITCODE -ne 0) {
        throw "Error al etiquetar la imagen"
    }
    Write-Host "Imagen etiquetada: $FullImageName" -ForegroundColor Green

    # Paso 7: Enviar imagen a ECR
    Write-Host "Enviando imagen a ECR..." -ForegroundColor Yellow
    docker push $FullImageName
    if ($LASTEXITCODE -ne 0) {
        throw "Error al enviar la imagen a ECR"
    }
    Write-Host "Imagen enviada exitosamente a ECR" -ForegroundColor Green

    # Paso 8: Limpiar imágenes locales
    Write-Host "Limpiando imágenes locales..." -ForegroundColor Yellow
    docker rmi "$LocalImageName`:latest" -f 2>$null
    docker rmi $FullImageName -f 2>$null
    Write-Host "Limpieza completada" -ForegroundColor Green

    Write-Host "`n🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "Imagen disponible en: $FullImageName" -ForegroundColor Cyan
    Write-Host "URI del repositorio: $ECR_URI/$RepositoryName" -ForegroundColor Cyan

} catch {
    Write-Host "`n❌ Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Limpiar variables de entorno
    Remove-Item Env:AWS_ACCESS_KEY_ID -ErrorAction SilentlyContinue
    Remove-Item Env:AWS_SECRET_ACCESS_KEY -ErrorAction SilentlyContinue
    Remove-Item Env:AWS_DEFAULT_REGION -ErrorAction SilentlyContinue
}

