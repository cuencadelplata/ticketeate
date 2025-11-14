#!/bin/bash
# Script para actualizar la configuración de nginx con la URL del API Gateway
# Uso: ./update-nginx-config.sh

set -e

echo "================================================"
echo "Actualizando configuración de Nginx"
echo "================================================"
echo ""

# Obtener la URL del API Gateway desde Terraform
echo "Obteniendo URL del API Gateway..."
cd "$(dirname "$0")/../../infrastructure"

API_GATEWAY_URL=$(terraform output -raw api_gateway_urls 2>/dev/null | grep -oP 'base_url\s*=\s*"\K[^"]+' || echo "")

if [ -z "$API_GATEWAY_URL" ]; then
    echo "ERROR: No se pudo obtener la URL del API Gateway"
    echo "Asegúrate de que terraform apply se haya ejecutado correctamente"
    exit 1
fi

echo "URL del API Gateway: $API_GATEWAY_URL"

# Extraer host del API Gateway (sin https://)
API_HOST=$(echo "$API_GATEWAY_URL" | sed 's|https://||' | sed 's|/.*||')
echo "Host del API Gateway: $API_HOST"

# Actualizar archivo hybrid.conf
NGINX_CONF="../apps/nginx/hybrid.conf"

if [ ! -f "$NGINX_CONF" ]; then
    echo "ERROR: No se encontró el archivo $NGINX_CONF"
    exit 1
fi

echo ""
echo "Actualizando $NGINX_CONF..."

# Crear backup
cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

# Actualizar las URLs en el archivo
# Reemplazar todas las ocurrencias de la URL de ejemplo
sed -i "s|https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/prod|${API_GATEWAY_URL}|g" "$NGINX_CONF"
sed -i "s|xxxxxxxxxx.execute-api.us-east-2.amazonaws.com|${API_HOST}|g" "$NGINX_CONF"

echo "Archivo actualizado correctamente"
echo ""
echo "================================================"
echo "Próximos pasos:"
echo "================================================"
echo "1. Revisar el archivo: cat $NGINX_CONF"
echo "2. Copiar a tu servidor EC2 Nginx"
echo "3. Reiniciar nginx: sudo systemctl reload nginx"
echo ""
echo "Comando para copiar al servidor:"
echo "scp $NGINX_CONF ubuntu@<nginx-ip>:/tmp/hybrid.conf"
echo "ssh ubuntu@<nginx-ip> 'sudo mv /tmp/hybrid.conf /etc/nginx/sites-available/hybrid.conf && sudo systemctl reload nginx'"
echo ""
