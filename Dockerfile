# =============================================================================
#  SPA React/Vite servida con Nginx — multi-stage build endurecido (non-root)
# =============================================================================
#  FASE 1 (build):   node:22-alpine        -> instala deps y compila a /app/dist
#  FASE 2 (runtime): nginx:alpine-slim     -> imagen mínima que SOLO contiene /dist
#  La imagen final NO contiene código fuente React ni node_modules.
#
#  Nota: VITE_API_URL es un build-arg. Vite lo "hornea" en el bundle en tiempo
#  de compilación, por lo que NO debe usarse para secretos (DB, tokens, etc.).
# -----------------------------------------------------------------------------

# ---------- FASE 1: builder ----------
FROM node:22-alpine AS build
WORKDIR /app

# Optimización de caché de capas: copiamos SOLO los manifiestos primero.
# Mientras package.json / package-lock.json no cambien, Docker reutiliza la
# capa de "npm ci" aunque cambie el código fuente -> builds mucho más rápidos.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Ahora sí, el resto del código (invalida caché solo de aquí para abajo).
COPY . .

# Con el reverse-proxy de Nginx, el frontend llama a /api (mismo origen).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- FASE 2: runtime ----------
# 'alpine-slim' quita módulos/paquetes extra (perl, njs…) que un servidor de
# estáticos no usa: ~21MB vs ~75MB de 'alpine', misma funcionalidad para SPA
# (gzip_static, reverse-proxy y wget del HEALTHCHECK siguen presentes).
# Fijada a la ÚLTIMA versión (1.31-alpine-slim / Alpine 3.24): ya trae los
# paquetes del SO parcheados -> Trivy = 0 CRITICAL/HIGH sin necesidad de
# 'apk upgrade' (que duplicaría libs entre capas y bajaría la eficiencia).
FROM nginx:1.31-alpine-slim AS runtime

# Metadatos OCI: permiten rastrear qué commit/versión produjo cada imagen.
ARG GIT_SHA=unknown
ARG VERSION=dev
LABEL org.opencontainers.image.title="phoenix-frontend" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${VERSION}"

# Config principal endurecida (pid y temp paths reubicados a rutas escribibles)
COPY nginx.conf /etc/nginx/nginx.conf

# ÚNICO artefacto que viaja a producción: la carpeta dist compilada.
# --chown en el propio COPY -> asigna el owner sin crear una capa extra que
# duplique los archivos (mejor eficiencia de capas que COPY + RUN chown).
COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html

# --- Hardening non-root -------------------------------------------------------
# El usuario 'nginx' (uid 101) ya existe en la imagen oficial. Le cedemos la
# propiedad de lo que Nginx necesita ESCRIBIR en ejecución:
#   - /var/cache/nginx : cachés de Nginx
#   - /var/run         : donde tradicionalmente va el nginx.pid
# Además reubicamos el pid a /tmp (siempre escribible) como enfoque robusto.
RUN set -eux; \
    touch /tmp/nginx.pid; \
    chown -R nginx:nginx /var/cache/nginx /var/run /tmp/nginx.pid; \
    chmod -R g+w /var/cache/nginx /var/run

# Puerto no privilegiado (>1024): un proceso non-root NO puede abrir el 80.
EXPOSE 8080
# Puerto INTERNO de métricas (stub_status) para el exporter de Prometheus.
# Documental: el deploy NO lo publica al host; solo es visible en la red 'web'.
EXPOSE 8081

# A partir de aquí el contenedor corre SIN privilegios de root.
USER nginx

# Liveness: si Nginx deja de responder, el orquestador reinicia el contenedor.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

# Nginx usa SIGQUIT para un graceful shutdown (drena conexiones abiertas).
STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
