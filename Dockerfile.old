# Dockerfile multi-stage optimisé pour Nuxt 3
FROM node:20-alpine AS base

# Installation des dépendances système
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# ==========================================
# Stage 1: Installation des dépendances
# ==========================================
FROM base AS deps

# Copier SEULEMENT les fichiers de dépendances
COPY package*.json ./
COPY .npmrc* ./

# Installer les dépendances (CACHE PERSISTE tant que package.json ne change pas)
RUN npm ci --frozen-lockfile

# ==========================================
# Stage 2: Build de l'application
# ==========================================
FROM base AS builder

# Arguments de build
ARG NODE_ENV=production
ARG BUILDTIME
ARG VERSION

# Copier les node_modules depuis le stage deps (avec cache)
COPY --from=deps /app/node_modules ./node_modules

# Copier package.json
COPY package*.json ./

# Copier le code source
COPY . .

# Créer le dossier PDF worker
RUN mkdir -p public/pdf-worker && \
    if [ -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs ]; then \
      cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf-worker/; \
    fi

# Variables d'environnement pour le build
ENV NODE_ENV=${NODE_ENV}
ENV NITRO_PRESET=node-server
# Désactiver le prerendering pour accélérer le build
ENV NITRO_PRERENDER_ROUTES=false

# Build de l'application
RUN npm run build

# ==========================================
# Stage 3: Production runner
# ==========================================
FROM base AS runner

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copier seulement les fichiers nécessaires
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=nuxtjs:nodejs /app/package-lock.json /app/package-lock.json

# Installer SEULEMENT les dépendances de production et nettoyer le cache
RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

# Passer à l'utilisateur non-root
USER nuxtjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement de runtime
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Commande de démarrage
CMD ["node", ".output/server/index.mjs"]
