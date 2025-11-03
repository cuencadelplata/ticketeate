# Dockerfile para Redis con configuración personalizada
FROM redis:7-alpine

# Metadatos
LABEL maintainer="Ticketeate Team"
LABEL description="Redis Server con configuración optimizada para Ticketeate"

# Copiar configuración personalizada desde la raíz del monorepo
COPY ./redis.conf /usr/local/etc/redis/redis.conf

# Crear directorio para datos con permisos correctos
RUN mkdir -p /data && \
    chown redis:redis /data && \
    chmod 755 /data

# Exponer puerto de Redis
EXPOSE 6379

# Volumen para persistencia
VOLUME ["/data"]

# Health check
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD redis-cli -a ${REDIS_PASSWORD:-ticketeate123} ping | grep PONG

# Usuario no-root
USER redis

# Comando para iniciar Redis con la configuración custom
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
