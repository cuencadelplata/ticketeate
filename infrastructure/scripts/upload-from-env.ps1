# Script para subir variables de entorno desde archivo .env a AWS Parameter Store
# Uso: .\upload-from-env.ps1 -EnvFile "..\..\apps\next-frontend\.env" -Environment production

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvFile,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("production", "staging", "development")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-2"
)

$ErrorActionPreference = "Stop"

Write-Host "Subiendo variables de entorno desde archivo .env..." -ForegroundColor Cyan
Write-Host "Archivo: $EnvFile" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Verificar que el archivo existe
if (-not (Test-Path $EnvFile)) {
    Write-Host "ERROR: El archivo $EnvFile no existe" -ForegroundColor Red
    exit 1
}

# Funcion para crear/actualizar parametros
function Set-SSMParameter {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Type = "SecureString",
        [string]$Description = ""
    )
    
    if ([string]::IsNullOrWhiteSpace($Value)) {
        Write-Host "Omitiendo $Name (valor vacio)" -ForegroundColor Gray
        return
    }
    
    $fullName = "/ticketeate/$Environment/$Name"
    
    try {
        Write-Host "Subiendo: $fullName" -ForegroundColor Gray
        
        aws ssm put-parameter `
            --name $fullName `
            --value $Value `
            --type $Type `
            --overwrite `
            --description $Description `
            --region $Region | Out-Null
            
        Write-Host "OK: $fullName" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR en $fullName : $_" -ForegroundColor Red
    }
}

# Leer archivo .env
Write-Host "Leyendo archivo .env..." -ForegroundColor Cyan
$envContent = Get-Content $EnvFile | Where-Object { 
    $_ -notmatch '^\s*#' -and 
    $_ -notmatch '^\s*$' -and 
    $_ -match '=' 
}

# Parsear variables
$envVars = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $Matches[1].Trim()
        $value = $Matches[2].Trim().Trim('"').Trim("'")
        $envVars[$key] = $value
    }
}

Write-Host "Variables encontradas: $($envVars.Count)" -ForegroundColor Green
Write-Host ""

# Mapeo de variables del .env a Parameter Store
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Subiendo variables a AWS Parameter Store" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Database
Write-Host "Database" -ForegroundColor Yellow
Set-SSMParameter -Name "database-url" -Value $envVars["DATABASE_URL"] -Description "PostgreSQL database URL"
Set-SSMParameter -Name "direct-url" -Value $envVars["DIRECT_URL"] -Description "Direct PostgreSQL connection"
Write-Host ""

# Better Auth
Write-Host "Authentication" -ForegroundColor Yellow
Set-SSMParameter -Name "better-auth-secret" -Value $envVars["BETTER_AUTH_SECRET"] -Description "Better Auth secret key"
Set-SSMParameter -Name "better-auth-url" -Value "https://ticketeate.com.ar" -Type "String" -Description "Better Auth URL for production"
Write-Host ""

# Cloudinary
Write-Host "Cloudinary" -ForegroundColor Yellow
Set-SSMParameter -Name "cloudinary-cloud-name" -Value $envVars["CLOUDINARY_CLOUD_NAME"] -Type "String" -Description "Cloudinary cloud name"
Set-SSMParameter -Name "cloudinary-api-key" -Value $envVars["CLOUDINARY_API_KEY"] -Description "Cloudinary API key"
Set-SSMParameter -Name "cloudinary-api-secret" -Value $envVars["CLOUDINARY_API_SECRET"] -Description "Cloudinary API secret"
Write-Host ""

# Google OAuth
Write-Host "Google OAuth" -ForegroundColor Yellow
Set-SSMParameter -Name "google-client-id" -Value $envVars["GOOGLE_CLIENT_ID"] -Type "String" -Description "Google OAuth client ID"
Set-SSMParameter -Name "google-client-secret" -Value $envVars["GOOGLE_CLIENT_SECRET"] -Description "Google OAuth client secret"
Write-Host ""

# Resend
Write-Host "Resend Email" -ForegroundColor Yellow
Set-SSMParameter -Name "resend-api-key" -Value $envVars["RESEND_API_KEY"] -Description "Resend email API key"
Set-SSMParameter -Name "resend-from-email" -Value $envVars["RESEND_FROM_EMAIL"] -Type "String" -Description "Resend from email address"
Write-Host ""

# Mercado Pago
Write-Host "Mercado Pago" -ForegroundColor Yellow
Set-SSMParameter -Name "mercadopago-client-id" -Value $envVars["MERCADO_PAGO_CLIENT_ID"] -Type "String" -Description "Mercado Pago client ID"
Set-SSMParameter -Name "mercadopago-client-secret" -Value $envVars["MERCADO_PAGO_CLIENT_SECRET"] -Description "Mercado Pago client secret"
Write-Host ""

# Service Auth
Write-Host "Service Authentication" -ForegroundColor Yellow
Set-SSMParameter -Name "service-auth-secret" -Value $envVars["SERVICE_AUTH_SECRET"] -Description "Service-to-service authentication secret"
Write-Host ""

# Revalidation Secret
Write-Host "ISR Revalidation" -ForegroundColor Yellow
Set-SSMParameter -Name "revalidation-secret" -Value $envVars["REVALIDATION_SECRET"] -Description "ISR on-demand revalidation secret"
Write-Host ""

# Google Maps
Write-Host "Google Maps" -ForegroundColor Yellow
Set-SSMParameter -Name "google-maps-api-key" -Value $envVars["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"] -Description "Google Maps API key"
Set-SSMParameter -Name "google-places-api-key" -Value $envVars["NEXT_PUBLIC_GOOGLE_PLACES_API_KEY"] -Description "Google Places API key"
Write-Host ""

# Supabase
Write-Host "Supabase" -ForegroundColor Yellow
Set-SSMParameter -Name "supabase-url" -Value $envVars["NEXT_PUBLIC_SUPABASE_URL"] -Type "String" -Description "Supabase project URL"
Set-SSMParameter -Name "supabase-anon-key" -Value $envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] -Type "String" -Description "Supabase anonymous key"
Set-SSMParameter -Name "supabase-service-role-key" -Value $envVars["SUPABASE_SERVICE_ROLE_KEY"] -Description "Supabase service role key (sensitive)"
Write-Host ""

# Grok API (si lo usas)
if ($envVars["GROK_API_KEY"]) {
    Write-Host "Grok AI" -ForegroundColor Yellow
    Set-SSMParameter -Name "grok-api-key" -Value $envVars["GROK_API_KEY"] -Description "Grok AI API key"
    Write-Host ""
}

# Cloudflare (si lo usas)
if ($envVars["CLOUDFLARE_API_TOKEN"]) {
    Write-Host "Cloudflare" -ForegroundColor Yellow
    Set-SSMParameter -Name "cloudflare-account-id" -Value $envVars["CLOUDFLARE_ACCOUNT_ID"] -Type "String" -Description "Cloudflare account ID"
    Set-SSMParameter -Name "cloudflare-api-token" -Value $envVars["CLOUDFLARE_API_TOKEN"] -Description "Cloudflare API token"
    Write-Host ""
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Variables de entorno subidas exitosamente" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para ver los parametros:" -ForegroundColor Yellow
Write-Host "  aws ssm get-parameters-by-path --path /ticketeate/$Environment/ --region $Region" -ForegroundColor Gray
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. cd .." -ForegroundColor Gray
Write-Host "  2. terraform apply" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANTE: Borra tu archivo .env del repositorio si no esta en .gitignore" -ForegroundColor Yellow
Write-Host "  git rm --cached apps/next-frontend/.env" -ForegroundColor Gray
