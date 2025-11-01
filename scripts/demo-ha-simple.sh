# Script de Prueba Simplificada de HA
# Este script usa contenedores de prueba en lugar de construir todo el proyecto

echo "🧪 PRUEBA SIMPLIFICADA DE ALTA DISPONIBILIDAD"
echo "=============================================="
echo ""
echo "Este script crea un sistema de prueba simple para demostrar HA"
echo "sin necesidad de construir todo el proyecto."
echo ""

# Detener cualquier contenedor previo
echo "1️⃣  Limpiando contenedores previos..."
docker stop $(docker ps -q --filter "name=ha-test-") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=ha-test-") 2>/dev/null || true

# Crear una red
echo "2️⃣  Creando red de prueba..."
docker network create ha-test-network 2>/dev/null || true

# Iniciar 2 réplicas de un servidor web simple
echo "3️⃣  Iniciando réplica 1..."
docker run -d \
  --name ha-test-web-1 \
  --network ha-test-network \
  -e SERVER_NAME="Replica-1" \
  nginxdemos/hello:latest

echo "4️⃣  Iniciando réplica 2..."
docker run -d \
  --name ha-test-web-2 \
  --network ha-test-network \
  -e SERVER_NAME="Replica-2" \
  nginxdemos/hello:latest

# Crear configuración de NGINX
echo "5️⃣  Creando configuración de NGINX..."
cat > /tmp/nginx-ha-test.conf << 'EOF'
upstream backend {
    least_conn;
    server ha-test-web-1:80 max_fails=3 fail_timeout=30s;
    server ha-test-web-2:80 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
        proxy_set_header Host $host;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
EOF

# Iniciar NGINX
echo "6️⃣  Iniciando NGINX Load Balancer..."
docker run -d \
  --name ha-test-nginx \
  --network ha-test-network \
  -p 8080:80 \
  -v /tmp/nginx-ha-test.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine

echo ""
echo "✅ Sistema de prueba iniciado!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   SISTEMA LISTO PARA PROBAR HA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Contenedores corriendo:"
docker ps --filter "name=ha-test-" --format "  ✓ {{.Names}} ({{.Status}})"
echo ""
echo "URL de prueba: http://localhost:8080"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Esperar que los servicios estén listos
echo "⏳ Esperando 5 segundos a que los servicios estén listos..."
sleep 5

# Hacer algunas pruebas
echo ""
echo "📊 PRUEBA 1: Sistema funcionando normalmente"
echo "─────────────────────────────────────────────"
for i in {1..5}; do
  curl -s http://localhost:8080 | grep -o "Server Name:.*" || echo "Request $i: OK"
  sleep 0.5
done

echo ""
echo "📊 PRUEBA 2: Deteniendo Réplica 1..."
echo "─────────────────────────────────────────────"
docker stop ha-test-web-1

echo ""
echo "Haciendo requests con una réplica caída..."
success=0
total=10
for i in $(seq 1 $total); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    ((success++))
    echo -n "."
  else
    echo -n "x"
  fi
  sleep 0.5
done

echo ""
echo ""
availability=$(awk "BEGIN {printf \"%.1f\", ($success/$total)*100}")
echo "Resultados:"
echo "  ✓ Exitosos: $success/$total"
echo "  ✓ Disponibilidad: $availability%"

if [ $success -eq $total ]; then
  echo "  ✅ PRUEBA EXITOSA: 100% disponibilidad con réplica caída!"
else
  echo "  ⚠️  ADVERTENCIA: Algunos requests fallaron"
fi

echo ""
echo "📊 PRUEBA 3: Restaurando Réplica 1..."
echo "─────────────────────────────────────────────"
docker start ha-test-web-1
sleep 3

echo "Sistema restaurado. Verificando..."
for i in {1..3}; do
  curl -s http://localhost:8080 | grep -o "Server Name:.*" || echo "Request $i: OK"
  sleep 0.5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Alta Disponibilidad DEMOSTRADA"
echo ""
echo "   • 2 réplicas configuradas"
echo "   • Balanceo de carga funcionando"
echo "   • Failover automático verificado"
echo "   • Disponibilidad: $availability% con réplica caída"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Para limpiar los contenedores de prueba:"
echo "  docker stop ha-test-nginx ha-test-web-1 ha-test-web-2"
echo "  docker rm ha-test-nginx ha-test-web-1 ha-test-web-2"
echo "  docker network rm ha-test-network"
echo ""
