#!/bin/bash
# Script actualizado para desplegar Next.js con todas las variables de AWS SSM
# Ejecutar en las instancias EC2: sudo bash deploy-nextjs-update.sh

set -e

echo "================================================"
echo "Desplegando Next.js con variables de AWS SSM"
echo "================================================"

ENVIRONMENT="production"
REGION="us-east-2"
ENV_FILE="/home/ubuntu/ticketeate/.env.production"

echo "Descargando variables de entorno desde Parameter Store..."

# Obtener todos los parámetros
PARAMS=$(aws ssm get-parameters-by-path \
    --path "/ticketeate/${ENVIRONMENT}/" \
    --with-decryption \
    --region ${REGION} \
    --query 'Parameters[*].[Name,Value]' \
    --output text)

# Crear directorio y archivo .env
mkdir -p /home/ubuntu/ticketeate
cat > ${ENV_FILE} <<EOV
# Generated from AWS Parameter Store
# $(date)

EOV

# Procesar parámetros y mapear a variables de entorno
echo "$PARAMS" | while read -r name value; do
    # Extraer el nombre de la variable sin el path
    var_name=$(echo $name | sed 's|/ticketeate/production/||')
    
    # Mapear nombres de Parameter Store a variables de entorno
    case $var_name in
        # Database
        database-url) echo "DATABASE_URL=\"$value\"" >> ${ENV_FILE} ;;
        direct-url) echo "DIRECT_URL=\"$value\"" >> ${ENV_FILE} ;;
        
        # Better Auth
        better-auth-secret) echo "BETTER_AUTH_SECRET=\"$value\"" >> ${ENV_FILE} ;;
        better-auth-url) echo "BETTER_AUTH_URL=\"$value\"" >> ${ENV_FILE} ;;
        next-public-better-auth-url) echo "NEXT_PUBLIC_BETTER_AUTH_URL=\"$value\"" >> ${ENV_FILE} ;;
        
        # Cloudinary
        cloudinary-cloud-name) echo "CLOUDINARY_CLOUD_NAME=\"$value\"" >> ${ENV_FILE} ;;
        cloudinary-api-key) echo "CLOUDINARY_API_KEY=\"$value\"" >> ${ENV_FILE} ;;
        cloudinary-api-secret) echo "CLOUDINARY_API_SECRET=\"$value\"" >> ${ENV_FILE} ;;
        next-public-cloudinary-cloud-name) echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=\"$value\"" >> ${ENV_FILE} ;;
        next-public-cloudinary-upload-preset) echo "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=\"$value\"" >> ${ENV_FILE} ;;
        
        # Google OAuth
        google-client-id) echo "GOOGLE_CLIENT_ID=\"$value\"" >> ${ENV_FILE} ;;
        google-client-secret) echo "GOOGLE_CLIENT_SECRET=\"$value\"" >> ${ENV_FILE} ;;
        
        # Resend
        resend-api-key) echo "RESEND_API_KEY=\"$value\"" >> ${ENV_FILE} ;;
        resend-from-email) echo "RESEND_FROM_EMAIL=\"$value\"" >> ${ENV_FILE} ;;
        
        # Mercado Pago
        mercadopago-client-id) echo "MERCADO_PAGO_CLIENT_ID=\"$value\"" >> ${ENV_FILE} ;;
        mercadopago-client-secret) echo "MERCADO_PAGO_CLIENT_SECRET=\"$value\"" >> ${ENV_FILE} ;;
        mercadopago-redirect-uri) echo "MERCADO_PAGO_REDIRECT_URI=\"$value\"" >> ${ENV_FILE} ;;
        mercadopago-mock) echo "MERCADO_PAGO_MOCK=\"$value\"" >> ${ENV_FILE} ;;
        
        # Service Auth
        service-auth-secret) echo "SERVICE_AUTH_SECRET=\"$value\"" >> ${ENV_FILE} ;;
        
        # Revalidation
        revalidation-secret) echo "REVALIDATION_SECRET=\"$value\"" >> ${ENV_FILE} ;;
        
        # Google Maps
        google-maps-api-key) echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=\"$value\"" >> ${ENV_FILE} ;;
        google-places-api-key) echo "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=\"$value\"" >> ${ENV_FILE} ;;
        
        # Supabase
        supabase-url) echo "NEXT_PUBLIC_SUPABASE_URL=\"$value\"" >> ${ENV_FILE} ;;
        supabase-anon-key) echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\"$value\"" >> ${ENV_FILE} ;;
        supabase-service-role-key) echo "SUPABASE_SERVICE_ROLE_KEY=\"$value\"" >> ${ENV_FILE} ;;
        
        # API Gateway
        next-public-api-url) echo "NEXT_PUBLIC_API_URL=\"$value\"" >> ${ENV_FILE} ;;
        
        # Redis (Upstash)
        upstash-redis-rest-url) echo "UPSTASH_REDIS_REST_URL=\"$value\"" >> ${ENV_FILE} ;;
        upstash-redis-rest-token) echo "UPSTASH_REDIS_REST_TOKEN=\"$value\"" >> ${ENV_FILE} ;;
        
        # Opcionales
        grok-api-key) echo "GROK_API_KEY=\"$value\"" >> ${ENV_FILE} ;;
        cloudflare-account-id) echo "CLOUDFLARE_ACCOUNT_ID=\"$value\"" >> ${ENV_FILE} ;;
        cloudflare-api-token) echo "CLOUDFLARE_API_TOKEN=\"$value\"" >> ${ENV_FILE} ;;
    esac
done

echo ""
echo "Variables de entorno cargadas en: ${ENV_FILE}"
echo "Total de variables: $(grep -c "=" ${ENV_FILE} || echo 0)"

# Buscar el PID del proceso de Next.js
NEXTJS_PID=$(ps aux | grep 'next-server' | grep -v grep | awk '{print $2}')

if [ -n "$NEXTJS_PID" ]; then
    echo ""
    echo "Reiniciando Next.js (PID: $NEXTJS_PID)..."
    kill $NEXTJS_PID
    sleep 2
    echo "Next.js detenido. Se reiniciará automáticamente si está configurado con systemd o PM2."
else
    echo ""
    echo "ADVERTENCIA: No se encontró proceso de Next.js corriendo."
fi

# Verificar si hay servicio systemd
if systemctl list-units --full -all | grep -q "next-frontend.service"; then
    echo "Reiniciando servicio systemd..."
    systemctl restart next-frontend
    systemctl status next-frontend --no-pager
fi

echo ""
echo "================================================"
echo "Deploy completado exitosamente"
echo "================================================"
echo ""
echo "Para verificar las variables:"
echo "  cat ${ENV_FILE}"
echo ""
echo "Para ver los logs de Next.js:"
echo "  sudo journalctl -u next-frontend -f"
