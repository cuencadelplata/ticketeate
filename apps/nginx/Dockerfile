FROM nginx:alpine

# Argumento para elegir el archivo de configuración
ARG CONFIG_FILE=default.conf

# Copiar la configuración seleccionada
COPY ./${CONFIG_FILE} /etc/nginx/conf.d/default.conf
