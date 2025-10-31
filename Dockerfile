# --- Optimized multi-stage Dockerfile for Vite + React ---
# Build stage: use a small Node image (alpine) to build static assets
FROM node:18-alpine AS builder

ARG NODE_ENV=production
ARG VITE_BACKEND_SERVER_HOST_URL
ENV NODE_ENV=${NODE_ENV}
# Pass any VITE_... build-time envs here so Vite can inline them at build
ENV VITE_BACKEND_SERVER_HOST_URL=${VITE_BACKEND_SERVER_HOST_URL}

WORKDIR /app

# Reduce layers and leverage cache: copy only package files first
COPY package*.json ./

# Use npm ci when possible for reproducible installs. Fallback to npm install if no lockfile.
RUN if [ -f package-lock.json ]; then npm ci --production=false --silent; else npm install --silent; fi

# Copy rest of the project
COPY . .

# Build the app (Vite will output into /app/dist by default)
RUN npm run build

# Production stage: serve with nginx (small, battle-tested)
FROM nginx:stable-alpine AS production

# Install curl for healthcheck (small)
RUN apk add --no-cache curl

# Remove default nginx config and add a minimal SPA-friendly server config
RUN rm /etc/nginx/conf.d/default.conf \
 && cat > /etc/nginx/conf.d/default.conf <<'NGINX_CONF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Don't leak NGINX version
    server_tokens off;

    # Serve static assets with long cache and immutable
    location ~* \.(?:css|js|json|svg|ico|png|jpg|jpeg|webp|woff2?|ttf)$ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Fallback to index.html for SPA client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Basic security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
}
NGINX_CONF

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]