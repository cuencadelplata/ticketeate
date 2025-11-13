# Script para actualizar la configuración de nginx con la URL del API Gateway
# Uso: .\update-nginx-config.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-2"
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Actualizando configuración de Nginx" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio de infrastructure
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..\..\\infrastructure")

# Obtener la URL del API Gateway desde Terraform
Write-Host "Obteniendo URL del API Gateway..." -ForegroundColor Yellow

try {
    $terraformOutput = terraform output -json api_gateway_urls 2>$null | ConvertFrom-Json
    $apiGatewayUrl = $terraformOutput.base_url
    
    if ([string]::IsNullOrWhiteSpace($apiGatewayUrl)) {
        throw "URL del API Gateway vacía"
    }
    
    Write-Host "URL del API Gateway: $apiGatewayUrl" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: No se pudo obtener la URL del API Gateway" -ForegroundColor Red
    Write-Host "Asegúrate de que 'terraform apply' se haya ejecutado correctamente" -ForegroundColor Red
    exit 1
}

# Extraer host del API Gateway (sin https://)
$apiHost = $apiGatewayUrl -replace '^https://', '' -replace '/.*$', ''
Write-Host "Host del API Gateway: $apiHost" -ForegroundColor Green

# Actualizar archivo hybrid.conf
$nginxConf = Join-Path $PSScriptRoot "..\..\apps\nginx\hybrid.conf"

if (-not (Test-Path $nginxConf)) {
    Write-Host "ERROR: No se encontró el archivo $nginxConf" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Actualizando $nginxConf..." -ForegroundColor Yellow

# Crear backup
$backupFile = "$nginxConf.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $nginxConf $backupFile
Write-Host "Backup creado: $backupFile" -ForegroundColor Gray

# Leer contenido del archivo
$content = Get-Content $nginxConf -Raw

# Reemplazar las URLs de ejemplo con la URL real del API Gateway
$content = $content -replace 'https://xxxxxxxxxx\.execute-api\.us-east-2\.amazonaws\.com/prod', $apiGatewayUrl
$content = $content -replace 'xxxxxxxxxx\.execute-api\.us-east-2\.amazonaws\.com', $apiHost

# Guardar el archivo actualizado
Set-Content -Path $nginxConf -Value $content -NoNewline

Write-Host "Archivo actualizado correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Revisar el archivo: cat $nginxConf" -ForegroundColor White
Write-Host "2. Copiar a tu servidor EC2 Nginx" -ForegroundColor White
Write-Host "3. Reiniciar nginx: sudo systemctl reload nginx" -ForegroundColor White
Write-Host ""
Write-Host "Comando para copiar al servidor (reemplaza <nginx-ip>):" -ForegroundColor Yellow
Write-Host "scp $nginxConf ubuntu@<nginx-ip>:/tmp/hybrid.conf" -ForegroundColor Gray
Write-Host "ssh ubuntu@<nginx-ip> 'sudo mv /tmp/hybrid.conf /etc/nginx/sites-available/hybrid.conf && sudo ln -sf /etc/nginx/sites-available/hybrid.conf /etc/nginx/sites-enabled/hybrid.conf && sudo nginx -t && sudo systemctl reload nginx'" -ForegroundColor Gray
Write-Host ""

# Obtener la IP del servidor Nginx
try {
    $nginxIp = (terraform output -raw nginx_public_ip 2>$null)
    if (-not [string]::IsNullOrWhiteSpace($nginxIp)) {
        Write-Host "IP del servidor Nginx: $nginxIp" -ForegroundColor Green
        Write-Host ""
        Write-Host "Comandos con IP real:" -ForegroundColor Yellow
        Write-Host "scp $nginxConf ubuntu@${nginxIp}:/tmp/hybrid.conf" -ForegroundColor Gray
        Write-Host "ssh ubuntu@${nginxIp} 'sudo mv /tmp/hybrid.conf /etc/nginx/sites-available/hybrid.conf && sudo ln -sf /etc/nginx/sites-available/hybrid.conf /etc/nginx/sites-enabled/hybrid.conf && sudo nginx -t && sudo systemctl reload nginx'" -ForegroundColor Gray
    }
}
catch {
    # Si no se puede obtener la IP, no es crítico
}

Write-Host ""
